package com.minicommerce.events;

public final class EventConstants {
    private EventConstants() {
    }

    // Exchanges
    public static final String EXCHANGE_ORDER = "order.exchange";
    public static final String EXCHANGE_INVENTORY = "inventory.exchange";
    public static final String EXCHANGE_DLX = "dlx.exchange";

    // Routing Keys
    public static final String ROUTING_KEY_ORDER_PLACED = "order.placed";
    public static final String ROUTING_KEY_INVENTORY_RESERVED = "inventory.reserved";
    public static final String ROUTING_KEY_INVENTORY_FAILED = "inventory.reservation.failed";
    public static final String ROUTING_KEY_ORDER_CONFIRMED = "order.confirmed";
    public static final String ROUTING_KEY_ORDER_REJECTED = "order.rejected";
    public static final String ROUTING_KEY_PRODUCT_UPDATED = "product.updated";
    public static final String ROUTING_KEY_DEAD_LETTER = "dead.letter";

    // Queues
    public static final String QUEUE_INVENTORY_ORDER_PLACED = "inventory.order.placed.queue";
    public static final String QUEUE_ORDER_INVENTORY_RESULT = "order.inventory.result.queue";
    public static final String QUEUE_NOTIFICATION_ORDER_EVENTS = "notification.order.events.queue";
    public static final String QUEUE_DEAD_LETTER = "dead.letter.queue";
}
