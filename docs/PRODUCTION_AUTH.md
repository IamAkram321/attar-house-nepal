# Production authentication (Vercel + Render + Google OAuth)

## Root cause of the production failure

The deployed backend was resolving the Google callback from local development
values (`GOOGLE_CALLBACK_URL` / `BACKEND_URL`). As a result,
`/api/auth/google` sent Google a `redirect_uri` of
`http://localhost:3000/api/auth/google/callback`, so production users were
redirected to their own machine instead of the Render backend.

Production now ignores localhost callback/backend values and derives the public
callback from `BACKEND_URL`, Render's `RENDER_EXTERNAL_URL`, or the incoming
request host (in that order). Local development still uses localhost.

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
| `GOOGLE_CALLBACK_URL` | `https://attar-house-api.onrender.com/api/auth/google/callback` (safe to omit; derived from `BACKEND_URL`) |
| `ALLOWED_ORIGINS` | extra comma-separated origins, e.g. Vercel preview URLs |
| `COOKIE_DOMAIN` | leave **empty** for Vercel -> Render |

Render sets `RENDER=true` / `RENDER_EXTERNAL_URL` automatically. The backend
uses them to enable production cookies even if `NODE_ENV` is missing.

## Vercel environment variables

| Variable | Production value |
| --- | --- |
| `VITE_API_URL` | `https://attar-house-api.onrender.com` |
| `VITE_RECAPTCHA_SITE_KEY` | Google reCAPTCHA site key (if used) |

Redeploy the Vercel project after changing `VITE_API_URL` because Vite inlines
it at build time.

## Google Cloud Console

OAuth client -> Authorized redirect URIs:

- `https://attar-house-api.onrender.com/api/auth/google/callback`
- `http://localhost:3000/api/auth/google/callback` (local development)

Authorized JavaScript origins (if required by the client type):

- `https://attar-house-nepal-chi.vercel.app`
- `http://localhost:5173`

## Quick verification

```bash
# Must show redirect_uri=https%3A%2F%2Fattar-house-api.onrender.com...
curl -sS -i --max-redirs 0 https://attar-house-api.onrender.com/api/auth/google

# Must echo the Vercel origin with credentials enabled
curl -sS -i -X OPTIONS https://attar-house-api.onrender.com/api/auth/login \
  -H "Origin: https://attar-house-nepal-chi.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

Then complete Google sign-in in a browser. The callback should return to the
Vercel site, and `/api/auth/me` should return the signed-in user.
