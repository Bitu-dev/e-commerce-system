package com.minicommerce.notification.service;

import com.minicommerce.notification.model.Notification;
import com.minicommerce.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testNotification = new Notification("evt-1234", "cust-user-1", "ord-999", "OrderConfirmed", "Your order has been confirmed.");
    }

    @Test
    @DisplayName("Should successfully record notification when eventId is new")
    void shouldRecordNotificationWhenEventIdIsNew() {
        when(notificationRepository.existsByEventId("evt-1234")).thenReturn(false);
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        notificationService.recordNotification(
                "evt-1234", "cust-user-1", "ord-999", "OrderConfirmed", "Your order has been confirmed."
        );

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getEventId()).isEqualTo("evt-1234");
        assertThat(captor.getValue().getCustomerId()).isEqualTo("cust-user-1");
        assertThat(captor.getValue().getRead()).isFalse();
    }

    @Test
    @DisplayName("Should skip creating notification if eventId was already recorded (Idempotency)")
    void shouldSkipDuplicateNotification() {
        when(notificationRepository.existsByEventId("evt-1234")).thenReturn(true);

        notificationService.recordNotification(
                "evt-1234", "cust-user-1", "ord-999", "OrderConfirmed", "Your order has been confirmed."
        );

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should allow notification owner to mark it as read")
    void shouldAllowOwnerToMarkAsRead() {
        when(notificationRepository.findById("notif-1")).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Notification> result = notificationService.markAsRead("notif-1", "cust-user-1");

        assertThat(result).isPresent();
        assertThat(result.get().getRead()).isTrue();
        verify(notificationRepository, times(1)).save(testNotification);
    }

    @Test
    @DisplayName("Should reject markAsRead if requester is not the notification owner (Security)")
    void shouldRejectNonOwnerFromMarkAsRead() {
        when(notificationRepository.findById("notif-1")).thenReturn(Optional.of(testNotification));

        assertThatThrownBy(() -> notificationService.markAsRead("notif-1", "attacker-user-id"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Cannot modify another customer's notification");

        verify(notificationRepository, never()).save(any());
    }
}
