-- HM Snacks Binary MLM Affiliate System Migration
-- RUN THIS IN NEON SQL EDITOR

-- 1. Drop old table if exists (or you can rename if you have data)
-- DROP TABLE IF EXISTS affiliates;

-- 2. Create Enhanced Affiliates Table
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    mobile TEXT NOT NULL UNIQUE,
    password TEXT,
    upi_id TEXT NOT NULL,
    email TEXT,
    social_link TEXT,
    coupon_code TEXT UNIQUE,
    
    -- Referral & Binary structure
    referrer_id UUID REFERENCES affiliates(id),
    parent_id UUID REFERENCES affiliates(id),
    position TEXT, -- 'left' or 'right'
    
    status TEXT DEFAULT 'Pending',
    is_active BOOLEAN DEFAULT false,
    
    -- Stats & Earnings
    total_orders INTEGER DEFAULT 0,
    total_sales_amount DOUBLE PRECISION DEFAULT 0,
    total_earnings DOUBLE PRECISION DEFAULT 0,
    direct_earnings DOUBLE PRECISION DEFAULT 0,
    level1_earnings DOUBLE PRECISION DEFAULT 0,
    level2_earnings DOUBLE PRECISION DEFAULT 0,
    level3_earnings DOUBLE PRECISION DEFAULT 0,
    pending_balance DOUBLE PRECISION DEFAULT 0,
    paid_balance DOUBLE PRECISION DEFAULT 0,
    
    current_tier TEXT DEFAULT 'Newbie',
    created_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP
);

-- 3. Affiliate Transactions (Ledger)
CREATE TABLE IF NOT EXISTS affiliate_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id),
    order_id TEXT,
    amount DOUBLE PRECISION NOT NULL,
    type TEXT NOT NULL, -- 'direct', 'level1', 'level2', 'level3', 'bonus'
    description TEXT,
    from_affiliate_id UUID REFERENCES affiliates(id),
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Payout Requests
CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id),
    amount DOUBLE PRECISION NOT NULL,
    upi_id TEXT NOT NULL,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliates_referrer ON affiliates(referrer_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_parent ON affiliates(parent_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_aff_trans_aff_id ON affiliate_transactions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_payout_aff_id ON payout_requests(affiliate_id);
