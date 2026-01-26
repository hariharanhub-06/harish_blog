CREATE TABLE IF NOT EXISTS ai_assistant_config (
    id TEXT PRIMARY KEY,
    persona TEXT,
    pricing TEXT,
    faq TEXT,
    convincing_tactics TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO ai_assistant_config (id, persona, pricing, faq, convincing_tactics)
VALUES ('default', '', '', '', '')
ON CONFLICT (id) DO NOTHING;
