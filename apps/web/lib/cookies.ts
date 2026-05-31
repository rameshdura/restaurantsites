export interface RestaurantSession {
  session_id: string
  table: number
  created_at: number
  expires_at: number
}

const getCookieName = (slug: string) => `restaurant_session_${slug}`

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    if (!c) continue
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0)
      return decodeURIComponent(c.substring(nameEQ.length, c.length))
  }
  return null
}

export function setCookie(name: string, value: string, seconds: number): void {
  if (typeof document === "undefined") return
  let expires = ""
  if (seconds) {
    const date = new Date()
    date.setTime(date.getTime() + seconds * 1000)
    expires = "; expires=" + date.toUTCString()
  }
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    expires +
    "; path=/; SameSite=Lax; Secure"
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return
  document.cookie =
    name +
    "=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure"
}

export function getSessionCookie(slug: string): RestaurantSession | null {
  const raw = getCookie(getCookieName(slug))
  if (!raw) return null
  try {
    const session: RestaurantSession = JSON.parse(raw)
    if (
      !session.session_id ||
      typeof session.table !== "number" ||
      !session.created_at ||
      !session.expires_at
    ) {
      return null
    }
    // Check local timestamp expiry
    const now = Math.floor(Date.now() / 1000)
    if (session.expires_at < now) {
      clearSessionCookie(slug)
      return null
    }
    return session
  } catch {
    clearSessionCookie(slug)
    return null
  }
}

export function setSessionCookie(
  slug: string,
  sessionId: string,
  tableNumber: number,
  expiresAt: number
): void {
  const now = Math.floor(Date.now() / 1000)
  const maxAge = expiresAt - now
  if (maxAge <= 0) return

  const session: RestaurantSession = {
    session_id: sessionId,
    table: tableNumber,
    created_at: now,
    expires_at: expiresAt,
  }

  setCookie(getCookieName(slug), JSON.stringify(session), maxAge)
}

export function clearSessionCookie(slug: string): void {
  deleteCookie(getCookieName(slug))
}
