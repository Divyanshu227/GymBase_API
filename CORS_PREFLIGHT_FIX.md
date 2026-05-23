# CORS Preflight Redirect Issue

## Symptom

The browser showed errors like:

```text
Response to preflight request doesn't pass access control check:
Redirect is not allowed for a preflight request.
```

This happened when the frontend at `https://gym-base-api.vercel.app` called API routes such as:

```text
https://gym-base-api-blfo.vercel.app/api/auth/login
https://gym-base-api-blfo.vercel.app/api/auth/register
```

## Root Cause

Before sending `POST /api/auth/login` or `POST /api/auth/register`, the browser sends an `OPTIONS` preflight request because the request uses JSON headers.

That preflight must receive a direct `2xx` response with CORS headers. It cannot follow redirects. If the configured API URL redirects to a different Vercel alias, adds or removes a slash, or points at the wrong deployment, the browser blocks the real login/register request.

The backend was also configured with a single exact CORS origin, so the deployed frontend origin must be listed explicitly.

## Fix Applied

- `backend/index.js` now supports `CORS_ORIGINS`, a comma-separated allowlist.
- `backend/index.js` only allows explicitly configured origins in production.
- `backend/index.js` explicitly supports common preflight methods and headers.
- `frontend/src/api.js` removes a trailing slash from `VITE_API_URL` to avoid accidental redirect-prone URLs.
- `.env.example` files now document the deployment variables.

## Deployment Checklist

Set these variables in the deployed backend:

```env
FRONTEND_URL=https://gym-base-api.vercel.app
CORS_ORIGINS=https://gym-base-api.vercel.app
```

Set this variable in the deployed frontend:

```env
VITE_API_URL=https://gym-base-api-blfo.vercel.app
```

Important: use the final backend domain that does not redirect. Do not include a trailing slash.

After changing Vercel environment variables, redeploy both projects so the new values are included in the build/runtime.

## Why Local `.env` Was Not Enough

Editing `backend/.env` only affects a locally running backend. Vercel does not read that file from the repository during production runtime. Add the same `FRONTEND_URL` and `CORS_ORIGINS` values in the Vercel dashboard for the backend project, then redeploy.
