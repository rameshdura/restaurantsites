import type { RestaurantData } from "./restaurant"

export interface ResolvedContactLinks {
  whatsapp: string | null
  messenger: string | null
  line: string | null
  phone: string | null
}

/**
 * Resolves social media and direct contact links for the restaurant.
 * Appends the chat session ID to the links so that the shop owner can track the context.
 */
export function resolveContactLinks(
  restaurantData: RestaurantData,
  sessionId?: string
): ResolvedContactLinks {
  const sameAs: string[] = restaurantData.social?.sameAs || []
  const phone = restaurantData.phone || restaurantData.contact?.phone
  const countryCode = restaurantData.localSEO?.countryCode || "JP"

  // 1. WhatsApp Link
  let whatsapp = sameAs.find(
    (url: string) => url.includes("wa.me") || url.includes("whatsapp.com")
  )
  if (!whatsapp && phone) {
    const clean = phone.replace(/[+\s\-()]/g, "")
    if (phone.startsWith("+")) {
      whatsapp = `https://wa.me/${clean}`
    } else if (clean.startsWith("0")) {
      const code = countryCode === "JP" ? "81" : "1"
      whatsapp = `https://wa.me/${code}${clean.slice(1)}`
    } else {
      whatsapp = `https://wa.me/${clean}`
    }
  }

  // 2. Messenger Link
  let messenger = sameAs.find((url: string) => url.includes("m.me"))
  if (!messenger) {
    const fbLink = sameAs.find((url: string) => url.includes("facebook.com"))
    if (fbLink) {
      try {
        const urlObj = new URL(fbLink)
        if (urlObj.pathname.includes("profile.php")) {
          const id = urlObj.searchParams.get("id")
          if (id) messenger = `https://m.me/${id}`
        } else {
          const pathParts = urlObj.pathname.split("/").filter(Boolean)
          if (pathParts.length > 0) {
            messenger = `https://m.me/${pathParts[0]}`
          }
        }
      } catch {
        // ignore
      }
    }
  }

  // 3. LINE Link
  let line = sameAs.find(
    (url: string) => url.includes("line.me") || url.includes("line.naver.jp")
  )

  // Append Session ID to support handover context
  if (sessionId) {
    const messageText = `Hi! I need help with my request. (Chat Session ID: ${sessionId})`

    if (whatsapp) {
      if (whatsapp.includes("?")) {
        whatsapp = `${whatsapp}&text=${encodeURIComponent(messageText)}`
      } else {
        whatsapp = `${whatsapp}?text=${encodeURIComponent(messageText)}`
      }
    }

    if (messenger) {
      if (messenger.includes("?")) {
        messenger = `${messenger}&ref=${encodeURIComponent(sessionId)}`
      } else {
        messenger = `${messenger}?ref=${encodeURIComponent(sessionId)}`
      }
    }

    if (line) {
      if (line.includes("?")) {
        line = `${line}&ref=${encodeURIComponent(sessionId)}`
      } else {
        line = `${line}?ref=${encodeURIComponent(sessionId)}`
      }
    }
  }

  return {
    whatsapp: whatsapp || null,
    messenger: messenger || null,
    line: line || null,
    phone: phone ? `tel:${phone.replace(/[+\s\-()]/g, "")}` : null,
  }
}
