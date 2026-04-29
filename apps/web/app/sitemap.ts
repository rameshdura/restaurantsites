import { MetadataRoute } from 'next'
import { getAllRestaurantSlugs, getRestaurant, RestaurantData } from '@/lib/restaurant'

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
   const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restaurantsite.io'

   // Static pages (platform level)
   const staticPages: MetadataRoute.Sitemap = [
     {
       url: baseUrl,
       lastModified: now,
       changeFrequency: 'daily',
       priority: 1.0,
     },
     // Note: /seo route removed - it's now per-restaurant and noindex
   ]

  // Restaurant pages (dynamic)
  const restaurantPages: MetadataRoute.Sitemap = activeRestaurants.flatMap(({ slug, data }) => {
    const entries: MetadataRoute.Sitemap = []

    // Home page - highest priority
    entries.push({
      url: `${baseUrl}/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    })

    // Menu page - second highest (menu changes often)
    entries.push({
      url: `${baseUrl}/${slug}/menu`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })

    // About page - lower priority, changes rarely
    entries.push({
      url: `${baseUrl}/${slug}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })

    // Contact page - updates occasionally
    entries.push({
      url: `${baseUrl}/${slug}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })

    // Company information - legal page, rarely updates
    if (data.companyInfo) {
      entries.push({
        url: `${baseUrl}/${slug}/company-information`,
        lastModified: now,
        changeFrequency: 'yearly',
        priority: 0.3,
      })
    }

    // Brand assets - thin content, low priority
    entries.push({
      url: `${baseUrl}/${slug}/brand`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    })

    return entries
  })

  return [...staticPages, ...restaurantPages]
}

/**
 * Sitemap with lastmod dates based on file system
 * (Optional enhancement - read data.json modification time)
 */
export async function sitemapWithFileTimes(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllRestaurantSlugs()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restaurantsite.io'
  
  const entries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 }
  ]

  for (const slug of slugs) {
    try {
      // We could read data.json mtime here for accurate lastmod
      // const dataPath = path.join(RESTAURANTS_PATH, slug, 'data.json')
      // const stats = await fs.stat(dataPath)
      // const lastMod = stats.mtime
      
      // For now, use current date
      const lastMod = new Date()
      
      entries.push(
        { url: `${baseUrl}/${slug}`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/${slug}/menu`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/${slug}/about`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/${slug}/contact`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/${slug}/company-information`, lastModified: lastMod, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/${slug}/brand`, lastModified: lastMod, changeFrequency: 'yearly', priority: 0.3 }
      )
    } catch (error) {
      console.error(`Error processing ${slug}:`, error)
    }
  }

  return entries
}
