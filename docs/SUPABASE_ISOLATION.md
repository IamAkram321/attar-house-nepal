# Ayesha Fragrances — Supabase isolation from 8848 Labs

Goal: everything attar runs on its OWN Supabase project, Cloudinary folders,
and domains. The old 8848 Labs database is never touched by new code.

## What was already decoupled in code (this change)

- `apps/server/src/app.ts` — removed hardcoded `8848labs.*` CORS origins and the
  `.pathaksons.com` cookie default. Allowed origins are now only
  `localhost:5173` + `FRONTEND_URL` + `ALLOWED_ORIGINS`.
- `apps/server/src/routes/auth.ts` — logout cookie domain is env-only.
- `apps/server/src/routes/uploads.ts`, `orders.ts` — Cloudinary folders default to
  `ayesha-fragrances/uploads` and `ayesha-fragrances/payment-proofs`
  (overridable via `UPLOAD_FOLDER` / `PAYMENT_PROOF_FOLDER`). Old stored URLs keep working.
- `apps/server/src/lib/cloudinary.ts` — attar-only uploads (images + pdf, 10MB max).
  3D formats (stl/obj/glb/3mf/step) rejected.
- Frontend archive (`/projects`) no longer fetches backend projects — no more
  3D-printing rows swapping in.
- No `.env` file was overwritten. Real secrets were never printed.

## Create the isolated project (you do this, ~15 min)

1. Supabase → New project (e.g. `ayesha-fragrances`), region ap-south-1, strong password.
2. In the new project → Connect → Transaction pooler → copy the URI.
3. Locally (never commit secrets):
   - `lib/db/.env` → set `DATABASE_URL` to the NEW pooler URI.
   - `apps/server/.env` → copy from `apps/server/.env.example`, set `DATABASE_URL`
     to the same NEW URI + fresh `SESSION_SECRET` + your `FRONTEND_URL`.
   - `apps/client/.env.local` → `VITE_API_URL=http://localhost:3000`.
4. Push schema to the NEW database only:
   - `pnpm --filter @workspace/db run push`
   - Verify tables in the NEW Supabase Table Editor (products, categories,
     collections, cart_sessions, orders, reviews, users — note: NO session yet).
4b. Create the session table manually (required — `drizzle push` excludes it,
    and auto-create is disabled because the esbuild bundle can't read the
    package's table.sql). In the NEW Supabase dashboard → SQL editor → run:
    ```sql
    CREATE TABLE "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
    )
    WITH (OIDS=FALSE);
    ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
    CREATE INDEX "IDX_session_expire" ON "session" ("expire");
    ```
    Without this, EVERY session request 500s and Google login always lands on
    `/?auth=failed` with `req.logIn error: ENOENT ... dist/table.sql`.
5. Seed attar taxonomy (additive, no deletes):
   - `pnpm --filter @workspace/db run db:seed:attar`
   - Check `/admin → Catalog` shows Floral/Oud/Musk/… categories.
6. Create products in `/admin → Catalog` with the SAME slugs as the frontend
   (`oud-royale-extrait`, `ref-al-nuaim-chocolate-musk-6ml`, …). Cart 404s
   disappear once the slug exists in the new DB.
7. Cloudinary: use a separate account or at minimum the new
   `ayesha-fragrances/*` folders. Update optional `UPLOAD_FOLDER` vars only.
8. Deploy: set the NEW `DATABASE_URL`, `SESSION_SECRET`, `FRONTEND_URL`,
   `ALLOWED_ORIGINS`, `COOKIE_DOMAIN` on your host. Never reuse 8848 values.

## Why cart 404'd (for the record)

- `/product/oud-royale-extrait` is a frontend fallback preview. The API call
  `GET /api/products/oud-royale-extrait` correctly returned 404 because that slug
  is absent from the connected database.
- Add-to-bag sent `productId: 1`, and `POST /api/cart/items` correctly returned
  404 Product not found for the same reason.
- The old `onError` toast lied ("Added…"). It now shows "Not in backend catalog
  yet" with a link to `/admin → Catalog`. The product page also shows a
  preview-only banner when the backend 404s.

## Leftover 8848 references (intentionally NOT renamed)

- pnpm package name `@workspace/8848labs`, generated `8848LABS` header comments,
  `.history/` snapshots, and existing `.env` secrets. Renaming packages touches
  every import and lockfile entry — do it as a separate chore after isolation
  is verified, or leave as-is (invisible to customers).
