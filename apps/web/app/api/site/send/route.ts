import { Resend } from "resend"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_RECIPIENT = "kals.future@gmail.com"

export async function POST(request: Request) {
  try {
    const { siteName, siteSlug, siteData, message } = await request.json()

    if (!siteName || !siteSlug) {
      return NextResponse.json(
        { error: "Missing site name or slug" },
        { status: 400 }
      )
    }

    const now = new Date()
    const formattedDateTime = now.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    const prefixText = `Site data exported on ${formattedDateTime}\n\n${message || ""}`

    const emailSubject = `${siteName} — Restaurant Site Data`

    const { data, error } = await resend.emails.send({
      from: "RestaurantSite.io <onboarding@resend.dev>",
      to: [EMAIL_RECIPIENT],
      subject: emailSubject,
      replyTo: "noreply@restaurantsites.vercel.app",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1a1a1a; margin: 0;">🍽️ RestaurantSite.io</h1>
          </div>
          <h2 style="color: #000;">Restaurant Site Data Export</h2>
          <p>Hello,</p>
          <p>Please find the data export for the following restaurant site:</p>
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 8px 12px; border: 1px solid #eee;">${siteName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: bold;">Slug:</td>
              <td style="padding: 8px 12px; border: 1px solid #eee;">${siteSlug}</td>
            </tr>
          </table>
          <p style="margin-top: 16px;"><strong>Message:</strong><br/>${prefixText.replace(/\n/g, "<br/>")}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 12px; color: #888;">
            This data.json file can be imported directly into the RestaurantSite.io site builder platform.<br/>
            Visit <a href="https://restaurantsites.vercel.app" style="color: #1a73e8;">restaurantsites.vercel.app</a> to manage your restaurant website.
          </p>
          <p style="font-size: 11px; color: #bbb; margin-top: 8px;">
            Sent on ${formattedDateTime}
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `${siteSlug}-data.json`,
          content: Buffer.from(JSON.stringify(siteData, null, 2)).toString(
            "base64"
          ),
          contentType: "application/json",
        },
      ],
    })

    if (error) {
      console.error("Resend Error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to send email" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    )
  }
}
