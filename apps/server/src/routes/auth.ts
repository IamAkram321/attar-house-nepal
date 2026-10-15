import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db, usersTable, emailVerificationTokensTable, passwordResetTokensTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { hashPassword, verifyPassword, DUMMY_HASH_FOR_TIMING_SAFETY, isPasswordStrongEnough } from "../lib/password";
import { generateRawToken, hashToken, tokenExpiryDate } from "../lib/tokens";
import { verifyCaptcha } from "../lib/recaptcha";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendAccountAlreadyExistsEmail,
} from "../lib/email";
import { signupLimiter, loginLimiter, forgotPasswordLimiter, resetPasswordLimiter } from "../middleware/authLimiter";

const router = Router();

function getBackendURL(): string {
  const rawUrl = process.env.BACKEND_URL || "http://localhost:3000";
  return rawUrl.trim().replace(/\/$/, "");
}

function getFrontendURL(): string {
  const rawUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const firstUrl = rawUrl.split(",")[0].trim();
  return firstUrl.replace(/\/$/, "");
}

function getRequestOrigin(req: Request): string {
  const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);

  if (origin && !origin.includes("google.com")) {
    return origin.trim().replace(/\/$/, "");
  }

  return getFrontendURL();
}

function getCallbackURL(): string {
  if (process.env.GOOGLE_CALLBACK_URL) {
    return process.env.GOOGLE_CALLBACK_URL.trim();
  }
  return `${getBackendURL()}/api/auth/google/callback`;
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: getCallbackURL(),
        passReqToCallback: false,
        proxy: true,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(null, false, { message: "No email provided by Google profile" });

          const existing = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.googleId, profile.id))
            .limit(1);

          let user = existing[0];

          if (!user) {
            const byEmail = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

            if (byEmail[0]) {
              const updated = await db
                .update(usersTable)
                .set({
                  googleId: profile.id,
                  avatar: profile.photos?.[0]?.value ?? byEmail[0].avatar,
                  emailVerified: true,
                })
                .where(eq(usersTable.id, byEmail[0].id))
                .returning();
              user = updated[0];
            } else {
              const inserted = await db
                .insert(usersTable)
                .values({
                  googleId: profile.id,
                  email,
                  name: profile.displayName ?? email,
                  avatar: profile.photos?.[0]?.value ?? null,
                  emailVerified: true,
                  role: "CUSTOMER",
                })
                .returning();
              user = inserted[0];
            }
          } else {
            await db
              .update(usersTable)
              .set({
                name: profile.displayName ?? user.name,
                avatar: profile.photos?.[0]?.value ?? user.avatar,
              })
              .where(eq(usersTable.id, user.id));
          }

          return done(null, user);
        } catch (err) {
          console.error("[passport/google] Strategy verification error:", err);
          return done(err as Error);
        }
      }
    )
  );
} else {
  console.warn("[auth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set. Google OAuth disabled.");
}

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as { id: number }).id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    const user = users[0];

    if (!user) {
      return done(null, false);
    }

    done(null, user);
  } catch (err) {
    done(err);
  }
});

router.get(
  "/auth/google",
  (req: Request, res: Response, next: NextFunction): void => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      // Browser button clicks (Accept: text/html) get a redirect back to login
      // with an explanatory flag; API/fetch callers keep the JSON 503.
      if (req.headers.accept?.includes("text/html")) {
        res.redirect(`${getFrontendURL()}/login?auth=unconfigured`);
      } else {
        res.status(503).json({ error: "Google OAuth not configured." });
      }
      return;
    }

    passport.authenticate("google", {
      scope: ["profile", "email"],
      callbackURL: getCallbackURL(),
    } as passport.AuthenticateOptions & { callbackURL?: string })(req, res, next);
  }
);

router.get(
  "/auth/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "google",
      { callbackURL: getCallbackURL() } as passport.AuthenticateOptions & { callbackURL?: string },
      (err: any, user: any) => {
        const frontendUrl = getFrontendURL();

        if (err || !user) {
          console.error("[auth/google/callback] Authentication failed:", err);
          res.redirect(`${frontendUrl}/?auth=failed`);
          return;
        }

        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error("[auth/google/callback] req.logIn error:", loginErr);
            res.redirect(`${frontendUrl}/?auth=failed`);
            return;
          }

          req.session.userId = user.id;
          req.session.userRole = user.role;

          req.session.save((saveErr) => {
            if (saveErr) {
              console.error("[auth/google/callback] Session save failed:", saveErr);
              res.redirect(`${frontendUrl}/?auth=failed`);
              return;
            }

            const dest = (user.role === "ADMIN" || user.role === "SUPER_ADMIN") ? `${frontendUrl}/admin` : `${frontendUrl}/`;
            res.redirect(dest);
          });
        });
      }
    )(req, res, next);
  }
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const CAPTCHA_REQUIRED_AFTER_ATTEMPTS = 3;

const GENERIC_LOGIN_ERROR = "Invalid email or password.";

router.post("/auth/signup", signupLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const captchaToken = typeof body.captchaToken === "string" ? body.captchaToken : undefined;

    if (!name || !email || !EMAIL_RE.test(email)) {
      res.status(400).json({ error: "Please provide a valid name and email address." });
      return;
    }
    if (!isPasswordStrongEnough(password)) {
      res.status(400).json({ error: "Password must be at least 8 characters." });
      return;
    }

    const captchaOk = await verifyCaptcha(captchaToken);
    if (!captchaOk) {
      res.status(400).json({ error: "CAPTCHA verification failed. Please try again." });
      return;
    }

    const passwordHash = await hashPassword(password);

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

    if (existing[0]) {
      void sendAccountAlreadyExistsEmail(existing[0].email, existing[0].name);
    } else {
      const inserted = await db
        .insert(usersTable)
        .values({ email, name, passwordHash, emailVerified: false, role: "CUSTOMER" })
        .returning();
      const user = inserted[0];

      const rawToken = generateRawToken();
      await db.insert(emailVerificationTokensTable).values({
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: tokenExpiryDate(24),
      });

      if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
        // Isolated local backend without an email service: no verification mail
        // can be sent, so auto-verify to keep signup → login working.
        // Production (RESEND_API_KEY set) still requires the emailed link.
        await db.update(usersTable).set({ emailVerified: true }).where(eq(usersTable.id, user.id));
        await db.delete(emailVerificationTokensTable).where(eq(emailVerificationTokensTable.userId, user.id));
        console.log(`[auth/signup] dev bypass: auto-verified ${user.email} (no RESEND_API_KEY)`);
      } else {
        void sendVerificationEmail(user.email, user.name, rawToken);
      }
    }

    res.status(200).json({
      message: "If that email address is available, we've sent instructions to confirm your account.",
    });
  } catch (err) {
    console.error("[auth/signup]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/verify-email", async (req: Request, res: Response): Promise<void> => {
  const rawToken = typeof req.query.token === "string" ? req.query.token : "";

  if (!rawToken) {
    res.redirect(`${getRequestOrigin(req)}/verify-email?status=invalid`);
    return;
  }

  try {
    const tokenHash = hashToken(rawToken);

    const [row] = await db
      .select()
      .from(emailVerificationTokensTable)
      .where(
        and(
          eq(emailVerificationTokensTable.tokenHash, tokenHash),
          gt(emailVerificationTokensTable.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!row) {
      res.redirect(`${getRequestOrigin(req)}/verify-email?status=invalid`);
      return;
    }

    await db.update(usersTable).set({ emailVerified: true }).where(eq(usersTable.id, row.userId));

    await db.delete(emailVerificationTokensTable).where(eq(emailVerificationTokensTable.id, row.id));

    res.redirect(`${getRequestOrigin(req)}/verify-email?status=success`);
  } catch (err) {
    console.error("[auth/verify-email]", err);
    res.redirect(`${getRequestOrigin(req)}/verify-email?status=invalid`);
  }
});

router.post("/auth/login", loginLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const captchaToken = typeof body.captchaToken === "string" ? body.captchaToken : undefined;

    if (!email || !password) {
      res.status(400).json({ error: GENERIC_LOGIN_ERROR });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

    if (!user || !user.passwordHash) {
      await verifyPassword(password, DUMMY_HASH_FOR_TIMING_SAFETY);
      res.status(401).json({ error: GENERIC_LOGIN_ERROR });
      return;
    }

    const isLocked = user.lockedUntil && user.lockedUntil.getTime() > Date.now();
    if (isLocked) {
      res.status(401).json({ error: GENERIC_LOGIN_ERROR });
      return;
    }

    if (user.failedLoginAttempts >= CAPTCHA_REQUIRED_AFTER_ATTEMPTS) {
      const captchaOk = await verifyCaptcha(captchaToken);
      if (!captchaOk) {
        res.status(401).json({ error: GENERIC_LOGIN_ERROR });
        return;
      }
    }

    const passwordOk = await verifyPassword(password, user.passwordHash);

    if (!passwordOk) {
      const nextAttempts = user.failedLoginAttempts + 1;
      const shouldLock = nextAttempts >= MAX_FAILED_ATTEMPTS;

      await db
        .update(usersTable)
        .set({
          failedLoginAttempts: shouldLock ? 0 : nextAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
        })
        .where(eq(usersTable.id, user.id));

      res.status(401).json({ error: GENERIC_LOGIN_ERROR });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({ error: "Please verify your email before logging in. Check your inbox for the link." });
      return;
    }

    await db
      .update(usersTable)
      .set({ failedLoginAttempts: 0, lockedUntil: null })
      .where(eq(usersTable.id, user.id));

    req.session.userId = user.id;
    req.session.userRole = user.role;

    req.session.save((err) => {
      if (err) {
        console.error("[auth/login] Session save error:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      res.json({
        user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role, createdAt: user.createdAt },
      });
    });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/forgot-password", forgotPasswordLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const captchaToken = typeof body.captchaToken === "string" ? body.captchaToken : undefined;

    const captchaOk = await verifyCaptcha(captchaToken);
    if (!captchaOk) {
      res.status(400).json({ error: "CAPTCHA verification failed. Please try again." });
      return;
    }

    if (email && EMAIL_RE.test(email)) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

      if (user) {
        const rawToken = generateRawToken();
        await db.insert(passwordResetTokensTable).values({
          userId: user.id,
          tokenHash: hashToken(rawToken),
          expiresAt: tokenExpiryDate(1),
        });

        void sendPasswordResetEmail(user.email, user.name, rawToken);
      }
    }

    res.status(200).json({
      message: "If an account exists for that email, we've sent password reset instructions.",
    });
  } catch (err) {
    console.error("[auth/forgot-password]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/reset-password", resetPasswordLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const rawToken = typeof body.token === "string" ? body.token : "";
    const newPassword = typeof body.password === "string" ? body.password : "";

    if (!rawToken || !isPasswordStrongEnough(newPassword)) {
      res.status(400).json({ error: "Invalid request. Password must be at least 8 characters." });
      return;
    }

    const tokenHash = hashToken(rawToken);

    const [row] = await db
      .select()
      .from(passwordResetTokensTable)
      .where(
        and(
          eq(passwordResetTokensTable.tokenHash, tokenHash),
          eq(passwordResetTokensTable.used, false),
          gt(passwordResetTokensTable.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!row) {
      res.status(400).json({ error: "This reset link is invalid or has expired. Please request a new one." });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, row.userId)).limit(1);
    if (!user) {
      res.status(400).json({ error: "This reset link is invalid or has expired. Please request a new one." });
      return;
    }

    const passwordHash = await hashPassword(newPassword);

    await db
      .update(usersTable)
      .set({ passwordHash, failedLoginAttempts: 0, lockedUntil: null })
      .where(eq(usersTable.id, user.id));

    await db.update(passwordResetTokensTable).set({ used: true }).where(eq(passwordResetTokensTable.id, row.id));

    void sendPasswordChangedEmail(user.email, user.name);

    res.json({ message: "Your password has been reset. You can now log in." });
  } catch (err) {
    console.error("[auth/reset-password]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", async (req: Request, res: Response): Promise<void> => {
  if (!req.session?.userId) { res.status(401).json({ user: null }); return; }
  try {
    const users = await db
      .select({ id: usersTable.id, email: usersTable.email, name: usersTable.name, avatar: usersTable.avatar, role: usersTable.role, createdAt: usersTable.createdAt })
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId))
      .limit(1);

    const user = users[0];
    if (!user) { req.session.destroy(() => { }); res.status(401).json({ user: null }); return; }
    res.json({ user });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (req: Request, res: Response): void => {
  req.session.destroy(() => {
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
    res.clearCookie("connect.sid", { path: "/", domain: cookieDomain });
    res.json({ success: true });
  });
});

export default router;