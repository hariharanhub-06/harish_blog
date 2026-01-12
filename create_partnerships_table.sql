-- Partnerships table for managing partner logos and information
-- Copy and run this SQL in your Neon database console

CREATE TABLE IF NOT EXISTS partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    partner_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries on active partnerships
CREATE INDEX idx_partnerships_active ON partnerships(is_active, display_order);

-- Insert sample data (optional, for testing)
-- INSERT INTO partnerships (name, logo, partner_type, display_order) VALUES
-- ('Partner 1', 'https://ik.imagekit.io/your-id/partner1.png', 'Supplier', 1),
-- ('Partner 2', 'https://ik.imagekit.io/your-id/partner2.png', 'Distributor', 2),
-- ('Partner 3', 'https://ik.imagekit.io/your-id/partner3.png', 'Sponsor', 3);
