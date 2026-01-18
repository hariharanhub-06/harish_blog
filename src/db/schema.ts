import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  headline: text("headline"),
  bio: text("bio"),
  about: text("about"),
  email: text("email"),
  location: text("location"),
  avatarUrl: text("avatar_url"),
  heroImageUrl: text("hero_image_url"),
  aboutImageUrl: text("about_image_url"),
  socialLinks: text("social_links", { mode: 'json' }).$default(() => ({
    linkedin: "",
    github: "",
    twitter: "",
    instagram: "",
  })),
  stats: text("stats", { mode: 'json' }).$default(() => ([
    { label: "Years Experience", value: "3+", icon: "Briefcase" },
    { label: "Projects Completed", value: "10+", icon: "Code" },
    { label: "Clubs Led", value: "5+", icon: "Award" },
    { label: "Colleges Partnered", value: "42", icon: "User" },
  ])),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  technologies: text("technologies", { mode: 'json' }), // SQLite doesn't have array type, using JSON mode
  liveUrl: text("live_url"),
  repoUrl: text("repo_url"),
  category: text("category"),
  featured: integer("featured", { mode: 'boolean' }).default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const blogPosts = sqliteTable("blog_posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  featuredImage: text("featured_image"),
  category: text("category"),
  tags: text("tags", { mode: 'json' }), // JSON mode for tags array
  published: integer("published", { mode: 'boolean' }).default(false),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const skills = sqliteTable("skills", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  category: text("category"),
  proficiency: integer("proficiency").default(0),
  icon: text("icon"),
  displayOrder: integer("display_order").default(0),
});

export const experience = sqliteTable("experience", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  company: text("company").notNull(),
  role: text("role").notNull(),
  duration: text("duration"),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const education = sqliteTable("education", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  period: text("period"),
  details: text("details"),
  displayOrder: integer("display_order").default(0),
});

export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  issuer: text("issuer"),
  date: text("date"),
  description: text("description"),
  link: text("link"),
  displayOrder: integer("display_order").default(0),
});

export const contactSubmissions = sqliteTable("contact_submissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  company: text("company"),
  mobile: text("mobile").notNull(),
  email: text("email").notNull(),
  website: text("website"),
  socialMedia: text("social_media"),
  category: text("category").default("Not Determined"),
  status: text("status").default("Fresh"),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const volunteering = sqliteTable("volunteering", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  role: text("role").notNull(),
  organization: text("organization").notNull(),
  duration: text("duration"),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
});

export const gallery = sqliteTable("gallery", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const visitorAnalytics = sqliteTable("visitor_analytics", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  page: text("page").notNull(),
  visitorId: text("visitor_id"),
  timestamp: integer("timestamp", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
});

export const snackProducts = sqliteTable("snack_products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  pricePerKg: real("price_per_kg"),
  offerPricePerKg: real("offer_price_per_kg"),
  pricePerPiece: real("price_per_piece"),
  offerPricePerPiece: real("offer_price_per_piece"),
  stock: real("stock").default(0),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  vendorId: text("vendor_id"),

  productCost: real("product_cost").default(0),
  packagingCost: real("packaging_cost").default(0),
  otherCharges: real("other_charges").default(0),
  gstPercent: real("gst_percent").default(5),
  affiliateDiscountPercent: real("affiliate_discount_percent").default(0),
  affiliatePoolPercent: real("affiliate_pool_percent").default(60),

  length: real("length").default(1),
  width: real("width").default(1),
  height: real("height").default(1),
  weight: real("weight").default(0.5),
  dimensionTiers: text("dimension_tiers", { mode: 'json' }),

  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const snackOrders = sqliteTable("snack_orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerMobile: text("customer_mobile").notNull(),
  customerEmail: text("customer_email").notNull(),
  address: text("address").notNull(),
  pincode: text("pincode").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull(),
  items: text("items", { mode: 'json' }).notNull(),
  totalAmount: real("total_amount").notNull(),
  shippingCost: real("shipping_cost").default(0),
  paymentMethod: text("payment_method").default("UPI"),
  paymentId: text("payment_id"),
  shipmentId: text("shipment_id"),
  courierName: text("courier_name"),
  status: text("status").default("Pending Verification"),
  cancelReason: text("cancel_reason"),
  shiprocketOrderId: text("shiprocket_order_id"),
  awbCode: text("awb_code"),
  trackingUrl: text("tracking_url"),
  couponCode: text("coupon_code"),
  discountAmount: real("discount_amount").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const coupons = sqliteTable("coupons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  discountValue: integer("discount_value").notNull(),
  discountType: text("discount_type").notNull(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const adminPushTokens = sqliteTable("admin_push_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  token: text("token").notNull().unique(),
  deviceType: text("device_type"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const snackReviews = sqliteTable("snack_reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id").notNull(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  status: text("status").default("Pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const abandonedCarts = sqliteTable("abandoned_carts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerName: text("customer_name"),
  customerMobile: text("customer_mobile"),
  items: text("items", { mode: 'json' }).notNull(),
  lastStep: text("last_step"),
  isRecovered: integer("is_recovered", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const affiliates = sqliteTable("affiliates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  fullName: text("full_name").notNull(),
  mobile: text("mobile").notNull().unique(),
  password: text("password"),
  upiId: text("upi_id").notNull(),
  email: text("email"),
  socialLink: text("social_link"),
  couponCode: text("coupon_code").unique(),

  referrerId: text("referrer_id"),
  parentId: text("parent_id"),
  position: text("position"),

  status: text("status").default("Pending"),
  isActive: integer("is_active", { mode: 'boolean' }).default(false),
  isPaid: integer("is_paid", { mode: 'boolean' }).default(false),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  ordersSincePaid: integer("orders_since_paid").default(0),

  totalOrders: integer("total_orders").default(0),
  totalSalesAmount: real("total_sales_amount").default(0),
  totalEarnings: real("total_earnings").default(0),
  directEarnings: real("direct_earnings").default(0),
  level1Earnings: real("level1_earnings").default(0),
  level2Earnings: real("level2_earnings").default(0),
  level3Earnings: real("level3_earnings").default(0),
  pendingBalance: real("pending_balance").default(0),
  availableBalance: real("available_balance").default(0),
  paidBalance: real("paid_balance").default(0),

  currentTier: text("current_tier").default("Newbie"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  approvedAt: integer("approved_at", { mode: "timestamp" }),
});

export const affiliateTransactions = sqliteTable("affiliate_transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  affiliateId: text("affiliate_id").notNull(),
  orderId: text("order_id"),
  amount: real("amount").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  fromAffiliateId: text("from_affiliate_id"),
  status: text("status").default("Pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const payoutRequests = sqliteTable("payout_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  affiliateId: text("affiliate_id").notNull(),
  amount: real("amount").notNull(),
  upiId: text("upi_id").notNull(),
  status: text("status").default("Pending"),
  adminNote: text("admin_note"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  processedAt: integer("processed_at", { mode: "timestamp" }),
});

export const affiliateConfig = sqliteTable("affiliate_config", {
  id: integer("id").primaryKey(),
  directSplit: real("direct_split").default(30),
  level1Split: real("level1_split").default(10),
  level2Split: real("level2_split").default(5),
  level3Split: real("level3_split").default(5),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const vendors = sqliteTable("vendors", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  pickupLocationId: text("pickup_location_id"),
  address: text("address"),
  bankDetails: text("bank_details", { mode: 'json' }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),

  totalEarnings: real("total_earnings").default(0),
  paidAmount: real("paid_amount").default(0),
  pendingBalance: real("pending_balance").default(0),
});

export const vendorPayouts = sqliteTable("vendor_payouts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  vendorId: text("vendor_id").notNull(),
  amount: real("amount").notNull(),
  paymentId: text("payment_id"),
  method: text("method").default("UPI"),
  status: text("status").default("Completed"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const orderShipments = sqliteTable("order_shipments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id").notNull(),
  vendorId: text("vendor_id"),
  shiprocketOrderId: text("shiprocket_order_id"),
  awbCode: text("awb_code"),
  courierName: text("courier_name"),
  trackingUrl: text("tracking_url"),
  status: text("status").default("Pending"),
  items: text("items", { mode: 'json' }).notNull(),
  vendorConfirmedDimensions: text("vendor_confirmed_dimensions", { mode: 'json' }),
  vendorConfirmedAt: integer("vendor_confirmed_at", { mode: "timestamp" }),
  dimensionSource: text("dimension_source").default("auto"),
  readyToShip: integer("ready_to_ship", { mode: 'boolean' }).default(false),
  labelUrl: text("label_url"),
  pickupDate: text("pickup_date"),
  pickupTime: text("pickup_time"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const partnerships = sqliteTable("partnerships", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  logo: text("logo").notNull(),
  partnerType: text("partner_type").notNull(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const affiliateProducts = sqliteTable("affiliate_products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  originalPrice: real("original_price"),
  discountedPrice: real("discounted_price"),
  discountPercent: integer("discount_percent"),
  affiliateUrl: text("affiliate_url").notNull(),
  imageUrl: text("image_url"),
  platform: text("platform"),
  category: text("category"),
  rating: real("rating"),
  isFeatured: integer("is_featured", { mode: 'boolean' }).default(false),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  viewsCount: integer("views_count").default(0),
  clicksCount: integer("clicks_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const stories = sqliteTable("stories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  youtubePlaylistId: text("youtube_playlist_id"),
  displayOrder: integer("display_order").default(0),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const storyEpisodes = sqliteTable("story_episodes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  storyId: text("story_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  youtubeVideoId: text("youtube_video_id").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration"),
  episodeNumber: integer("episode_number").default(1),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});
