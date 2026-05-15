-- Update profiles table with social section controls
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "show_social_section" boolean DEFAULT false;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "social_section_media_url" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "social_section_media_type" text DEFAULT 'image';
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "social_section_title" text DEFAULT 'Social Space';
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "social_section_subtitle" text DEFAULT 'Join the conversation!';

-- Create website_polls table
CREATE TABLE IF NOT EXISTS "website_polls" (
  "id" text PRIMARY KEY NOT NULL,
  "question" text NOT NULL,
  "options" jsonb NOT NULL,
  "is_active" boolean DEFAULT true,
  "background_url" text,
  "background_type" text DEFAULT 'image',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create poll_responses table
CREATE TABLE IF NOT EXISTS "poll_responses" (
  "id" text PRIMARY KEY NOT NULL,
  "poll_id" text NOT NULL,
  "option_index" integer NOT NULL,
  "ip_hash" text,
  "platform" text DEFAULT 'direct',
  "created_at" timestamp DEFAULT now()
);

-- Create website_questions table
CREATE TABLE IF NOT EXISTS "website_questions" (
  "id" text PRIMARY KEY NOT NULL,
  "prompt" text NOT NULL,
  "is_active" boolean DEFAULT true,
  "background_url" text,
  "background_type" text DEFAULT 'image',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create website_question_responses table
CREATE TABLE IF NOT EXISTS "website_question_responses" (
  "id" text PRIMARY KEY NOT NULL,
  "question_id" text NOT NULL,
  "user_name" text,
  "answer_text" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);

-- Create social_game_sessions table
CREATE TABLE IF NOT EXISTS "social_game_sessions" (
  "id" text PRIMARY KEY NOT NULL,
  "game_id" text NOT NULL,
  "title" text NOT NULL,
  "is_active" boolean DEFAULT true,
  "play_count" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now()
);
