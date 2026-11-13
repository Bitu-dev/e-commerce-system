-- ========================================================
-- Mini Commerce Platform: PostgreSQL Initialization
-- Creates 3 logically isolated databases with dedicated credentials
-- Service 1: Product & Inventory Service -> product_db (owner: product_user)
-- Service 2: Order Service               -> order_db   (owner: order_user)
-- Service 3: Notification Service        -> notification_db (owner: notification_user)
-- ========================================================

-- 1. Create dedicated users with secure passwords
CREATE USER product_user WITH PASSWORD 'product_pass';
CREATE USER order_user WITH PASSWORD 'order_pass';
CREATE USER notification_user WITH PASSWORD 'notification_pass';

-- 2. Create isolated databases owned by each service user
CREATE DATABASE product_db OWNER product_user;
CREATE DATABASE order_db OWNER order_user;
CREATE DATABASE notification_db OWNER notification_user;

-- 3. Grant schema & connection privileges
GRANT ALL PRIVILEGES ON DATABASE product_db TO product_user;
GRANT ALL PRIVILEGES ON DATABASE order_db TO order_user;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO notification_user;

-- Connect to each database to configure default permissions
\connect product_db
GRANT ALL ON SCHEMA public TO product_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO product_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO product_user;

\connect order_db
GRANT ALL ON SCHEMA public TO order_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO order_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO order_user;

\connect notification_db
GRANT ALL ON SCHEMA public TO notification_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO notification_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO notification_user;
