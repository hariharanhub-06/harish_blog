-- HariPicks Affiliate Products Table
-- Run this in Neon SQL Editor

CREATE TABLE affiliate_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    original_price DECIMAL(10,2),
    discounted_price DECIMAL(10,2),
    discount_percent INTEGER,
    affiliate_url TEXT NOT NULL,
    image_url TEXT,
    platform VARCHAR(50), -- 'amazon', 'flipkart', 'other'
    category VARCHAR(100), -- 'Electronics', 'Fashion', 'Home', 'Books', etc.
    rating DECIMAL(2,1), -- e.g., 4.5
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_affiliate_products_platform ON affiliate_products(platform);
CREATE INDEX idx_affiliate_products_category ON affiliate_products(category);
CREATE INDEX idx_affiliate_products_is_featured ON affiliate_products(is_featured);
CREATE INDEX idx_affiliate_products_is_active ON affiliate_products(is_active);
CREATE INDEX idx_affiliate_products_created_at ON affiliate_products(created_at DESC);

-- Add a comment to the table
COMMENT ON TABLE affiliate_products IS 'HariPicks affiliate product showcase for Amazon, Flipkart, and other e-commerce platforms';
