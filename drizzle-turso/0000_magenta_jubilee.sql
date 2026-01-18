CREATE TABLE `abandoned_carts` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_name` text,
	`customer_mobile` text,
	`items` text NOT NULL,
	`last_step` text,
	`is_recovered` integer DEFAULT false,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`issuer` text,
	`date` text,
	`description` text,
	`link` text,
	`display_order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `admin_push_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`device_type` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`last_used_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_push_tokens_token_unique` ON `admin_push_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `affiliate_config` (
	`id` integer PRIMARY KEY NOT NULL,
	`direct_split` real DEFAULT 30,
	`level1_split` real DEFAULT 10,
	`level2_split` real DEFAULT 5,
	`level3_split` real DEFAULT 5,
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `affiliate_products` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`original_price` real,
	`discounted_price` real,
	`discount_percent` integer,
	`affiliate_url` text NOT NULL,
	`image_url` text,
	`platform` text,
	`category` text,
	`rating` real,
	`is_featured` integer DEFAULT false,
	`is_active` integer DEFAULT true,
	`views_count` integer DEFAULT 0,
	`clicks_count` integer DEFAULT 0,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `affiliate_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`affiliate_id` text NOT NULL,
	`order_id` text,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`from_affiliate_id` text,
	`status` text DEFAULT 'Pending',
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `affiliates` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`mobile` text NOT NULL,
	`password` text,
	`upi_id` text NOT NULL,
	`email` text,
	`social_link` text,
	`coupon_code` text,
	`referrer_id` text,
	`parent_id` text,
	`position` text,
	`status` text DEFAULT 'Pending',
	`is_active` integer DEFAULT false,
	`is_paid` integer DEFAULT false,
	`paid_at` integer,
	`orders_since_paid` integer DEFAULT 0,
	`total_orders` integer DEFAULT 0,
	`total_sales_amount` real DEFAULT 0,
	`total_earnings` real DEFAULT 0,
	`direct_earnings` real DEFAULT 0,
	`level1_earnings` real DEFAULT 0,
	`level2_earnings` real DEFAULT 0,
	`level3_earnings` real DEFAULT 0,
	`pending_balance` real DEFAULT 0,
	`available_balance` real DEFAULT 0,
	`paid_balance` real DEFAULT 0,
	`current_tier` text DEFAULT 'Newbie',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`approved_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `affiliates_mobile_unique` ON `affiliates` (`mobile`);--> statement-breakpoint
CREATE UNIQUE INDEX `affiliates_coupon_code_unique` ON `affiliates` (`coupon_code`);--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text,
	`excerpt` text,
	`featured_image` text,
	`category` text,
	`tags` text,
	`published` integer DEFAULT false,
	`published_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE TABLE `contact_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`company` text,
	`mobile` text NOT NULL,
	`email` text NOT NULL,
	`website` text,
	`social_media` text,
	`category` text DEFAULT 'Not Determined',
	`status` text DEFAULT 'Fresh',
	`subject` text,
	`message` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`discount_value` integer NOT NULL,
	`discount_type` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_unique` ON `coupons` (`code`);--> statement-breakpoint
CREATE TABLE `education` (
	`id` text PRIMARY KEY NOT NULL,
	`institution` text NOT NULL,
	`degree` text NOT NULL,
	`period` text,
	`details` text,
	`display_order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `experience` (
	`id` text PRIMARY KEY NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`duration` text,
	`description` text,
	`display_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `gallery` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`image_url` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `order_shipments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`vendor_id` text,
	`shiprocket_order_id` text,
	`awb_code` text,
	`courier_name` text,
	`tracking_url` text,
	`status` text DEFAULT 'Pending',
	`items` text NOT NULL,
	`vendor_confirmed_dimensions` text,
	`vendor_confirmed_at` integer,
	`dimension_source` text DEFAULT 'auto',
	`ready_to_ship` integer DEFAULT false,
	`label_url` text,
	`pickup_date` text,
	`pickup_time` text,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `partnerships` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`logo` text NOT NULL,
	`partner_type` text NOT NULL,
	`is_active` integer DEFAULT true,
	`display_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `payout_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`affiliate_id` text NOT NULL,
	`amount` real NOT NULL,
	`upi_id` text NOT NULL,
	`status` text DEFAULT 'Pending',
	`admin_note` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`processed_at` integer
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`headline` text,
	`bio` text,
	`about` text,
	`email` text,
	`location` text,
	`avatar_url` text,
	`hero_image_url` text,
	`about_image_url` text,
	`social_links` text,
	`stats` text,
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`thumbnail` text,
	`technologies` text,
	`live_url` text,
	`repo_url` text,
	`category` text,
	`featured` integer DEFAULT false,
	`display_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text,
	`proficiency` integer DEFAULT 0,
	`icon` text,
	`display_order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `snack_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_mobile` text NOT NULL,
	`customer_email` text NOT NULL,
	`address` text NOT NULL,
	`pincode` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`country` text NOT NULL,
	`items` text NOT NULL,
	`total_amount` real NOT NULL,
	`shipping_cost` real DEFAULT 0,
	`payment_method` text DEFAULT 'UPI',
	`payment_id` text,
	`shipment_id` text,
	`courier_name` text,
	`status` text DEFAULT 'Pending Verification',
	`cancel_reason` text,
	`shiprocket_order_id` text,
	`awb_code` text,
	`tracking_url` text,
	`coupon_code` text,
	`discount_amount` real DEFAULT 0,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `snack_orders_order_id_unique` ON `snack_orders` (`order_id`);--> statement-breakpoint
CREATE TABLE `snack_products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`image_url` text,
	`price_per_kg` real,
	`offer_price_per_kg` real,
	`price_per_piece` real,
	`offer_price_per_piece` real,
	`stock` real DEFAULT 0,
	`is_active` integer DEFAULT true,
	`vendor_id` text,
	`product_cost` real DEFAULT 0,
	`packaging_cost` real DEFAULT 0,
	`other_charges` real DEFAULT 0,
	`gst_percent` real DEFAULT 5,
	`affiliate_discount_percent` real DEFAULT 0,
	`affiliate_pool_percent` real DEFAULT 60,
	`length` real DEFAULT 1,
	`width` real DEFAULT 1,
	`height` real DEFAULT 1,
	`weight` real DEFAULT 0.5,
	`dimension_tiers` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `snack_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`customer_name` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`status` text DEFAULT 'Pending',
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`thumbnail_url` text,
	`youtube_playlist_id` text,
	`display_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `story_episodes` (
	`id` text PRIMARY KEY NOT NULL,
	`story_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`youtube_video_id` text NOT NULL,
	`thumbnail_url` text,
	`duration` text,
	`episode_number` integer DEFAULT 1,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `vendor_payouts` (
	`id` text PRIMARY KEY NOT NULL,
	`vendor_id` text NOT NULL,
	`amount` real NOT NULL,
	`payment_id` text,
	`method` text DEFAULT 'UPI',
	`status` text DEFAULT 'Completed',
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`phone` text,
	`pickup_location_id` text,
	`address` text,
	`bank_details` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`total_earnings` real DEFAULT 0,
	`paid_amount` real DEFAULT 0,
	`pending_balance` real DEFAULT 0
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vendors_email_unique` ON `vendors` (`email`);--> statement-breakpoint
CREATE TABLE `visitor_analytics` (
	`id` text PRIMARY KEY NOT NULL,
	`page` text NOT NULL,
	`visitor_id` text,
	`timestamp` integer DEFAULT (strftime('%s', 'now')),
	`user_agent` text,
	`referrer` text
);
--> statement-breakpoint
CREATE TABLE `volunteering` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`organization` text NOT NULL,
	`duration` text,
	`description` text,
	`display_order` integer DEFAULT 0
);
