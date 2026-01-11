CREATE TABLE "abandoned_carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" text,
	"customer_mobile" text,
	"items" jsonb NOT NULL,
	"last_step" text,
	"is_recovered" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"issuer" text,
	"date" text,
	"description" text,
	"link" text,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "admin_push_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"device_type" text,
	"created_at" timestamp DEFAULT now(),
	"last_used_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_push_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "affiliate_config" (
	"id" integer PRIMARY KEY NOT NULL,
	"direct_split" double precision DEFAULT 50,
	"level1_split" double precision DEFAULT 20,
	"level2_split" double precision DEFAULT 18,
	"level3_split" double precision DEFAULT 12,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "affiliate_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliate_id" uuid NOT NULL,
	"order_id" text,
	"amount" double precision NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"from_affiliate_id" uuid,
	"status" text DEFAULT 'Pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "affiliates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"mobile" text NOT NULL,
	"password" text,
	"upi_id" text NOT NULL,
	"email" text,
	"social_link" text,
	"coupon_code" text,
	"referrer_id" uuid,
	"parent_id" uuid,
	"position" text,
	"status" text DEFAULT 'Pending',
	"is_active" boolean DEFAULT false,
	"total_orders" integer DEFAULT 0,
	"total_sales_amount" double precision DEFAULT 0,
	"total_earnings" double precision DEFAULT 0,
	"direct_earnings" double precision DEFAULT 0,
	"level1_earnings" double precision DEFAULT 0,
	"level2_earnings" double precision DEFAULT 0,
	"level3_earnings" double precision DEFAULT 0,
	"pending_balance" double precision DEFAULT 0,
	"paid_balance" double precision DEFAULT 0,
	"current_tier" text DEFAULT 'Newbie',
	"created_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	CONSTRAINT "affiliates_mobile_unique" UNIQUE("mobile"),
	CONSTRAINT "affiliates_coupon_code_unique" UNIQUE("coupon_code")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text,
	"excerpt" text,
	"featured_image" text,
	"category" text,
	"tags" text[],
	"published" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"company" text,
	"mobile" text NOT NULL,
	"email" text NOT NULL,
	"website" text,
	"social_media" text,
	"category" text DEFAULT 'Not Determined',
	"status" text DEFAULT 'Fresh',
	"subject" text,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"discount_value" integer NOT NULL,
	"discount_type" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "education" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution" text NOT NULL,
	"degree" text NOT NULL,
	"period" text,
	"details" text,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "experience" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company" text NOT NULL,
	"role" text NOT NULL,
	"duration" text,
	"description" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payout_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliate_id" uuid NOT NULL,
	"amount" double precision NOT NULL,
	"upi_id" text NOT NULL,
	"status" text DEFAULT 'Pending',
	"admin_note" text,
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"headline" text,
	"bio" text,
	"about" text,
	"email" text,
	"location" text,
	"avatar_url" text,
	"hero_image_url" text,
	"about_image_url" text,
	"social_links" jsonb DEFAULT '{"linkedin":"","github":"","twitter":"","instagram":""}'::jsonb,
	"stats" jsonb DEFAULT '[{"label":"Years Experience","value":"3+","icon":"Briefcase"},{"label":"Projects Completed","value":"10+","icon":"Code"},{"label":"Clubs Led","value":"5+","icon":"Award"},{"label":"Colleges Partnered","value":"42","icon":"User"}]'::jsonb,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"thumbnail" text,
	"technologies" text[],
	"live_url" text,
	"repo_url" text,
	"category" text,
	"featured" boolean DEFAULT false,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"proficiency" integer DEFAULT 0,
	"icon" text,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "snack_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_mobile" text NOT NULL,
	"customer_email" text NOT NULL,
	"address" text NOT NULL,
	"pincode" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"country" text NOT NULL,
	"items" jsonb NOT NULL,
	"total_amount" double precision NOT NULL,
	"shipping_cost" double precision DEFAULT 0,
	"payment_method" text DEFAULT 'UPI',
	"payment_id" text,
	"shipment_id" text,
	"courier_name" text,
	"status" text DEFAULT 'Pending Verification',
	"cancel_reason" text,
	"shiprocket_order_id" text,
	"awb_code" text,
	"tracking_url" text,
	"coupon_code" text,
	"discount_amount" double precision DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "snack_orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "snack_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"image_url" text,
	"price_per_kg" double precision,
	"offer_price_per_kg" double precision,
	"price_per_piece" double precision,
	"offer_price_per_piece" double precision,
	"stock" double precision DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"product_cost" double precision DEFAULT 0,
	"packaging_cost" double precision DEFAULT 0,
	"other_charges" double precision DEFAULT 0,
	"affiliate_discount_percent" double precision DEFAULT 0,
	"affiliate_pool_percent" double precision DEFAULT 60,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "snack_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"customer_name" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"status" text DEFAULT 'Pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "visitor_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page" text NOT NULL,
	"visitor_id" text,
	"timestamp" timestamp DEFAULT now(),
	"user_agent" text,
	"referrer" text
);
--> statement-breakpoint
CREATE TABLE "volunteering" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text NOT NULL,
	"organization" text NOT NULL,
	"duration" text,
	"description" text,
	"order" integer DEFAULT 0
);
