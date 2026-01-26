-- SQL for Training Academy Setup
-- Run these in your Neon Console (SQL Editor)

-- 1. Skills Table (for Domain Expertise)
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    proficiency INTEGER DEFAULT 0,
    icon TEXT,
    "order" INTEGER DEFAULT 0
);

-- 2. Partnerships Table (for Academic Partners)
-- Note: This table likely already exists, but ensure it has the correct structure for "Academic Partner" types.
CREATE TABLE IF NOT EXISTS partnerships (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    partner_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_partnerships_type ON partnerships(partner_type);
CREATE INDEX IF NOT EXISTS idx_skills_order ON skills("order");

-- Optional: Add some initial categories for skills if needed
-- INSERT INTO skills (name, category, icon) VALUES ('Next.js', 'Frontend', '⚡');
