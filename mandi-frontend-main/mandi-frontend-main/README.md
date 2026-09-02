# Mandi — storefront frontend

Next.js (App Router, TypeScript, Tailwind v4) frontend for the Express/Mongo
backend in `../Backend`. Storefront + admin dashboard, built to talk to that
backend and no other.

## Setup

```bash
npm install
cp .env.local.example .env.local   # set BACKEND_URL to wherever the Express API runs
npm run dev
```

The backend also needs one env var set that it didn't have before:
`FRONTEND_URL=http://localhost:3000` (used to build the email verification and
password-reset links it sends — see "Backend changes" below).

## How auth actually works here — read this before changing anything

**The browser never talks to the Express backend directly.** Every request from
client components goes to this app's own `/api/[...path]` route
(`src/app/api/[...path]/route.ts`), which forwards it server-to-server to
`BACKEND_URL` and relays cookies in both directions. Server Components fetch
the backend directly (server-to-server, no browser involved) via
`src/lib/backend.ts` and `src/lib/session.ts`.

Why: the backend sets its JWT in an `httpOnly`, `SameSite=Strict` cookie. If
the browser called the Express API directly, that cookie would only work in
production if the frontend and backend shared a registrable domain, and
`SameSite=Strict` would silently drop it during any cross-site quirk. Proxying
through our own server means the browser only ever sees **one origin** — this
app's — so the cookie is always first-party, `SameSite=Strict` works exactly
as intended, and the backend's URL never ships to the client bundle.

Practical effect: if you deploy this to `shop.example.com` and the API to
`api.internal` somewhere else entirely, this still works with zero CORS
config on the backend, because the backend only ever sees requests from our
Next.js server, never from a browser.

## Structure

- `src/lib/backend.ts` — server-only fetch to the Express API (never imported client-side)
- `src/lib/session.ts` — `getServerUser()`, the source of truth for "who's logged in" in Server Components, backed by `GET /profile/me`
- `src/lib/api-client.ts` — client-side fetch wrapper hitting our own `/api/*` proxy
- `src/app/api/[...path]/route.ts` — the proxy itself
- `src/components/CartProvider.tsx` — client cart state, refetched on mutation
- `src/app/admin/` — guarded in `layout.tsx` (redirects non-admins server-side before any admin UI renders)
- `DESIGN.md` — the visual identity and why

## Backend changes made alongside this frontend

The backend had a few gaps that would've made parts of this UI dead ends, so
they were patched directly in `../Backend`:

- **Crash-on-startup bug**: `app.js` used `globalErrorHandler` without importing it. Fixed.
- **Admin order management didn't exist at all**: added `GET /api/orders/admin/all` and `PATCH /api/orders/:id/status`.
- **Admin couldn't see or edit a product/category after deactivating it**: the public list/detail endpoints always filtered `isActive: true` with no admin override. Added `GET /api/products/admin/all`, `GET /api/products/admin/:id`, `GET /api/categories/admin/all`, `GET /api/categories/admin/:id`.
- **No way to update a product's images without re-typing raw URLs**: `PATCH /api/products/:id` now also accepts `multipart/form-data` with new image files (alongside its original JSON-body mode).
- **No profile update endpoint**: added `PATCH /api/profile/me` (name/phone only).
- **Auth middleware returned 500 for an invalid/expired token**: now returns 401.
- **Verification/reset email links pointed at the wrong place**: one hardcoded the raw backend API URL, the other guessed `localhost:3000`. Both now use `FRONTEND_URL`.

## Known limits worth knowing about

- Razorpay Checkout.js is loaded from `checkout.razorpay.com` at payment time — if you add a Content-Security-Policy, allow that domain for `script-src`/`frame-src`.
- PIN-code autofill on the address form calls `api.postalpincode.in` directly from the browser (a free, keyless public API) — not proxied, since it's a public read-only lookup with no auth involved.
- Admin order detail (`/admin/orders/[id]`) fetches through the list endpoint and finds the match client-side, since the backend only exposes bulk admin order listing, not a single-order admin lookup. Fine at current scale; worth a dedicated endpoint if the order volume grows.
