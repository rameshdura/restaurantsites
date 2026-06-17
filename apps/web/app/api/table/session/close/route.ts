import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { sendOrderConfirmationEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { session_id, status = "closed" } = await request.json()

    if (!session_id) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
    }

    const { data: closedSession, error } = await supabase
      .from("table_sessions")
      .update({
        status: status,
        last_activity: new Date().toISOString(),
      })
      .eq("session_id", session_id)
      .select()
      .single()

    if (error) {
      console.error("[POST /api/table/session/close] Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Trigger confirmation email if it's a takeout/delivery and just submitted
    if (status === "payment_pending" && closedSession.orders?.customer_info) {
      try {
        await sendOrderConfirmationEmail(
          closedSession,
          closedSession.restaurant_slug
        )
      } catch (err) {
        console.error("Error triggering confirmation email:", err)
      }
    }

    return NextResponse.json({ success: true, session: closedSession })
  } catch (error) {
    console.error("[POST /api/table/session/close] Internal Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
