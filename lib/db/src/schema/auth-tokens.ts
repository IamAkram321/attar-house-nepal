import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";

/**
 * Email verification tokens.
 *
 * SECURITY: only ever store a SHA-256 hash of the token, never the token
 * itself — same reasoning as password_reset_tokens below. A leaked database
 * row must not be usable to verify an account.
 */
export const emailVerificationTokensTable = pgTable("email_verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tokenHash: text("token_hash").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Password reset tokens.
 *
 * SECURITY properties, all required by design:
 * - tokenHash stores sha256(rawToken), never the raw token. If this table
 *   leaks (backup, replica, careless log, etc.) the tokens inside it are
 *   useless — you cannot reverse a hash back into a working reset link.
 * - expiresAt is enforced server-side on every use (see routes/auth.ts).
 * - used: once a token is redeemed, it flips to true and can never be used
 *   again, even if the expiry window hasn't closed yet.
 */
export const passwordResetTokensTable = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tokenHash: text("token_hash").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type EmailVerificationToken = typeof emailVerificationTokensTable.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokensTable.$inferSelect;