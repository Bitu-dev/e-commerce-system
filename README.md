<p align="center">
  <img src="frontend/public/brand/aurora-logo.svg" alt="Aurora Hardware Logo" width="460" />
</p>

# E-Commerce System — Event-Driven Order & Inventory Management Platform

A full-stack, distributed event-driven microservices e-commerce platform built with **Java 21 / Spring Boot 3.3**, **PostgreSQL**, **RabbitMQ**, **Redis**, **Keycloak OAuth2 with PKCE (S256)**, and **Next.js 16 (React 19)**.

> **Primary Documentation Links**:
> - 📘 **[Enterprise Project Documentation (Markdown)](docs/PROJECT_DOCUMENTATION.md)** | 📄 **[Download PDF Edition (14 Pages)](docs/PROJECT_DOCUMENTATION.pdf)**: Complete system specifications, class/method dictionary, REST API contracts, entity schemas, C4 diagrams, and RabbitMQ topologies.
> - 🔬 **[Technical Deep Dive & Architecture Explanation (Markdown)](docs/TECHNICAL_DEEP_DIVE.md)** | 📄 **[Download PDF Edition (12 Pages)](docs/TECHNICAL_DEEP_DIVE.pdf)**: Conceptual engineering guide covering Keycloak PKCE S256, transactional outbox patterns, row-level pessimistic locking, and resilient event choreography.

---

## 1. System Architecture

```
                            Next.js Frontend (:3000)
                                      |
                           REST + Keycloak JWT (PKCE)
                                      |
                     +----------------+----------------+
                     |                                 |
           Order Service (:8082)            Product & Inventory (:8081)
           DB: order_db                     DB: product_db
                     |                                 |
                     |                        Redis Cache (:6379)
                     +-------- RabbitMQ (:5672) -------+
                                      |
                           Notification Service (:8083)
                           DB: notification_db
```

### Component Overview & Port Mapping

| Component | Technology | Port | Database / Broker |
| :--- | :--- | :--- | :--- |
| **Product & Inventory Service** | Spring Boot 3.3.4 (Java 21) | `8081` | PostgreSQL (`product_db`), Redis (`6379`) |
| **Order Service** | Spring Boot 3.3.4 (Java 21) | `8082` | PostgreSQL (`order_db`) |
| **Notification Service** | Spring Boot 3.3.4 (Java 21) | `8083` | PostgreSQL (`notification_db`) |
| **Frontend Web Application** | Next.js 16, React 19, Tailwind CSS | `3000` | Browser Client |
| **Identity & Access Management** | Keycloak 24.0 (PKCE S256) | `8080` | Realm: `mini-commerce` |
| **Message Broker** | RabbitMQ 3.13 | `5672` (AMQP) / `15672` (UI) | Topic Exchanges & DLQ |
| **Cache Store** | Redis 7 | `6379` | 5-min TTL with explicit eviction |
| **Database Server** | PostgreSQL 16 | `5432` | 3 logically isolated databases |

---

## 2. Asynchronous Event-Driven Flow

```
Customer                Order Service                Product Service             RabbitMQ               Notification Service
   │                          │                             │                        │                          │
   │─── 1. POST /api/orders ─►│                             │                        │                          │
   │    (Status: PENDING)     │── 2. OrderPlacedEvent ──────────────────────────────►│                          │
   │                          │                             │                        │── 3. Consume OrderPlaced►│
   │                          │                             │                        │                          │ (Creates Notif)
   │                          │                             │◄── 4. OrderPlaced ─────│                          │
   │                          │                             │                        │                          │
   │                          │                             │── 5. Atomic Stock ─────│                          │
   │                          │                             │      Reservation       │                          │
   │                          │                             │      (SELECT FOR UPDATE)                          │
   │                          │                             │                        │                          │
   │                          │                             │── 6. InvReserved ─────►│                          │
   │                          │                             │      (or InvFailed)    │                          │
   │                          │◄── 7. Consume InvReserved ───────────────────────────│                          │
   │                          │                                                      │                          │
   │                          │── 8. Status: CONFIRMED ─────────────────────────────►│                          │
   │                          │      OrderConfirmedEvent                             │                          │
   │                          │                                                      │── 9. OrderConfirmed ────►│
   │                          │                                                      │                          │ (Confirmed Notif)
   │◄── 10. Poll GET /orders ─│                                                      │                          │
```

---

## 3. Reliability & Failure Handling Safeguards

1. **Atomic Inventory Reservation**:
   - Uses **pessimistic row locking** (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) in `ProductRepository` during order reservation.
   - Prevents concurrent orders from overselling inventory.
2. **Idempotent Consumers**:
   - `StockReservation` table enforces a **unique constraint** on `order_id` to guarantee that repeated delivery of `OrderPlaced` cannot deduct stock twice.
   - `Notification` table enforces a **unique constraint** on `event_id` to prevent duplicate notifications upon message redelivery.
3. **Transactional Outbox Pattern**:
   - Orders are saved and an `OutboxEvent` record is written within the **same atomic database transaction**, guaranteeing zero event loss.
4. **Dead-Letter Exchange (DLX)**:
   - Poison-pill messages that exhaust the retry policy (3 attempts with exponential backoff) are routed to `dlx.exchange` and collected in `dead.letter.queue`.
5. **Manual Acknowledgements**:
   - Consumers acknowledge messages (`basicAck`) only after database transactions commit.

---

## 4. Keycloak Authentication & Roles

- **Realm**: `mini-commerce`
- **Client**: `mini-commerce-web` (Public client, Authorization Code Flow with PKCE using `S256`).
- **Test Credentials**:

| User | Password | Role | Permissions |
| :--- | :--- | :--- | :--- |
| **`bitaniya.user`** | `password123` | `USER` | Browse catalog, place orders, view own order history & notifications. |
| **`bitaniya.admin`** | `adminPass2026` | `ADMIN` | Manage products, adjust stock quantities, view all orders and fulfillment. |

---

## 5. Quickstart Guide

### Prerequisites
- Docker & Docker Desktop (running)
- Java 21+ and Maven 3.9+
- Node.js 20+ and pnpm

### Step 1: Start Infrastructure Containers
```bash
docker compose up -d
```
Verify all 4 containers are healthy:
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- RabbitMQ: `http://localhost:15672` (guest / guest)
- Keycloak: `http://localhost:8080` (admin / admin)

### Step 2: Build & Run Backend Microservices
```bash
cd backend
mvn clean package -DskipTests

# Terminal 1: Product & Inventory Service (8081)
java -jar product-service/target/product-service-1.0.0-SNAPSHOT.jar

# Terminal 2: Order Service (8082)
java -jar order-service/target/order-service-1.0.0-SNAPSHOT.jar

# Terminal 3: Notification Service (8083)
java -jar notification-service/target/notification-service-1.0.0-SNAPSHOT.jar
```

### Step 3: Run Frontend Web Application
```bash
cd frontend
pnpm install
pnpm dev --port 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 6. REST API Reference

### Product & Inventory Service (`:8081`)
- `GET /api/products` — Browse active products (Redis cached)
- `GET /api/products/{id}` — Get single product (Redis cached)
- `POST /api/products` — Create new product (`ADMIN` only)
- `PUT /api/products/{id}` — Update product (`ADMIN` only)
- `PATCH /api/products/{id}/stock` — Adjust stock quantity (`ADMIN` only)

### Order Service (`:8082`)
- `POST /api/orders` — Place order (`USER` only)
- `GET /api/orders/my` — Get authenticated customer's orders (`USER` only)
- `GET /api/orders/{id}` — Get single order (Owner or `ADMIN`)
- `GET /api/orders` — Get all orders (`ADMIN` only)

### Notification Service (`:8083`)
- `GET /api/notifications/my` — Get authenticated customer's notifications (`USER` only)
- `PATCH /api/notifications/{id}/read` — Mark notification as read (Owner only)
- `GET /api/notifications` — View all notifications (`ADMIN` only)

---

## 7. Inspecting Failed Messages & Dead Letter Queue (DLQ) Recovery

As required by **Assessment Section 5.1**, transient infrastructure errors or poisoned messages that fail consumer processing are bounded to 3 retries and rejected with `basicNack(deliveryTag, false, false)` directly into the **Dead Letter Exchange** (`dlx.exchange` -> `dead.letter.queue`).

### 1. Inspecting Failed Messages in RabbitMQ
1. Navigate to the RabbitMQ Management Portal: **[http://localhost:15672](http://localhost:15672)** (Credentials: `guest` / `guest`).
2. Go to the **Queues** tab and click on **`dead.letter.queue`**.
3. Expand the **Get messages** section:
   - Set **Ack Mode** to `Nack message requeue: true` (to preview without destructive deletion).
   - Click **Get Message(s)**.
4. Review the payload and the `x-death` header array, which contains:
   - `reason`: Why the message was dead-lettered (`rejected` or `expired`).
   - `queue`: Original source queue name.
   - `count`: Total delivery attempts.
   - `time`: Timestamp of rejection.

### 2. Recovering & Replaying Failed Messages
Once the root cause (e.g. database network outage, schema change) is corrected:
- **Option A (RabbitMQ Shovel Plugin / Management UI)**:
  1. In the Management UI, navigate to `Admin` -> `Shovel Management`.
  2. Create a shovel from Source Queue `dead.letter.queue` to Destination Exchange `order.exchange` (or `inventory.exchange`) with the original routing key.
- **Option B (Transactional Outbox Resend)**:
  - Any orders where publishing failed remain in the `outbox_events` table with status `FAILED` or `PENDING`.
  - Re-run the background scanner or reset the status via SQL:
    ```sql
    UPDATE outbox_events SET status = 'PENDING', retry_count = 0 WHERE status = 'FAILED';
    ```
    The `OutboxPublisherService` `@Scheduled(fixedDelay = 5000)` daemon will immediately re-publish the pending records.

---

## 8. Running Automated Tests

Run the comprehensive unit test suite across all 3 microservices covering atomic inventory deduction, pessimistic locking, transactional outbox creation, status transitions, and consumer idempotency:

```bash
cd backend
mvn test
```

