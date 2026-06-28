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

// ─── Schema Compatibility Helpers ─────────────────────────────
let cachedUseStores: boolean | null = null;

export async function getDbSchema(): Promise<boolean> {
  if (cachedUseStores !== null) {
    return cachedUseStores;
  }
  try {
    const { error } = await supabase.from('stores').select('id').limit(1);
    if (error && (error.message.includes("Could not find the table") || error.code === '42P01')) {
      cachedUseStores = false;
    } else {
      cachedUseStores = true;
    }
  } catch {
    cachedUseStores = false;
  }
  return cachedUseStores;
}

export async function getDbTables() {
  const useStores = await getDbSchema();
  return {
    useStores,
    stores: useStores ? 'stores' : 'restaurants',
    oauth_connections: 'oauth_connections',
    reservations: 'reservations',
    
    // Column aliases
    storeIdCol: useStores ? 'store_id' : 'restaurant_id',
    storeSlugCol: useStores ? 'store_slug' : 'restaurant_slug',
  };
}

// ─── Types ────────────────────────────────────────────────────

export interface OAuthConnection {
  id: string;
  store_id: string;
  provider: string;
  account_email: string | null;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: string | null;
  scopes: string | null;
}

export interface ReservationRow {
  id: string;
  store_id: string;
  store_slug: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  party_size: number;
  reservation_date: string;  // YYYY-MM-DD
  reservation_time: string;  // HH:MM:SS or HH:MM
  status: string;
  notes: string | null;
  calendar_event_id: string | null;
}

export interface StoreRow {
  id: string;
  slug: string;
  name: string;
  timezone: string;
}

// ─── Queries ──────────────────────────────────────────────────

/**
 * Fetch the OAuth connection for a store+provider.
 * Returns null if not connected.
 */
export async function getOAuthConnection(
  storeId: string,
  provider: string
): Promise<OAuthConnection | null> {
  const db = await getDbTables();
  const { data, error } = await supabase
    .from(db.oauth_connections)
    .select('*')
    .eq(db.storeIdCol, storeId)
    .eq('provider', provider)
    .single();

  if (error || !data) return null;
  
  const row = data as any;
  return {
    ...row,
    store_id: row.store_id || row.restaurant_id,
  } as OAuthConnection;
}

/**
 * Update the access token + expiry after a token refresh.
 */
export async function updateOAuthToken(
  id: string,
  accessToken: string,
  expiresAt: string
): Promise<void> {
  const db = await getDbTables();
  await supabase
    .from(db.oauth_connections)
    .update({ access_token: accessToken, expires_at: expiresAt })
    .eq('id', id);
}

/**
 * Fetch a single reservation by ID.
 */
export async function getReservation(
  reservationId: string
): Promise<ReservationRow | null> {
  const db = await getDbTables();
  const { data, error } = await supabase
    .from(db.reservations)
    .select('*')
    .eq('id', reservationId)
    .single();

  if (error || !data) return null;
  
  const row = data as any;
  return {
    ...row,
    store_id: row.store_id || row.restaurant_id,
    store_slug: row.store_slug || row.restaurant_slug,
  } as ReservationRow;
}

/**
 * Fetch store details (name, timezone) by ID.
 */
export async function getStoreById(
  storeId: string
): Promise<StoreRow | null> {
  const db = await getDbTables();
  const { data, error } = await supabase
    .from(db.stores)
    .select('id, slug, name, timezone')
    .eq('id', storeId)
    .single();

  if (error || !data) return null;
  return data as StoreRow;
}

/**
 * Save the Google Calendar event ID back to the reservation row.
 */
export async function setCalendarEventId(
  reservationId: string,
  provider: string,
  eventId: string
): Promise<void> {
  const db = await getDbTables();
  await supabase
    .from(db.reservations)
    .update({ calendar_provider: provider, calendar_event_id: eventId })
    .eq('id', reservationId);
}
