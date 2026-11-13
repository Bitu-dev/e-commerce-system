package com.minicommerce.product.service;

import com.minicommerce.events.EventConstants;
import com.minicommerce.events.InventoryReservationFailedEvent;
import com.minicommerce.events.InventoryReservedEvent;
import com.minicommerce.events.OrderItemPayload;
import com.minicommerce.events.OrderPlacedEvent;
import com.minicommerce.product.config.RedisConfig;
import com.minicommerce.product.model.Product;
import com.minicommerce.product.model.StockReservation;
import com.minicommerce.product.repository.ProductRepository;
import com.minicommerce.product.repository.StockReservationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class InventoryReservationService {

    private static final Logger log = LoggerFactory.getLogger(InventoryReservationService.class);

    private final ProductRepository productRepository;
    private final StockReservationRepository stockReservationRepository;
    private final AmqpTemplate amqpTemplate;
    private final CacheManager cacheManager;

    public InventoryReservationService(ProductRepository productRepository,
                                       StockReservationRepository stockReservationRepository,
                                       AmqpTemplate amqpTemplate,
                                       CacheManager cacheManager) {
        this.productRepository = productRepository;
        this.stockReservationRepository = stockReservationRepository;
        this.amqpTemplate = amqpTemplate;
        this.cacheManager = cacheManager;
    }

    /**
     * Atomically reserves stock for an order or emits a business failure event.
     * Enforces strict idempotency and pessimistic row locking to prevent overselling.
     */
    @Transactional
    public void processOrderReservation(OrderPlacedEvent event) {
        String orderId = event.getOrderId();
        log.info("Processing inventory reservation for order ID: {}", orderId);

        // 1. Idempotency Check: if order is already processed, do not duplicate reservation
        if (stockReservationRepository.existsByOrderId(orderId)) {
            log.warn("Idempotency guard: Reservation for order ID {} has already been processed. Skipping.", orderId);
            return;
        }

        // 2. Validate stock availability for all items with pessimistic write lock
        List<Product> productsToUpdate = new ArrayList<>();
        boolean allAvailable = true;
        String failureReason = null;

        for (OrderItemPayload item : event.getItems()) {
            Optional<Product> prodOpt = productRepository.findByIdWithLock(item.getProductId());
            if (prodOpt.isEmpty()) {
                allAvailable = false;
                failureReason = "Product #" + item.getProductId() + " (" + item.getProductName() + ") not found in catalog.";
                break;
            }

            Product product = prodOpt.get();
            if (product.getStockQuantity() < item.getQuantity()) {
                allAvailable = false;
                failureReason = String.format("Insufficient inventory for '%s'. Requested: %d, Available: %d",
                        product.getName(), item.getQuantity(), product.getStockQuantity());
                break;
            }

            productsToUpdate.add(product);
        }

        if (allAvailable) {
            // 3. Atomically decrement inventory for all items
            for (int i = 0; i < event.getItems().size(); i++) {
                OrderItemPayload item = event.getItems().get(i);
                Product product = productsToUpdate.get(i);
                int oldStock = product.getStockQuantity();
                product.setStockQuantity(oldStock - item.getQuantity());
                product.setUpdatedAt(Instant.now());
                productRepository.save(product);
                log.info("Deducted {} units of '{}' (Old: {}, New: {})", item.getQuantity(), product.getName(), oldStock, product.getStockQuantity());
            }

            // 4. Record successful reservation record
            StockReservation reservation = new StockReservation(orderId, "RESERVED", null);
            stockReservationRepository.save(reservation);

            // 5. Evict Redis catalog cache so storefront reflects updated stock
            evictCatalogCache();

            // 6. Publish InventoryReserved event to RabbitMQ
            InventoryReservedEvent successEvent = new InventoryReservedEvent(orderId, event.getCustomerId(), reservation.getId());
            amqpTemplate.convertAndSend(EventConstants.EXCHANGE_INVENTORY, EventConstants.ROUTING_KEY_INVENTORY_RESERVED, successEvent);
            log.info("Successfully reserved stock for order {}. Emitted InventoryReservedEvent.", orderId);

        } else {
            // 7. Record failed reservation record for idempotency
            StockReservation failedRes = new StockReservation(orderId, "FAILED", failureReason);
            stockReservationRepository.save(failedRes);

            // 8. Publish business failure event (not an infrastructure retry loop)
            InventoryReservationFailedEvent failEvent = new InventoryReservationFailedEvent(orderId, event.getCustomerId(), failureReason);
            amqpTemplate.convertAndSend(EventConstants.EXCHANGE_INVENTORY, EventConstants.ROUTING_KEY_INVENTORY_FAILED, failEvent);
            log.warn("Stock reservation failed for order {}: {}. Emitted InventoryReservationFailedEvent.", orderId, failureReason);
        }
    }

    private void evictCatalogCache() {
        try {
            if (cacheManager.getCache(RedisConfig.CACHE_PRODUCTS_ALL) != null) {
                cacheManager.getCache(RedisConfig.CACHE_PRODUCTS_ALL).clear();
            }
            if (cacheManager.getCache(RedisConfig.CACHE_PRODUCTS_DETAIL) != null) {
                cacheManager.getCache(RedisConfig.CACHE_PRODUCTS_DETAIL).clear();
            }
            log.info("Evicted Redis product caches after inventory update.");
        } catch (Exception e) {
            log.warn("Could not evict Redis cache: {}", e.getMessage());
        }
    }
}
