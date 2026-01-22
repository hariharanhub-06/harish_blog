CREATE TABLE "affiliate_products" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"original_price" real,
	"discounted_price" real,
	"discount_percent" integer,
	"affiliate_url" text NOT NULL,
	"image_url" text,
	"platform" text,
	"category" text,
	"rating" real,
	"is_featured" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"views_count" integer DEFAULT 0,
	"clicks_count" integer DEFAULT 0,
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
CREATE TABLE "youtube_videos" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"youtube_video_id" text NOT NULL,
	"thumbnail_url" text,
	"description" text,
	"category" text,
	"order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "abandoned_carts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "abandoned_carts" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "admin_push_tokens" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "admin_push_tokens" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "affiliate_config" ALTER COLUMN "direct_split" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "affiliate_config" ALTER COLUMN "direct_split" SET DEFAULT 30;--> statement-breakpoint
ALTER TABLE "affiliate_config" ALTER COLUMN "level1_split" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "affiliate_config" ALTER COLUMN "level1_split" SET DEFAULT 10;--> statement-breakpoint
ALTER TABLE "affiliate_config" ALTER COLUMN "level2_split" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "affiliate_config" ALTER COLUMN "level2_split" SET DEFAULT 5;--> statement-breakpoint
ALTER TABLE "affiliate_config" ALTER COLUMN "level3_split" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "affiliate_config" ALTER COLUMN "level3_split" SET DEFAULT 5;--> statement-breakpoint
ALTER TABLE "affiliate_transactions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "affiliate_transactions" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "affiliate_transactions" ALTER COLUMN "affiliate_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "affiliate_transactions" ALTER COLUMN "amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "affiliate_transactions" ALTER COLUMN "from_affiliate_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "affiliates" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "affiliates" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "affiliates" ALTER COLUMN "referrer_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "affiliates" ALTER COLUMN "parent_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "affiliates" ALTER COLUMN "total_sales_amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "affiliates" ALTER COLUMN "total_earnings" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "affiliates" ALTER COLUMN "direct_earnings" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "affiliates" ALTER COLUMN "level1_earnings" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "affiliates" ALTER COLUMN "level2_earnings" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "affiliates" ALTER COLUMN "level3_earnings" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "affiliates" ALTER COLUMN "pending_balance" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "affiliates" ALTER COLUMN "paid_balance" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "tags" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "contact_submissions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "contact_submissions" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "coupons" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "coupons" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "education" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "education" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "experience" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "experience" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "gallery" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "gallery" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "order_shipments" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order_shipments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "order_shipments" ALTER COLUMN "vendor_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "partnerships" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "partnerships" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payout_requests" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payout_requests" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payout_requests" ALTER COLUMN "affiliate_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payout_requests" ALTER COLUMN "amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "social_links" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "stats" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "technologies" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "skills" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "skills" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "snack_orders" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "snack_orders" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "snack_orders" ALTER COLUMN "total_amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_orders" ALTER COLUMN "shipping_cost" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_orders" ALTER COLUMN "discount_amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "price_per_kg" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "offer_price_per_kg" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "price_per_piece" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "offer_price_per_piece" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "stock" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "vendor_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "product_cost" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "packaging_cost" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "other_charges" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "gst_percent" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "gst_percent" SET DEFAULT 5;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "affiliate_discount_percent" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "affiliate_pool_percent" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "affiliate_pool_percent" SET DEFAULT 60;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "length" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "length" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "width" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "width" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "height" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "height" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "weight" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "snack_products" ALTER COLUMN "weight" SET DEFAULT 0.5;--> statement-breakpoint
ALTER TABLE "snack_reviews" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "snack_reviews" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "snack_reviews" ALTER COLUMN "product_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "vendor_payouts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "vendor_payouts" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "vendor_payouts" ALTER COLUMN "vendor_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "vendor_payouts" ALTER COLUMN "amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "total_earnings" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "paid_amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "pending_balance" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "visitor_analytics" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "visitor_analytics" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "volunteering" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "volunteering" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "affiliates" ADD COLUMN "available_balance" real DEFAULT 0;