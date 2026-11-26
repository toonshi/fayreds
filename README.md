# Fayreds Travel

The website for **Faith Mutune (Fayreds Travel)**, a Kenyan travel influencer working in hospitality.
It shows what Faith does and turns visitors into clients and partners through three main buttons:

| Button | Who it's for | After the form |
|---|---|---|
| **Marketing** | Hotels, staycations, restaurants, tour operators and brands that want Faith to feature them | SMS (Kenyan numbers) and email confirmation |
| **Travel Consultation** | Travellers who want a personal trip plan | Pay **$100 / KES equivalent** → SMS + email confirmation → continue with Faith on **WhatsApp or email** |
| **Partnerships** | Businesses offering a commission-based partnership | SMS + email confirmation |

Visitors can also **reserve a spot on Faith's upcoming trips** by paying a deposit or the full amount.

Clients are both Kenyan and international:
- **Kenyans** see KES and pay by **M-Pesa** (STK push). They get **SMS + email**.
- **International clients** see USD and pay by **card (Stripe)**. They get **email** (SMS optional).

Faith gets an **SMS/WhatsApp alert** for every new enquiry and payment, and manages everything in an **admin dashboard**.

---

## Team and workstreams

The work is split into **three independent workstreams**. Nobody has to wait for anyone else, because:

1. **The contracts are already written** (see [Shared contracts](#shared-contracts)): the database schema, the form
   definitions, and the API request/response types. Everyone codes against them from day one.
2. **Working stubs exist for every handover point.** `POST /api/enquiries` already saves to the database, `/pay/[reference]`
   already shows the amount, `notify.ts` already has its functions (they log for now), and sample trips are seeded.
3. **Every external service has a demo mode.** With no keys in `.env`, SMS, email, M-Pesa and Stripe just log to the console.
   Nobody waits for Africa's Talking, Safaricom or Stripe accounts.
4. **Each person owns their own folders** (below) and works on their own branch.

### Who owns what

| Person | Role | Owns (only this person edits these) |
|---|---|---|
| **Faith** | Frontend: the public website | `src/app/layout.tsx` (fonts, metadata), `src/app/(site)/**` (home page, header/footer layout, all public pages), `src/app/{icon.svg,apple-icon.tsx,opengraph-image.tsx,sitemap.ts,robots.ts}`, `src/components/**`, `src/content/**`, `src/app/globals.css`, `public/**` |
| **Mike** | Backend: APIs, notifications, payments | `src/app/api/**`, `src/app/pay/**`, `src/lib/{enquiries,notify,sms,email,mpesa,stripe,payments,pricing}.ts` |
| **Hendy** | Admin panel, shared contracts, deployment, integration | `prisma/**`, `src/types/**`, `src/lib/{db,site,forms,phone,auth,trips}.ts`, `src/app/admin/**`, `src/middleware.ts`, `.env.example`, Vercel/Neon setup |

**Rule:** if you need something changed in a folder you don't own, ask the owner. Changes to the **shared contracts**
(`prisma/schema.prisma`, `src/lib/forms.ts`, `src/types/contracts.ts`) go through a PR that **Hendy** approves and
announces to everyone.

### Branches

| Person | Branch |
|---|---|
| Faith | `faith/frontend` |
| Mike | `mike/api` |
| Hendy | `hendy/admin` |

Open a pull request into `main` and merge small pieces often. Each branch only touches its owner's folders,
so merge conflicts should be rare.

---

## Faith: frontend (public website)

**Status:** F1–F10 are done (PRs `faith/trips-and-content` and `faith/brand-and-forms`). Faith still needs to supply real content:
her portrait (`bio.photo`), follower counts (`bio.stats`), testimonials, trip photos (admin panel), and to confirm the draft bio and FAQ answers.

Build everything a visitor sees, except the payment page. Read data through `src/lib/trips.ts` and `src/lib/site.ts`,
and submit forms to `POST /api/enquiries`. Both already work.

| # | Task | Done when… |
|---|---|---|
| F1 | **Brand:** logo (SVG wordmark + icon based on "Fayreds Travel"), favicon, colours and fonts as tokens in `globals.css` | Logo in `public/logo.svg`, used in header and favicon; colours defined once and reused |
| F2 | **Layout:** header (logo, nav, "Book a consultation" button) and footer (Instagram, TikTok and Facebook from `site.socials`, phone, email) in `src/app/(site)/layout.tsx`, so admin and payment pages keep their own simpler layout | Shows on every public page and works on a phone |
| F3 | **Home page** (`src/app/(site)/page.tsx`): hero, short bio, the **three main buttons** (Marketing / Travel Consultation / Partnerships), upcoming trips (`getPublishedTrips()`), social proof (follower counts, brands worked with), testimonials | All three buttons go to their form pages; trips come from the database |
| F4 | **`FormRenderer` component** (`src/components/FormRenderer.tsx`): renders any form from `forms[kind]` in `src/lib/forms.ts` (all field types, sections, half-width fields), adds a hidden honeypot input `website_url`, posts an `EnquiryRequest`, shows `errors` under each field on a 422, and on 201 goes to `redirectTo` | One component powers all four forms; errors show clearly; there's a loading state on the button |
| F5 | **Form pages:** `src/app/(site)/marketing`, `consultation`, `partnership`, each with an intro, what to expect, and `<FormRenderer kind="…"/>` | Submitting creates a row in the database (check with `npx prisma studio`) |
| F6 | **Trips:** `/trips` (list) and `/trips/[slug]` (details, price, dates, `spotsLeft()`, then the reservation form with `tripSlug`) | A sold-out trip shows "Fully booked" and hides the form |
| F7 | **Prices by location:** KES for Kenyans, USD for everyone else (use the country field / `isKenyanClient()` from `src/lib/phone.ts`; default to showing both) | Consultation and trip prices show the right currency |
| F8 | **Thank-you page** `/thank-you?ref=…`: confirms receipt, shows the reference, says "We've sent you an SMS/email" and gives WhatsApp/socials links | Works for the marketing and partnership flows |
| F9 | **Content:** final bio, real photos (`public/images/`), testimonials and FAQ in `src/content/*.ts`, SEO titles and descriptions, Open Graph image | No placeholder text left |
| F10 | **Quality:** mobile-first, accessible (labels, contrast, keyboard), Lighthouse ≥ 90 | Checked on a real phone |

**Not code, any time (Faith):** apply for the M-Pesa **Daraja go-live** with a Paybill or Till number, open a **Stripe** account,
create a **Gmail app password** for `fayredstravel@gmail.com`, and collect real trip details and photos.

---

## Mike: backend (APIs, notifications, payments)

Everything behind the forms: saving enquiries, SMS/email, and taking money. First versions of `enquiries.ts`,
`pricing.ts`, `/api/enquiries` and the `/pay` placeholder already work. Improve them **without changing the contract** in
`src/types/contracts.ts`.

| # | Task | Done when… |
|---|---|---|
| M1 | **Harden `POST /api/enquiries`:** rate limit per IP (e.g. 5/min), honeypot, length limits, consistent 400/422/429 responses as in `EnquiryResponse` | Spam attempts are rejected; real submissions still return 201 |
| M2 | **Notifications** in `src/lib/notify.ts` (signatures are fixed): `notifyEnquiryReceived()` sends the client "We've received your request, ref FT-…" by **SMS** (Kenyan numbers, `sms.ts`) and **email** (everyone, `email.ts`), and alerts Faith by SMS to `FAITH_ALERT_PHONE` (+ optional WhatsApp via CallMeBot). `notifyPaymentConfirmed()` sends a receipt and a "paid" alert to Faith | All four forms trigger the right messages; demo mode logs them; calling it twice doesn't send twice |
| M3 | **Pricing** (`pricing.ts`): consultation $100 / `CONSULTATION_PRICE_KES`; trip deposit or full price × spots | Unit-tested by hand for KES and USD |
| M4 | **M-Pesa STK push** (`mpesa.ts` draft exists): `POST /api/payments/mpesa` creates a `Payment` (PENDING) and sends the STK prompt; `POST /api/payments/mpesa/callback` checks `MPESA_CALLBACK_SECRET`, saves the receipt, and is idempotent; `GET /api/payments/[id]` returns the status | Works in the Daraja sandbox (shortcode 174379, test phone) |
| M5 | **Stripe Checkout:** `POST /api/payments/stripe` creates a Checkout Session in USD; `POST /api/payments/stripe/webhook` verifies the signature and marks the payment paid on `checkout.session.completed` | Works with test card 4242 4242 4242 4242 and `stripe listen` |
| M6 | **Payment page** `/pay/[reference]`: shows the amount, M-Pesa for Kenyans (phone prefilled, "Check your phone" state, polls every 3s), card for international clients, and a link to switch between them | Clear states for waiting, success and failure |
| M7 | **After payment:** set the Payment to PAID and the Enquiry to PAID, call `notifyPaymentConfirmed()`. For a **consultation**, the success screen shows **"Continue on WhatsApp"** (`whatsappLink()` with the reference prefilled) and **"Continue by email"** (mailto) | Paid consultation → the client lands in a WhatsApp chat with Faith |
| M8 | **Demo mode for payments** when keys are missing (M-Pesa auto-confirms after a few seconds; Stripe skips to success), **disabled when `NODE_ENV=production`** | Faith and Hendy can test the full flow locally without keys |
| M9 | **Africa's Talking:** switch from demo to the sandbox, then live, when Hendy shares the keys; request the `FAYREDS` sender ID | Real SMS arrives on a Kenyan phone |

---

## Hendy: admin panel and integration

Owns the shared contracts, the admin dashboard Faith uses every day, and getting everything live.
`src/lib/auth.ts` (login cookie) is already written.

| # | Task | Done when… |
|---|---|---|
| H1 | **Contracts:** keep `prisma/schema.prisma`, `src/lib/forms.ts` and `src/types/contracts.ts` stable; review and merge any change and tell Faith and Mike | Changes are announced before they merge |
| H2 | **Admin login:** `/admin/login` (password = `ADMIN_PASSWORD`, uses `createSession()`), logout, and `src/middleware.ts` protecting `/admin/**` | You can't open `/admin` without logging in |
| H3 | **Enquiries dashboard** `/admin`: counts per type and status, a table filtered by type (Marketing / Consultation / Partnership / Reservation), status and date, plus search by name, email or reference | Faith finds any enquiry in seconds |
| H4 | **Enquiry detail** `/admin/enquiries/[id]`: every answer (labels from `forms.ts`), payments, private notes, status changes (NEW → IN_PROGRESS → COMPLETED / DECLINED), and one-click WhatsApp, call and email buttons | Faith can work a lead from one screen |
| H5 | **Trips manager** `/admin/trips`: add/edit trips (dates, prices in KES and USD, deposits, spots, photo URL, highlights), publish/unpublish, and the list of travellers per trip | New trips appear on the public site without a code change |
| H6 | **Payments list** `/admin/payments` and **CSV export** of enquiries and payments | Faith can reconcile M-Pesa and Stripe statements |
| H7 | **Deployment:** GitHub repo, Vercel project, Neon Postgres (`DATABASE_URL` pooled + `DIRECT_URL`), `prisma migrate deploy` on build, all env vars, custom domain, Daraja callback and Stripe webhook URLs registered | The site is live on the domain over HTTPS |
| H8 | **Integration:** merge the branches, then run the [end-to-end checklist](#end-to-end-checklist) on the live site with real keys | Every row in the checklist passes |
| H9 | **Phase 2 (later):** a helper that collects deals from partner sites for consultations, so Faith doesn't have to search many websites by hand | Scoped after launch |

---

## Shared contracts

These are the only places the three workstreams touch. **Hendy owns them.**

| File | What it defines | Used by |
|---|---|---|
| `prisma/schema.prisma` | `Enquiry`, `Payment` and `Trip` tables and their statuses | everyone |
| `src/lib/forms.ts` | every form field (marketing, consultation, partnership, reservation) + `validate()` | Faith renders it, Mike validates with it, Hendy shows answers with it |
| `src/types/contracts.ts` | API request/response types | Faith ↔ Mike |
| `src/lib/notify.ts` | `notifyEnquiryReceived(id)`, `notifyPaymentConfirmed(id)` (Mike fills in the bodies) | Mike |
| `src/lib/trips.ts` | `getPublishedTrips()`, `getTripBySlug()`, `spotsLeft()` | Faith, Mike |
| `src/lib/site.ts` | Faith's phone, WhatsApp, email, socials, consultation price, `whatsappLink()` | everyone |

### `POST /api/enquiries`

```jsonc
// request
{ "kind": "consultation", "values": { "name": "Amina", "email": "a@x.com", "phone": "0712345678", "country": "Kenya", "...": "..." }, "tripSlug": "diani-beach-escape" /* reservation only */ }

// 201
{ "ok": true, "reference": "FT-CON-7K3QX", "next": "pay", "redirectTo": "/pay/FT-CON-7K3QX" }
// marketing / partnership → "next": "done", "redirectTo": "/thank-you?ref=FT-MKT-…"

// 422
{ "ok": false, "errors": { "email": "Enter a valid email" }, "message": "Please check the highlighted fields" }
```

### User flows

```
Marketing / Partnership:  button → form → POST /api/enquiries → SMS + email to client, alert to Faith → /thank-you
Consultation:             button → form → POST /api/enquiries → /pay/[ref] → M-Pesa (KES) or card (USD)
                            → payment confirmed → SMS + email receipt, alert to Faith → Continue on WhatsApp / email
Trip reservation:         trip page → form → POST /api/enquiries → /pay/[ref] (deposit or full) → receipt + alert
```

---

## Getting started

Requires Node 20+ and PostgreSQL (local, or a free [Neon](https://neon.tech) database).

```bash
npm install
```

```bash
cp .env.example .env
```

Edit `DATABASE_URL` and `DIRECT_URL` in `.env`, then:

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

```bash
npm run dev
```

Open http://localhost:3000. `npx prisma studio` lets you browse the database.

With no SMS, email, M-Pesa or Stripe keys in `.env`, everything runs in **demo mode**: messages and payments are printed in the
terminal instead of being sent.

## Tech stack

- **Next.js 15** (App Router, TypeScript) + **Tailwind CSS 4**
- **PostgreSQL** with **Prisma**: Neon in production
- **Africa's Talking**: SMS · **Nodemailer** (Gmail SMTP): email
- **Safaricom Daraja**: M-Pesa STK push · **Stripe Checkout**: cards
- Hosted on **Vercel**

## Environment variables

All of them are listed and explained in [`.env.example`](./.env.example). Each section says who owns it.

## End-to-end checklist

| Flow | Expected |
|---|---|
| Marketing form, Kenyan number | 201 → thank-you page; client SMS + email; Faith alert; shows in admin |
| Partnership form, UK number | Thank-you page; client email (no SMS); Faith alert |
| Consultation, Kenyan | Pay KES by M-Pesa → receipt SMS + email → WhatsApp opens with reference |
| Consultation, international | Pay $100 by card → receipt email → WhatsApp/email options |
| Trip reservation (deposit) | Correct deposit × spots; spots left goes down after payment; listed under the trip in admin |
| Invalid / spam input | 422 with field errors / 429 when rate-limited |
| Admin | Login required; filter, notes, status change, CSV export work |
