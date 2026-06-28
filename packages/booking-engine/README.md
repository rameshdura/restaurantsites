# Booking Engine Module (`@workspace/booking-engine`)

## 1. Context & Purpose (Why it is here)
The `booking-engine` package contains the core business rules and calculations for restaurant reservation handling.

In typical web applications, reservation rules (like checking seat capacity, calculating lunch/dinner shifts, validating party size, and matching operating days) are often scattered across Next.js API endpoints, database triggers, or the client-side UI. This leads to duplicate implementations and makes it impossible to reuse the logic in other environments (such as an AI model context protocol server, background cron syncs, or custom admin tools).

By extracting these rules into a standalone TypeScript library:
* We guarantee consistent validation rules across the Next.js customer booking page and the AI chat assistant (via MCP).
* The package remains independent of any direct file system or database driver, allowing it to be used anywhere (Next.js, Node.js Express, Cloud Functions, Edge, or CLI scripts).

---

## 2. Scope & Responsibilities (What it does vs. doesn't do)

### The Module DOES:
* **Validate Booking Parameters:** Ensure the date format, time format, and party sizes conform to requirements.
* **Determine Opening/Operating Day Matching:** Parse shift ranges (e.g., `"Mon - Thu"`, `"Everyday"`) and determine if the restaurant is open on the requested date.
* **Check Time Window / Shift Compliance:** Verify if a reservation time falls within defined lunch, dinner, or generic operating hours.
* **Calculate Slot Capacity:** Take current reservation guest totals and cross-reference them against maximum restaurant capacities to evaluate if a slot is fully booked.

### The Module DOES NOT:
* **Connect directly to a Database:** Database records (e.g. lists of existing reservations or restaurant details) must be passed to the functions as parameters.
* **Sync Calendars or External Integrations:** Triggering Google Calendar or Notion updates is the job of the `@workspace/integrations` package or the application layer.
* **Handle UI Rendering:** It does not export React elements or styling; it only processes raw inputs and outputs JSON status results.

---

## 3. Relatives & Dependencies
* **Zod (`zod`):** For data structure validation.
* **Relatives:** Imported by `apps/web` (Next.js backend endpoints) and `apps/mcp-server` (Model Context Protocol server).

---

## 4. Usage Guide

### Import Schemas and Functions
```typescript
import { verifyAvailability, DEFAULT_BOOKING_SETTINGS } from '@workspace/booking-engine';
```

### Basic Check Example
```typescript
import { verifyAvailability } from '@workspace/booking-engine';

const result = verifyAvailability({
  restaurantData: {
    name: "Sushi Zen",
    reservation: {
      acceptsReservations: true,
      minimumPartySize: 2,
      maximumPartySize: 10
    },
    openingHours: [
      {
        day: "Mon - Fri",
        lunch: "11:30 - 15:00",
        dinner: "17:00 - 22:00",
        isClosed: false
      }
    ]
  },
  existingBookings: [
    { party_size: 4 },
    { party_size: 2 }
  ],
  dateStr: "2026-06-29",
  timeStr: "19:00",
  partySize: 4
});

if (result.available) {
  console.log("Slot is free! Proceed with database insert.");
} else {
  console.log(`Cannot book: ${result.message}`);
}
```
