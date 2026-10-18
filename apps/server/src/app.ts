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

const customAllowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
      .map((url) => url.trim().replace(/\/$/, ""))
      .filter(Boolean)
  : [];

const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim().replace(/\/$/, "")] : []),
  ...customAllowedOrigins,
];

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

const isProduction = process.env.NODE_ENV === "production";
// Isolated attar project: cookie domain comes ONLY from COOKIE_DOMAIN env (no inherited default).
const cookieDomain = process.env.COOKIE_DOMAIN !== undefined
  ? (process.env.COOKIE_DOMAIN || undefined)
  : undefined;

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
      // Cross-site deploys (e.g. *.vercel.app -> *.onrender.com) need
      // SameSite=None + Secure, otherwise browsers drop the session cookie
      // on API calls and every login silently fails. Same-site custom
      // domains (app.example.com <-> api.example.com) could use "lax".
      sameSite: isProduction ? "none" : "lax",
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