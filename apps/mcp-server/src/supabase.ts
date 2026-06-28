import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    '[MCP] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. ' +
    'Calendar integrations will not work.'
  );
}

// Service-role client — bypasses RLS.
// Only used server-side inside the MCP process.
const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseServiceRoleKey ?? 'placeholder',
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// ─── Types ────────────────────────────────────────────────────

export interface OAuthConnection {
  id: string;
  restaurant_id: string;
  provider: string;
  account_email: string | null;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: string | null;
  scopes: string | null;
}

export interface ReservationRow {
  id: string;
  restaurant_id: string;
  restaurant_slug: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  party_size: number;
  reservation_date: string;  // YYYY-MM-DD
  reservation_time: string;  // HH:MM:SS
  status: string;
  notes: string | null;
  calendar_event_id: string | null;
}

export interface RestaurantRow {
  id: string;
  slug: string;
  name: string;
  timezone: string;
}

// ─── Queries ──────────────────────────────────────────────────

/**
 * Fetch the OAuth connection for a restaurant+provider.
 * Returns null if not connected.
 */
export async function getOAuthConnection(
  restaurantId: string,
  provider: string
): Promise<OAuthConnection | null> {
  const { data, error } = await supabase
    .from('oauth_connections')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('provider', provider)
    .single();

  if (error || !data) return null;
  return data as OAuthConnection;
}

/**
 * Update the access token + expiry after a token refresh.
 */
export async function updateOAuthToken(
  id: string,
  accessToken: string,
  expiresAt: string
): Promise<void> {
  await supabase
    .from('oauth_connections')
    .update({ access_token: accessToken, expires_at: expiresAt })
    .eq('id', id);
}

/**
 * Fetch a single reservation by ID.
 */
export async function getReservation(
  reservationId: string
): Promise<ReservationRow | null> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', reservationId)
    .single();

  if (error || !data) return null;
  return data as ReservationRow;
}

/**
 * Fetch restaurant details (name, timezone) by ID.
 */
export async function getRestaurantById(
  restaurantId: string
): Promise<RestaurantRow | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('id, slug, name, timezone')
    .eq('id', restaurantId)
    .single();

  if (error || !data) return null;
  return data as RestaurantRow;
}

/**
 * Save the Google Calendar event ID back to the reservation row.
 */
export async function setCalendarEventId(
  reservationId: string,
  provider: string,
  eventId: string
): Promise<void> {
  await supabase
    .from('reservations')
    .update({ calendar_provider: provider, calendar_event_id: eventId })
    .eq('id', reservationId);
}
