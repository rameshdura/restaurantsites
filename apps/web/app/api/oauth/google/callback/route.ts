import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"
import type { Restaurant } from "@/lib/supabase-types"

interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
}

interface GoogleUserInfo {
  email: string
}

// ─── GET /api/oauth/google/callback ──────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const restaurantSlug = searchParams.get("state")
    const errorParam = searchParams.get("error")

    const origin = new URL(request.url).origin
    const getDashboardUrl = (slug?: string | null) => {
      if (
        process.env.NEXT_PUBLIC_DASHBOARD_URL &&
        process.env.NEXT_PUBLIC_DASHBOARD_URL !== `${origin}/dashboard`
      ) {
        return process.env.NEXT_PUBLIC_DASHBOARD_URL
      }
      return `${origin}/${slug || "gorkha"}/owner/apps`
    }

    if (errorParam) {
      return NextResponse.redirect(
        `${getDashboardUrl(restaurantSlug)}?oauth_error=${encodeURIComponent(errorParam)}`
      )
    }

    if (!code || !restaurantSlug) {
      return NextResponse.json(
        {
          error: "Missing code or state (restaurantSlug) from Google callback",
        },
        { status: 400 }
      )
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        { error: "Google OAuth credentials not configured" },
        { status: 503 }
      )
    }

    // 1. Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      return NextResponse.json(
        { error: "Failed to exchange code for tokens", details: err },
        { status: 502 }
      )
    }

    const tokens: GoogleTokenResponse = await tokenRes.json()

    // 2. Fetch user email
    let accountEmail: string | null = null
    try {
      const userRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        }
      )
      if (userRes.ok) {
        const userInfo: GoogleUserInfo = await userRes.json()
        accountEmail = userInfo.email ?? null
      }
    } catch {
      /* non-fatal */
    }

    // 3. Resolve restaurant_id
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

    const PLACEHOLDER_USER_ID = "00000000-0000-0000-0000-000000000001"
    const expiresAt = new Date(
      Date.now() + tokens.expires_in * 1000
    ).toISOString()

    // 4. Resolve refresh token (preserve existing if google didn't return a new one on reconnect)
    const { data: existingConn } = await supabaseServer
      .from("oauth_connections")
      .select("refresh_token")
      .eq("restaurant_id", restaurant.id)
      .eq("provider", "google")
      .maybeSingle()

    const finalRefreshToken = tokens.refresh_token || existingConn?.refresh_token || null

    // 5. Upsert OAuth connection
    const { error: upsertError } = await supabaseServer
      .from("oauth_connections")
      .upsert(
        {
          restaurant_id: restaurant.id,
          user_id: PLACEHOLDER_USER_ID,
          provider: "google",
          account_email: accountEmail,
          access_token: tokens.access_token,
          refresh_token: finalRefreshToken,
          expires_at: expiresAt,
          scopes: tokens.scope ?? null,
        } as never,
        { onConflict: "restaurant_id,provider" }
      )

    if (upsertError) {
      return NextResponse.json(
        {
          error: "Failed to save OAuth connection",
          details: (upsertError as { message: string }).message,
        },
        { status: 500 }
      )
    }

    return NextResponse.redirect(
      `${getDashboardUrl(restaurantSlug)}?oauth_success=google`
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}
