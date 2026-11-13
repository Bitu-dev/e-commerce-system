package com.minicommerce.product.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "stock_reservations",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_stock_reservation_order_id", columnNames = {"order_id"})
    }
)
public class StockReservation implements Serializable {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "order_id", nullable = false, length = 64, unique = true)
    private String orderId;

    @Column(nullable = false, length = 32)
    private String status; // RESERVED, FAILED

    @Column(length = 255)
    private String failureReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public StockReservation() {
        this.id = "res-" + UUID.randomUUID().toString().substring(0, 8);
    }

    public StockReservation(String orderId, String status, String failureReason) {
        this.id = "res-" + UUID.randomUUID().toString().substring(0, 8);
        this.orderId = orderId;
        this.status = status;
        this.failureReason = failureReason;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
