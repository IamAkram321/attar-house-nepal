import rateLimit from "express-rate-limit";

// Shared config for rate limit headers
const commonOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

// Rate limit file uploads to prevent storage quota abuse
export const uploadLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 30,
  message: { error: "Too many uploads. Please try again later." },
});

// Rate limit custom orders to prevent spam submissions
export const customOrderLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  message: { error: "Too many requests submitted. Please try again later, or contact us directly." },
});