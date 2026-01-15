-- Database Performance Indexes for Affiliate System
-- Run this script in your Neon database console

-- Speed up affiliate lookups by referral code
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code 
  ON affiliates(referral_code);

-- Speed up order queries by affiliate
CREATE INDEX IF NOT EXISTS idx_orders_affiliate_id 
  ON orders(affiliate_id);

-- Speed up commission calculations (status + affiliate combination)
CREATE INDEX IF NOT EXISTS idx_orders_status_affiliate 
  ON orders(status, affiliate_id);

-- Speed up recent order queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
  ON orders(created_at DESC);

-- Optional: Composite index for affiliate dashboard queries
CREATE INDEX IF NOT EXISTS idx_orders_affiliate_status_created 
  ON orders(affiliate_id, status, created_at DESC);

-- Analyze tables to update query planner statistics
ANALYZE affiliates;
ANALYZE orders;
