import { MetadataRoute } from "next"
import { headers } from "next/headers"
import {
  getAllRestaurantSlugs,
  getRestaurant,
} from "@/lib/restaurant"

/**
 * Dynamic Sitemap Generator
 *
 * Generates site-specific sitemap.xml based on the request host.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers()
  const host = headersList.get("host") || ""
  
  // Logic: 
  // 1. Identify if this is a custom domain or a sub-path structure.
  // 2. If it matches a restaurant slug, return only that restaurant's pages.
  // 3. Otherwise return platform-level sitemap.

  const slugs = await getAllRestaurantSlugs()
  
  // Determine if host is a specific restaurant.
  // Supports subdomain (slug.domain.com) and custom domains (custom-domain.com).
  const currentSlug = slugs.find((slug) => {
    // Check for subdomain match
    if (host.startsWith(`${slug}.`)) return true;
    
    // Future-proofing: If we map custom domains in our restaurant config, 
    // we could perform a lookup here. For now, we assume if it doesn't 
    // start with a slug, it's the platform/root.
    return false;
  })
  
  const now = new Date()
  const baseUrl = `https://${host}`

  // Platform root case (or global landing)
  if (!currentSlug) {
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: now,
        changeFrequency: "daily",
        priority: 1.0,
      },
    ]
    return staticPages
  }

  // Site-specific case
  const res = await getRestaurant(currentSlug)
  if (!res) return []

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/company-information`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ]

  return entries
}
