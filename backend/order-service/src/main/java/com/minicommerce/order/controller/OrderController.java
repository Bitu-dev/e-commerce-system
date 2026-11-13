package com.minicommerce.order.controller;

import com.minicommerce.order.model.Order;
import com.minicommerce.order.model.OrderItem;
import com.minicommerce.order.service.OrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    public static class CreateOrderItemRequest {
        public String productId;
        public String productName;
        public BigDecimal unitPrice;
        public int quantity;
    }

    public static class CreateOrderRequest {
        public List<CreateOrderItemRequest> items;
    }

    /**
     * USER: Submit order. Validates payload, stores snapshot, and emits OrderPlaced.
     */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest request,
                                         @AuthenticationPrincipal Jwt jwt) {
        if (request.items == null || request.items.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Order must contain at least one item."));
        }

        String customerId = jwt.getSubject();
        String customerName = jwt.getClaimAsString("name");
        if (customerName == null) customerName = jwt.getClaimAsString("preferred_username");
        if (customerName == null) customerName = "Customer (" + customerId + ")";

        String customerEmail = jwt.getClaimAsString("email");
        if (customerEmail == null) customerEmail = "customer@minicommerce.local";

        List<OrderItem> orderItems = request.items.stream()
                .map(req -> new OrderItem(
                        req.productId,
                        req.productName != null ? req.productName : req.productId,
                        req.unitPrice != null ? req.unitPrice : BigDecimal.ZERO,
                        req.quantity > 0 ? req.quantity : 1
                ))
                .collect(Collectors.toList());

        try {
            Order order = orderService.placeOrder(customerId, customerName, customerEmail, orderItems);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * USER: Get only the authenticated customer's orders.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal Jwt jwt) {
        String customerId = jwt.getSubject();
        List<Order> orders = orderService.getOrdersByCustomer(customerId);
        return ResponseEntity.ok(orders);
    }

    /**
     * ADMIN: View all orders across all customers.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /**
     * Owner USER or ADMIN: View single order details by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable String id,
                                          @AuthenticationPrincipal Jwt jwt,
                                          org.springframework.security.core.Authentication authentication) {
        return orderService.getOrderById(id)
                .map(order -> {
                    boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    if (!isAdmin && !order.getCustomerId().equals(jwt.getSubject())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "403 Forbidden: You do not own this order."));
                    }
                    return ResponseEntity.ok(order);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
