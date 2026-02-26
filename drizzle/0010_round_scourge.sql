CREATE TABLE "kanban_columns" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#3b82f6' NOT NULL,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "kanban_tasks" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "kanban_tasks" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "kanban_tasks" ADD COLUMN "column_id" text;--> statement-breakpoint
ALTER TABLE "kanban_tasks" ADD CONSTRAINT "kanban_tasks_column_id_kanban_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."kanban_columns"("id") ON DELETE cascade ON UPDATE no action;