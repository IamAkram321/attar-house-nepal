import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import passport from "passport";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

import "./routes/auth";

const app: Express = express();

// Render exposes RENDER=true / RENDER_EXTERNAL_URL. Treat that as production
// even if NODE_ENV was not configured, so cross-site secure cookies are used.
const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.RENDER === "true" ||
  Boolean(process.env.RENDER_EXTERNAL_URL);

function splitOrigins(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

const frontendOrigins = splitOrigins(process.env.FRONTEND_URL);
const customAllowedOrigins = splitOrigins(process.env.ALLOWED_ORIGINS);

const allowedOrigins = Array.from(
  new Set([
    "http://localhost:5173",
    // FRONTEND_URL may be a comma-separated list. Fall back to APP_BASE_URL
    // for older deployments that still use that variable name.
    ...(frontendOrigins.length ? frontendOrigins : splitOrigins(process.env.APP_BASE_URL)),
    ...customAllowedOrigins,
  ])
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.trim().replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PgSession = connectPgSimple(session);

// Isolated attar project: cookie domain comes ONLY from COOKIE_DOMAIN env
// (no inherited default). Leave it empty for Vercel -> Render deployments so
// the browser keeps the cookie on the Render backend host.
function getCookieDomain(): string | undefined {
  const configured = process.env.COOKIE_DOMAIN?.trim();
  if (!configured) return undefined;

  const normalized = configured.replace(/^\.+/, "").toLowerCase();

  // Setting Domain=.vercel.app / .onrender.com is rejected or ignored by
  // browsers and would silently drop the session cookie. A host-only cookie
  // (empty COOKIE_DOMAIN) is the correct cross-site Vercel <-> Render setup.
  if (
    normalized === "vercel.app" ||
    normalized.endsWith(".vercel.app") ||
    normalized === "onrender.com" ||
    normalized.endsWith(".onrender.com")
  ) {
    console.warn("[session] Ignoring COOKIE_DOMAIN on a shared hosting domain; leave COOKIE_DOMAIN empty.");
    return undefined;
  }

  return configured;
}

const cookieDomain = getCookieDomain();

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "session",
      // Must stay false: with `true`, connect-pg-simple reads its bundled
      // table.sql relative to the esbuild output (dist/table.sql), which does
      // not exist → req.logIn crashes with ENOENT and Google login always
      // lands on /?auth=failed. Create the table once via SQL instead
      // (see docs/SUPABASE_ISOLATION.md).
      createTableIfMissing: false,
    }),

    // Never pass an empty string to express-session — it throws
    // "secret option required for sessions". Fall back for local dev only.
    secret: process.env.SESSION_SECRET?.trim()
      ? process.env.SESSION_SECRET
      : "fallback-dev-secret-change-me",

    resave: false,
    saveUninitialized: false,

    proxy: true,
    name: "connect.sid",

    cookie: {
      httpOnly: true,
      secure: isProduction,
      // Requests reach the API through the Vercel /api rewrite, so the
      // browser sees connect.sid as a first-party Vercel cookie. Lax is
      // sufficient (and more compatible) than SameSite=None for that setup.
      sameSite: "lax",
      domain: cookieDomain,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api", router);

export default app;