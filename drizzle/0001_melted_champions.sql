CREATE TABLE "order_shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" text NOT NULL,
	"vendor_id" uuid,
	"shiprocket_order_id" text,
	"awb_code" text,
	"courier_name" text,
	"tracking_url" text,
	"status" text DEFAULT 'Pending',
	"items" jsonb NOT NULL,
	"vendor_confirmed_dimensions" jsonb,
	"vendor_confirmed_at" timestamp,
	"dimension_source" text DEFAULT 'auto',
	"ready_to_ship" boolean DEFAULT false,
	"label_url" text,
	"pickup_date" text,
	"pickup_time" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partnerships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"logo" text NOT NULL,
	"partner_type" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendor_payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"amount" double precision NOT NULL,
	"payment_id" text,
	"method" text DEFAULT 'UPI',
	"status" text DEFAULT 'Completed',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"phone" text,
	"pickup_location_id" text,
	"address" text,
	"bank_details" jsonb,
	"created_at" timestamp DEFAULT now(),
	"total_earnings" double precision DEFAULT 0,
	"paid_amount" double precision DEFAULT 0,
	"pending_balance" double precision DEFAULT 0,
	CONSTRAINT "vendors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "affiliate_config" ALTER COLUMN "direct_split" SET DEFAULT 30;--> statement-breakpoint
ALTER TABLE "affiliate_config" ALTER COLUMN "level1_split" SET DEFAULT 10;--> statement-breakpoint
ALTER TABLE "affiliate_config" ALTER COLUMN "level2_split" SET DEFAULT 5;--> statement-breakpoint
ALTER TABLE "affiliate_config" ALTER COLUMN "level3_split" SET DEFAULT 5;--> statement-breakpoint
ALTER TABLE "affiliates" ADD COLUMN "is_paid" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "affiliates" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "affiliates" ADD COLUMN "orders_since_paid" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "snack_products" ADD COLUMN "vendor_id" uuid;--> statement-breakpoint
ALTER TABLE "snack_products" ADD COLUMN "length" double precision DEFAULT 1;--> statement-breakpoint
ALTER TABLE "snack_products" ADD COLUMN "width" double precision DEFAULT 1;--> statement-breakpoint
ALTER TABLE "snack_products" ADD COLUMN "height" double precision DEFAULT 1;--> statement-breakpoint
ALTER TABLE "snack_products" ADD COLUMN "weight" double precision DEFAULT 0.5;--> statement-breakpoint
ALTER TABLE "snack_products" ADD COLUMN "dimension_tiers" jsonb;