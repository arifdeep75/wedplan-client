# WedPlan

A wedding planning marketplace where couples find vendors, request bookings, and
vendors manage their studio — built with **Next.js 16** (App Router),
**TypeScript**, **Tailwind CSS 4**, **Better Auth** and **Stripe**.

The API lives in a separate repository: `wedplan-server` (Express 5 + MongoDB).

## What you can do

**Visitors**

- Browse approved services with search, category chips and result counts.
- Open a service detail page with gallery, vendor information, price and facts.
- Create an account, sign in with email/password or Google.

**Customers**

- Send booking requests with a preferred date and a message.
- Track request status (pending, accepted, declined, cancelled).
- Cancel pending requests.
- Manage their profile, avatar and password.

**Vendors**

- Publish services (they enter admin review, then go live).
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

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

| Variable              | Required | Description                    |
| --------------------- | -------- | ------------------------------ |
| `NEXT_PUBLIC_API_URL` | yes      | Base URL of the WedPlan API    |

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
- Checkout returns to `/dashboard/vendor?payment=success&session_id=…`. The
  dashboard asks the API to verify the session, then removes the query string so
  refreshing cannot replay it.
- When the API has no Stripe keys, the Plan tab shows an explicit demo option
  only if the server enables `PAYMENTS_DEMO`. Demo activations are labelled as
  such and never look like real payments.
- Empty, loading and error states are handled on every data-driven screen; no
  `alert()` calls.

## Deployment

The app deploys cleanly to Vercel:

1. Import the repository and set `NEXT_PUBLIC_API_URL` to the deployed API URL
   (for example `https://wedplan-api.onrender.com`).
2. Build with `npm run build` (the default); no other configuration is needed.
3. On the API, set `CLIENT_URL` to the deployed frontend origin so cookies,
   CORS and Stripe redirects line up. Both domains should use HTTPS.
4. Google OAuth, ImgBB and Stripe keys are configured on the API — see the
   `wedplan-server` README.

## Project structure

```
src/
  app/                     routes (home, services, dashboards, profile, auth)
  components/
    auth/                  sign-in / sign-up forms
    dashboard/             shells, stat cards, role-specific dashboards
    home/                  hero, categories, featured services
    layout/                navbar, footer
    services/              browser, cards, detail view, booking panel
    ui/                    shared primitives
  lib/                     api client, auth client, formatters
```
