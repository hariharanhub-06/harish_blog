-- HM Snacks Affiliates Table Migration
-- Run this SQL in your Neon database console

CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    mobile TEXT NOT NULL UNIQUE,
    upi_id TEXT NOT NULL,
    email TEXT,
    social_link TEXT,
    coupon_code TEXT UNIQUE,
    status TEXT DEFAULT 'Pending',
    is_active BOOLEAN DEFAULT false,
    total_orders INTEGER DEFAULT 0,
    total_commission DOUBLE PRECISION DEFAULT 0,
    current_tier TEXT DEFAULT 'Newbie',
    created_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_coupon_code ON affiliates(coupon_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_mobile ON affiliates(mobile);

-- Verify table creation
SELECT * FROM affiliates LIMIT 1;
