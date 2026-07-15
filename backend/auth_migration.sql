-- Auth migration: adds users table + user_id FK to existing tables
-- Run against ro_service_db

-- Users table (simple username/password, bcrypt hashed)
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,   -- bcrypt hash
    full_name   VARCHAR(100),
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Add user_id to existing tables (nullable initially for migration, then set NOT NULL after backfill)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE products  ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;

-- Seed users (password is "password123" hashed with bcrypt)
-- Generate: const bcrypt = require('bcryptjs'); bcrypt.hashSync('password123', 10)
INSERT INTO users (username, password, full_name) VALUES
    ('admin',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin User'),
    ('shop1',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Shop Owner 1'),
    ('shop2',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Shop Owner 2'),
    ('demo',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Demo User')
ON CONFLICT (username) DO NOTHING;

-- Backfill existing data to admin user (id=1)
UPDATE customers SET user_id = 1 WHERE user_id IS NULL;
UPDATE products  SET user_id = 1 WHERE user_id IS NULL;
