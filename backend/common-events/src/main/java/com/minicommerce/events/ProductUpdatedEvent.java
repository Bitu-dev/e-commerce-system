package com.minicommerce.events;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class ProductUpdatedEvent implements Serializable {
    private String eventId;
    private String eventType = "ProductUpdated";
    private String schemaVersion = "1.0";
    private String productId;
    private String action; // CREATED, UPDATED, STOCK_ADJUSTED
    private int newStockQuantity;
    private Instant timestamp;

    public ProductUpdatedEvent() {
        this.eventId = UUID.randomUUID().toString();
        this.timestamp = Instant.now();
    }

    public ProductUpdatedEvent(String productId, String action, int newStockQuantity) {
        this.eventId = UUID.randomUUID().toString();
        this.productId = productId;
        this.action = action;
        this.newStockQuantity = newStockQuantity;
        this.timestamp = Instant.now();
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getSchemaVersion() {
        return schemaVersion;
    }

    public void setSchemaVersion(String schemaVersion) {
        this.schemaVersion = schemaVersion;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public int getNewStockQuantity() {
        return newStockQuantity;
    }

    public void setNewStockQuantity(int newStockQuantity) {
        this.newStockQuantity = newStockQuantity;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
