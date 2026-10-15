import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "PRODUCTION_MANAGER",
  "CAD_DESIGNER",
  "FULFILLMENT_LEAD",
  "SUPPORT_AGENT",
  "CUSTOMER",
] as const;

export type UserRole = typeof USER_ROLES[number];

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  googleId: text("google_id").unique(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  passwordHash: text("password_hash"),
  emailVerified: boolean("email_verified").notNull().default(false),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until"),
  // Roles: SUPER_ADMIN | ADMIN | PRODUCTION_MANAGER | CAD_DESIGNER | FULFILLMENT_LEAD | SUPPORT_AGENT | CUSTOMER
  role: text("role").notNull().default("CUSTOMER"),
  permissions: text("permissions").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;