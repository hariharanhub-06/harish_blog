CREATE TABLE "admin_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"device_name" text,
	"browser" text,
	"os" text,
	"ip_address" text,
	"is_current" boolean DEFAULT false,
	"last_active" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
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
CREATE TABLE "finance_leads" (
	"id" text PRIMARY KEY NOT NULL,
	"lead_id" text NOT NULL,
	"loan_type" text NOT NULL,
	"status" text DEFAULT 'Document Collection',
	"approved_bank" text,
	"approved_amount" real DEFAULT 0,
	"disbursement_date" timestamp,
	"commission_amount" real DEFAULT 0,
	"commission_collected_date" timestamp,
	"rejection_reason" text,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "finance_loans" (
	"id" text PRIMARY KEY NOT NULL,
	"borrower_name" text NOT NULL,
	"amount" real DEFAULT 0 NOT NULL,
	"collected_amount" real DEFAULT 0 NOT NULL,
	"interest_rate" real DEFAULT 0,
	"time_period" text,
	"start_date" timestamp DEFAULT now(),
	"due_date" timestamp,
	"notes" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "client_projects" ALTER COLUMN "lead_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "client_projects" ADD COLUMN "planned_delivery_date" timestamp;--> statement-breakpoint
ALTER TABLE "client_projects" ADD COLUMN "project_category" text;--> statement-breakpoint
ALTER TABLE "client_projects" ADD COLUMN "project_notes" jsonb;--> statement-breakpoint
ALTER TABLE "finance_debts" ADD COLUMN "interest_rate" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "finance_debts" ADD COLUMN "time_period" text;--> statement-breakpoint
ALTER TABLE "finance_transactions" ADD COLUMN "loan_id" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "business_solution_video_url" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "business_solution_video_config" jsonb;