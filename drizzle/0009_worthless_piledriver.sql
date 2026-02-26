CREATE TABLE "kanban_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"status" text DEFAULT 'To Do' NOT NULL,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "experience" ADD COLUMN "is_current" boolean DEFAULT false;