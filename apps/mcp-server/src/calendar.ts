import { google } from 'googleapis';
import type { ReservationRow, RestaurantRow } from './supabase';
import type { calendar_v3 } from 'googleapis';

// ─── Token Refresh ────────────────────────────────────────────

export interface RefreshedToken {
  access_token: string;
  expires_in: number;
}

/**
 * Refreshes a Google OAuth access token using the stored refresh_token.
 */
export async function refreshGoogleToken(
  refreshToken: string
): Promise<RefreshedToken> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in MCP server env'
    );
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google token refresh failed: ${err}`);
  }

  const data = await res.json();
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
  reservation: ReservationRow,
  restaurant: RestaurantRow
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

  // reservation_time from Supabase is "HH:MM:SS"
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
    location: restaurant.name,
    start: {
      dateTime: startDateTime,
      timeZone: restaurant.timezone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: restaurant.timezone,
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
        restaurant_id: reservation.restaurant_id,
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
  reservation: ReservationRow,
  restaurant: RestaurantRow,
  calendarId = 'primary'
): Promise<string> {
  const calendar = getCalendarClient(accessToken);

  const response = await calendar.events.insert({
    calendarId,
    requestBody: buildEventBody(reservation, restaurant),
  });

  const eventId = response.data.id;
  if (!eventId) throw new Error('Google Calendar returned no event ID');
  return eventId;
}

// ─── calendar.update ──────────────────────────────────────────

/**
 * Updates an existing Google Calendar event.
 */
export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  reservation: ReservationRow,
  restaurant: RestaurantRow,
  calendarId = 'primary'
): Promise<void> {
  const calendar = getCalendarClient(accessToken);

  await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: buildEventBody(reservation, restaurant),
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
