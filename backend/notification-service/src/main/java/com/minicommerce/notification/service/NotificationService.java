package com.minicommerce.notification.service;

import com.minicommerce.notification.model.Notification;
import com.minicommerce.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Records a notification with strict idempotency: if eventId already exists, skips gracefully.
     */
    @Transactional
    public void recordNotification(String eventId, String customerId, String orderId, String eventType, String message) {
        if (notificationRepository.existsByEventId(eventId)) {
            log.warn("Idempotency guard: Notification for event ID {} already recorded. Skipping duplicate.", eventId);
            return;
        }

        Notification notification = new Notification(eventId, customerId, orderId, eventType, message);
        Notification saved = notificationRepository.save(notification);
        log.info("Recorded customer notification ID {} for order #{} [Event: {}]", saved.getId(), orderId, eventType);
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForCustomer(String customerId) {
        return notificationRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Transactional(readOnly = true)
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Optional<Notification> markAsRead(String notificationId, String customerId) {
        Optional<Notification> notifOpt = notificationRepository.findById(notificationId);
        if (notifOpt.isEmpty()) {
            return Optional.empty();
        }

        Notification notification = notifOpt.get();
        if (!notification.getCustomerId().equals(customerId)) {
            throw new SecurityException("403 Forbidden: Cannot modify another customer's notification.");
        }

        notification.setRead(true);
        return Optional.of(notificationRepository.save(notification));
    }
}
