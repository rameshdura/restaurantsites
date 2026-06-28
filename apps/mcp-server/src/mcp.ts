import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getRestaurantData } from './fetcher';
import {
  getOAuthConnection,
  updateOAuthToken,
  getReservation,
  getStoreById,
  setCalendarEventId,
} from './supabase';
import {
  refreshGoogleToken,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  listCalendarEvents,
} from '@workspace/integrations';

// ─── Token refresh helper ────────────────────────────────────
// Ensures the access token is fresh before making API calls.
// Updates Supabase if a refresh was needed.

async function ensureFreshToken(connectionId: string, accessToken: string | null, refreshToken: string | null, expiresAt: string | null): Promise<string> {
  // Check if token is still valid (with 60s buffer)
  if (accessToken && expiresAt) {
    const expiryMs = new Date(expiresAt).getTime();
    if (Date.now() < expiryMs - 60_000) {
      return accessToken;
    }
  }

  if (!refreshToken) {
    throw new Error('No refresh token available. The restaurant owner must reconnect Google Calendar.');
  }

  const { access_token, expires_in } = await refreshGoogleToken(refreshToken);
  const newExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

  await updateOAuthToken(connectionId, access_token, newExpiresAt);
  return access_token;
}

// ─── MCP Server setup ────────────────────────────────────────

export const setupMcpServer = (slug: string) => {
  const server = new Server(
    {
      name: `restaurant-mcp-${slug}`,
      version: '1.0.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  // ── Resources ──────────────────────────────────────────────
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: 'restaurant://data.json',
        name: `${slug} Data JSON`,
        description: 'The complete structured JSON data for the restaurant, including menu, settings, and SEO.',
        mimeType: 'application/json',
      },
    ],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === 'restaurant://data.json') {
      try {
        const data = await getRestaurantData(slug);
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'application/json',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error: any) {
        throw new Error(`Resource read error: ${error.message}`);
      }
    }
    throw new Error(`Resource not found: ${request.params.uri}`);
  });

  // ── Tools ─────────────────────────────────────────────────
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      // ── Restaurant info tools ──
      {
        name: 'get_restaurant_info',
        description: 'Get basic top-level information about the restaurant.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_menu',
        description: 'Get the full structured menu of the restaurant.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_pages_config',
        description: 'Get the page configurations and sections layout for the restaurant.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_booking_settings',
        description: 'Get the restaurant reservation and booking settings.',
        inputSchema: { type: 'object', properties: {} },
      },
      // ── Booking tools ──
      {
        name: 'check_booking_availability',
        description: 'Check availability for a reservation on a specific date, time, and party size.',
        inputSchema: {
          type: 'object',
          properties: {
            date: { type: 'string', description: 'Date in YYYY-MM-DD format (e.g. 2026-06-28)' },
            time: { type: 'string', description: 'Time in HH:MM format (e.g. 19:00)' },
            partySize: { type: 'number', description: 'Number of guests' },
          },
          required: ['date', 'time', 'partySize'],
        },
      },
      {
        name: 'create_booking',
        description: 'Create a confirmed reservation for a customer. Also syncs to Google Calendar if connected.',
        inputSchema: {
          type: 'object',
          properties: {
            date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
            time: { type: 'string', description: 'Time in HH:MM format' },
            partySize: { type: 'number', description: 'Number of guests' },
            customerName: { type: 'string', description: 'Customer full name' },
            customerEmail: { type: 'string', description: 'Customer email address' },
            customerPhone: { type: 'string', description: 'Customer phone number' },
            notes: { type: 'string', description: 'Optional notes or special requests' },
          },
          required: ['date', 'time', 'partySize', 'customerName', 'customerEmail', 'customerPhone'],
        },
      },
      {
        name: 'list_bookings',
        description: 'List reservations for this restaurant. Optionally filter by date.',
        inputSchema: {
          type: 'object',
          properties: {
            date: { type: 'string', description: 'Optional date filter YYYY-MM-DD' },
          },
        },
      },
      {
        name: 'cancel_booking',
        description: 'Cancel a reservation by its ID. Also removes the Google Calendar event if connected.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'The reservation ID (UUID)' },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_booking',
        description: 'Get full details of a reservation by its ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'The reservation ID (UUID)' },
          },
          required: ['id'],
        },
      },
      // ── Calendar tools ──
      {
        name: 'calendar.create',
        description: 'Create a Google Calendar event for an existing reservation. Requires the restaurant to have connected Google Calendar via OAuth.',
        inputSchema: {
          type: 'object',
          properties: {
            restaurant_id: { type: 'string', description: 'Restaurant UUID from Supabase' },
            reservation_id: { type: 'string', description: 'Reservation UUID from Supabase' },
          },
          required: ['restaurant_id', 'reservation_id'],
        },
      },
      {
        name: 'calendar.update',
        description: 'Update an existing Google Calendar event when a reservation changes.',
        inputSchema: {
          type: 'object',
          properties: {
            restaurant_id: { type: 'string', description: 'Restaurant UUID' },
            reservation_id: { type: 'string', description: 'Reservation UUID' },
            calendar_event_id: { type: 'string', description: 'Google Calendar event ID to update' },
          },
          required: ['restaurant_id', 'reservation_id', 'calendar_event_id'],
        },
      },
      {
        name: 'calendar.delete',
        description: 'Delete a Google Calendar event when a reservation is cancelled.',
        inputSchema: {
          type: 'object',
          properties: {
            restaurant_id: { type: 'string', description: 'Restaurant UUID' },
            reservation_id: { type: 'string', description: 'Reservation UUID' },
            calendar_event_id: { type: 'string', description: 'Google Calendar event ID to delete' },
          },
          required: ['restaurant_id', 'calendar_event_id'],
        },
      },
      {
        name: 'calendar.list',
        description: 'List upcoming Google Calendar events for the restaurant.',
        inputSchema: {
          type: 'object',
          properties: {
            restaurant_id: { type: 'string', description: 'Restaurant UUID' },
            max_results: { type: 'number', description: 'Max events to return (default: 20)' },
          },
          required: ['restaurant_id'],
        },
      },
    ],
  }));

  // ── Tool Handlers ─────────────────────────────────────────
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args = {} } = request.params;

      const getApiUrl = (path: string) => {
        const root = process.env.ROOT_API_URL || 'http://localhost:3000';
        return `${root.replace(/\/$/, '')}${path}`;
      };

      // ── Restaurant info ──────────────────────────────────
      if (name === 'get_restaurant_info') {
        const data = await getRestaurantData(slug);
        return { content: [{ type: 'text', text: JSON.stringify({ name: data.name, address: data.address, phone: data.phone, email: data.email, description: data.description, contact: data.contact, openingHours: data.openingHours }, null, 2) }] };
      }

      if (name === 'get_menu') {
        const data = await getRestaurantData(slug);
        return { content: [{ type: 'text', text: JSON.stringify({ menuCategories: data.menuCategories, menu: data.menu }, null, 2) }] };
      }

      if (name === 'get_pages_config') {
        const data = await getRestaurantData(slug);
        return { content: [{ type: 'text', text: JSON.stringify(data.pages || {}, null, 2) }] };
      }

      if (name === 'get_booking_settings') {
        const data = await getRestaurantData(slug);
        const settings = {
          reservation: data.reservation || { acceptsReservations: true, reservationMethods: ['phone', 'online'], minimumPartySize: 1, maximumPartySize: 20 },
          openingHours: data.openingHours || [],
          holidayNotes: data.holidayNotes || '',
        };
        return { content: [{ type: 'text', text: JSON.stringify(settings, null, 2) }] };
      }

      // ── Booking tools (delegate to Next.js API) ──────────
      if (name === 'check_booking_availability') {
        const { date, time, partySize } = args as { date: string; time: string; partySize: number };
        if (!date || !time || !partySize) throw new Error('Missing required arguments: date, time, partySize');
        const url = getApiUrl(`/api/bookings?restaurantSlug=${slug}&checkAvailability=true&date=${date}&time=${time}&partySize=${partySize}`);
        const res = await fetch(url);
        const json = await res.json();
        return { content: [{ type: 'text', text: JSON.stringify(json, null, 2) }] };
      }

      if (name === 'create_booking') {
        const { date, time, partySize, customerName, customerEmail, customerPhone, notes } = args as any;
        if (!date || !time || !partySize || !customerName || !customerEmail || !customerPhone) throw new Error('Missing required booking fields');
        const url = getApiUrl('/api/bookings');
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restaurantSlug: slug, date, time, partySize, customerName, customerEmail, customerPhone, notes }),
        });
        const json = await res.json();
        if (!res.ok) return { isError: true, content: [{ type: 'text', text: json.error || 'Failed to create booking.' }] };
        return { content: [{ type: 'text', text: JSON.stringify(json, null, 2) }] };
      }

      if (name === 'list_bookings') {
        const { date } = args as { date?: string };
        const query = date ? `&date=${date}` : '';
        const url = getApiUrl(`/api/bookings?restaurantSlug=${slug}${query}`);
        const res = await fetch(url);
        const json = await res.json();
        return { content: [{ type: 'text', text: JSON.stringify(json, null, 2) }] };
      }

      if (name === 'cancel_booking') {
        const { id } = args as { id: string };
        if (!id) throw new Error('Missing required argument: id');
        const url = getApiUrl(`/api/bookings/${id}`);
        const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) });
        const json = await res.json();
        return { content: [{ type: 'text', text: JSON.stringify(json, null, 2) }] };
      }

      if (name === 'get_booking') {
        const { id } = args as { id: string };
        if (!id) throw new Error('Missing required argument: id');
        const url = getApiUrl(`/api/bookings/${id}`);
        const res = await fetch(url);
        const json = await res.json();
        return { content: [{ type: 'text', text: JSON.stringify(json, null, 2) }] };
      }

      // ── Calendar tools ────────────────────────────────────

      if (name === 'calendar.create') {
        const store_id = (args as any).store_id || (args as any).restaurant_id;
        const { reservation_id } = args as { reservation_id: string };
        if (!store_id || !reservation_id) throw new Error('Missing store_id or reservation_id');

        const [oauth, reservation, store] = await Promise.all([
          getOAuthConnection(store_id, 'google'),
          getReservation(reservation_id),
          getStoreById(store_id),
        ]);

        if (!oauth) return { isError: true, content: [{ type: 'text', text: 'Google Calendar is not connected for this store.' }] };
        if (!reservation) return { isError: true, content: [{ type: 'text', text: 'Reservation not found.' }] };
        if (!store) return { isError: true, content: [{ type: 'text', text: 'Store not found.' }] };

        const accessToken = await ensureFreshToken(oauth.id, oauth.access_token, oauth.refresh_token, oauth.expires_at);
        const eventId = await createCalendarEvent(accessToken, reservation, store);
        await setCalendarEventId(reservation_id, 'google', eventId);

        return { content: [{ type: 'text', text: JSON.stringify({ success: true, google_event_id: eventId }, null, 2) }] };
      }

      if (name === 'calendar.update') {
        const store_id = (args as any).store_id || (args as any).restaurant_id;
        const { reservation_id, calendar_event_id } = args as { reservation_id: string; calendar_event_id: string };
        if (!store_id || !reservation_id || !calendar_event_id) throw new Error('Missing required arguments');

        const [oauth, reservation, store] = await Promise.all([
          getOAuthConnection(store_id, 'google'),
          getReservation(reservation_id),
          getStoreById(store_id),
        ]);

        if (!oauth) return { isError: true, content: [{ type: 'text', text: 'Google Calendar is not connected.' }] };
        if (!reservation || !store) return { isError: true, content: [{ type: 'text', text: 'Reservation or store not found.' }] };

        const accessToken = await ensureFreshToken(oauth.id, oauth.access_token, oauth.refresh_token, oauth.expires_at);
        await updateCalendarEvent(accessToken, calendar_event_id, reservation, store);

        return { content: [{ type: 'text', text: JSON.stringify({ success: true, updated_event_id: calendar_event_id }, null, 2) }] };
      }

      if (name === 'calendar.delete') {
        const store_id = (args as any).store_id || (args as any).restaurant_id;
        const { calendar_event_id } = args as { calendar_event_id: string };
        if (!store_id || !calendar_event_id) throw new Error('Missing store_id or calendar_event_id');

        const oauth = await getOAuthConnection(store_id, 'google');
        if (!oauth) return { isError: true, content: [{ type: 'text', text: 'Google Calendar is not connected.' }] };

        const accessToken = await ensureFreshToken(oauth.id, oauth.access_token, oauth.refresh_token, oauth.expires_at);
        await deleteCalendarEvent(accessToken, calendar_event_id);

        return { content: [{ type: 'text', text: JSON.stringify({ success: true, deleted_event_id: calendar_event_id }, null, 2) }] };
      }

      if (name === 'calendar.list') {
        const store_id = (args as any).store_id || (args as any).restaurant_id;
        const { max_results } = args as { max_results?: number };
        if (!store_id) throw new Error('Missing store_id');

        const oauth = await getOAuthConnection(store_id, 'google');
        if (!oauth) return { isError: true, content: [{ type: 'text', text: 'Google Calendar is not connected.' }] };

        const accessToken = await ensureFreshToken(oauth.id, oauth.access_token, oauth.refresh_token, oauth.expires_at);
        const events = await listCalendarEvents(accessToken, 'primary', max_results ?? 20);

        return { content: [{ type: 'text', text: JSON.stringify({ events }, null, 2) }] };
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Tool error: ${error.message}` }],
      };
    }
  });

  return server;
};
