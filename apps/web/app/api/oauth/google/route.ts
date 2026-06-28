import { NextResponse } from "next/server"
import { supabaseServer, getDbTables } from "@/lib/supabase"
import type { Restaurant } from "@/lib/supabase-types"

// ─── GET /api/oauth/google ────────────────────────────────────
// Initiates Google OAuth flow.
// Query params: restaurantSlug (so we know which restaurant to link)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantSlug = searchParams.get("restaurantSlug")

    if (!restaurantSlug) {
      return NextResponse.json(
        { error: "Missing restaurantSlug parameter" },
        { status: 400 }
      )
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = process.env.GOOGLE_REDIRECT_URI

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        {
          error:
            "Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI to your environment.",
        },
        { status: 503 }
      )
    }

    const scopes = [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" ")

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
      state: restaurantSlug,
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    return NextResponse.redirect(authUrl)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("[GET /api/oauth/google]", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}

// ─── DELETE /api/oauth/google ─────────────────────────────────
// Disconnects Google Calendar by removing the oauth_connections row.
// Query params: restaurantSlug

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantSlug = searchParams.get("restaurantSlug")

    if (!restaurantSlug) {
      return NextResponse.json(
        { error: "Missing restaurantSlug parameter" },
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

    const { error } = await supabaseServer
      .from(db.oauth_connections)
      .delete()
      .eq(db.storeIdCol, restaurant.id)
      .eq("provider", "google")

    if (error) {
      return NextResponse.json(
        {
          error: "Failed to disconnect",
          details: (error as { message: string }).message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Google Calendar disconnected",
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("[DELETE /api/oauth/google]", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}
