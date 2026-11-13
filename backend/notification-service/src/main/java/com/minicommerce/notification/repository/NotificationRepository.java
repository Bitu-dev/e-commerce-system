package com.minicommerce.notification.repository;

import com.minicommerce.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    boolean existsByEventId(String eventId);

    List<Notification> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    List<Notification> findAllByOrderByCreatedAtDesc();
}
