import { pgTable, text, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const profiles = pgTable("profiles", {
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
  socialLinks: jsonb("social_links").$default(() => ({
    linkedin: "",
    github: "",
    twitter: "",
    instagram: "",
  })),
  stats: jsonb("stats").$default(() => ([
    { label: "Years Experience", value: "3+", icon: "Briefcase" },
    { label: "Projects Completed", value: "10+", icon: "Code" },
    { label: "Clubs Led", value: "5+", icon: "Award" },
    { label: "Colleges Partnered", value: "42", icon: "User" },
    { label: "Colleges Partnered", value: "42", icon: "User" },
  ])),
  trainingStats: jsonb("training_stats").$default(() => ([
    { label: "Expert Sessions", value: "150+", icon: "Presentation" },
    { label: "Partnered Colleges", value: "42+", icon: "GraduationCap" },
    { label: "Minds Empowered", value: "5000+", icon: "Users" },
  ])),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  technologies: jsonb("technologies"),
  liveUrl: text("live_url"),
  repoUrl: text("repo_url"),
  category: text("category"),
  featured: boolean("featured").default(false),
  displayOrder: integer("order").default(0),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  featuredImage: text("featured_image"),
  category: text("category"),
  tags: jsonb("tags"),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  category: text("category"),
  proficiency: integer("proficiency").default(0),
  icon: text("icon"),
  displayOrder: integer("order").default(0),
});

export const experience = pgTable("experience", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  company: text("company").notNull(),
  logo: text("logo"),
  role: text("role").notNull(),
  duration: text("duration"),
  description: text("description"),
  displayOrder: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const education = pgTable("education", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  institution: text("institution").notNull(),
  logo: text("logo"),
  degree: text("degree").notNull(),
  period: text("period"),
  details: text("details"),
  displayOrder: integer("order").default(0),
});

export const achievements = pgTable("achievements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  issuer: text("issuer"),
  date: text("date"),
  description: text("description"),
  link: text("link"),
  displayOrder: integer("order").default(0),
});

export const contactSubmissions = pgTable("contact_submissions", {
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const volunteering = pgTable("volunteering", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  role: text("role").notNull(),
  organization: text("organization").notNull(),
  logo: text("logo"),
  duration: text("duration"),
  description: text("description"),
  displayOrder: integer("order").default(0),
});

export const gallery = pgTable("gallery", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const visitorAnalytics = pgTable("visitor_analytics", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  page: text("page").notNull(),
  visitorId: text("visitor_id"),
  timestamp: timestamp("timestamp").defaultNow(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
});

export const snackProducts = pgTable("snack_products", {
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
  isActive: boolean("is_active").default(true),
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
  dimensionTiers: jsonb("dimension_tiers"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const snackOrders = pgTable("snack_orders", {
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
  items: jsonb("items").notNull(),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  discountValue: integer("discount_value").notNull(),
  discountType: text("discount_type").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminPushTokens = pgTable("admin_push_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  token: text("token").notNull().unique(),
  deviceType: text("device_type"),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
});

export const snackReviews = pgTable("snack_reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id").notNull(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  status: text("status").default("Pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const abandonedCarts = pgTable("abandoned_carts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerName: text("customer_name"),
  customerMobile: text("customer_mobile"),
  items: jsonb("items").notNull(),
  lastStep: text("last_step"),
  isRecovered: boolean("is_recovered").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const affiliates = pgTable("affiliates", {
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
  isActive: boolean("is_active").default(false),
  isPaid: boolean("is_paid").default(false),
  paidAt: timestamp("paid_at"),
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
  createdAt: timestamp("created_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
});

export const affiliateTransactions = pgTable("affiliate_transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  affiliateId: text("affiliate_id").notNull(),
  orderId: text("order_id"),
  amount: real("amount").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  fromAffiliateId: text("from_affiliate_id"),
  status: text("status").default("Pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payoutRequests = pgTable("payout_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  affiliateId: text("affiliate_id").notNull(),
  amount: real("amount").notNull(),
  upiId: text("upi_id").notNull(),
  status: text("status").default("Pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const affiliateConfig = pgTable("affiliate_config", {
  id: integer("id").primaryKey(),
  directSplit: real("direct_split").default(30),
  level1Split: real("level1_split").default(10),
  level2Split: real("level2_split").default(5),
  level3Split: real("level3_split").default(5),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendors = pgTable("vendors", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  pickupLocationId: text("pickup_location_id"),
  address: text("address"),
  bankDetails: jsonb("bank_details"),
  createdAt: timestamp("created_at").defaultNow(),

  totalEarnings: real("total_earnings").default(0),
  paidAmount: real("paid_amount").default(0),
  pendingBalance: real("pending_balance").default(0),
});

export const vendorPayouts = pgTable("vendor_payouts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  vendorId: text("vendor_id").notNull(),
  amount: real("amount").notNull(),
  paymentId: text("payment_id"),
  method: text("method").default("UPI"),
  status: text("status").default("Completed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderShipments = pgTable("order_shipments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id").notNull(),
  vendorId: text("vendor_id"),
  shiprocketOrderId: text("shiprocket_order_id"),
  awbCode: text("awb_code"),
  courierName: text("courier_name"),
  trackingUrl: text("tracking_url"),
  status: text("status").default("Pending"),
  items: jsonb("items").notNull(),
  vendorConfirmedDimensions: jsonb("vendor_confirmed_dimensions"),
  vendorConfirmedAt: timestamp("vendor_confirmed_at"),
  dimensionSource: text("dimension_source").default("auto"),
  readyToShip: boolean("ready_to_ship").default(false),
  labelUrl: text("label_url"),
  pickupDate: text("pickup_date"),
  pickupTime: text("pickup_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const partnerships = pgTable("partnerships", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  logo: text("logo").notNull(),
  partnerType: text("partner_type").notNull(),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const affiliateProducts = pgTable("affiliate_products", {
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
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  viewsCount: integer("views_count").default(0),
  clicksCount: integer("clicks_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const youtubeVideos = pgTable("youtube_videos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  youtubeVideoId: text("youtube_video_id").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  description: text("description"),
  category: text("category"),
  displayOrder: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiAssistantConfig = pgTable("ai_assistant_config", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  knowledgeBase: text("knowledge_base"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const feedbacks = pgTable("feedbacks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  role: text("role").notNull(), // Student, Professional, Entrepreneur
  organization: text("organization").notNull(), // College or Company
  rating: integer("rating").notNull().default(5),
  content: text("content").notNull(),
  status: text("status").notNull().default("Fresh"), // Fresh (Pending), Approved
  createdAt: timestamp("created_at").defaultNow(),
});
