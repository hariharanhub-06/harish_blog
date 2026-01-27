CREATE TABLE "ai_assistant_config" (
	"id" text PRIMARY KEY NOT NULL,
	"knowledge_base" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedbacks" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"organization" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'Fresh' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_options" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"question_text" text NOT NULL,
	"image_url" text,
	"time_limit" integer,
	"points" integer DEFAULT 1000,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "quiz_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"user_name" text NOT NULL,
	"score" integer DEFAULT 0,
	"correct_answers" integer DEFAULT 0,
	"total_questions" integer NOT NULL,
	"attempts" integer DEFAULT 1,
	"time_taken" integer,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"cover_image" text,
	"is_published" boolean DEFAULT false,
	"time_limit" integer DEFAULT 30,
	"play_count" integer DEFAULT 0,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "stories" CASCADE;--> statement-breakpoint
DROP TABLE "story_episodes" CASCADE;--> statement-breakpoint
ALTER TABLE "education" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "experience" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "training_stats" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "tags" jsonb;--> statement-breakpoint
ALTER TABLE "volunteering" ADD COLUMN "logo" text;