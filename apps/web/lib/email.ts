import { Resend } from "resend"
import { getRestaurant } from "@/lib/restaurant"

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789")

export interface OrderItem {
  item_id: string;
  qty: number;
  notes?: string;
}

export interface OrderSession {
  table_number: number | string;
  orders?: {
    customer_info?: {
      name: string;
      phone: string;
      email: string;
      address?: string;
    };
    items?: OrderItem[];
    total?: number;
  };
}

export async function sendOrderConfirmationEmail(
  session: OrderSession,
  restaurantSlug: string
) {
  const customerInfo = session.orders?.customer_info
  if (!customerInfo) return

  // Load restaurant to get currency, name, and the restaurant's notification email
  const restaurant = await getRestaurant(restaurantSlug)
  const restaurantEmail =
    restaurant?.data?.email || restaurant?.data?.contact?.email

  // If no restaurant email is configured, we cannot notify the restaurant
  if (!restaurantEmail) {
    console.error("[Resend] No restaurant email configured to receive orders.")
    return
  }

  const isTakeout =
    Number(session.table_number) >= 1000 && Number(session.table_number) < 10000
  const isDelivery = Number(session.table_number) >= 10000
  const orderType = isDelivery ? "Delivery" : isTakeout ? "Takeout" : "Dine-in"

  const currency = restaurant?.data?.app?.currency || "USD"

  const CURRENCY_SYMBOLS: Record<string, string> = {
    JPY: "¥",
    USD: "$",
    EUR: "€",
    GBP: "£",
    KRW: "₩",
    CNY: "¥",
    INR: "₹",
  }
  const symbol = CURRENCY_SYMBOLS[currency] || ""

  const itemsHtml = (session.orders?.items || [])
    .map((item: OrderItem) => {
      const details = restaurant?.menu?.find((m) => m.id === item.item_id)
      const name = details?.name || item.item_id
      const price = parseFloat(String(details?.price || 0)) * item.qty
      return `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; font-weight: 500;">
        ${item.qty}x ${name}
        ${item.notes ? `<br><small style="color: #666;">Note: ${item.notes}</small>` : ""}
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right;">
        ${symbol}${price}
      </td>
    </tr>
  `
    })
    .join("")

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background-color: #000; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">🚨 New ${orderType} Order!</h1>
      </div>
      
      <div style="padding: 30px 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
        <h3 style="margin-top: 0; color: #666; font-size: 14px; text-transform: uppercase;">Customer Details</h3>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${customerInfo.name}</p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> ${customerInfo.phone}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${customerInfo.email}</p>
        ${
          isDelivery && customerInfo.address
            ? `<p style="margin: 5px 0;"><strong>Delivery Address:</strong> ${customerInfo.address}</p>`
            : ""
        }

        <div style="margin-top: 30px; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #fafafa; padding: 12px 15px; border-bottom: 1px solid #eee;">
            <h3 style="margin: 0; font-size: 15px;">Order Items <span style="color: #666; font-weight: normal; font-size: 13px;">(Table/ID: #${session.table_number})</span></h3>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            ${itemsHtml}
          </table>
          <div style="padding: 15px; background-color: #fafafa; text-align: right; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 18px; font-weight: bold;">Total: ${symbol}${session.orders?.total || 0}</p>
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center;">
           <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">Please process this order in your POS Dashboard.</p>
           <a href="https://restaurantsite.io/${restaurantSlug}/owner/orders" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;">View POS Dashboard</a>
        </div>
      </div>
    </div>
  `

  try {
    const data = await resend.emails.send({
      from: "Restaurant Orders <onboarding@resend.dev>",
      to: restaurantEmail,
      replyTo: customerInfo.email,
      subject: `[ACTION REQUIRED] New ${orderType} Order - ${customerInfo.name}`,
      html,
    })
    console.log("[Resend] Email sent successfully", data)
    return data
  } catch (error) {
    console.error("[Resend] Failed to send email", error)
    return null
  }
}
