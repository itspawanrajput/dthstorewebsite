-- Database Schema using MySQL

CREATE DATABASE IF NOT EXISTS dth_store;
USE dth_store;

-- Users Table (Admin/Staff)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords in production!
    name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN', 'STAFF') DEFAULT 'STAFF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    location VARCHAR(100),
    service_type VARCHAR(50), -- DTH, Broadband
    operator VARCHAR(50),
    status VARCHAR(20) DEFAULT 'New', -- New, Contacted, Interested, Installed, Cancelled
    source VARCHAR(50) DEFAULT 'Website',
    order_id VARCHAR(50),
    created_at BIGINT
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    price VARCHAR(50) NOT NULL,
    original_price VARCHAR(50),
    type VARCHAR(50),
    features JSON, -- Helper to store array of strings
    image TEXT, -- Base64 or URL
    color VARCHAR(50),
    is_best_seller BOOLEAN DEFAULT FALSE
);

-- Site Config Table (Single Row)
CREATE TABLE IF NOT EXISTS site_config (
    id INT PRIMARY KEY DEFAULT 1,
    config_json JSON
);

-- Initialize Default Admin (Password: 123)
-- In a real app, use bcrypt to hash '123' -> '$2b$10$...'
INSERT INTO users (username, password_hash, name, role) 
VALUES ('admin', '123', 'Super Admin', 'ADMIN') 
ON DUPLICATE KEY UPDATE username=username;
