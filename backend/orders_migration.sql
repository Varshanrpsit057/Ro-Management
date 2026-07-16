-- Orders & Service Bookings migration

-- Customer orders
CREATE TABLE IF NOT EXISTS store_orders (
    id              SERIAL PRIMARY KEY,
    session_id      VARCHAR(64) NOT NULL,
    customer_name   VARCHAR(100) NOT NULL,
    customer_phone  VARCHAR(15) NOT NULL,
    customer_address TEXT NOT NULL,
    payment_method  VARCHAR(20) DEFAULT 'cod' CHECK (payment_method IN ('cod','pay_at_shop','phone_order')),
    total_amount    DECIMAL(10,2) NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','shipped','delivered')),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS store_order_items (
    id            SERIAL PRIMARY KEY,
    order_id      INT NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
    product_id    INT NOT NULL REFERENCES store_products(id) ON DELETE SET NULL,
    product_name  VARCHAR(200) NOT NULL,
    price         DECIMAL(10,2) NOT NULL,
    qty           INT NOT NULL DEFAULT 1
);

-- Service bookings
CREATE TABLE IF NOT EXISTS service_bookings (
    id              SERIAL PRIMARY KEY,
    customer_name   VARCHAR(100) NOT NULL,
    customer_phone  VARCHAR(15) NOT NULL,
    customer_address TEXT NOT NULL,
    service_type    VARCHAR(50) NOT NULL CHECK (service_type IN ('installation','repair','filter_replacement','amc','other')),
    preferred_date  DATE,
    description     TEXT,
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','assigned','completed','cancelled')),
    technician      VARCHAR(100),
    admin_notes     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
