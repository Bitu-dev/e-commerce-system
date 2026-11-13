package com.minicommerce.order.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minicommerce.events.EventConstants;
import com.minicommerce.events.OrderConfirmedEvent;
import com.minicommerce.events.OrderPlacedEvent;
import com.minicommerce.events.OrderRejectedEvent;
import com.minicommerce.order.model.Order;
import com.minicommerce.order.model.OrderItem;
import com.minicommerce.order.model.OrderStatus;
import com.minicommerce.order.model.OutboxEvent;
import com.minicommerce.order.repository.OrderRepository;
import com.minicommerce.order.repository.OutboxEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.core.AmqpTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OutboxEventRepository outboxEventRepository;

    @Mock
    private AmqpTemplate amqpTemplate;

    private OrderService orderService;

    private OrderItem item1;
    private OrderItem item2;

    @BeforeEach
    void setUp() {
        ObjectMapper mapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        orderService = new OrderService(orderRepository, outboxEventRepository, amqpTemplate, mapper);
        item1 = new OrderItem("prod-1", "Sony WH-1000XM5", new BigDecimal("15499.00"), 2);
        item2 = new OrderItem("prod-2", "Apple Watch Ultra 2", new BigDecimal("26999.00"), 1);
    }

    @Test
    @DisplayName("Should successfully place order, calculate total on server, create outbox event, and publish OrderPlacedEvent")
    void shouldPlaceOrderSuccessfully() {
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(outboxEventRepository.save(any(OutboxEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order order = orderService.placeOrder("cust-123", "Bitaniya User", "user@test.com", List.of(item1, item2));

        assertThat(order).isNotNull();
        assertThat(order.getStatus()).isEqualTo(OrderStatus.PENDING);
        // Total: (15499 * 2) + (26999 * 1) = 30998 + 26999 = 57997.00
        assertThat(order.getTotalAmount()).isEqualByComparingTo(new BigDecimal("57997.00"));
        assertThat(order.getItems()).hasSize(2);

        // Verify outbox record saved
        verify(outboxEventRepository, atLeastOnce()).save(any(OutboxEvent.class));

        // Verify RabbitMQ publishing
        verify(amqpTemplate, times(1)).convertAndSend(
                eq(EventConstants.EXCHANGE_ORDER),
                eq(EventConstants.ROUTING_KEY_ORDER_PLACED),
                any(OrderPlacedEvent.class)
        );
    }

    @Test
    @DisplayName("Should reject empty order items with IllegalArgumentException")
    void shouldRejectEmptyOrder() {
        assertThatThrownBy(() -> orderService.placeOrder("cust-123", "User", "user@test.com", List.of()))
                .isInstanceOf(IllegalArgumentException.class);

        verify(orderRepository, never()).save(any());
        verify(amqpTemplate, never()).convertAndSend(anyString(), anyString(), any(Object.class));
    }

    @Test
    @DisplayName("Should update order status to CONFIRMED and publish OrderConfirmedEvent")
    void shouldConfirmOrder() {
        Order existing = new Order("cust-123", "User", "user@test.com");
        existing.setId("ord-100");
        existing.setStatus(OrderStatus.PENDING);
        existing.setTotalAmount(new BigDecimal("1000.00"));

        when(orderRepository.findById("ord-100")).thenReturn(Optional.of(existing));
        when(orderRepository.save(any(Order.class))).thenReturn(existing);

        orderService.confirmOrder("ord-100");

        assertThat(existing.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        verify(amqpTemplate, times(1)).convertAndSend(
                eq(EventConstants.EXCHANGE_ORDER),
                eq(EventConstants.ROUTING_KEY_ORDER_CONFIRMED),
                any(OrderConfirmedEvent.class)
        );
    }

    @Test
    @DisplayName("Should update order status to REJECTED with failure reason and publish OrderRejectedEvent")
    void shouldRejectOrder() {
        Order existing = new Order("cust-123", "User", "user@test.com");
        existing.setId("ord-200");
        existing.setStatus(OrderStatus.PENDING);

        when(orderRepository.findById("ord-200")).thenReturn(Optional.of(existing));
        when(orderRepository.save(any(Order.class))).thenReturn(existing);

        orderService.rejectOrder("ord-200", "Insufficient inventory");

        assertThat(existing.getStatus()).isEqualTo(OrderStatus.REJECTED);
        assertThat(existing.getRejectionReason()).isEqualTo("Insufficient inventory");
        verify(amqpTemplate, times(1)).convertAndSend(
                eq(EventConstants.EXCHANGE_ORDER),
                eq(EventConstants.ROUTING_KEY_ORDER_REJECTED),
                any(OrderRejectedEvent.class)
        );
    }

    @Test
    @DisplayName("Should remain idempotent when confirming an already CONFIRMED order")
    void shouldBeIdempotentWhenAlreadyConfirmed() {
        Order existing = new Order("cust-123", "User", "user@test.com");
        existing.setId("ord-100");
        existing.setStatus(OrderStatus.CONFIRMED);

        when(orderRepository.findById("ord-100")).thenReturn(Optional.of(existing));

        orderService.confirmOrder("ord-100");

        verify(orderRepository, never()).save(any());
        verify(amqpTemplate, never()).convertAndSend(anyString(), anyString(), any(Object.class));
    }
}
