# WedPlan

A wedding planning marketplace where couples find vendors, request bookings, and
vendors manage their studio — built with **Next.js 16** (App Router),
**TypeScript**, **Tailwind CSS 4**, **Better Auth** and **Stripe**.

The API lives in a separate repository: `wedplan-server` (Express 5 + MongoDB).

## Live links

- **Live website:** https://wedplan-arifdeep75-client.vercel.app
- **Client repository:** https://github.com/arifdeep75/wedplan-client
- **Server repository:** https://github.com/arifdeep75/wedplan-server
- **Live API:** https://wedplan-arifdeep75-server.vercel.app

## Technology stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Cache Components)         |
| Language   | TypeScript 5                                      |
| Styling    | Tailwind CSS 4, custom editorial design system    |
| Icons      | lucide-react                                      |
| Motion     | Motion (Reveal animations)                        |
| Auth       | Better Auth (email/password, Google, JWT bearer)  |
| Toasts     | Sonner                                            |
| Backend    | Express 5 + TypeScript + MongoDB (official driver)|
| Payments   | Stripe Checkout + signature-verified webhooks     |

## What you can do

**Visitors**

- Browse approved services with search, category chips and result counts.
- Open a service detail page with gallery, vendor information, price and facts.
- Create an account, sign in with email/password or Google.

**Customers**

- Send booking requests with a preferred date, event location and a message.
- Track request status (pending, accepted, declined, cancelled).
- Cancel pending requests.
- Manage their profile, avatar and password.

**Vendors**

- Publish services with up to six uploaded images (they enter admin review, then go live).
- Edit, hide/show and delete their own listings.
- Accept or decline incoming booking requests.
- Upgrade to **Premium** — a one-time Stripe payment that unlocks unlimited
  listings and a premium badge for 12 months.
- Review plan status, expiry and payment history.
- Edit studio profile details.

**Admins**

- Search and filter all users by role; block or unblock accounts.
- Review pending services and approve or reject them.
- Monitor platform stats: users, approvals, bookings, premium vendors, revenue.
- Inspect the subscription payment ledger.

Dashboards and the profile page are responsive down to 390px.

## Design

A minimal black-and-white editorial system:

| Token         | Value     | Usage                          |
| ------------- | --------- | ------------------------------ |
| Ink           | `#252525` | Primary text, buttons, accents |
| Paper         | `#FFFFFF` | Cards and surfaces             |
| Background    | `#F4F4F2` | Page background                |
| Muted accent  | `#B9A6A0` | Small labels, icons            |
| Border        | `#E9E7E4` | Hairlines and dividers         |

Headings use a serif display font (`font-heading`); no gradients, glass panels
or bright accent colours. Currency amounts for services are shown in BDT (৳);
premium subscriptions are charged in USD.

## Getting started

Requirements: Node.js 20+, npm, and the WedPlan API running (default
`http://localhost:5000`).

Create `.env.local` manually — it is git-ignored and must never be committed:

```bash
npm install
# create .env.local with the values below
npm run dev
```

Minimal local `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Open `http://localhost:3000`.

| Variable              | Required | Description                    |
| --------------------- | -------- | ------------------------------ |
| `NEXT_PUBLIC_API_URL` | yes      | Base URL of the WedPlan API    |
| `API_PROXY_URL`       | no*      | API origin used by `next.config.ts` rewrites; required for same-origin cookies in deployment |
| `NEXT_PUBLIC_CONTACT_EMAIL` | no | Public support email displayed in the footer |
| `NEXT_PUBLIC_CONTACT_PHONE` | no | Public support phone displayed in the footer |
| `NEXT_PUBLIC_CONTACT_LOCATION` | no | Public contact location displayed in the footer |
| `NEXT_PUBLIC_FACEBOOK_URL` | no | Official Facebook page URL |
| `NEXT_PUBLIC_INSTAGRAM_URL` | no | Official Instagram profile URL |
| `NEXT_PUBLIC_X_URL` | no | Official X profile URL |
| `NEXT_PUBLIC_YOUTUBE_URL` | no | Official YouTube channel URL |

All environment files are git-ignored. Never commit `.env`, `.env.local`,
`.env.production` or any other file containing real credentials.

Scripts:

```bash
npm run dev     # development server
npm run build   # production build (includes type checking)
npm start       # serve the production build
npm run lint    # eslint
```

## Flow notes

- Authentication is cookie-based against the API; the navbar refreshes its
  session after sign-in, profile edits and plan changes.
- Creating or editing a service sets it back to **pending** — the admin must
  approve it before it appears in public browsing.
- Checkout returns to `/payment/success?session_id=…`. That page asks the API
  to verify the session and waits for the Stripe webhook to grant premium; the
  redirect itself never unlocks anything. `/payment/cancel` handles a cancelled
  checkout.
- When the API has no Stripe keys, the Plan tab shows an explicit demo option
  only if the server enables `PAYMENTS_DEMO`. Demo activations are labelled as
  such and never look like real payments.
- Empty, loading and error states are handled on every data-driven screen; no
  `alert()` calls.

## Deployment

The app is deployed on Vercel at
https://wedplan-arifdeep75-client.vercel.app.

- `NEXT_PUBLIC_API_URL` points at the site's own origin.
- `API_PROXY_URL` points at the API origin. `next.config.ts` rewrites `/api/*`
  to it, so browser requests stay same-origin and the session cookie remains
  first-party (no third-party cookie issues, no CORS).
- On the API, `CLIENT_URL` is the deployed frontend origin so Better Auth
  trusted origins and Stripe redirects line up.
- Google OAuth, ImgBB and Stripe keys are configured on the API only — see the
  `wedplan-server` README.

## Project structure

```
src/
  app/                     routes (home, services, dashboards, profile, auth)
  components/
    auth/                  sign-in / sign-up forms
    dashboard/             shells, stat cards, role-specific dashboards
    home/                  featured services
    shared/                navbar, footer and reveal wrapper
    services/              browser, cards, detail view, booking panel
    ui/                    shared primitives
  lib/                     api client, auth client, formatters
```
