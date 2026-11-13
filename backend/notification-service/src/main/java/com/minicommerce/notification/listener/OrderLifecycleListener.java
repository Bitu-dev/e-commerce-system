package com.minicommerce.notification.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minicommerce.events.EventConstants;
import com.minicommerce.events.OrderConfirmedEvent;
import com.minicommerce.events.OrderPlacedEvent;
import com.minicommerce.events.OrderRejectedEvent;
import com.minicommerce.notification.service.NotificationService;
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
public class OrderLifecycleListener {

    private static final Logger log = LoggerFactory.getLogger(OrderLifecycleListener.class);

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    public OrderLifecycleListener(NotificationService notificationService, ObjectMapper objectMapper) {
        this.notificationService = notificationService;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = EventConstants.QUEUE_NOTIFICATION_ORDER_EVENTS, ackMode = "MANUAL")
    public void handleOrderEvent(Message message,
                                 Channel channel,
                                 @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {
        try {
            String routingKey = message.getMessageProperties().getReceivedRoutingKey();
            log.info("Notification Service received order event with routing key: {}", routingKey);

            if (EventConstants.ROUTING_KEY_ORDER_PLACED.equals(routingKey)) {
                OrderPlacedEvent event = objectMapper.readValue(message.getBody(), OrderPlacedEvent.class);
                log.info("Notification Service processed OrderPlacedEvent for order #{}", event.getOrderId());
                String notifMsg = String.format("Order #%s submitted (Total: ETB %s). Checking stock availability asynchronously...",
                        event.getOrderId().toUpperCase(), event.getTotalAmount());
                notificationService.recordNotification(event.getEventId(), event.getCustomerId(), event.getOrderId(), "OrderPlaced", notifMsg);

            } else if (EventConstants.ROUTING_KEY_ORDER_CONFIRMED.equals(routingKey)) {
                OrderConfirmedEvent event = objectMapper.readValue(message.getBody(), OrderConfirmedEvent.class);
                log.info("Notification Service processed OrderConfirmedEvent for order #{}", event.getOrderId());
                String notifMsg = String.format("Great news! Order #%s has been CONFIRMED. Hardware stock is reserved and verified.",
                        event.getOrderId().toUpperCase());
                notificationService.recordNotification(event.getEventId(), event.getCustomerId(), event.getOrderId(), "OrderConfirmed", notifMsg);

            } else if (EventConstants.ROUTING_KEY_ORDER_REJECTED.equals(routingKey)) {
                OrderRejectedEvent event = objectMapper.readValue(message.getBody(), OrderRejectedEvent.class);
                log.warn("Notification Service processed OrderRejectedEvent for order #{}", event.getOrderId());
                String notifMsg = String.format("Order #%s could not be fulfilled: %s",
                        event.getOrderId().toUpperCase(), event.getReason());
                notificationService.recordNotification(event.getEventId(), event.getCustomerId(), event.getOrderId(), "OrderRejected", notifMsg);

            } else {
                log.warn("Received unexpected routing key on notification queue: {}", routingKey);
            }

            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            log.error("Error processing notification event: {}. Sending to DLQ.", e.getMessage(), e);
            channel.basicNack(deliveryTag, false, false);
        }
    }
}
