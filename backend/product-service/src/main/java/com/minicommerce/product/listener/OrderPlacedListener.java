package com.minicommerce.product.listener;

import com.minicommerce.events.EventConstants;
import com.minicommerce.events.OrderPlacedEvent;
import com.minicommerce.product.service.InventoryReservationService;
import com.rabbitmq.client.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OrderPlacedListener {

    private static final Logger log = LoggerFactory.getLogger(OrderPlacedListener.class);

    private final InventoryReservationService inventoryReservationService;

    public OrderPlacedListener(InventoryReservationService inventoryReservationService) {
        this.inventoryReservationService = inventoryReservationService;
    }

    @RabbitListener(queues = EventConstants.QUEUE_INVENTORY_ORDER_PLACED, ackMode = "MANUAL")
    public void handleOrderPlaced(OrderPlacedEvent event,
                                 Channel channel,
                                 @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {
        log.info("Received OrderPlacedEvent for order ID {} [EventId: {}]", event.getOrderId(), event.getEventId());

        try {
            inventoryReservationService.processOrderReservation(event);
            // Acknowledge message only after successful database transaction commits
            channel.basicAck(deliveryTag, false);
            log.info("Acknowledged OrderPlaced message for order {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Error processing OrderPlacedEvent for order {}: {}. Rejecting message to DLQ.",
                    event.getOrderId(), e.getMessage(), e);
            // Rejects message without requeue so it moves to Dead Letter Queue (DLQ)
            channel.basicNack(deliveryTag, false, false);
        }
    }
}
