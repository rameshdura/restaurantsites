import { headers } from "next/headers"

/**
 * Creates a server-side link helper function `getLink` that mirrors
 * client-side hook logic, taking dedicated domains into account.
 */
export async function getServerRestaurantLink(slug: string) {
  let isDedicatedDomain = false

  try {
    const headersList = await headers()
    const host = headersList.get("host") || "localhost"
    const hostname = host.split(":")[0] || "localhost"

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost"
    const forceMain = process.env.NEXT_PUBLIC_FORCE_MAIN_SITE === "true"

    if (forceMain) {
      isDedicatedDomain = true
    } else {
      // Check if we are on a dedicated domain
      // If hostname is not localhost, doesn't contain 'localhost',
      // and doesn't contain the root domain or 'restaurantsites',
      // it's likely a dedicated domain.
      const isMain =
        hostname === "localhost" ||
        hostname.includes("localhost") ||
        hostname.includes("restaurantsites") ||
        (rootDomain !== "localhost" && hostname.includes(rootDomain))

      isDedicatedDomain = !isMain
    }
  } catch (error) {
    console.error("Error reading headers in getServerRestaurantLink:", error)
  }

  const getLink = (path: string) => {
    if (!slug) return path

    // Ensure path starts with /
    const normalizedPath = path.startsWith("/") ? path : `/${path}`

    // If it's already an anchor on the home page, and we are on a dedicated domain,
    // just return the anchor.
    if (normalizedPath.startsWith("/#") && isDedicatedDomain) {
      return normalizedPath.substring(1)
    }

    // If it's a dedicated domain, don't prepend the slug
    if (isDedicatedDomain) {
      return normalizedPath
    }

    // Main domain: prepend the slug
    // Special case for root path: return /slug instead of /slug/
    if (normalizedPath === "/") {
      return `/${slug}`
    }

    return `/${slug}${normalizedPath}`
  }

  return { getLink, isDedicatedDomain }
}
