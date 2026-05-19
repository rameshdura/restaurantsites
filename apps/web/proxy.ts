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
    // Handle Vercel default domains (e.g. project-name-suffix.vercel.app)
    const subdomain = hostname.replace(".vercel.app", "")
    
    // Ignore internal platform subdomains
    if (subdomain.includes("restaurantsites")) {
      return NextResponse.next()
    }
    
    // Extract slug by removing potential Vercel deployment suffixes (e.g. -ojjqbgqaf-rameshduras-projects)
    // A suffix typically starts after the restaurant name. Assuming restaurant names don't contain dashes
    // or we can heuristically clean it.
    slug = subdomain.split("-")[0] || ""
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
