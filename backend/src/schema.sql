-- RO Water Service Management — Database Schema
-- Run this against a PostgreSQL database to create all tables.

CREATE TABLE IF NOT EXISTS customers (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    phone       VARCHAR(15)  NOT NULL UNIQUE,
    address     TEXT,
    created_at  TIMESTAMPTZ  DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ro_systems (
    id            SERIAL PRIMARY KEY,
    customer_id   INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    model_name    VARCHAR(100),
    install_date  DATE,
    status        VARCHAR(20) DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive', 'removed')),
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    price       DECIMAL(10,2) NOT NULL,
    stock_qty   INT DEFAULT 0,
    image_url   VARCHAR(300),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS filter_replacements (
    id              SERIAL PRIMARY KEY,
    ro_system_id    INT NOT NULL REFERENCES ro_systems(id) ON DELETE CASCADE,
    filter_type     VARCHAR(50) NOT NULL
                    CHECK (filter_type IN ('sediment','carbon','RO_membrane','post_carbon','UF','UV','other')),
    replaced_date   DATE NOT NULL,
    next_due_date   DATE NOT NULL,
    cost            DECIMAL(10,2),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_history (
    id            SERIAL PRIMARY KEY,
    ro_system_id  INT NOT NULL REFERENCES ro_systems(id) ON DELETE CASCADE,
    service_date  DATE NOT NULL,
    description   TEXT NOT NULL,
    cost          DECIMAL(10,2),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
