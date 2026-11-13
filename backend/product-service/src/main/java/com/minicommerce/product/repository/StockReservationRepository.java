package com.minicommerce.product.repository;

import com.minicommerce.product.model.StockReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StockReservationRepository extends JpaRepository<StockReservation, String> {

    boolean existsByOrderId(String orderId);

    Optional<StockReservation> findByOrderId(String orderId);
}
