package com.minicommerce.order.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minicommerce.events.EventConstants;
import com.minicommerce.events.InventoryReservationFailedEvent;
import com.minicommerce.events.InventoryReservedEvent;
import com.minicommerce.order.service.OrderService;
import com.rabbitmq.client.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class InventoryResultListener {

    private static final Logger log = LoggerFactory.getLogger(InventoryResultListener.class);

    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    public InventoryResultListener(OrderService orderService, ObjectMapper objectMapper) {
        this.orderService = orderService;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = EventConstants.QUEUE_ORDER_INVENTORY_RESULT, ackMode = "MANUAL")
    public void handleInventoryEvent(Message message,
                                     Channel channel,
                                     @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {
        try {
            String routingKey = message.getMessageProperties().getReceivedRoutingKey();
            log.info("Received inventory result message with routing key: {}", routingKey);

            if (EventConstants.ROUTING_KEY_INVENTORY_RESERVED.equals(routingKey)) {
                InventoryReservedEvent event = objectMapper.readValue(message.getBody(), InventoryReservedEvent.class);
                log.info("Received InventoryReservedEvent for order #{} [ReservationId: {}]", event.getOrderId(), event.getReservationId());
                orderService.confirmOrder(event.getOrderId());
            } else if (EventConstants.ROUTING_KEY_INVENTORY_FAILED.equals(routingKey)) {
                InventoryReservationFailedEvent event = objectMapper.readValue(message.getBody(), InventoryReservationFailedEvent.class);
                log.warn("Received InventoryReservationFailedEvent for order #{}. Reason: {}", event.getOrderId(), event.getReason());
                orderService.rejectOrder(event.getOrderId(), event.getReason());
            } else {
                log.warn("Received unexpected routing key on order inventory result queue: {}", routingKey);
            }

            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            log.error("Error processing inventory event: {}. Sending to DLQ.", e.getMessage(), e);
            channel.basicNack(deliveryTag, false, false);
        }
    }
}
