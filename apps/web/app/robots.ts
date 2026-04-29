import { MetadataRoute } from 'next'

/**
 * robots.txt Generator
 * 
 * Controls search engine crawling behavior.
 * - Allows all major bots to crawl restaurant pages
 * - Disallows admin/dev utilities
 * - Blocks API routes from indexing
 * - Points to sitemap.xml
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restaurantsite.io'
  const sitemapUrl = `${baseUrl}/sitemap.xml`

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',                    // API endpoints (no content)
          '/_next/',                  // Next.js internals
          '/static/',                 // Static assets (already ignored)
          '/admin/',                  // Future admin routes
          // Note: /[restaurant]/seo pages auto-blocked by being noindex + not in sitemap
        ],
      },
      // Google-specific rules (optional)
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
        ],
      },
      // Block bad bots from scraping (optional)
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: [sitemapUrl],
  }
}

/**
 * Enhanced robots.txt with crawl-delay for polite bots
 * (Uncomment if needed to reduce server load)
 */
export function robotsWithCrawlDelay(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/seo',
          '/_next/',
        ],
        crawlDelay: 1, // 1 second between requests
      },
    ],
    sitemap: [process.env.NEXT_PUBLIC_SITE_URL + '/sitemap.xml'],
  }
}
