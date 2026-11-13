package com.minicommerce.order.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minicommerce.events.EventConstants;
import com.minicommerce.events.InventoryReservationFailedEvent;
import com.minicommerce.events.InventoryReservedEvent;
import com.minicommerce.events.OrderConfirmedEvent;
import com.minicommerce.events.OrderItemPayload;
import com.minicommerce.events.OrderPlacedEvent;
import com.minicommerce.events.OrderRejectedEvent;
import com.minicommerce.order.model.Order;
import com.minicommerce.order.model.OrderItem;
import com.minicommerce.order.model.OrderStatus;
import com.minicommerce.order.model.OutboxEvent;
import com.minicommerce.order.repository.OrderRepository;
import com.minicommerce.order.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final AmqpTemplate amqpTemplate;
    private final ObjectMapper objectMapper;

    public OrderService(OrderRepository orderRepository,
                        OutboxEventRepository outboxEventRepository,
                        AmqpTemplate amqpTemplate,
                        ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.outboxEventRepository = outboxEventRepository;
        this.amqpTemplate = amqpTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Submits customer order: validates items, persists snapshot as PENDING,
     * saves Transactional Outbox record, and publishes OrderPlacedEvent after commit.
     */
    @Transactional
    public Order placeOrder(String customerId, String customerName, String customerEmail, List<OrderItem> items) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("400 Bad Request: Order must contain at least one item.");
        }

        Order order = new Order(customerId, customerName, customerEmail);
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItem item : items) {
            if (item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero for product: " + item.getProductName());
            }
            BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            item.setSubtotal(subtotal);
            order.addItem(item);
            total = total.add(subtotal);
        }

        order.setTotalAmount(total);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());

        // 1. Persist Order in order_db and flush to guarantee DB record
        Order savedOrder = orderRepository.saveAndFlush(order);
        log.info("Persisted Order ID {} as PENDING for customer {}", savedOrder.getId(), customerId);

        // 2. Prepare OrderPlacedEvent DTO
        List<OrderItemPayload> itemPayloads = savedOrder.getItems().stream()
                .map(i -> new OrderItemPayload(i.getProductId(), i.getProductName(), i.getUnitPrice(), i.getQuantity(), i.getSubtotal()))
                .collect(Collectors.toList());

        OrderPlacedEvent event = new OrderPlacedEvent(
                savedOrder.getId(),
                customerId,
                customerName,
                customerEmail,
                itemPayloads,
                savedOrder.getTotalAmount()
        );

        // 3. Transactional Outbox pattern: write outbox event in the same DB transaction
        OutboxEvent outbox = null;
        try {
            String jsonPayload = objectMapper.writeValueAsString(event);
            outbox = new OutboxEvent(savedOrder.getId(), "OrderPlaced", EventConstants.ROUTING_KEY_ORDER_PLACED, jsonPayload);
            outbox = outboxEventRepository.saveAndFlush(outbox);
        } catch (Exception e) {
            log.warn("Could not serialize outbox event payload: {}", e.getMessage());
        }

        // 4. Publish to RabbitMQ after commit to prevent race conditions with fast downstream consumers
        final OutboxEvent finalOutbox = outbox;
        final String finalOrderId = savedOrder.getId();
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        amqpTemplate.convertAndSend(EventConstants.EXCHANGE_ORDER, EventConstants.ROUTING_KEY_ORDER_PLACED, event);
                        log.info("Published OrderPlacedEvent for order ID {} after commit", finalOrderId);
                        if (finalOutbox != null) {
                            finalOutbox.setStatus("PUBLISHED");
                            finalOutbox.setPublishedAt(Instant.now());
                            outboxEventRepository.save(finalOutbox);
                        }
                    } catch (Exception e) {
                        log.error("Failed to publish OrderPlacedEvent immediately after commit", e);
                    }
                }
            });
        } else {
            amqpTemplate.convertAndSend(EventConstants.EXCHANGE_ORDER, EventConstants.ROUTING_KEY_ORDER_PLACED, event);
        }

        return savedOrder;
    }

    /**
     * Consumes successful inventory reservation: updates status to CONFIRMED
     * and publishes OrderConfirmedEvent for downstream Notification Service.
     */
    @Transactional
    public void confirmOrder(String orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        int attempts = 0;
        while (orderOpt.isEmpty() && attempts < 5) {
            attempts++;
            try {
                Thread.sleep(100);
            } catch (InterruptedException ignored) {}
            orderOpt = orderRepository.findById(orderId);
        }

        if (orderOpt.isEmpty()) {
            log.error("Cannot confirm: Order #{} not found in order_db", orderId);
            return;
        }

        Order order = orderOpt.get();
        if (order.getStatus() == OrderStatus.CONFIRMED) {
            log.info("Idempotency: Order #{} is already CONFIRMED. Skipping.", orderId);
            return;
        }

        order.setStatus(OrderStatus.CONFIRMED);
        order.setUpdatedAt(Instant.now());
        orderRepository.save(order);
        log.info("Order #{} transitioned to CONFIRMED.", orderId);

        // Publish OrderConfirmedEvent
        OrderConfirmedEvent event = new OrderConfirmedEvent(order.getId(), order.getCustomerId(), order.getTotalAmount());
        amqpTemplate.convertAndSend(EventConstants.EXCHANGE_ORDER, EventConstants.ROUTING_KEY_ORDER_CONFIRMED, event);
        log.info("Published OrderConfirmedEvent for order #{}", orderId);
    }

    /**
     * Consumes failed inventory reservation: updates status to REJECTED
     * and publishes OrderRejectedEvent for downstream Notification Service.
     */
    @Transactional
    public void rejectOrder(String orderId, String reason) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        int attempts = 0;
        while (orderOpt.isEmpty() && attempts < 5) {
            attempts++;
            try {
                Thread.sleep(100);
            } catch (InterruptedException ignored) {}
            orderOpt = orderRepository.findById(orderId);
        }

        if (orderOpt.isEmpty()) {
            log.error("Cannot reject: Order #{} not found in order_db", orderId);
            return;
        }

        Order order = orderOpt.get();
        if (order.getStatus() == OrderStatus.REJECTED) {
            log.info("Idempotency: Order #{} is already REJECTED. Skipping.", orderId);
            return;
        }

        order.setStatus(OrderStatus.REJECTED);
        order.setRejectionReason(reason);
        order.setUpdatedAt(Instant.now());
        orderRepository.save(order);
        log.warn("Order #{} transitioned to REJECTED. Reason: {}", orderId, reason);

        // Publish OrderRejectedEvent
        OrderRejectedEvent event = new OrderRejectedEvent(order.getId(), order.getCustomerId(), reason);
        amqpTemplate.convertAndSend(EventConstants.EXCHANGE_ORDER, EventConstants.ROUTING_KEY_ORDER_REJECTED, event);
        log.info("Published OrderRejectedEvent for order #{}", orderId);
    }


    @Transactional(readOnly = true)
    public List<Order> getOrdersByCustomer(String customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Optional<Order> getOrderById(String orderId) {
        return orderRepository.findById(orderId);
    }
}
