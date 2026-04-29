"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export function useRestaurantLink() {
  const params = useParams()
  const slug = params?.restaurant as string
  const [isDedicatedDomain, setIsDedicatedDomain] = useState(false)

  useEffect(() => {
    const hostname = window.location.hostname
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost"
    const forceMain = process.env.NEXT_PUBLIC_FORCE_MAIN_SITE === "true"

    if (forceMain) {
      setIsDedicatedDomain(false)
      return
    }
    
    // Check if we are on a dedicated domain
    // If hostname is not localhost, doesn't contain 'localhost', 
    // and doesn't contain the root domain or 'restaurantsites', 
    // it's likely a dedicated domain.
    const isMain = hostname === "localhost" || 
                  hostname.includes("localhost") || 
                  hostname.includes("restaurantsites") ||
                  (rootDomain !== "localhost" && hostname.includes(rootDomain))

    setIsDedicatedDomain(!isMain)
  }, [])

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

  return { getLink, slug, isDedicatedDomain }
}
