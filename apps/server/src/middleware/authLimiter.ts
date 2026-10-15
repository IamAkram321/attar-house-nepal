import rateLimit from "express-rate-limit";

// Rate limiting setup for authentication endpoints
const commonOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

export const signupLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 8,
  message: { error: "Too many signup attempts. Please try again later." },
});

export const loginLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  message: { error: "Too many login attempts. Please try again later." },
});

export const forgotPasswordLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  message: { error: "Too many requests. Please try again later." },
});

export const resetPasswordLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  message: { error: "Too many requests. Please try again later." },
});