import { NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
}

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get("host") || "localhost:3000"

  // Define your platform's main domain
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"

  // 1. Skip middleware for static files and API routes
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/_static")
  ) {
    return NextResponse.next()
  }

  let slug = ""

  if (
    hostname === rootDomain ||
    hostname === "localhost:3000" ||
    hostname === "localhost"
  ) {
    // If it's the root domain, we might want to show a landing page or something
    return NextResponse.next()
  }

  // Extract subdomain
  if (hostname.endsWith(`.${rootDomain}`)) {
    slug = hostname.replace(`.${rootDomain}`, "")
  } else if (hostname.endsWith(".vercel.app")) {
    // Handle Vercel default domains (e.g. restaurant-slug-suffix.vercel.app)
    const subdomain = hostname.replace(".vercel.app", "")

    // Ignore internal platform subdomains
    if (subdomain.includes("restaurantsites")) {
      return NextResponse.next()
    }

    // Identify valid slugs to avoid matching Vercel's random deployment suffix
    const validSlugs = ["hamro-khaja-ghar", "ramen-taro", "rato-bhale", "solmari", "royalgarden-restaurant", "satikmedia"]

    // Check if the subdomain starts with any of the valid slugs
    slug = validSlugs.find((s) => subdomain.startsWith(s)) || ""
  } else {
    // Custom domain
    slug = hostname.split(".")[0] || ""
  }

  if (!slug) {
    return NextResponse.next()
  }

  // Rewrite to /[restaurant]/[path]
  return NextResponse.rewrite(new URL(`/${slug}${url.pathname}`, req.url))
}
