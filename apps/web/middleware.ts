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

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get("host") || "localhost:3000"

  // Define your platform's main domain (change this if you deploy to a specific domain)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"

  // Get the restaurant slug from the subdomain or domain
  // Example: sushi-yama.localhost:3000 -> sushi-yama
  // Example: sushi-yama.com -> sushi-yama (if configured)
  
  let slug = ""
  
  if (hostname === rootDomain || hostname === "localhost:3000") {
    // If it's the root domain, we might want to show a landing page or something
    // For now, let's just allow it or redirect
    return NextResponse.next()
  }

    // Extract subdomain
    if (hostname.endsWith(`.${rootDomain}`)) {
      slug = hostname.replace(`.${rootDomain}`, "")
    } else if (hostname.endsWith(".vercel.app")) {
      // Handle Vercel default domains (e.g. project-name.vercel.app)
      // If it's exactly the project name or matches a known pattern for the root, skip it
      const subdomain = hostname.replace(".vercel.app", "")
      if (subdomain.includes("restaurantsites")) {
        return NextResponse.next()
      }
      slug = subdomain.split(".")[0] || ""
    } else {
      // If it's a custom domain, we'd need a mapping
      // For now, let's assume the slug is the first part of the domain or the domain itself
      // In a real scenario, you might fetch this from a config or database
      slug = hostname.split(".")[0] || ""
    }

  if (!slug) {
    return NextResponse.next()
  }

  // Rewrite to /[restaurant]/[path]
  return NextResponse.rewrite(new URL(`/${slug}${url.pathname}`, req.url))
}
