package com.minicommerce.notification.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "notifications",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_notification_event_id", columnNames = {"event_id"})
    }
)
public class Notification implements Serializable {

    @Id
    @Column(length = 64)
    private String id;

    @NotBlank
    @Column(name = "event_id", nullable = false, length = 64, unique = true)
    private String eventId;

    @NotBlank
    @Column(name = "customer_id", nullable = false, length = 64)
    private String customerId;

    @NotBlank
    @Column(name = "order_id", nullable = false, length = 64)
    private String orderId;

    @Column(name = "event_type", length = 64)
    private String eventType;

    @NotBlank
    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private Boolean read = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Notification() {
        this.id = "notif-" + UUID.randomUUID().toString().substring(0, 8);
    }

    public Notification(String eventId, String customerId, String orderId, String eventType, String message) {
        this.id = "notif-" + UUID.randomUUID().toString().substring(0, 8);
        this.eventId = eventId;
        this.customerId = customerId;
        this.orderId = orderId;
        this.eventType = eventType;
        this.message = message;
        this.read = false;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getRead() {
        return read;
    }

    public void setRead(Boolean read) {
        this.read = read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
