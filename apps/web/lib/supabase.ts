import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing."
  )
}

// ── Anon client (client-side / public reads) ─────────────────
// Safe to expose to the browser. Respects Row Level Security.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: SupabaseClient<any> = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder"
)

// ── Server client (API routes & server components only) ──────
// Uses the service role key — bypasses RLS.
// NEVER import this in client components.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseServer: SupabaseClient<any> = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseServiceRoleKey ?? supabaseAnonKey ?? "placeholder",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

let cachedUseStores: boolean | null = null

export async function getDbSchema(): Promise<boolean> {
  if (cachedUseStores !== null) {
    return cachedUseStores
  }
  try {
    const { error } = await supabaseServer.from("stores").select("id").limit(1)
    if (
      error &&
      (error.message.includes("Could not find the table") ||
        error.code === "42P01")
    ) {
      cachedUseStores = false
    } else {
      cachedUseStores = true
    }
  } catch {
    cachedUseStores = false
  }
  return cachedUseStores
}

export async function getDbTables() {
  const useStores = await getDbSchema()
  return {
    useStores,
    stores: useStores ? "stores" : "restaurants",
    store_users: useStores ? "store_users" : "restaurant_users",
    oauth_connections: "oauth_connections",
    booking_settings: "booking_settings",
    reservations: "reservations",
    conversation_sessions: "conversation_sessions",

    // Column aliases
    storeIdCol: useStores ? "store_id" : "restaurant_id",
    storeSlugCol: useStores ? "store_slug" : "restaurant_slug",
  }
}
