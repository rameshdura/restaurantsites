import { google } from 'googleapis';
import type { calendar_v3 } from 'googleapis';

// ─── Shared Interface Types ────────────────────────────────────

export interface IntegrationStore {
  name: string;
  timezone: string;
}

export type IntegrationRestaurant = IntegrationStore;

export interface IntegrationReservation {
  id: string;
  store_id: string;
  store_slug: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  party_size: number;
  reservation_date: string; // "YYYY-MM-DD"
  reservation_time: string; // "HH:MM:SS" or "HH:MM"
  notes: string | null;
}

// Backwards compatibility alias for the old shape
export interface LegacyIntegrationReservation {
  id: string;
  restaurant_id: string;
  restaurant_slug: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  notes: string | null;
}

export interface RefreshedToken {
  access_token: string;
  expires_in: number;
}

// ─── Token Refresh ────────────────────────────────────────────

/**
 * Refreshes a Google OAuth access token using the stored refresh_token.
 */
export async function refreshGoogleToken(
  refreshToken: string,
  clientId?: string,
  clientSecret?: string
): Promise<RefreshedToken> {
  const finalClientId = clientId || process.env.GOOGLE_CLIENT_ID;
  const finalClientSecret = clientSecret || process.env.GOOGLE_CLIENT_SECRET;

  if (!finalClientId || !finalClientSecret) {
    throw new Error(
      'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set or passed as arguments'
    );
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: finalClientId,
      client_secret: finalClientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google token refresh failed: ${err}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
  };
}

// ─── Calendar Client Helper ───────────────────────────────────

function getCalendarClient(accessToken: string): calendar_v3.Calendar {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth });
}

// ─── Format reservation as Google Calendar event ─────────────

function buildEventBody(
  reservation: IntegrationReservation,
  store: IntegrationStore
): calendar_v3.Schema$Event {
  const {
    reservation_date,
    reservation_time,
    party_size,
    customer_name,
    customer_email,
    customer_phone,
    notes,
  } = reservation;

  // reservation_time is "HH:MM:SS" or "HH:MM"
  const timeParts = reservation_time.split(':');
  const hh = timeParts[0] ?? '00';
  const mm = timeParts[1] ?? '00';

  const startDateTime = `${reservation_date}T${hh}:${mm}:00`;

  // Default 1.5 hour slot
  const endDate = new Date(`${reservation_date}T${hh}:${mm}:00`);
  endDate.setMinutes(endDate.getMinutes() + 90);
  const endHH = String(endDate.getHours()).padStart(2, '0');
  const endMM = String(endDate.getMinutes()).padStart(2, '0');
  const endDateTime = `${reservation_date}T${endHH}:${endMM}:00`;

  const descriptionLines = [
    `👥 Party size: ${party_size}`,
    customer_phone ? `📞 Phone: ${customer_phone}` : '',
    customer_email ? `📧 Email: ${customer_email}` : '',
    notes ? `📝 Notes: ${notes}` : '',
    `\n🆔 Reservation ID: ${reservation.id}`,
  ].filter(Boolean);

  const event: calendar_v3.Schema$Event = {
    summary: `Reservation — ${customer_name} (${party_size} guests)`,
    description: descriptionLines.join('\n'),
    location: store.name,
    start: {
      dateTime: startDateTime,
      timeZone: store.timezone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: store.timezone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
    extendedProperties: {
      private: {
        reservation_id: reservation.id,
        restaurant_id: reservation.store_id, // keep key as restaurant_id inside google event meta for backwards compatibility
        store_id: reservation.store_id,
        source: 'restaurantsite',
      },
    },
  };

  if (customer_email) {
    event.attendees = [{ email: customer_email, displayName: customer_name }];
  }

  return event;
}

// ─── calendar.create ──────────────────────────────────────────

/**
 * Creates a Google Calendar event for the reservation.
 * Returns the Google event ID on success.
 */
export async function createCalendarEvent(
  accessToken: string,
  reservation: IntegrationReservation,
  store: IntegrationStore,
  calendarId = 'primary'
): Promise<string> {
  const calendar = getCalendarClient(accessToken);

  return (await calendar.events.insert({
    calendarId,
    requestBody: buildEventBody(reservation, store),
  })).data.id ?? (() => { throw new Error('Google Calendar returned no event ID'); })();
}

// ─── calendar.update ──────────────────────────────────────────

/**
 * Updates an existing Google Calendar event.
 */
export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  reservation: IntegrationReservation,
  store: IntegrationStore,
  calendarId = 'primary'
): Promise<void> {
  const calendar = getCalendarClient(accessToken);

  await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: buildEventBody(reservation, store),
  });
}

// ─── calendar.delete ──────────────────────────────────────────

/**
 * Deletes a Google Calendar event.
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string,
  calendarId = 'primary'
): Promise<void> {
  const calendar = getCalendarClient(accessToken);

  await calendar.events.delete({
    calendarId,
    eventId,
  });
}

// ─── calendar.list ────────────────────────────────────────────

export interface CalendarEventSummary {
  id: string;
  summary: string;
  start: string;
  end: string;
}

/**
 * Lists upcoming events from the restaurant's Google Calendar.
 * Filtered to only show events created by RestaurantSite.
 */
export async function listCalendarEvents(
  accessToken: string,
  calendarId = 'primary',
  maxResults = 20
): Promise<CalendarEventSummary[]> {
  const calendar = getCalendarClient(accessToken);

  const response = await calendar.events.list({
    calendarId,
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
    // Filter to only RestaurantSite-created events
    privateExtendedProperty: ['source=restaurantsite'],
  });

  const items = response.data.items ?? [];

  return items.map((event: calendar_v3.Schema$Event) => ({
    id: event.id ?? '',
    summary: event.summary ?? '',
    start: event.start?.dateTime ?? event.start?.date ?? '',
    end: event.end?.dateTime ?? event.end?.date ?? '',
  }));
}
