# shadcn/ui monorepo template

This is a Next.js monorepo template with shadcn/ui.

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```

## Restaurant Management

The platform includes automation scripts to manage restaurant sites within the monorepo.

### Create a Restaurant

To scaffold a new restaurant site from the secure boilerplate:

```bash
npm run create-restaurant <slug>
```

**What this does:**

1. **Scaffolding:** Creates a new directory in `apps/web/restaurants/<slug>`.
2. **Configuration:** Copies and customizes the `data.json` template (updates UID, name, and image paths).
3. **Assets:** Clones the boilerplate image library into both the local restaurant folder and the Next.js `public` directory.
4. **Registration:** Automatically adds the new slug to the `validSlugs` array in `apps/web/proxy.ts` to enable routing.

## Connecting a Custom Domain (GoDaddy → Vercel)

Follow these steps to point a GoDaddy domain to a restaurant site deployed on Vercel.

### Step 1 — Add the Domain in Vercel

1. Open your project in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to **Settings → Domains** and click **Add Domain**.
3. Enter your GoDaddy domain (e.g. `myrestaurant.com`).
4. Vercel will display a **TXT verification record** — copy it, as you may need it in the next step.

### Step 2 — Verify Ownership in GoDaddy (if required)

> If Vercel asks you to verify the domain before switching nameservers, do this first:

1. Log in to [GoDaddy](https://www.godaddy.com) and navigate to **My Products → DNS**.
2. Add the **TXT record** provided by Vercel under your domain's DNS settings.
3. Wait a few minutes for GoDaddy to save the record, then confirm ownership in Vercel.

### Step 3 — Switch Nameservers to Vercel

1. In GoDaddy, go to **My Products → DNS → Nameservers** and click **Change**.
2. Select **Enter my own nameservers** and set:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. Save the changes. DNS propagation can take up to 48 hours, though it usually completes within a few minutes to a few hours.

### Step 4 — Domain Connects Automatically

Once propagation is complete:

- The domain will appear as **Valid** in your Vercel project's **Domains** settings.
- Vercel automatically routes the domain to your project.
- In this monorepo, if the restaurant's folder slug (in `apps/web/restaurants/<slug>`) matches the incoming hostname, the middleware proxy will automatically serve that restaurant's site — no additional configuration needed.

### Remove a Restaurant

To completely remove a restaurant site and its associated assets:

```bash
npm run remove-restaurant <slug>
```

**What this does:**

1. **Cleanup:** Deletes the restaurant configuration folder in `apps/web/restaurants/<slug>`.
2. **Asset Purge:** Removes the public image assets from `apps/web/public/images/restaurants/<slug>`.
3. **Unregistration:** Automatically removes the slug from `apps/web/proxy.ts`, ensuring it is no longer recognized by the middleware proxy.

** step by step godaddy to the turbo repo**

1. Go to GoDaddy and login.
2. Go to the domain.
   change ns records to ns1.vercel-dns.com and ns2.vercel-dns.com
   in vercel add domain it might ask to add the txt which can be only entered if the ns server is godaddy
   then change ns records to vercel

in vercel then connect domain to the project
your new domaiin will show in a list of the domains
it will automatically connect to the project after the domain is propagated
---

# 📋 Route Architecture & Improvement Review

> This section documents all page routes, their purpose, what works well, and what can be improved. Written to guide ongoing development for the multi-restaurant SaaS model.

---

## Route Map

```
/                                      → Root landing (redirects or lists)
/[restaurant]                          → Restaurant public homepage (data.json-driven)
/[restaurant]/about
/[restaurant]/menu
/[restaurant]/contact
/[restaurant]/brand
/[restaurant]/company-information
/[restaurant]/privacy-policy

/[restaurant]/table/[tableId]          → Customer table ordering UI

/[restaurant]/owner                    → Redirects → /owner/scan
/[restaurant]/owner/scan               → QR scanner to finalize bills
/[restaurant]/owner/tables             → Table grid overview (live status)
/[restaurant]/owner/tables/[tableId]   → Table detail + order management
/[restaurant]/owner/kitchen            → Kitchen Display System (KDS)
/[restaurant]/owner/activity           → Dashboard: stats + active sessions + transactions
/[restaurant]/owner/sessions/[id]      → Single closed session detail
/[restaurant]/owner/settings           → QR code generator/downloader

/api/table/session                     → GET: validate session | POST: create session
/api/table/session/close               → POST: close/complete a session
/api/table/order/add                   → POST: add/update cart items
/api/table/order/cook                  → POST: update cooked quantities (kitchen)
/api/table/order/serve                 → POST: update served quantities
```

---

## Customer Flow: `/[restaurant]/table/[tableId]`

**What it does:**
- On load, checks for a session cookie matching the current table.
- Validates the cookie against the backend (`/api/table/session`).
- If no valid session → shows **Start Order** screen.
- Guest enters number of persons via a numpad → creates a session.
- Session active → full `FoodMenu` component is rendered with cart + ordering sidebar.
- Guest can add items, tip, checkout → generates a QR receipt.
- Receipt QR is scanned by owner/staff to finalize payment.

**What's working well:**
- Clean two-phase UX: landing → ordering.
- Session cookie management is solid.
- The `FoodMenu` component handles both standalone menu and table-mode ordering.
- Graceful session closure feedback (toast-based, auto-redirect).

**Improvements to consider:**

1. **No session persistence across browser refreshes on different tables.** If a guest scans a different table's QR while they have an active session on another table, they get silently dropped. Consider a "You have an active session on Table X — continue there?" prompt.

2. **Persons numpad allows 0.** Currently `Number(persons) === 0` is disabled at button level, but entering "0" directly from the numpad then deleting is still possible. Add server-side minimum validation (`persons >= 1`).

3. **No table label shown on persons numpad screen.** The table label is shown on the "Start Order" screen but not on the persons numpad screen. Carry it through for orientation.

4. **Session ID exposed in footer.** The raw `session_id` is printed in the footer for debugging. Remove this in production or gate it behind a dev/env flag.

5. **`logoUrl` prop is accepted but never rendered.** The logo could be shown above the restaurant name on the landing screen to make it feel more branded per-restaurant.

6. **The `FoodMenu` component is a 1,041-line monolith.** For a component meant to serve mass restaurants, it should be split: `CartSidebar`, `OrdersSidebar`, `ReceiptView`, `TipSelector`, `CheckoutFlow`. Each can be individually improved without touching the others.

---

## Owner Flow Overview

The owner area lives under `/[restaurant]/owner/*` with a shared sticky top-nav header.

**Owner nav links:** Tables → Scanner → Kitchen → Activity → Settings

**Notable:** `/[restaurant]/owner` redirects immediately to `/owner/scan` (the default landing). Consider redirecting to `/owner/activity` instead since it shows the full picture (live tables + sales) and is more immediately useful when an owner opens their dashboard.

---

## `/[restaurant]/owner/tables` — Table Grid

**What it does:**
- Shows all tables from `data.json` as a grid.
- Each tile is colour-coded: 🔴 Packed (active session) / 🟢 Available.
- Clicking a tile navigates to `/owner/tables/[tableId]`.
- Auto-refreshes every 5 seconds via Supabase direct query.

**What's working well:**
- Visual at-a-glance status is excellent.
- Shows current/max persons count on each tile.
- Auto-refresh with manual override works smoothly.

**Improvements to consider:**

1. **`payment_pending` status looks same as `active` on the grid.** A table awaiting checkout shows red (packed), but there's no visual difference from a table that's still ordering. Add a pulsing amber badge/indicator for `payment_pending` tiles so staff know to go collect payment.

2. **No running total shown on the tile.** Owners would benefit from seeing the running order total on the tile itself (e.g. `$42.50`) without having to navigate into the detail page.

3. **Clicking a green (available) tile goes to a detail page that says "Table is Available."** This is correct but could also offer a "Open Table" button allowing the owner to manually start a session for walk-ins without requiring a QR scan.

4. **`tables` config comes from `data.json`.** For the SaaS model where tables are loosely added, consider making table count configurable from the owner dashboard (Settings page) rather than only via `data.json` editing.

---

## `/[restaurant]/owner/tables/[tableId]` — Table Detail

**What it does:**
- Shows current status (Available / Packed).
- If active session: shows full order item list with serve tracking.
- Owner can adjust item quantities (add/remove via `+/-`).
- Serve tracker per item (`served_qty`).
- "Pay & Close" (marks `completed`) and "Flush" (marks `closed`/deleted) actions.
- Shows last 5 session history, each linking to `/owner/sessions/[sessionId]`.

**What's working well:**
- Full order control from a single page.
- Serve tracking inline is powerful.
- History section with links is clean and useful.

**Improvements to consider:**

1. **No "Add Item" button from the menu.** Currently the owner can only change quantities of existing items. There's no way to add a new item that wasn't ordered by the guest. Adding a mini menu picker here (filtered by category) would help for cases where guests order verbally.

2. **`formatDate` is locale-hardcoded to `"en-US"`.** Should use the restaurant's configured language/locale from `data.json → app.language`.

3. **"Flush" is ambiguous language.** Rename to "Force Close" and clarify in the dialog that it closes the session without recording payment. "Pay & Close" → "Mark as Paid & Close" is clearer.

4. **No auto-refresh on this page.** Unlike the tables grid, the detail page requires manual refresh. Add a 10s auto-refresh (with optional toggle) so the owner sees order updates as guests add items in real time.

5. **Item price displayed per-unit only, not per-row total.** The line item shows `$12.00` (unit price) but not `$24.00` (2x quantity). Show both: `$12 × 2 = $24`.

---

## `/[restaurant]/owner/kitchen` — Kitchen Display System (KDS)

**What it does:**
- Shows active sessions with their items as "tickets".
- Oldest session shown first (KDS order).
- Per-item cooked quantity tracker (`+/-`).
- Elapsed time indicator with colour coding: normal → amber (15m+) → red (30m+).
- "Update Ticket" button saves cooked counts to backend.
- Fully cooked tickets dim to 70% opacity.
- Auto-refreshes every 5 seconds.

**What's working well:**
- Elapsed time with colour-coded urgency is excellent for kitchen staff.
- Local pending state (before save) prevents accidental data loss.
- "Update Ticket" button only appears when there are unsaved changes.
- Oldest-first ordering is correct for kitchen workflow.

**Improvements to consider:**

1. **No sound/notification when a new ticket arrives.** Kitchen staff may not be looking at the screen. A browser notification or optional audio ping when a new session appears would be a significant UX win.

2. **The KDS only shows cooked qty, not served qty.** The serve tracking happens in the Table Detail page, but the kitchen doesn't see whether items have been taken to the table. Adding a "Served" indicator on the KDS ticket would close the loop for kitchen-to-floor communication.

3. **`getMenuItemDetails` is duplicated across KDS, Activity, and Scan clients.** Extract this to a shared `lib/menu.ts` helper: `getMenuItemById(itemId, menu, categories)`.

4. **No "Mark All Cooked" button per ticket.** Staff have to increment each item individually. A single "Mark All Cooked" button per ticket would speed up the workflow significantly.

5. **Customer notes styled in red (good) but lack visual prominence.** Notes like "no onion" or "extra spicy" are critical. Consider adding a warning icon prefix to make them unmissable.

---

## `/[restaurant]/owner/scan` — QR Scanner / Payment Finalizer

**What it does:**
- Opens camera-based QR scanner.
- Scans a session's QR code from the guest's receipt screen.
- Looks up the session and shows the full bill.
- Owner clicks "Accept Payment & Finalize" to close the session.
- Supports deep-linking: `?session_id=xxx` pre-loads without scanning.

**What's working well:**
- Clean full-screen scanner.
- Deep-link pre-loading is great for URL-based workflows.
- Green success state after finalization is clear.

**Improvements to consider:**

1. **Default redirect from `/owner` goes here, but the scanner is only useful during checkout.** Most of the time, owners want to see activity, not scan. Consider redirecting `/owner` to `/owner/activity` by default, and keeping the scanner accessible from nav.

2. **No fallback for browsers without camera access.** If camera permissions are denied (e.g. desktop browser), the scanner is empty. Show a text input fallback: "Paste Session ID manually."

3. **The `handleScan` URL-parsing branch is dead code.** Since QR codes encode only the raw session_id, `new URL(text)` always throws. Simplify the handler to just accept the raw string directly.

4. **Finalizing from scan marks `status: "closed"` but the table detail page uses `"completed"` for paid sessions.** Standardise: scan → `"completed"`, flush → `"closed"`.

---

## `/[restaurant]/owner/activity` — Activity Dashboard

**What it does:**
- 4 stat cards: Live Tables, Active Sales, Total Sales, Closed Sessions.
- Active table cards showing session details, item breakdown, served progress, and bill totals.
- Recent Transactions table (last 10 closed sessions), clickable → session detail.
- Auto-refreshes every 5 seconds.

**What's working well:**
- Stats cards give an immediate snapshot.
- Active session cards with item breakdown and served/total count is excellent.
- Transaction table with clickable rows is clean.

**Improvements to consider:**

1. **"Total Sales" counts ALL sessions ever, not just today's.** This number grows unboundedly and is misleading for daily operations. Filter to today by default with an optional "All Time" toggle.

2. **`activeSales` includes `payment_pending` sessions.** These are committed but not collected. Consider showing "Ordering" and "Awaiting Payment" separately.

3. **Session card rendering is duplicated from `OwnerTablesClient`.** Extract a shared `<SessionCard>` component.

4. **"Use Scanner to Finalize" CTA at the bottom of each active card is not a link.** Link it to `/owner/scan` or directly to `/owner/tables/[tableId]`.

5. **`getMenuItemDetails` is duplicated here too.** Move to shared `lib/menu.ts`.

---

## `/[restaurant]/owner/settings` — QR Code Generator

**What it does:**
- Renders a downloadable QR card for each table in `data.json`.
- Each card has the restaurant name, table label, and a download button.

**What's working well:**
- Simple, clean, functional.
- Download button works per-table.

**Improvements to consider:**

1. **Tables are read-only from `data.json`.** For the SaaS model, owners should be able to add/remove/rename tables from this settings page without editing JSON.

2. **No "Download All" bulk action.** For a restaurant with 20 tables, downloading one at a time is tedious. A "Download All as ZIP" button would help.

3. **Settings is very sparse.** Long-term this page should host: table management, tax/service charge rate, currency, timezone, notification preferences — things currently locked in `data.json`.

---

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/table/session` | GET | Validate session by `session_id` |
| `/api/table/session` | POST | Create a new table session |
| `/api/table/session/close` | POST | Close/complete a session |
| `/api/table/order/add` | POST | Add/update cart items, set tips |
| `/api/table/order/cook` | POST | Update cooked quantities (kitchen) |
| `/api/table/order/serve` | POST | Update served quantities |

**Improvements to consider:**

1. **No authentication on any owner API routes.** Anyone who knows the URL can call `/api/table/session/close` with any session ID. Owner-facing routes (`/close`, `/cook`, `/serve`, `isOwner: true` path of `/add`) should be protected with a secret token or Supabase session auth.

2. **`/api/table/order/add` handles both guest cart and owner edits via `isOwner` flag.** Consider splitting into `/api/table/order/update` (owner) vs. `/api/table/order/add` (guest only) for clarity.

3. **No rate limiting on session creation.** A user could spam POST `/api/table/session` to flood the DB. Add IP-based rate limiting via Vercel Edge middleware or Upstash.

---

## Shared Architecture Observations

### What the SaaS Model Does Well
- **Single codebase, multi-tenant by slug.** Adding a restaurant is just a `data.json` + folder — zero code changes.
- **Table/Order feature is completely optional.** Restaurants without `tables` in `data.json` simply don't surface the feature.
- **Kitchen, Owner, and Guest UIs are fully decoupled.** Each reads from the same Supabase session row but renders independently.
- **The `FoodMenu` component works in both static and table-mode contexts** — same component used on the public `/menu` page and the guest ordering page.

### Things to Standardise Across All Owner Pages

| Duplicated Pattern | Found In | Recommended Fix |
|---|---|---|
| `fetchSessions` + `autoRefresh` + `isRefreshing` | Tables, Kitchen, Activity | Extract `useTableSessions(slug, filter)` hook |
| `getMenuItemDetails(id, menu, categories)` | Kitchen, Activity, Scan | Move to `lib/menu.ts` |
| `CURRENCY_SYMBOLS` map | 3+ files | Move to `lib/currency.ts` |
| `alert()` for errors | TableDetail, Kitchen | Standardise on `toast()` everywhere |

### Supabase Real-time (Future Upgrade)

Currently all pages poll every 5 seconds (`setInterval`). This works but burns requests at scale. For production, replace with **Supabase Realtime subscriptions** (`supabase.channel(...).on('postgres_changes', ...)`). This gives true push-based updates with zero polling overhead.

---

## Notes on the "Loose" Table Feature Model

The table/order system was added as a loosely coupled module on top of the restaurant site template. This is the right design approach — here's how to keep it clean as it grows:

- **Tables config in `data.json`** is fine for MVP but will need a DB-backed table config eventually (owner-managed from Settings).
- **Session-based ordering** (cookie + Supabase row) is solid. No auth required for guests is the right call for a restaurant context.
- **The three status states (`active` → `payment_pending` → `closed`/`completed`)** map cleanly to the guest journey. Just ensure `completed` (paid) and `closed` (force-closed without payment) are used consistently everywhere.
- **The KDS (kitchen display) is a genuine differentiator** for the SaaS offering. Most restaurant site builders don't include this. Keep investing in it — sound alerts and Realtime push would make it production-grade.

### Offline-Resilient Cart/Order Architecture
To ensure the menu remains functional even during unstable internet/database outages, we should move towards a **Local-First Cart approach**:
1. **Sync Storage:** Use `localStorage` or `IndexedDB` to persist the cart state on the client immediately.
2. **Optimistic UI:** When the user clicks "Add to Order", update the local state instantly without waiting for the API.
3. **Queueing System:** If the network request fails, push the order update to a background queue. Once the connection is restored, the queue flushes the updates to the database sequentially.
4. **Resilient Menu:** Wrap the entire `FoodMenu` and order logic in an **ErrorBoundary** and provide a "Syncing..." status indicator if the background connection is lost, rather than crashing or showing a 404.
