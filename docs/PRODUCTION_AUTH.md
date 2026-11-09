# Production authentication (Vercel + Render + Google OAuth)

## Root cause of the production failure

The API is reached through the Vercel rewrite `/api/:path*` ->
`https://attar-house-api.onrender.com/api/:path*`. That makes `connect.sid` a
first-party cookie on the Vercel host.

Two things can still break the session:

1. A Google callback on the Render host (`attar-house-api.onrender.com`) sets
   the cookie on Render, not Vercel. The next same-origin `/api/auth/me` call
   from the Vercel app therefore has no cookie and returns 401.
2. A production bundle built with `VITE_API_URL=https://attar-house-api.onrender.com`
   bypasses the proxy and calls Render directly, which has the same cookie
   problem (and is blocked as a third-party cookie by some browsers).

The code now keeps production API calls relative and falls back to
`FRONTEND_URL/api/auth/google/callback` in production. Local development still
uses the localhost callback/API values.

## Render environment variables

Required:

| Variable | Production value |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Supabase connection string |
| `SESSION_SECRET` | long random secret |
| `BACKEND_URL` | `https://attar-house-api.onrender.com` |
| `FRONTEND_URL` | `https://attar-house-nepal-chi.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

Optional:

| Variable | Production value |
| --- | --- |
| `GOOGLE_CALLBACK_URL` | `https://attar-house-nepal-chi.vercel.app/api/auth/google/callback` (must go through the Vercel proxy; safe to omit because it is derived from `FRONTEND_URL`) |
| `ALLOWED_ORIGINS` | extra comma-separated origins, e.g. Vercel preview URLs |
| `COOKIE_DOMAIN` | leave **empty** so the cookie stays first-party on Vercel |

Render sets `RENDER=true` / `RENDER_EXTERNAL_URL` automatically. The backend
uses them to enable production cookies even if `NODE_ENV` is missing.

## Vercel environment variables

| Variable | Production value |
| --- | --- |
| `VITE_API_URL` | **Do not set it.** Production uses relative `/api` URLs through the rewrite. |
| `VITE_RECAPTCHA_SITE_KEY` | Google reCAPTCHA site key (if used) |

Redeploy the Vercel project after removing/changing variables because Vite
inlines them at build time. An old deployment can keep calling Render directly
until it is rebuilt.

## Google Cloud Console

OAuth client -> Authorized redirect URIs:

- `https://attar-house-nepal-chi.vercel.app/api/auth/google/callback`
- `http://localhost:3000/api/auth/google/callback` (local development)

Authorized JavaScript origins (if required by the client type):

- `https://attar-house-nepal-chi.vercel.app`
- `http://localhost:5173`

## Quick verification

```bash
# Must proxy to Render (look for X-Render-Origin-Server: Render)
curl -sS -i https://attar-house-nepal-chi.vercel.app/api/auth/me

# Must show redirect_uri=https://attar-house-nepal-chi.vercel.app/api/auth/google/callback
curl -sS -i --max-redirs 0 https://attar-house-nepal-chi.vercel.app/api/auth/google

# Must echo the Vercel origin with credentials enabled
curl -sS -i -X OPTIONS https://attar-house-nepal-chi.vercel.app/api/auth/login \
  -H "Origin: https://attar-house-nepal-chi.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

Then complete Google sign-in in a browser. The callback should return to the
Vercel site, and `/api/auth/me` should return the signed-in user.
