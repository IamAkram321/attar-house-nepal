import { defineConfig } from "drizzle-kit";

try {
  // Loads lib/db/.env if present.
  process.loadEnvFile();
} catch {
  // no local .env file — ignore
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Ensure the database is provisioned."
  );
}

export default defineConfig({
  schema: "./src/schema/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Tells Drizzle Kit to skip dropping external managed tables like "session"
  tablesFilter: ["!session"],
});