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
  stock: integer("stock").default(0),
  isActive: boolean("is_active").default(true),
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
