CREATE TABLE "admin_trusted_devices" (
	"id" text PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"device_name" text NOT NULL,
	"device_token_hash" text NOT NULL,
	"browser" text,
	"os" text,
	"last_used_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_trusted_devices_device_token_hash_unique" UNIQUE("device_token_hash")
);
--> statement-breakpoint
CREATE TABLE "agile_deployment_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"version" text NOT NULL,
	"deployment_date" timestamp DEFAULT now(),
	"summary" text,
	"bugs_fixed" jsonb,
	"features_shipped" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agile_epics" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#0052CC',
	"status" text DEFAULT 'To Do',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agile_issues" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"epic_id" text,
	"sprint_id" text,
	"parent_id" text,
	"title" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'story' NOT NULL,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"status" text DEFAULT 'To Do' NOT NULL,
	"story_points" integer DEFAULT 0,
	"assignee" text,
	"position" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agile_meetings" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"sprint_id" text,
	"type" text NOT NULL,
	"date" timestamp DEFAULT now(),
	"content" jsonb,
	"mood" integer DEFAULT 5,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agile_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"description" text,
	"lead" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agile_projects_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "agile_sprints" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"goal" text,
	"status" text DEFAULT 'planned' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agile_workflows" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text DEFAULT 'Standard Workflow' NOT NULL,
	"status_order" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "form_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"form_id" text NOT NULL,
	"type" text NOT NULL,
	"question_text" text NOT NULL,
	"required" boolean DEFAULT false,
	"options" jsonb,
	"image_url" text,
	"section_id" text,
	"logic_conditions" jsonb,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "form_response_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"response_id" text NOT NULL,
	"question_id" text NOT NULL,
	"answer_text" text,
	"answer_choices" jsonb
);
--> statement-breakpoint
CREATE TABLE "form_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"form_id" text NOT NULL,
	"status" text DEFAULT 'New',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_published" boolean DEFAULT false,
	"banner_url" text,
	"banner_position" text DEFAULT 'center',
	"theme_color" text,
	"post_submission_action" text DEFAULT 'message',
	"post_submission_data" text,
	"automation_enabled" boolean DEFAULT false,
	"automation_channels" jsonb,
	"automation_template" text,
	"custom_success_message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "heart_reactions" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lucky_draw_clicks" (
	"id" text PRIMARY KEY NOT NULL,
	"referral_code" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"clicked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lucky_draw_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"mobile" text NOT NULL,
	"selfie_url" text NOT NULL,
	"favorite_number" integer,
	"unique_lucky_number" text,
	"referral_code" text NOT NULL,
	"referred_by" text,
	"language" text DEFAULT 'en',
	"step" integer DEFAULT 1,
	"is_winner" boolean DEFAULT false,
	"privacy_consent" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "lucky_draw_entries_mobile_unique" UNIQUE("mobile"),
	CONSTRAINT "lucky_draw_entries_unique_lucky_number_unique" UNIQUE("unique_lucky_number"),
	CONSTRAINT "lucky_draw_entries_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "routine_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"routine_id" text NOT NULL,
	"date" text NOT NULL,
	"is_completed" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "routines" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"schedule" jsonb,
	"order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smile_analytics" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"event" text NOT NULL,
	"ip_hash" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smile_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'pause',
	"link" text DEFAULT '/smile',
	"lines" jsonb NOT NULL,
	"rare_lines" jsonb,
	"rare_chance" integer DEFAULT 10,
	"poster_bg_gradient" text DEFAULT '#1a1a2e,#16213e',
	"share_text" text DEFAULT 'This made me smile 😄 Try yours →',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"youtube_playlist_id" text,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "story_episodes" (
	"id" text PRIMARY KEY NOT NULL,
	"story_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"youtube_video_id" text NOT NULL,
	"thumbnail_url" text,
	"duration" text,
	"episode_number" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "travelledPlaces" (
	"id" text PRIMARY KEY NOT NULL,
	"cityName" text NOT NULL,
	"country" text NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "visitor_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"visitor_number" integer NOT NULL,
	"ip_hash" text,
	"country" text,
	"country_code" text,
	"first_visit" timestamp DEFAULT now(),
	"last_visit" timestamp DEFAULT now(),
	"total_time_seconds" integer DEFAULT 0,
	"visit_count" integer DEFAULT 1
);
--> statement-breakpoint
ALTER TABLE "feedbacks" ALTER COLUMN "status" SET DEFAULT 'New';--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_hero_section" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_stats_section" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_training_section" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_experience_section" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_education_section" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_volunteering_section" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_about_section" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_projects_section" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_quizzes_section" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_typing_test_section" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_feedback_section" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_games_section" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_live_sessions_section" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_know_about_you_section" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "click_effect" text DEFAULT 'none';