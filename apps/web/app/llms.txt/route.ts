import { headers } from "next/headers"
import {
  getAllRestaurantSlugs,
  getRestaurant,
  generateRestaurantLlmTxt,
  RestaurantData,
} from "@/lib/restaurant"

async function resolveRestaurantSlugFromHost(host: string): Promise<string | null> {
  const hostname = host.split(":")[0] || "localhost"
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"

  // If hostname is the root platform domain
  if (
    hostname === rootDomain ||
    hostname === "localhost:3000" ||
    hostname === "localhost" ||
    hostname.includes("restaurantsites")
  ) {
    return null
  }

  const slugs = await getAllRestaurantSlugs()

  // 1. Direct subdomain check (e.g., ramen-taro.localhost:3000)
  if (hostname.endsWith(`.${rootDomain}`)) {
    const subdomain = hostname.replace(`.${rootDomain}`, "")
    if (slugs.includes(subdomain)) return subdomain
  }

  // 2. Vercel default domain check (e.g. ramen-taro-suffix.vercel.app)
  if (hostname.endsWith(".vercel.app")) {
    const subdomain = hostname.replace(".vercel.app", "")
    const matchedSlug = slugs.find((s) => subdomain.startsWith(s))
    if (matchedSlug) return matchedSlug
  }

  // 3. Custom domain split check (e.g., royalgarden.com -> royalgarden)
  const firstPart = hostname.split(".")[0] || ""
  if (firstPart) {
    if (slugs.includes(firstPart)) return firstPart
    const matchedSlug = slugs.find((s) => s.includes(firstPart) || firstPart.includes(s))
    if (matchedSlug) return matchedSlug
  }

  return null
}

export async function GET() {
  try {
    const headersList = await headers()
    const host = headersList.get("host") || "localhost:3000"

    const tenantSlug = await resolveRestaurantSlugFromHost(host)

    if (tenantSlug) {
      // Dynamic custom domain serving for a specific restaurant
      const res = await getRestaurant(tenantSlug)
      if (res) {
        const md = generateRestaurantLlmTxt(res.data)
        return new Response(md, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        })
      }
    }

    // Platform-level directory serving
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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://restaurantsites.vercel.app"

    let md = `# RestaurantSite.io Platform\n\n`
    md += `> A premium website builder and listing platform for the world's finest restaurants.\n\n`
    md += `## Featured Restaurants\n\n`

    for (const r of activeRestaurants) {
      const desc = r.data.seo?.description || r.data.description || ""
      const cuisines = r.data.schema?.servesCuisine || (r.data.cuisineType ? [r.data.cuisineType] : [])
      const cuisineStr = cuisines.length > 0 ? ` (${cuisines.join(", ")})` : ""
      md += `- [${r.data.name}](${baseUrl}/${r.slug}): ${desc}${cuisineStr}. [AI Guide](${baseUrl}/${r.slug}/llms.txt)\n`
    }

    md += `\n## Platform Resources\n`
    md += `- [Sitemap](${baseUrl}/sitemap.xml): The platform XML sitemap.\n`
    md += `- [Robots](${baseUrl}/robots.txt): Crawler instruction file.\n`

    return new Response(md, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error generating platform llms.txt:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
