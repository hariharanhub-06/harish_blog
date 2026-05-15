import { pgTable, text, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import crypto from "crypto";

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
  audioUrl: text("audio_url"),
  featuredVideoUrl: text("featured_video_url"),
  businessSolutionVideoUrl: text("business_solution_video_url"),
  businessSolutionVideoConfig: jsonb("business_solution_video_config").$default(() => ({
    scale: 1,
    x: 0,
    y: 0,
    mixBlendMode: "screen"
  })),

  // High-level Section Visibility Toggles
  showHeroSection: boolean("show_hero_section").default(true),
  showStatsSection: boolean("show_stats_section").default(true),
  showTrainingSection: boolean("show_training_section").default(true),
  showExperienceSection: boolean("show_experience_section").default(true),
  showEducationSection: boolean("show_education_section").default(true),
  showVolunteeringSection: boolean("show_volunteering_section").default(true),
  showAboutSection: boolean("show_about_section").default(true),
  showProjectsSection: boolean("show_projects_section").default(true),
  showQuizzesSection: boolean("show_quizzes_section").default(true),
  showTypingTestSection: boolean("show_typing_test_section").default(true),
  showFeedbackSection: boolean("show_feedback_section").default(true),
  showGamesSection: boolean("show_games_section").default(true),
  showLiveSessionsSection: boolean("show_live_sessions_section").default(true),

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
  isCurrent: boolean("is_current").default(false),
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
  businessType: text("business_type"),
  requestedService: text("requested_service"),
  mobile: text("mobile").notNull(),
  email: text("email").notNull(),
  website: text("website"),
  socialMedia: text("social_media"),
  category: text("category").default("Not Determined"),
  status: text("status").default("New"),
  subject: text("subject"),
  message: text("message").notNull(),
  adminNotes: text("admin_notes"),
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

export const adminSessions = pgTable("admin_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userEmail: text("user_email").notNull(),
  deviceName: text("device_name"),
  browser: text("browser"),
  os: text("os"),
  ipAddress: text("ip_address"),
  isCurrent: boolean("is_current").default(false), // Transitional flag for identifying current device during tracking
  lastActive: timestamp("last_active").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const adminTrustedDevices = pgTable("admin_trusted_devices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userEmail: text("user_email").notNull(),
  deviceName: text("device_name").notNull(),
  deviceTokenHash: text("device_token_hash").notNull().unique(), // The hashed crypto token
  browser: text("browser"),
  os: text("os"),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
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
  status: text("status").notNull().default("New"), // New (Pending), Approved, Seen
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  coverImage: text("cover_image"),
  isPublished: boolean("is_published").default(false),
  timeLimit: integer("time_limit").default(30), // default seconds per question
  playCount: integer("play_count").default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  quizId: text("quiz_id").notNull(),
  questionText: text("question_text").notNull(),
  imageUrl: text("image_url"),
  timeLimit: integer("time_limit"), // specific timer for this question
  points: integer("points").default(1000),
  displayOrder: integer("order").default(0),
});

export const quizOptions = pgTable("quiz_options", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  questionId: text("question_id").notNull(),
  optionText: text("option_text").notNull(),
  isCorrect: boolean("is_correct").default(false),
});

export const quizSubmissions = pgTable("quiz_submissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  quizId: text("quiz_id").notNull(),
  userName: text("user_name").notNull(),
  score: integer("score").default(0),
  correctAnswers: integer("correct_answers").default(0),
  totalQuestions: integer("total_questions").notNull(),
  attempts: integer("attempts").default(1),
  timeTaken: integer("time_taken"),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const quizRelations = relations(quizzes, ({ many }) => ({
  questions: many(quizQuestions),
}));

export const quizQuestionRelations = relations(quizQuestions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
  options: many(quizOptions),
}));


export const quizOptionRelations = relations(quizOptions, ({ one }) => ({
  question: one(quizQuestions, {
    fields: [quizOptions.questionId],
    references: [quizQuestions.id],
  }),
}));

export const quizSessions = pgTable("quiz_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  quizId: text("quiz_id").notNull(),
  pin: text("pin").notNull().unique(), // 6-digit PIN
  status: text("status").notNull().default("waiting"), // waiting, active, finished
  currentQuestionIndex: integer("current_question_index").default(-1), // -1 = lobby
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizParticipants = pgTable("quiz_participants", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").notNull(),
  name: text("name").notNull(),
  score: integer("score").default(0),
  streak: integer("streak").default(0), // For streak bonuses
  lastAnsweredQuestionIndex: integer("last_answered_question_index").default(-1),
  lastActive: timestamp("last_active").defaultNow(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const quizLiveAnswers = pgTable("quiz_live_answers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").notNull(),
  questionId: text("question_id").notNull(),
  participantId: text("participant_id").notNull(),
  optionId: text("option_id").notNull(), // The ID of the option picked
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizSessionRelations = relations(quizSessions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quizSessions.quizId],
    references: [quizzes.id],
  }),
  participants: many(quizParticipants),
}));

export const quizParticipantRelations = relations(quizParticipants, ({ one }) => ({
  session: one(quizSessions, {
    fields: [quizParticipants.sessionId],
    references: [quizSessions.id],
  }),
}));

export const financeDebts = pgTable("finance_debts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  initialAmount: real("initial_amount").notNull().default(0),
  remainingAmount: real("remaining_amount").notNull().default(0),
  notes: text("notes"), // For payment structure/method
  repaymentType: text("repayment_type").default("single"), // single or split
  interestRate: real("interest_rate").default(0),
  timePeriod: text("time_period"), // e.g. "12 months", "1 year"
  dueDate: timestamp("due_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const financeLoans = pgTable("finance_loans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  borrowerName: text("borrower_name").notNull(),
  amount: real("amount").notNull().default(0),
  collectedAmount: real("collected_amount").notNull().default(0),
  interestRate: real("interest_rate").default(0),
  timePeriod: text("time_period"),
  startDate: timestamp("start_date").defaultNow(),
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  status: text("status").default("active"), // active, collected, defaulted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const financeTransactions = pgTable("finance_transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  amount: real("amount").notNull(),
  description: text("description"),
  category: text("category").notNull(), // Food, Fuel, Salary, etc.
  type: text("type").notNull(), // expense, income, debt_pay, loan_collect
  debtId: text("debt_id"),
  loanId: text("loan_id"),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const financeDebtRelations = relations(financeDebts, ({ many }) => ({
  transactions: many(financeTransactions),
}));

export const financeTransactionRelations = relations(financeTransactions, ({ one }) => ({
  debt: one(financeDebts, {
    fields: [financeTransactions.debtId],
    references: [financeDebts.id],
  }),
}));

export const typingTestResults = pgTable("typing_test_results", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userName: text("user_name").notNull(),
  wpm: integer("wpm").notNull(),
  accuracy: integer("accuracy").notNull(),
  duration: integer("duration").notNull(), // 2, 5, 30
  difficulty: text("difficulty").default("basic"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const meetingAvailability = pgTable("meeting_availability", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  dayOfWeek: integer("day_of_week"), // 0-6
  startTime: text("start_time"), // "HH:mm"
  endTime: text("end_time"), // "HH:mm"
  isAvailable: boolean("is_available").default(true),
  specificDate: timestamp("specific_date"), // For one-off availability
  createdAt: timestamp("created_at").defaultNow(),
});

export const meetingSchedules = pgTable("meeting_schedules", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  meetingType: text("meeting_type").notNull(), // "GRR Visit", "DRR Visit"
  clubName: text("club_name").notNull(),
  numAttendees: integer("num_attendees"),
  notes: text("notes"),
  presidentName: text("president_name"),
  mobileNumber: text("mobile_number"),
  driveLink: text("drive_link"),
  venue: text("venue"),
  venueDetails: text("venue_details"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  endDate: timestamp("end_date"), // For flexible time ranges
  status: text("status").default("requested"), // requested, confirmed, completed
  isVisible: boolean("is_visible").default(true),
  checklistData: jsonb("checklist_data"), // { itemId: { checked: boolean, comment: string } }
  scoringData: jsonb("scoring_data"), // { rowId: { points: number, comment: string } }
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const schedulerDocuments = pgTable("scheduler_documents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  fileUrl: text("file_url").notNull(),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const liveSessions = pgTable("live_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  price: real("price").notNull().default(0),
  startTime: timestamp("start_time").notNull(),
  duration: integer("duration").default(60), // in minutes
  meetingLink: text("meeting_link"), // e.g., Google Meet
  posterUrl: text("poster_url"), // e.g., ImageKit URL
  status: text("status").default("scheduled"), // scheduled, active, completed
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessionRegistrations = pgTable("session_registrations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  userMobile: text("user_mobile").notNull(),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  amountPaid: real("amount_paid").default(0),
  status: text("status").default("pending"), // pending, confirmed, failed
  joinToken: text("join_token").unique().$defaultFn(() => crypto.randomUUID()),
  activeSessionId: text("active_session_id"),
  lastActiveAt: timestamp("last_active_at"),
  registeredAt: timestamp("registered_at").defaultNow(),
});

export const liveSessionModeratorPolicies = pgTable("live_session_moderator_policies", {
  sessionId: text("session_id").primaryKey(), // Using sessionId as PK for 1:1 isolation
  disableAudio: boolean("disable_audio").default(false),
  disableVideo: boolean("disable_video").default(false),
  disableScreenSharing: boolean("disable_screen_sharing").default(false),
  disableChat: boolean("disable_chat").default(false),
  disableReactions: boolean("disable_reactions").default(false),
  transcriptionLanguage: text("transcription_language").default("en-IN"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const liveSessionMinutes = pgTable("live_session_minutes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").notNull(),
  content: text("content").notNull(),
  speakerName: text("speaker_name"), // Added for distributed transcription
  type: text("type").default("transcript"), // transcript, pinned, manual
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessionRelations = relations(liveSessions, ({ many }) => ({
  registrations: many(sessionRegistrations),
  minutes: many(liveSessionMinutes),
}));

export const liveSessionMinutesRelations = relations(liveSessionMinutes, ({ one }) => ({
  session: one(liveSessions, {
    fields: [liveSessionMinutes.sessionId],
    references: [liveSessions.id],
  }),
}));

export const registrationRelations = relations(sessionRegistrations, ({ one }) => ({
  session: one(liveSessions, {
    fields: [sessionRegistrations.sessionId],
    references: [liveSessions.id],
  }),
}));

export const gameAssets = pgTable("game_assets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  gameId: text("game_id").notNull(), // e.g., 'memory'
  assetUrl: text("asset_url").notNull(),
  assetType: text("asset_type").default("image"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameScores = pgTable("game_scores", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  gameId: text("game_id").notNull(), // 'dino', 'tictactoe', 'memory', 'puzzle', 'scramble'
  userName: text("user_name").notNull(),
  score: integer("score").default(0),
  moves: integer("moves"),
  timeTaken: integer("time_taken"), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const schedulerConfig = pgTable("scheduler_config", {
  id: integer("id").primaryKey(), // Singleton: 1
  enableMinDaysConstraint: boolean("enable_min_days_constraint").default(true),
  minDaysBeforeBooking: integer("min_days_before_booking").default(3), // 1-5
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clientProjects = pgTable("client_projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  leadId: text("lead_id"),
  title: text("title").notNull(),
  clientName: text("client_name").notNull(),
  businessName: text("business_name"),
  description: text("description"),
  scopeSummary: text("scope_summary"),
  timeline: text("timeline"),
  price: real("price").default(0),
  advancePaid: real("advance_paid").default(0),
  balanceAmount: real("balance_amount").default(0),
  paymentStatus: text("payment_status").default("pending"),
  status: text("status").default("onboarding"),
  invoiceUrl: text("invoice_url"),
  agreementContent: text("agreement_content"),
  onboardingChecklist: jsonb("onboarding_checklist"),
  progressMilestones: jsonb("progress_milestones").$default(() => ([])),
  internalCost: real("internal_cost").default(0),
  expectedProfit: real("expected_profit").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  plannedDeliveryDate: timestamp("planned_delivery_date"),
  projectCategory: text("project_category"),
  projectNotes: jsonb("project_notes").$default(() => ([])), // [{ date, note, author }]
});

export const clientProjectRelations = relations(clientProjects, ({ one }) => ({
  lead: one(contactSubmissions, {
    fields: [clientProjects.leadId],
    references: [contactSubmissions.id],
  }),
}));

export const contactSubmissionRelations = relations(contactSubmissions, ({ many }) => ({
  projects: many(clientProjects),
}));

export const pricingBaseCosts = pgTable("pricing_base_costs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  component: text("component").notNull(),
  internalCost: real("internal_cost").notNull().default(0),
  type: text("type").notNull().default("Fixed"), // Fixed, Variable, Risk
  notes: text("notes"),
  displayOrder: integer("order").default(0),
});

export const routines = pgTable("routines", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  schedule: jsonb("schedule").$default(() => ({ type: "daily" })),
  displayOrder: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const routineLogs = pgTable("routine_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  routineId: text("routine_id").notNull(),
  date: text("date").notNull(), // ISO Date string YYYY-MM-DD
  isCompleted: boolean("is_completed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const routineRelations = relations(routines, ({ many }) => ({
  logs: many(routineLogs),
}));

export const routineLogRelations = relations(routineLogs, ({ one }) => ({
  routine: one(routines, {
    fields: [routineLogs.routineId],
    references: [routines.id],
  }),
}));

export const pricingPageRates = pgTable("pricing_page_rates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  pageType: text("page_type").notNull(),
  internalCost: real("internal_cost").notNull().default(0),
  sellingPrice: real("selling_price").notNull().default(0),
  displayOrder: integer("order").default(0),
});

export const pricingFeatureRates = pgTable("pricing_feature_rates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  feature: text("feature").notNull(),
  category: text("category").notNull(), // Feature, CRM
  internalCost: real("internal_cost").notNull().default(0),
  sellingPrice: real("selling_price").notNull().default(0),
  displayOrder: integer("order").default(0),
});

export const pricingMultipliers = pgTable("pricing_multipliers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  category: text("category").notNull(), // Complexity, Client Value, Timeline, Scope Risk
  label: text("label").notNull(),
  value: real("value").notNull().default(1.0), // Multiplier or Additional Cost
  isPercentage: boolean("is_percentage").default(false),
  displayOrder: integer("order").default(0),
});

export const pricingDiscounts = pgTable("pricing_discounts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  condition: text("condition").notNull(),
  maxDiscount: real("max_discount").notNull().default(0), // Percentage
  displayOrder: integer("order").default(0),
});

export const projectQuotes = pgTable("project_quotes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectName: text("project_name").notNull(),
  clientName: text("client_name").notNull(),
  quoteToken: text("quote_token").unique().$defaultFn(() => crypto.randomUUID()),

  // Storing config snapshot for full history
  configuration: jsonb("configuration").notNull(), // { pages: [], features: [], crm: bool, multipliers: {} }

  // Financial Result
  finalPrice: real("final_price").notNull(),
  internalCost: real("internal_cost").notNull(),
  expectedProfit: real("expected_profit").notNull(),
  profitMargin: real("profit_margin").notNull(),

  // Metadata for Quote Generator
  deliverables: jsonb("deliverables"),
  timeline: text("timeline"),
  status: text("status").default("draft"), // draft, sent, accepted

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const financeLeads = pgTable("finance_leads", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  leadId: text("lead_id").notNull(),
  loanType: text("loan_type").notNull(),
  status: text("status").default("Document Collection"), // Document Collection, Applied, Approved Pending, Approved, Disbursed, Commission Collected, Not Eligible/Reject

  // Approval Details
  approvedBank: text("approved_bank"),
  approvedAmount: real("approved_amount").default(0),

  // Payout Details
  disbursementDate: timestamp("disbursement_date"),

  // Commission Details
  commissionAmount: real("commission_amount").default(0),
  commissionCollectedDate: timestamp("commission_collected_date"),

  // Rejection Details
  rejectionReason: text("rejection_reason"),

  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const financeLeadRelations = relations(financeLeads, ({ one }) => ({
  lead: one(contactSubmissions, {
    fields: [financeLeads.leadId],
    references: [contactSubmissions.id],
  }),
}));


export const contactSubmissionFinanceRelations = relations(contactSubmissions, ({ many }) => ({
  projects: many(clientProjects),
  financeLeads: many(financeLeads),
}));

export const kanbanColumns = pgTable("kanban_columns", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  color: text("color").notNull().default("#3b82f6"), // Default blue
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const kanbanTasks = pgTable("kanban_tasks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  columnId: text("column_id").references(() => kanbanColumns.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("Medium"), // Low, Medium, High
  status: text("status"), // Deprecated, keeping for migration
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forms = pgTable("forms", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  isPublished: boolean("is_published").default(false),
  bannerUrl: text("banner_url"),
  bannerPosition: text("banner_position").default("center"),
  themeColor: text("theme_color"),
  postSubmissionAction: text("post_submission_action").default('message'),
  postSubmissionData: text("post_submission_data"),
  automationEnabled: boolean("automation_enabled").default(false),
  automationChannels: jsonb("automation_channels"),
  automationTemplate: text("automation_template"),
  customSuccessMessage: text("custom_success_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const formQuestions = pgTable("form_questions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  formId: text("form_id").notNull(),
  type: text("type").notNull(), // short_answer, paragraph, multiple_choice, checkboxes, dropdown
  questionText: text("question_text").notNull(),
  required: boolean("required").default(false),
  options: jsonb("options"), // Array of strings for choices OR scale/file config
  imageUrl: text("image_url"),
  sectionId: text("section_id"),
  logicConditions: jsonb("logic_conditions"),
  displayOrder: integer("order").default(0),
});

export const formResponses = pgTable("form_responses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  formId: text("form_id").notNull(),
  status: text("status").default("New"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const formResponseAnswers = pgTable("form_response_answers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  responseId: text("response_id").notNull(),
  questionId: text("question_id").notNull(),
  answerText: text("answer_text"), // For text answers
  answerChoices: jsonb("answer_choices"), // For multiple options
});

export const formRelations = relations(forms, ({ many }) => ({
  questions: many(formQuestions),
  responses: many(formResponses),
}));

export const formQuestionRelations = relations(formQuestions, ({ one }) => ({
  form: one(forms, {
    fields: [formQuestions.formId],
    references: [forms.id],
  }),
}));

export const formResponseRelations = relations(formResponses, ({ one, many }) => ({
  form: one(forms, {
    fields: [formResponses.formId],
    references: [forms.id],
  }),
  answers: many(formResponseAnswers),
}));

export const formResponseAnswerRelations = relations(formResponseAnswers, ({ one }) => ({
  response: one(formResponses, {
    fields: [formResponseAnswers.responseId],
    references: [formResponses.id],
  }),
  question: one(formQuestions, {
    fields: [formResponseAnswers.questionId],
    references: [formQuestions.id],
  }),
}));

export const travelledPlaces = pgTable('travelledPlaces', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  cityName: text('cityName').notNull(),
  country: text('country').notNull(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const visitorSessions = pgTable("visitor_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  visitorNumber: integer("visitor_number").notNull(),
  ipHash: text("ip_hash"),
  country: text("country"),
  countryCode: text("country_code"),
  firstVisit: timestamp("first_visit").defaultNow(),
  lastVisit: timestamp("last_visit").defaultNow(),
  totalTimeSeconds: integer("total_time_seconds").default(0),
  visitCount: integer("visit_count").default(1),
});


export const heartReactions = pgTable("heart_reactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  action: text("action").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- RESTORED TABLES (Data Recovery) ---

export const stories = pgTable("stories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  youtubePlaylistId: text("youtube_playlist_id"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const storyEpisodes = pgTable("story_episodes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  storyId: text("story_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  youtubeVideoId: text("youtube_video_id").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration"),
  episodeNumber: integer("episode_number").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agileProjects = pgTable("agile_projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  description: text("description"),
  lead: text("lead"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agileSprints = pgTable("agile_sprints", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull(),
  name: text("name").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  goal: text("goal"),
  status: text("status").notNull().default("planned"), // planned, active, closed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agileEpics = pgTable("agile_epics", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  color: text("color").default("#0052CC"),
  status: text("status").default("To Do"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agileIssues = pgTable("agile_issues", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull(),
  epicId: text("epic_id"),
  sprintId: text("sprint_id"),
  parentId: text("parent_id"), // for subtasks
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull().default("story"), // story, bug, task, subtask
  priority: text("priority").notNull().default("Medium"), // Lowest, Low, Medium, High, Highest
  status: text("status").notNull().default("To Do"),
  storyPoints: integer("story_points").default(0),
  assignee: text("assignee"),
  position: real("position").notNull().default(0), // For drag-and-drop ordering
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agileMeetings = pgTable("agile_meetings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull(),
  sprintId: text("sprint_id"),
  type: text("type").notNull(), // Daily Standup, Sprint Planning, Retro, Grooming
  date: timestamp("date").defaultNow(),
  content: jsonb("content"), // Agenda, notes, action items
  mood: integer("mood").default(5), // 1-10 team mood
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agileWorkflows = pgTable("agile_workflows", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull(),
  name: text("name").notNull().default("Standard Workflow"),
  statusOrder: jsonb("status_order").notNull(), // Array of status names in order
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agileDeploymentLogs = pgTable("agile_deployment_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull(),
  version: text("version").notNull(),
  deploymentDate: timestamp("deployment_date").defaultNow(),
  summary: text("summary"),
  bugsFixed: jsonb("bugs_fixed"),
  featuresShipped: jsonb("features_shipped"),
  createdAt: timestamp("created_at").defaultNow(),
});


