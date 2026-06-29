import { NextResponse } from "next/server"
import { supabaseServer, getDbTables } from "@/lib/supabase"
import type { Restaurant, ConversationSession } from "@/lib/supabase-types"

// ─── POST /api/chat-sessions ──────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { restaurantSlug, sessionId, customerName } = body

    if (!restaurantSlug || !sessionId) {
      return NextResponse.json(
        { error: "Missing restaurantSlug or sessionId" },
        { status: 400 }
      )
    }

    const db = await getDbTables()

    const { data: restaurant } = (await supabaseServer
      .from(db.stores)
      .select("id")
      .eq("slug", restaurantSlug)
      .single()) as { data: Pick<Restaurant, "id"> | null; error: unknown }

    if (!restaurant) {
      return NextResponse.json(
        { error: `Restaurant "${restaurantSlug}" not found` },
        { status: 404 }
      )
    }

    const { data: session, error } = (await supabaseServer
      .from(db.conversation_sessions)
      .upsert(
        {
          [db.storeIdCol]: restaurant.id,
          [db.storeSlugCol]: restaurantSlug,
          session_id: sessionId,
          customer_name: customerName ?? null,
          last_message_at: new Date().toISOString(),
          status: "active",
        } as never,
        { onConflict: `${db.storeSlugCol},session_id` }
      )
      .select()
      .single()) as {
      data: ConversationSession | null
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json(
        { error: "Failed to upsert session", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, session })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}

// ─── GET /api/chat-sessions ───────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantSlug = searchParams.get("restaurantSlug")
    const sessionId = searchParams.get("sessionId")
    const limit = searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : 20
    const offset = searchParams.get("offset")
      ? Number(searchParams.get("offset"))
      : 0
    const search = searchParams.get("search") || ""

    if (!restaurantSlug) {
      return NextResponse.json(
        { error: "Missing restaurantSlug" },
        { status: 400 }
      )
    }

    const db = await getDbTables()

    if (sessionId) {
      const { data: session, error } = (await supabaseServer
        .from(db.conversation_sessions)
        .select("*")
        .eq(db.storeSlugCol, restaurantSlug)
        .eq("session_id", sessionId)
        .maybeSingle()) as { data: ConversationSession | null; error: { message: string } | null }

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch session", details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ session: session ?? null })
    } else {
      let query = supabaseServer
        .from(db.conversation_sessions)
        .select("*")
        .eq(db.storeSlugCol, restaurantSlug)

      if (search) {
        query = query.or(
          `session_id.ilike.%${search}%,customer_name.ilike.%${search}%`
        )
      }

      const { data: sessions, error } = (await query
        .order("last_message_at", { ascending: false })
        .range(offset, offset + limit - 1)) as {
        data: ConversationSession[] | null
        error: { message: string } | null
      }

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch sessions", details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ sessions: sessions || [] })
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}
