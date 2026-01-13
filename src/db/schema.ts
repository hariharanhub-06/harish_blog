import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, doublePrecision } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  headline: text("headline"),
  bio: text("bio"),
  about: text("about"),
  email: text("email"),
  location: text("location"),
  avatarUrl: text("avatar_url"),
  heroImageUrl: text("hero_image_url"),
  aboutImageUrl: text("about_image_url"),
  socialLinks: jsonb("social_links").default({
    linkedin: "",
    github: "",
    twitter: "",
    instagram: "",
  }),
  stats: jsonb("stats").default([
    { label: "Years Experience", value: "3+", icon: "Briefcase" },
    { label: "Projects Completed", value: "10+", icon: "Code" },
    { label: "Clubs Led", value: "5+", icon: "Award" },
    { label: "Colleges Partnered", value: "42", icon: "User" },
  ]),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  technologies: text("technologies").array(),
  liveUrl: text("live_url"),
  repoUrl: text("repo_url"),
  category: text("category"),
  featured: boolean("featured").default(false),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  featuredImage: text("featured_image"),
  category: text("category"),
  tags: text("tags").array(),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category"), // Web Dev, Tools, Management, etc.
  proficiency: integer("proficiency").default(0),
  icon: text("icon"),
  order: integer("order").default(0),
});

export const experience = pgTable("experience", {
  id: uuid("id").primaryKey().defaultRandom(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  duration: text("duration"),
  description: text("description"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const education = pgTable("education", {
  id: uuid("id").primaryKey().defaultRandom(),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  period: text("period"),
  details: text("details"),
  order: integer("order").default(0),
});

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  issuer: text("issuer"),
  date: text("date"),
  description: text("description"),
  link: text("link"),
  order: integer("order").default(0),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
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
  id: uuid("id").primaryKey().defaultRandom(),
  role: text("role").notNull(),
  organization: text("organization").notNull(),
  duration: text("duration"),
  description: text("description"),
  order: integer("order").default(0),
});

export const gallery = pgTable("gallery", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const visitorAnalytics = pgTable("visitor_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  page: text("page").notNull(),
  visitorId: text("visitor_id"), // Unique session/user ID
  timestamp: timestamp("timestamp").defaultNow(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
});

// HM Snacks - Products Table
export const snackProducts = pgTable("snack_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // Savories, Sweets, etc.
  imageUrl: text("image_url"),
  pricePerKg: doublePrecision("price_per_kg"),
  offerPricePerKg: doublePrecision("offer_price_per_kg"),
  pricePerPiece: doublePrecision("price_per_piece"),
  offerPricePerPiece: doublePrecision("offer_price_per_piece"),
  stock: doublePrecision("stock").default(0),
  isActive: boolean("is_active").default(true),
  vendorId: uuid("vendor_id"), // Link to vendors table

  // Profit-based Affiliate Fields
  productCost: doublePrecision("product_cost").default(0),
  packagingCost: doublePrecision("packaging_cost").default(0),
  otherCharges: doublePrecision("other_charges").default(0),
  gstPercent: doublePrecision("gst_percent").default(5), // Added GST field
  affiliateDiscountPercent: doublePrecision("affiliate_discount_percent").default(0),
  affiliatePoolPercent: doublePrecision("affiliate_pool_percent").default(60),

  // Shipping Dimensions
  length: doublePrecision("length").default(1),
  width: doublePrecision("width").default(1),
  height: doublePrecision("height").default(1),
  weight: doublePrecision("weight").default(0.5), // in KG
  dimensionTiers: jsonb("dimension_tiers"), // Array of {weight, l, w, h}

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HM Snacks - Orders Table
export const snackOrders = pgTable("snack_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: text("order_id").notNull().unique(), // Human readable order ID (e.g. HMS-1001)
  customerName: text("customer_name").notNull(),
  customerMobile: text("customer_mobile").notNull(),
  customerEmail: text("customer_email").notNull(),
  address: text("address").notNull(),
  pincode: text("pincode").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull(),
  items: jsonb("items").notNull(), // Array of {productId, name, imageUrl, quantity (in kg), price}
  totalAmount: doublePrecision("total_amount").notNull(),
  shippingCost: doublePrecision("shipping_cost").default(0),
  paymentMethod: text("payment_method").default("UPI"), // 'UPI'
  paymentId: text("payment_id"), // Stores UTR for UPI
  shipmentId: text("shipment_id"), // Stores Tracking Number
  courierName: text("courier_name"), // Stores Courier Name (e.g. DTDC, Shiprocket)
  status: text("status").default("Pending Verification"), // Pending Verification, Payment Confirmed, Parcel Prepared, Shipping, Delivered, Cancel
  cancelReason: text("cancel_reason"),
  shiprocketOrderId: text("shiprocket_order_id"),
  awbCode: text("awb_code"),
  trackingUrl: text("tracking_url"),
  couponCode: text("coupon_code"),
  discountAmount: doublePrecision("discount_amount").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HM Snacks - Coupons Table
export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(), // e.g., 'SAVE10', 'WELCOME50'
  discountValue: integer("discount_value").notNull(), // 10 or 50
  discountType: text("discount_type").notNull(), // 'percentage' or 'fixed'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin Push Tokens for PWA Notifications
export const adminPushTokens = pgTable("admin_push_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  deviceType: text("device_type"), // 'mobile', 'desktop'
  createdAt: timestamp("created_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
});

// HM Snacks - Reviews Table
export const snackReviews = pgTable("snack_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment"),
  status: text("status").default("Pending"), // Pending, Approved, Spam
  createdAt: timestamp("created_at").defaultNow(),
});

// HM Snacks - Abandoned Carts Table
export const abandonedCarts = pgTable("abandoned_carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerName: text("customer_name"),
  customerMobile: text("customer_mobile"),
  items: jsonb("items").notNull(), // Array of {productId, quantity, unit}
  lastStep: text("last_step"), // 'Information', 'Shipping', 'Payment'
  isRecovered: boolean("is_recovered").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HM Snacks - Affiliates Table (Enhanced for Binary MLM)
export const affiliates = pgTable("affiliates", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  mobile: text("mobile").notNull().unique(),
  password: text("password"), // Generated by admin on approval
  upiId: text("upi_id").notNull(),
  email: text("email"),
  socialLink: text("social_link"),
  couponCode: text("coupon_code").unique(),

  // Referral & Binary structure
  referrerId: uuid("referrer_id"), // Who directly referred them
  parentId: uuid("parent_id"),     // Who they are under in the binary tree
  position: text("position"),      // 'left' or 'right'

  status: text("status").default("Pending"),
  isActive: boolean("is_active").default(false),
  isPaid: boolean("is_paid").default(false),
  paidAt: timestamp("paid_at"),
  ordersSincePaid: integer("orders_since_paid").default(0),

  // Stats
  totalOrders: integer("total_orders").default(0),
  totalSalesAmount: doublePrecision("total_sales_amount").default(0),
  totalEarnings: doublePrecision("total_earnings").default(0),
  directEarnings: doublePrecision("direct_earnings").default(0),
  level1Earnings: doublePrecision("level1_earnings").default(0),
  level2Earnings: doublePrecision("level2_earnings").default(0),
  level3Earnings: doublePrecision("level3_earnings").default(0),
  pendingBalance: doublePrecision("pending_balance").default(0),
  paidBalance: doublePrecision("paid_balance").default(0),

  currentTier: text("current_tier").default("Newbie"),
  createdAt: timestamp("created_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
});

// HM Snacks - Affiliate Transactions (Ledger)
export const affiliateTransactions = pgTable("affiliate_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  affiliateId: uuid("affiliate_id").notNull(),
  orderId: text("order_id"),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // 'direct', 'level1', 'level2', 'level3', 'bonus'
  description: text("description"),
  fromAffiliateId: uuid("from_affiliate_id"), // Affiliate who generated the sale
  status: text("status").default("Pending"), // Pending, Completed
  createdAt: timestamp("created_at").defaultNow(),
});

// HM Snacks - Payout Requests
export const payoutRequests = pgTable("payout_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  affiliateId: uuid("affiliate_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  upiId: text("upi_id").notNull(),
  status: text("status").default("Pending"), // Pending, Approved, Rejected
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// HM Snacks - Affiliate Global Config
export const affiliateConfig = pgTable("affiliate_config", {
  id: integer("id").primaryKey(), // Usually single row with ID 1
  directSplit: doublePrecision("direct_split").default(30),
  level1Split: doublePrecision("level1_split").default(10),
  level2Split: doublePrecision("level2_split").default(5),
  level3Split: doublePrecision("level3_split").default(5),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// HM Snacks - Vendors Table
export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(), // Login ID
  password: text("password").notNull(),
  phone: text("phone"),
  pickupLocationId: text("pickup_location_id"), // From Shiprocket
  address: text("address"),
  bankDetails: jsonb("bank_details"),
  createdAt: timestamp("created_at").defaultNow(),

  // Settlement Stats
  totalEarnings: doublePrecision("total_earnings").default(0),
  paidAmount: doublePrecision("paid_amount").default(0),
  pendingBalance: doublePrecision("pending_balance").default(0),
});

// HM Snacks - Vendor Payouts
export const vendorPayouts = pgTable("vendor_payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  paymentId: text("payment_id"), // UTR or Reference
  method: text("method").default("UPI"),
  status: text("status").default("Completed"), // Completed, Pending
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// HM Snacks - Order Shipments (For Split Orders)
export const orderShipments = pgTable("order_shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: text("order_id").notNull(),
  vendorId: uuid("vendor_id"),
  shiprocketOrderId: text("shiprocket_order_id"),
  awbCode: text("awb_code"),
  courierName: text("courier_name"),
  trackingUrl: text("tracking_url"),
  status: text("status").default("Pending"),
  items: jsonb("items").notNull(), // Array of items in this shipment
  vendorConfirmedDimensions: jsonb("vendor_confirmed_dimensions"), // {l, w, h, weight} from vendor
  vendorConfirmedAt: timestamp("vendor_confirmed_at"),
  dimensionSource: text("dimension_source").default("auto"), // 'vendor', 'admin', 'auto'
  readyToShip: boolean("ready_to_ship").default(false),
  labelUrl: text("label_url"),
  pickupDate: text("pickup_date"),
  pickupTime: text("pickup_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partnerships table for displaying partner logos on product pages
export const partnerships = pgTable("partnerships", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  logo: text("logo").notNull(), // ImageKit URL
  partnerType: text("partner_type").notNull(), // e.g., "Supplier", "Distributor", "Sponsor"
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

