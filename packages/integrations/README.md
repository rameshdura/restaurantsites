# Integrations Module (`@workspace/integrations`)

## 1. Context & Purpose (Why it is here)
The `integrations` package houses the connectors to third-party services and platforms (such as Google Calendar, Notion, and Slack).

By isolating these integrations into a standalone module:
* We separate third-party API dependencies (like Google APIs SDK) from the frontend web bundle.
* We prevent API connection logic from cluttering database queries or core booking business rules.
* If a new integration (e.g. Notion or Mailchimp) needs to be added, it can be developed and tested inside this package without risk of breaking other system components.

---

## 2. Scope & Responsibilities (What it does vs. doesn't do)

### The Module DOES:
* **Manage OAuth Tokens:** Perform access token exchanges and refresh operations (e.g., using Google OAuth2 credentials).
* **Format API Payloads:** Convert internal reservation formats into the schemas required by external platforms (like mapping a booking to a Google Calendar event).
* **Call Third-Party Services:** Handle external HTTP and SDK requests (creating, updating, listing, and deleting events).

### The Module DOES NOT:
* **Manage Database Records:** It does not fetch connection secrets, tokens, or booking IDs directly from the database; it expects the database client or application layer to retrieve and supply them.
* **Determine Booking Availability:** It does not know if a reservation slot is open; it only reacts when requested to sync a confirmed booking.

---

## 3. Relatives & Dependencies
* **Google APIs (`googleapis`):** The official SDK for interacting with Google services.
* **Relatives:** Imported by `apps/web` (triggers sync requests) and `apps/mcp-server` (hosts the OAuth connection endpoints and MCP tools).

---

## 4. Usage Guide

### Refreshing Google OAuth Token
```typescript
import { refreshGoogleToken } from '@workspace/integrations';

const refreshed = await refreshGoogleToken({
  refreshToken: "...",
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!
});

console.log("New Access Token:", refreshed.access_token);
```

### Syncing a Booking Event
```typescript
import { createCalendarEvent } from '@workspace/integrations';

const eventId = await createCalendarEvent({
  accessToken: "...",
  reservation: {
    id: "booking-uuid-1",
    customer_name: "John Doe",
    customer_email: "john@example.com",
    customer_phone: "+81 90-1234-5678",
    party_size: 4,
    reservation_date: "2026-06-29",
    reservation_time: "19:00:00",
    notes: "No seafood"
  },
  restaurant: {
    name: "Sushi Zen",
    timezone: "Asia/Tokyo"
  }
});

console.log("Google Calendar Event ID:", eventId);
```
