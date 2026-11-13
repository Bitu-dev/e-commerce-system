package com.minicommerce.product.service;

import com.minicommerce.events.EventConstants;
import com.minicommerce.events.InventoryReservationFailedEvent;
import com.minicommerce.events.InventoryReservedEvent;
import com.minicommerce.events.OrderItemPayload;
import com.minicommerce.events.OrderPlacedEvent;
import com.minicommerce.product.model.Product;
import com.minicommerce.product.model.StockReservation;
import com.minicommerce.product.repository.ProductRepository;
import com.minicommerce.product.repository.StockReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.cache.CacheManager;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryReservationServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private StockReservationRepository stockReservationRepository;

    @Mock
    private AmqpTemplate amqpTemplate;

    @Mock
    private CacheManager cacheManager;

    @InjectMocks
    private InventoryReservationService inventoryReservationService;

    private Product testProduct;
    private OrderPlacedEvent testOrderPlacedEvent;

    @BeforeEach
    void setUp() {
        testProduct = new Product(
                "prod-iphone-16-pro",
                "iPhone 16 Pro Max",
                "Smartphones",
                "Flagship titanium phone",
                new BigDecimal("49999.00"),
                10,
                "https://images.unsplash.com/test",
                "Flagship"
        );

        OrderItemPayload item = new OrderItemPayload(
                "prod-iphone-16-pro",
                "iPhone 16 Pro Max",
                new BigDecimal("49999.00"),
                2,
                new BigDecimal("99998.00")
        );

        testOrderPlacedEvent = new OrderPlacedEvent(
                "ord-test-1234",
                "cust-user-1",
                "Bitaniya User",
                "user@minicommerce.local",
                List.of(item),
                new BigDecimal("99998.00")
        );
    }

    @Test
    @DisplayName("Should successfully reserve stock and publish InventoryReservedEvent when stock is sufficient")
    void shouldReserveStockSuccessfullyWhenAvailable() {
        when(stockReservationRepository.existsByOrderId("ord-test-1234")).thenReturn(false);
        when(productRepository.findByIdWithLock("prod-iphone-16-pro")).thenReturn(Optional.of(testProduct));

        inventoryReservationService.processOrderReservation(testOrderPlacedEvent);

        // Verify stock decremented: 10 - 2 = 8
        assertThat(testProduct.getStockQuantity()).isEqualTo(8);
        verify(productRepository, times(1)).save(testProduct);

        // Verify reservation record saved
        ArgumentCaptor<StockReservation> resCaptor = ArgumentCaptor.forClass(StockReservation.class);
        verify(stockReservationRepository, times(1)).save(resCaptor.capture());
        assertThat(resCaptor.getValue().getStatus()).isEqualTo("RESERVED");
        assertThat(resCaptor.getValue().getOrderId()).isEqualTo("ord-test-1234");

        // Verify event published to RabbitMQ
        verify(amqpTemplate, times(1)).convertAndSend(
                eq(EventConstants.EXCHANGE_INVENTORY),
                eq(EventConstants.ROUTING_KEY_INVENTORY_RESERVED),
                any(InventoryReservedEvent.class)
        );
    }

    @Test
    @DisplayName("Should publish InventoryReservationFailedEvent without deducting stock when stock is insufficient")
    void shouldFailReservationWhenStockInsufficient() {
        testProduct.setStockQuantity(1); // Requested 2, only 1 available
        when(stockReservationRepository.existsByOrderId("ord-test-1234")).thenReturn(false);
        when(productRepository.findByIdWithLock("prod-iphone-16-pro")).thenReturn(Optional.of(testProduct));

        inventoryReservationService.processOrderReservation(testOrderPlacedEvent);

        // Stock must remain unchanged
        assertThat(testProduct.getStockQuantity()).isEqualTo(1);
        verify(productRepository, never()).save(any(Product.class));

        // Reservation saved as FAILED
        ArgumentCaptor<StockReservation> resCaptor = ArgumentCaptor.forClass(StockReservation.class);
        verify(stockReservationRepository, times(1)).save(resCaptor.capture());
        assertThat(resCaptor.getValue().getStatus()).isEqualTo("FAILED");

        // Failure event published
        verify(amqpTemplate, times(1)).convertAndSend(
                eq(EventConstants.EXCHANGE_INVENTORY),
                eq(EventConstants.ROUTING_KEY_INVENTORY_FAILED),
                any(InventoryReservationFailedEvent.class)
        );
    }

    @Test
    @DisplayName("Should skip processing when order has already been reserved (Idempotency)")
    void shouldSkipProcessingWhenAlreadyProcessed() {
        when(stockReservationRepository.existsByOrderId("ord-test-1234")).thenReturn(true);

        inventoryReservationService.processOrderReservation(testOrderPlacedEvent);

        verify(productRepository, never()).findByIdWithLock(anyString());
        verify(stockReservationRepository, never()).save(any(StockReservation.class));
        verify(amqpTemplate, never()).convertAndSend(anyString(), anyString(), any(Object.class));
    }
}
