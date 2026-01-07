import { pgTable, text, timestamp, uuid, integer, boolean, jsonb } from "drizzle-orm/pg-core";

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
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
