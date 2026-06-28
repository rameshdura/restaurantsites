import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"
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

    const { data: restaurant } = (await supabaseServer
      .from("restaurants")
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
      .from("conversation_sessions")
      .upsert(
        {
          restaurant_id: restaurant.id,
          restaurant_slug: restaurantSlug,
          session_id: sessionId,
          customer_name: customerName ?? null,
          last_message_at: new Date().toISOString(),
          status: "active",
        } as never,
        { onConflict: "restaurant_slug,session_id" }
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

    if (!restaurantSlug || !sessionId) {
      return NextResponse.json(
        { error: "Missing restaurantSlug or sessionId" },
        { status: 400 }
      )
    }

    const { data: session } = (await supabaseServer
      .from("conversation_sessions")
      .select("*")
      .eq("restaurant_slug", restaurantSlug)
      .eq("session_id", sessionId)
      .single()) as { data: ConversationSession | null; error: unknown }

    return NextResponse.json({ session: session ?? null })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}
