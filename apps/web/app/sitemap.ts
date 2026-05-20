import { MetadataRoute } from "next"
import {
  getAllRestaurantSlugs,
  getRestaurant,
  RestaurantData,
} from "@/lib/restaurant"

/**
 * Dynamic Sitemap Generator
 *
 * Automatically generates sitemap.xml for all restaurant pages.
 * Includes:
 * - Homepage (platform listing)
 * - Each restaurant's 6 pages (home, about, menu, contact, brand, company-info)
 * - Change frequency and priority per page type
 *
 * Builds automatically when restaurants are added/updated.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllRestaurantSlugs()

  const restaurants = await Promise.all(
    slugs.map(async (slug) => {
      const res = await getRestaurant(slug)
      return res ? { slug, data: res.data } : null
    })
  )

  const activeRestaurants = restaurants.filter(Boolean) as {
    slug: string
    data: RestaurantData
  }[]

  const now = new Date()
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://restaurantsites.vercel.app"

  // Static pages (platform level)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ]

  // Restaurant pages (dynamic)
  const restaurantPages: MetadataRoute.Sitemap = activeRestaurants.flatMap(
    ({ slug }) => {
      const entries: MetadataRoute.Sitemap = []

      // Home page
      entries.push({
        url: `${baseUrl}/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
      })

      // Menu page
      entries.push({
        url: `${baseUrl}/${slug}/menu`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      })

      // About page
      entries.push({
        url: `${baseUrl}/${slug}/about`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      })

      // Contact page
      entries.push({
        url: `${baseUrl}/${slug}/contact`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      })

      // Company information
      entries.push({
        url: `${baseUrl}/${slug}/company-information`,
        lastModified: now,
        changeFrequency: "yearly",
        priority: 0.3,
      })

      // llm.txt
      entries.push({
        url: `${baseUrl}/${slug}/llm.txt`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.2,
      })

      return entries
    }
  )

  return [...staticPages, ...restaurantPages]
}
