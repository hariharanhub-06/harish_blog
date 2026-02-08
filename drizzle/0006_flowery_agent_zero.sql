CREATE TABLE "client_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"lead_id" text NOT NULL,
	"title" text NOT NULL,
	"client_name" text NOT NULL,
	"business_name" text,
	"description" text,
	"scope_summary" text,
	"timeline" text,
	"price" real DEFAULT 0,
	"advance_paid" real DEFAULT 0,
	"balance_amount" real DEFAULT 0,
	"payment_status" text DEFAULT 'pending',
	"status" text DEFAULT 'onboarding',
	"agreement_content" text,
	"invoice_url" text,
	"onboarding_checklist" jsonb,
	"progress_milestones" jsonb,
	"internal_cost" real DEFAULT 0,
	"expected_profit" real DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "finance_debts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"initial_amount" real DEFAULT 0 NOT NULL,
	"remaining_amount" real DEFAULT 0 NOT NULL,
	"notes" text,
	"repayment_type" text DEFAULT 'single',
	"due_date" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "finance_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" real NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"type" text NOT NULL,
	"debt_id" text,
	"date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"asset_url" text NOT NULL,
	"asset_type" text DEFAULT 'image',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"user_name" text NOT NULL,
	"score" integer DEFAULT 0,
	"moves" integer,
	"time_taken" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "live_session_minutes" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"content" text NOT NULL,
	"speaker_name" text,
	"type" text DEFAULT 'transcript',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "live_session_moderator_policies" (
	"session_id" text PRIMARY KEY NOT NULL,
	"disable_audio" boolean DEFAULT false,
	"disable_video" boolean DEFAULT false,
	"disable_screen_sharing" boolean DEFAULT false,
	"disable_chat" boolean DEFAULT false,
	"disable_reactions" boolean DEFAULT false,
	"transcription_language" text DEFAULT 'en-IN',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "live_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" real DEFAULT 0 NOT NULL,
	"start_time" timestamp NOT NULL,
	"duration" integer DEFAULT 60,
	"meeting_link" text,
	"poster_url" text,
	"status" text DEFAULT 'scheduled',
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "meeting_availability" (
	"id" text PRIMARY KEY NOT NULL,
	"day_of_week" integer,
	"start_time" text,
	"end_time" text,
	"is_available" boolean DEFAULT true,
	"specific_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "meeting_schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"meeting_type" text NOT NULL,
	"club_name" text NOT NULL,
	"num_attendees" integer,
	"notes" text,
	"president_name" text,
	"mobile_number" text,
	"drive_link" text,
	"venue" text,
	"venue_details" text,
	"scheduled_date" timestamp NOT NULL,
	"end_date" timestamp,
	"status" text DEFAULT 'requested',
	"is_visible" boolean DEFAULT true,
	"checklist_data" jsonb,
	"scoring_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pricing_base_costs" (
	"id" text PRIMARY KEY NOT NULL,
	"component" text NOT NULL,
	"internal_cost" real DEFAULT 0 NOT NULL,
	"type" text DEFAULT 'Fixed' NOT NULL,
	"notes" text,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "pricing_discounts" (
	"id" text PRIMARY KEY NOT NULL,
	"condition" text NOT NULL,
	"max_discount" real DEFAULT 0 NOT NULL,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "pricing_feature_rates" (
	"id" text PRIMARY KEY NOT NULL,
	"feature" text NOT NULL,
	"category" text NOT NULL,
	"internal_cost" real DEFAULT 0 NOT NULL,
	"selling_price" real DEFAULT 0 NOT NULL,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "pricing_multipliers" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"label" text NOT NULL,
	"value" real DEFAULT 1 NOT NULL,
	"is_percentage" boolean DEFAULT false,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "pricing_page_rates" (
	"id" text PRIMARY KEY NOT NULL,
	"page_type" text NOT NULL,
	"internal_cost" real DEFAULT 0 NOT NULL,
	"selling_price" real DEFAULT 0 NOT NULL,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "project_quotes" (
	"id" text PRIMARY KEY NOT NULL,
	"project_name" text NOT NULL,
	"client_name" text NOT NULL,
	"quote_token" text,
	"configuration" jsonb NOT NULL,
	"final_price" real NOT NULL,
	"internal_cost" real NOT NULL,
	"expected_profit" real NOT NULL,
	"profit_margin" real NOT NULL,
	"deliverables" jsonb,
	"timeline" text,
	"status" text DEFAULT 'draft',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "project_quotes_quote_token_unique" UNIQUE("quote_token")
);
--> statement-breakpoint
CREATE TABLE "quiz_live_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"question_id" text NOT NULL,
	"participant_id" text NOT NULL,
	"option_id" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scheduler_config" (
	"id" integer PRIMARY KEY NOT NULL,
	"enable_min_days_constraint" boolean DEFAULT true,
	"min_days_before_booking" integer DEFAULT 3,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scheduler_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"file_url" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_registrations" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"user_mobile" text NOT NULL,
	"razorpay_order_id" text,
	"razorpay_payment_id" text,
	"razorpay_signature" text,
	"amount_paid" real DEFAULT 0,
	"status" text DEFAULT 'pending',
	"join_token" text,
	"active_session_id" text,
	"last_active_at" timestamp,
	"registered_at" timestamp DEFAULT now(),
	CONSTRAINT "session_registrations_join_token_unique" UNIQUE("join_token")
);
--> statement-breakpoint
CREATE TABLE "typing_test_results" (
	"id" text PRIMARY KEY NOT NULL,
	"user_name" text NOT NULL,
	"wpm" integer NOT NULL,
	"accuracy" integer NOT NULL,
	"duration" integer NOT NULL,
	"difficulty" text DEFAULT 'basic',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "contact_submissions" ALTER COLUMN "status" SET DEFAULT 'New';--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD COLUMN "business_type" text;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD COLUMN "requested_service" text;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD COLUMN "admin_notes" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "audio_url" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "featured_video_url" text;