CREATE TABLE "quiz_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"name" text NOT NULL,
	"score" integer DEFAULT 0,
	"streak" integer DEFAULT 0,
	"last_answered_question_index" integer DEFAULT -1,
	"last_active" timestamp DEFAULT now(),
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"pin" text NOT NULL,
	"status" text DEFAULT 'waiting' NOT NULL,
	"current_question_index" integer DEFAULT -1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "quiz_sessions_pin_unique" UNIQUE("pin")
);
