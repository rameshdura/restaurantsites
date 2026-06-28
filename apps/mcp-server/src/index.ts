import dotenv from 'dotenv';
import path from 'path';

// Load environment variables relative to this directory at the very top
// so that local modules (like ./supabase) have access to them during import-time initialization.
const envPaths = [
  path.join(__dirname, '../.env'),
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'apps/mcp-server/.env')
];

let envLoaded = false;
for (const p of envPaths) {
  const res = dotenv.config({ path: p });
  if (!res.error) {
    console.log(`Loaded environment from: ${p}`);
    envLoaded = true;
    break;
  }
}
if (!envLoaded) {
  console.warn('Warning: Could not load .env file from any expected path.');
}

import express from 'express';
import cors from 'cors';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { setupMcpServer } from './mcp';
import { authMiddleware } from './auth';
import { McpRequest } from './types';
import {
  getOAuthConnection,
  updateOAuthToken,
  getReservation,
  getRestaurantById,
  setCalendarEventId,
} from './supabase';
import {
  refreshGoogleToken,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  listCalendarEvents,
} from './calendar';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── MCP SSE (per-restaurant slug) ───────────────────────────
const transports = new Map<string, SSEServerTransport>();

app.get('/sse', authMiddleware, async (req: McpRequest, res) => {
  const slug = req.slug!;
  console.log(`New SSE connection for slug: ${slug}`);

  const transport = new SSEServerTransport('/message', res);
  const mcpServer = setupMcpServer(slug);
  await mcpServer.connect(transport);

  const sessionId = transport.sessionId;
  transports.set(sessionId, transport);

  res.on('close', () => {
    console.log(`SSE closed for session: ${sessionId}`);
    transports.delete(sessionId);
  });
});

app.post('/message', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    res.status(400).json({ error: 'sessionId query parameter is required' });
    return;
  }
  const transport = transports.get(sessionId);
  if (!transport) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  await transport.handlePostMessage(req, res);
});

// ─── API Key guard for REST endpoints ────────────────────────
function requireApiKey(req: express.Request, res: express.Response): boolean {
  const expected = process.env.MCP_API_KEY;
  if (!expected) {
    res.status(500).json({ error: 'MCP_API_KEY not configured' });
    return false;
  }
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${expected}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

// ─── Token helper ─────────────────────────────────────────────
async function ensureFreshToken(
  connectionId: string,
  accessToken: string | null,
  refreshToken: string | null,
  expiresAt: string | null
): Promise<string> {
  if (accessToken && expiresAt) {
    const expiryMs = new Date(expiresAt).getTime();
    if (Date.now() < expiryMs - 60_000) return accessToken;
  }
  if (!refreshToken) throw new Error('No refresh token — restaurant must reconnect Google Calendar.');
  const { access_token, expires_in } = await refreshGoogleToken(refreshToken);
  const newExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();
  await updateOAuthToken(connectionId, access_token, newExpiresAt);
  return access_token;
}

// ─── REST: POST /calendar/create ─────────────────────────────
// Body: { restaurant_id, reservation_id }
// Called by Next.js after creating a reservation.

app.post('/calendar/create', async (req, res) => {
  if (!requireApiKey(req, res)) return;
  try {
    const { restaurant_id, reservation_id } = req.body;
    if (!restaurant_id || !reservation_id) {
      res.status(400).json({ error: 'Missing restaurant_id or reservation_id' });
      return;
    }

    const [oauth, reservation, restaurant] = await Promise.all([
      getOAuthConnection(restaurant_id, 'google'),
      getReservation(reservation_id),
      getRestaurantById(restaurant_id),
    ]);

    if (!oauth) { res.status(404).json({ error: 'Google Calendar not connected for this restaurant.' }); return; }
    if (!reservation) { res.status(404).json({ error: 'Reservation not found.' }); return; }
    if (!restaurant) { res.status(404).json({ error: 'Restaurant not found.' }); return; }

    const accessToken = await ensureFreshToken(oauth.id, oauth.access_token, oauth.refresh_token, oauth.expires_at);
    const eventId = await createCalendarEvent(accessToken, reservation, restaurant);
    await setCalendarEventId(reservation_id, 'google', eventId);

    res.json({ success: true, google_event_id: eventId });
  } catch (err: any) {
    console.error('[POST /calendar/create]', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── REST: POST /calendar/update ──────────────────────────────
// Body: { restaurant_id, reservation_id, calendar_event_id }

app.post('/calendar/update', async (req, res) => {
  if (!requireApiKey(req, res)) return;
  try {
    const { restaurant_id, reservation_id, calendar_event_id } = req.body;
    if (!restaurant_id || !reservation_id || !calendar_event_id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const [oauth, reservation, restaurant] = await Promise.all([
      getOAuthConnection(restaurant_id, 'google'),
      getReservation(reservation_id),
      getRestaurantById(restaurant_id),
    ]);

    if (!oauth || !reservation || !restaurant) {
      res.status(404).json({ error: 'OAuth, reservation, or restaurant not found.' });
      return;
    }

    const accessToken = await ensureFreshToken(oauth.id, oauth.access_token, oauth.refresh_token, oauth.expires_at);
    await updateCalendarEvent(accessToken, calendar_event_id, reservation, restaurant);

    res.json({ success: true, updated_event_id: calendar_event_id });
  } catch (err: any) {
    console.error('[POST /calendar/update]', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── REST: POST /calendar/delete ──────────────────────────────
// Body: { restaurant_id, calendar_event_id }

app.post('/calendar/delete', async (req, res) => {
  if (!requireApiKey(req, res)) return;
  try {
    const { restaurant_id, calendar_event_id } = req.body;
    if (!restaurant_id || !calendar_event_id) {
      res.status(400).json({ error: 'Missing restaurant_id or calendar_event_id' });
      return;
    }

    const oauth = await getOAuthConnection(restaurant_id, 'google');
    if (!oauth) { res.status(404).json({ error: 'Google Calendar not connected.' }); return; }

    const accessToken = await ensureFreshToken(oauth.id, oauth.access_token, oauth.refresh_token, oauth.expires_at);
    await deleteCalendarEvent(accessToken, calendar_event_id);

    res.json({ success: true, deleted_event_id: calendar_event_id });
  } catch (err: any) {
    console.error('[POST /calendar/delete]', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── REST: POST /calendar/list ────────────────────────────────
// Body: { restaurant_id, max_results? }

app.post('/calendar/list', async (req, res) => {
  if (!requireApiKey(req, res)) return;
  try {
    const { restaurant_id, max_results = 20 } = req.body;
    if (!restaurant_id) {
      res.status(400).json({ error: 'Missing restaurant_id' });
      return;
    }

    const oauth = await getOAuthConnection(restaurant_id, 'google');
    if (!oauth) { res.status(404).json({ error: 'Google Calendar not connected.' }); return; }

    const accessToken = await ensureFreshToken(oauth.id, oauth.access_token, oauth.refresh_token, oauth.expires_at);
    const events = await listCalendarEvents(accessToken, 'primary', max_results);

    res.json({ events });
  } catch (err: any) {
    console.error('[POST /calendar/list]', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Health check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RestaurantSite MCP Server',
    version: '1.0.0',
    endpoints: [
      'GET  /sse                  — MCP SSE (per-restaurant)',
      'POST /message              — MCP message handler',
      'POST /calendar/create      — Create Google Calendar event',
      'POST /calendar/update      — Update Google Calendar event',
      'POST /calendar/delete      — Delete Google Calendar event',
      'POST /calendar/list        — List upcoming calendar events',
    ],
  });
});

app.listen(port, () => {
  console.log(`MCP Server listening on port ${port}`);
});
