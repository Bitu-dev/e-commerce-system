package com.minicommerce.product.service;

import com.minicommerce.events.EventConstants;
import com.minicommerce.events.ProductUpdatedEvent;
import com.minicommerce.product.config.RedisConfig;
import com.minicommerce.product.model.Product;
import com.minicommerce.product.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final RabbitTemplate rabbitTemplate;

    public ProductService(ProductRepository productRepository, RabbitTemplate rabbitTemplate) {
        this.productRepository = productRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Cacheable(value = RedisConfig.CACHE_PRODUCTS_ALL)
    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        log.info("Fetching all active products from database (cache miss)");
        return productRepository.findByActiveTrueOrderByCreatedAtDesc();
    }

    @Cacheable(value = RedisConfig.CACHE_PRODUCTS_DETAIL, key = "#id", unless = "#result == null")
    @Transactional(readOnly = true)
    public Optional<Product> getProductById(String id) {
        log.info("Fetching product details for ID {} from database (cache miss)", id);
        return productRepository.findById(id);
    }

    @CacheEvict(value = {RedisConfig.CACHE_PRODUCTS_ALL, RedisConfig.CACHE_PRODUCTS_DETAIL}, allEntries = true)
    @Transactional
    public Product createProduct(Product product) {
        if (product.getId() == null || product.getId().isBlank()) {
            product.setId("prod-" + java.util.UUID.randomUUID().toString().substring(0, 8));
        }
        product.setCreatedAt(Instant.now());
        product.setUpdatedAt(Instant.now());

        Product saved = productRepository.save(product);
        log.info("Created new product ID {} with initial stock {}. Invalidating Redis cache.", saved.getId(), saved.getStockQuantity());

        publishProductUpdatedEvent(saved.getId(), "CREATED", saved.getStockQuantity());
        return saved;
    }

    @CacheEvict(value = {RedisConfig.CACHE_PRODUCTS_ALL, RedisConfig.CACHE_PRODUCTS_DETAIL}, allEntries = true)
    @Transactional
    public Product updateProduct(String id, Product patch) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));

        if (patch.getName() != null) existing.setName(patch.getName());
        if (patch.getCategory() != null) existing.setCategory(patch.getCategory());
        if (patch.getDescription() != null) existing.setDescription(patch.getDescription());
        if (patch.getPrice() != null) existing.setPrice(patch.getPrice());
        if (patch.getImage() != null) existing.setImage(patch.getImage());
        if (patch.getBadge() != null) existing.setBadge(patch.getBadge());
        if (patch.getActive() != null) existing.setActive(patch.getActive());
        if (patch.getStockQuantity() != null) existing.setStockQuantity(patch.getStockQuantity());

        existing.setUpdatedAt(Instant.now());
        Product updated = productRepository.save(existing);
        log.info("Updated product ID {}. Invalidating Redis cache.", updated.getId());

        publishProductUpdatedEvent(updated.getId(), "UPDATED", updated.getStockQuantity());
        return updated;
    }

    @CacheEvict(value = {RedisConfig.CACHE_PRODUCTS_ALL, RedisConfig.CACHE_PRODUCTS_DETAIL}, allEntries = true)
    @Transactional
    public Product updateStock(String id, int newStock) {
        if (newStock < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative.");
        }

        Product product = productRepository.findByIdWithLock(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));

        int oldStock = product.getStockQuantity();
        product.setStockQuantity(newStock);
        product.setUpdatedAt(Instant.now());

        Product saved = productRepository.save(product);
        log.info("Adjusted stock for product ID {} from {} to {}. Invalidating Redis cache.", id, oldStock, newStock);

        publishProductUpdatedEvent(id, "STOCK_ADJUSTED", newStock);
        return saved;
    }

    private void publishProductUpdatedEvent(String productId, String action, int newStockQuantity) {
        try {
            ProductUpdatedEvent event = new ProductUpdatedEvent(productId, action, newStockQuantity);
            rabbitTemplate.convertAndSend(EventConstants.EXCHANGE_INVENTORY, EventConstants.ROUTING_KEY_PRODUCT_UPDATED, event);
            log.info("Published ProductUpdatedEvent for product {}", productId);
        } catch (Exception e) {
            log.warn("Failed to publish ProductUpdatedEvent for product {}: {}", productId, e.getMessage());
        }
    }

    @PostConstruct
    @Transactional
    public void seedInitialProducts() {
        if (productRepository.count() == 0) {
            log.info("Seeding initial flagship devices into product_db...");
            productRepository.save(new Product("prod-iphone-16-pro", "iPhone 16 Pro Max", "Smartphones",
                    "Grade 5 titanium design with sculpted edges, 48MP camera, and A18 Pro chip.",
                    new BigDecimal("49999.00"), 14,
                    "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1200&q=85", "Flagship"));

            productRepository.save(new Product("prod-macbook-pro-m4", "MacBook Pro 14” M4 Max", "Laptops",
                    "Liquid Retina XDR display with 1600 nits peak brightness and desktop-class M4 Max.",
                    new BigDecimal("89999.00"), 6,
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85", "Pro Performance"));

            productRepository.save(new Product("prod-sony-wh1000xm5", "Sony WH-1000XM5 Wireless ANC", "Audio",
                    "Industry-leading noise cancellation with dual processors and soft-fit leather.",
                    new BigDecimal("15499.00"), 22,
                    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85", "Best Seller"));

            productRepository.save(new Product("prod-galaxy-s25-ultra", "Samsung Galaxy S25 Ultra", "Smartphones",
                    "Next-gen Galaxy AI multimodal engine, integrated S Pen, titanium chassis.",
                    new BigDecimal("46999.00"), 11,
                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85", "Galaxy AI"));

            productRepository.save(new Product("prod-ps5-pro", "PlayStation 5 Pro Console", "Gaming",
                    "PlayStation Spectral Super Resolution (PSSR), 2TB high-speed NVMe SSD, ray tracing.",
                    new BigDecimal("29999.00"), 3,
                    "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=85", "Low Stock"));

            productRepository.save(new Product("prod-apple-watch-ultra-2", "Apple Watch Ultra 2 Black Titanium", "Wearables",
                    "Rugged 49mm titanium case, 3000 nits display, precision dual-frequency GPS.",
                    new BigDecimal("26999.00"), 8,
                    "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=1200&q=85", "Adventure"));

            productRepository.save(new Product("prod-ipad-pro-m4", "iPad Pro 13” Ultra Retina XDR", "Tablets",
                    "Tandem OLED breakthrough display, razor-thin 5.1mm chassis, M4 processor.",
                    new BigDecimal("43999.00"), 5,
                    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=85", "Tandem OLED"));
            log.info("Default hardware catalog seeded successfully.");
        }
    }
}
