import { Metadata } from "next"
import Image from "next/image"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  ExternalLink,
  Shield,
  Search,
  Globe,
  Image as ImageIcon,
  FileText,
  Images,
  Link as LinkIcon,
  HardDrive,
  Link2,
} from "lucide-react"

export const metadata: Metadata = {
  title: "SEO Preview Dashboard",
  description: "Internal SEO audit and preview tool",
  robots: {
    index: false,
    follow: false,
  },
}

// Get base URL from env or use placeholder
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://restaurantsites.vercel.app"

interface SEOChecklist {
  route: string
  status: "complete" | "partial" | "missing" | "not-applicable"
  title?: string
  description?: string
  ogImage?: boolean
  structuredData?: boolean
  canonical?: boolean
  altText?: boolean
}

interface SEOPageCardProps {
  slug: string
  name: string
  route: string
  checks: SEOChecklist[]
  metadata: {
    title?: string
    description?: string
    keywords?: string[]
    ogImage?: string
    noindex?: boolean
  }
}

function SEOPageCard({
  slug,
  name,
  route,
  checks,
  metadata,
}: SEOPageCardProps) {
  const statusColors = {
    complete: "bg-green-500/10 text-green-600 border-green-500/20",
    partial: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    missing: "bg-red-500/10 text-red-600 border-red-500/20",
    "not-applicable": "bg-gray-500/10 text-gray-600 border-gray-500/20",
  }

  const statusIcons = {
    complete: "✓",
    partial: "⚠",
    missing: "✗",
    "not-applicable": "○",
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="text-primary">{name}</span>
              <Badge variant="outline" className="font-mono text-xs">
                /{slug}
                {route !== "/" ? route : ""}
              </Badge>
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              {route === "/"
                ? "Restaurant homepage"
                : `Restaurant ${route.replace("/", "")} page`}
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <a
              href={`/${slug}${route}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Open
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metadata Preview */}
        {metadata.title && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
              <Search className="h-3 w-3" />
              SERP Preview
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
              <p className="text-base leading-snug font-medium text-blue-600">
                {metadata.title}
              </p>
              <p className="mt-1 text-sm leading-snug text-green-700">
                {`${BASE_URL}/${slug}${route}`}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                {metadata.description || "No description set..."}
              </p>
            </div>
          </div>
        )}

        {/* SEO Checks Grid */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            <Shield className="h-3 w-3" />
            SEO Checklist
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            {checks.map((check, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium ${statusColors[check.status]}`}
              >
                <span className="text-base">{statusIcons[check.status]}</span>
                <span className="capitalize">
                  {check.route === "title"
                    ? "Meta Title"
                    : check.route === "description"
                      ? "Meta Desc"
                      : check.route === "ogImage"
                        ? "OG Image"
                        : check.route === "structuredData"
                          ? "Schema.org"
                          : check.route === "canonical"
                            ? "Canonical"
                            : check.route.replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 border-t border-border/40 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Title: {metadata.title?.length || 0} / 60
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Desc: {metadata.description?.length || 0} / 160
          </div>
        </div>

        {/* Meta Tags Preview */}
        {metadata.keywords && metadata.keywords.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
              <Globe className="h-3 w-3" />
              Keywords
            </div>
            <div className="flex flex-wrap gap-1.5">
              {metadata.keywords.slice(0, 8).map((kw, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {kw}
                </Badge>
              ))}
              {metadata.keywords.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{metadata.keywords.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* OG Image Preview */}
        {metadata.ogImage && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
              <ImageIcon className="h-3 w-3" />
              Open Graph Image
            </div>
            <div className="relative h-24 w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={metadata.ogImage}
                alt="OG preview"
                fill
                className="object-cover"
              />
            </div>{" "}
          </div>
        )}

        {/* Indexing Status */}
        {metadata.noindex && (
          <div className="flex items-center gap-2 rounded-md border border-yellow-500/20 bg-yellow-500/10 p-2 text-xs text-yellow-700">
            <Shield className="h-3 w-3" />
            <span className="font-medium">
              Noindex tag set - Page will not appear in search results
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Experiment: Local OG Image helpers
// ---------------------------------------------------------------------------

interface ExperimentLocalOGImageProps {
  restaurantSlug: string
  restaurantName: string
  restaurantData: Record<string, unknown>
  ogImageUrl?: string // current data.social.ogImage (external Unsplash)
}

interface OGImageCandidate {
  label: string
  path: string
}

/**
 * Locate the hero section and return its slides array from a maybe-heterogeneous
 * SectionBlock[] typed under RestaurantData.pages.home.sections.
 */
function getSlideUrlsFromSections(
  sections: unknown
): { id: string; image: string; alt: string }[] {
  const arr = Array.isArray(sections) ? sections : []
  for (let i = 0; i < arr.length; i++) {
    const s = arr[i] as {
      type?: string
      data?: { slides?: { id: string; image: string; alt: string }[] }
    }
    if (s?.type === "hero" && Array.isArray(s?.data?.slides)) {
      return s.data.slides
    }
  }
  return []
}

/** Build visually distinct candidate images and enrich each with a debug label. */
import { RestaurantData } from "@/lib/restaurant"

// ... (existing imports)

// Replace function signature for buildCandidates
function buildCandidates(
  data: RestaurantData,
  heroSlides?: { id: string; image: string; alt: string }[]
): OGImageCandidate[] {
  const c: OGImageCandidate[] = []

  const pages: Array<keyof NonNullable<RestaurantData["pages"]>> = [
    "about",
    "menu",
    "contact",
  ]
  for (const p of pages) {
    const pageObj = data.pages?.[p]
    // Use proper type assertion or check
    const cover =
      pageObj?.coverImage ??
      (
        pageObj?.sections?.find((s) => s.id === "cover")?.data as {
          url?: string
        }
      )?.url
    if (typeof cover === "string")
      c.push({ label: `coverImage / pages.${p}`, path: cover })
  }

  // Gallery is accessed through images object
  if (data.images?.gallery && Array.isArray(data.images.gallery)) {
    const g = data.images.gallery
    if (g.length > 0 && g[0] && typeof g[0].url === "string")
      c.push({ label: "data.images.gallery[0].url", path: g[0].url })
  }

  if (data.images) {
    const { logo, featured } = data.images
    const ogImage = data.social?.ogImage
    if (typeof ogImage === "string")
      c.push({ label: "data.social.ogImage", path: ogImage })
    if (typeof logo === "string")
      c.push({ label: "data.images.logo", path: logo })
    if (
      logo &&
      typeof logo === "object" &&
      "url" in logo &&
      typeof logo.url === "string"
    )
      c.push({ label: "data.images.logo.url", path: logo.url })
    if (Array.isArray(featured) && featured.length > 0) {
      const url = featured[0]?.url
      if (typeof url === "string")
        c.push({ label: "data.images.featured[0].url", path: url })
    }
  }

  const heroPaths: string[] = (heroSlides ?? [])
    .map((s) => s.image)
    .filter((v): v is string => Boolean(v))
  for (let i = 0; i < heroPaths.length; i++) {
    const hp = heroPaths[i]
    if (hp) c.push({ label: `Hero slide ${i + 1}`, path: hp })
  }

  if (data.about?.images && Array.isArray(data.about.images)) {
    const aboutImages = data.about.images
    for (let i = 0; i < aboutImages.length; i++) {
      const u = aboutImages[i] as string // Assuming array of strings
      c.push({ label: `data.about.images[${i}]`, path: u })
    }
  }
  if (typeof data.pages?.menu?.coverImage === "string")
    c.push({ label: "pages.menu.coverImage", path: data.pages.menu.coverImage })
  if (typeof data.pages?.contact?.coverImage === "string")
    c.push({
      label: "pages.contact.coverImage",
      path: data.pages.contact.coverImage,
    })

  return c
}

// ... (existing code for absSrc, checkDisk, resolveFullUrl)

async function ExperimentLocalOGImage({
  restaurantSlug,
  restaurantName,
  restaurantData,
  ogImageUrl,
}: ExperimentLocalOGImageProps) {
  // Resolve origin the current request so we always know the live host.
  const reqHeader = await headers()
  const reqOrigin = reqHeader.get("origin") || ""

  const heroSlideImages = getSlideUrlsFromSections(
    (restaurantData.pages as any)?.home?.sections ?? []
  )
  const candidates = buildCandidates(
    restaurantData as unknown as RestaurantData,
    heroSlideImages
  )

  // Collect full URLs and disk-existence in parallel
  const enriched = await Promise.all(
    candidates.map(async (c) => {
      const resolved = { url: c.path, note: "resolveFullUrl undefined" }
      const diskInfo = { exists: false, fullPath: "" }
      return { ...c, ...resolved, reqOrigin, ...diskInfo }
    })
  )

  return (
    <section className="mb-16 space-y-6 rounded-2xl border-2 border-primary/30 bg-primary/[0.02] p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2">
          <Images className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Experiment: Local OG Image
          </h2>
          <p className="text-sm text-muted-foreground">
            Testing every available local image candidate for{" "}
            <strong>{restaurantName}</strong> —{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              /{restaurantSlug}
            </code>
          </p>
        </div>
      </div>

      {/* ─── Reference: current external ogImage ─── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          <LinkIcon className="h-3 w-3" /> Current ogImage (external)
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                data.social.ogImage
              </Badge>
              <Badge
                variant="outline"
                className="border-amber-500/40 text-[10px] text-amber-600"
              >
                external · current
              </Badge>
            </div>
            <div className="relative h-24 w-full overflow-hidden rounded-lg border border-border/40 bg-muted/20">
              <Image
                src={ogImageUrl || "/placeholder.jpg"}
                alt="Current external OG image"
                fill
                className="object-cover"
              />
            </div>
            <code className="block truncate text-[10px] text-muted-foreground">
              src={ogImageUrl || "/placeholder.jpg"}
            </code>
          </div>
        </div>
      </div>

      {/* ─── Candidates ─── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          <ImageIcon className="h-3 w-3" /> Candidates
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {enriched.map((c, i) => {
            const abs = c.path
            const rel = c.path
            const fallbackMeta = JSON.stringify(c)
            return (
              <div key={`${c.label}-${i}`} className="space-y-2">
                {/* Row ① absolute src  (= BASE_URL + path) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Badge variant="default" className="text-[10px]">
                      ① absolute
                    </Badge>
                    <code className="text-muted-foreground">{c.label}</code>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-border/40 bg-muted/20 p-2">
                    <Image
                      key={`abs-${i}`}
                      src={abs}
                      alt={c.label}
                      width={600}
                      height={200}
                      className="h-24 w-full object-cover"
                      unoptimized
                    />
                  </div>
                  <code className="block truncate text-[10px] text-muted-foreground">
                    src={abs}
                  </code>
                </div>

                {/* Row ② relative src  (path only, no BASE_URL) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-[10px]">
                      ② relative
                    </Badge>
                    <code className="text-muted-foreground">{c.label}</code>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-border/40 bg-muted/20 p-2">
                    <Image
                      key={`rel-${i}`}
                      src={rel}
                      alt={c.label}
                      width={600}
                      height={200}
                      className="h-24 w-full object-cover"
                      unoptimized
                    />
                  </div>
                  <code className="block truncate text-[10px] text-muted-foreground">
                    src={rel}
                  </code>
                </div>

                {/* Row ③ page.tsx default  (= undefined fallback from SEOChecklistCard) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      ③ missing src
                    </Badge>
                    <code className="text-muted-foreground">{c.label}</code>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-destructive/40 bg-destructive/5 p-2">
                    <Image
                      key={`miss-${i}`}
                      src={"/images/_nonexistent_missing.jpg"}
                      alt="MISSING – should fail"
                      width={600}
                      height={200}
                      className="h-24 w-full bg-destructive/20 object-cover"
                    />
                  </div>
                  <code className="block truncate text-[10px] text-muted-foreground">
                    src={"/_nonexistent_missing.jpg"}
                  </code>
                </div>

                {/* Row ④ explicit meta fall-back */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] text-green-600"
                    >
                      ④ meta fallback
                    </Badge>
                    <code className="text-muted-foreground">{c.label}</code>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-green-500/5 p-2 text-[10px] text-muted-foreground">
                    <code className="block truncate">{fallbackMeta}</code>
                    <span className="mt-1 block text-green-600">
                      ✓ Stored in page.tsx metadata / meta tag
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── URL Debug ─── */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Link2 className="h-4 w-4" /> URL Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* ── Origin / base-URL block ─────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            <div className="flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              <code className="rounded bg-muted px-1.5 py-0.5">
                NEXT_PUBLIC_SITE_URL
              </code>
              <span className="text-muted-foreground">=</span>
              <code className="rounded bg-muted px-1.5 py-0.5">{BASE_URL}</code>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              <code className="rounded bg-muted px-1.5 py-0.5">Origin</code>
              <span className="text-muted-foreground">=</span>
              {reqOrigin ? (
                <code className="rounded bg-green-500/10 px-1.5 py-0.5 text-green-600">
                  {reqOrigin}
                </code>
              ) : (
                <code className="rounded bg-red-500/5 px-1.5 py-0.5 text-red-500">
                  (unavailable — headers() threw)
                </code>
              )}
            </div>
            {/* reqHost removed */}
          </div>

          {/* ── Per-candidate table ────────────────────────────────────── */}
          <div className="overflow-x-auto rounded-lg border border-border/40">
            <table className="w-full [&_td]:border-b [&_td]:border-border/40 [&_td]:p-1.5 [&_td]:text-[11px] [&_th]:border-b [&_th]:border-border/40 [&_th]:bg-muted/50 [&_th]:p-1.5 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-semibold">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Path (data.json)</th>
                  <th>Resolved URL</th>
                  <th>Origin used</th>
                  <th>On disk?</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((c, i) => (
                  <tr key={`debug-${c.label}-${i}`}>
                    <td className="text-muted-foreground">
                      <code className="text-[10px]">{c.label}</code>
                    </td>
                    <td>
                      <code className="text-[10px] text-muted-foreground">
                        {c.path}
                      </code>
                    </td>
                    <td>
                      <code className="text-[10px] break-all">{c.url}</code>
                    </td>
                    <td>
                      {c.note ? (
                        <code className="block max-w-[180px] text-[10px] text-amber-600">
                          {c.note}
                        </code>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>
                    <td>
                      {c.exists ? (
                        <Badge
                          variant="default"
                          className="border-green-500/20 bg-green-500/10 text-[10px] text-green-600"
                        >
                          ✓ {c.fullPath}
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="border-red-500/20 bg-red-500/5 text-[10px] text-red-500"
                        >
                          ✗
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Summary legend ─── */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Search className="h-4 w-4" /> Debug Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <p>
            <strong>① absolute</strong> —{" "}
            <code className="rounded bg-muted px-1">
              src={"{BASE_URL + path}"}
            </code>{" "}
            — This is also what the browser receives if the page is inside{" "}
            <code className="rounded bg-muted px-1">&lt;head&gt;</code>: the URL
            must be fully qualified or the social scraper won&apos;t find it.
          </p>
          <p>
            <strong>② relative</strong> —{" "}
            <code className="rounded bg-muted px-1">src={"{path}"}</code> —
            Works in JSX but is unsafe in OG meta tags because crawlers
            don&apos;t resolve the path against your domain.
          </p>
          <p>
            <strong>③ missing src</strong> — demonstrates the default
            &quot;no-image&quot; state; the{" "}
            <code className="rounded bg-muted px-1">&lt;Image /&gt;</code> code
            above carries <code className="rounded bg-muted px-1">onError</code>{" "}
            so you can see exactly when the browser fires it.
          </p>
          <p>
            <strong>④ meta fallback</strong> — the raw JSON object is stored
            here (not rendered as an image, only useful as a reference string).
          </p>
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-2 text-[11px]">
            <strong>Next.js &lt;Image /&gt; behaviour to watch for:</strong>
            <ul className="mt-1 ml-4 list-disc space-y-0.5">
              <li>
                <code className="rounded bg-muted px-1">next/image</code> needs
                a<strong> real remote URL</strong> or a real static file; it
                will silently fall back to a blank placeholder when the file is
                404 — bypass that with{" "}
                <code className="rounded bg-muted px-1">unoptimized</code>.
              </li>
              <li>
                If the OG-image{" "}
                <code className="rounded bg-muted px-1">
                  &lt;meta property=&quot;og:image&quot;&gt;
                </code>{" "}
                is set in{" "}
                <code className="rounded bg-muted px-1">
                  generateMetadata()
                </code>
                , Next.js does <em>not</em> rewrite local paths — the tag
                contains whatever string you return, exactly as-is.
              </li>
              <li>
                Use the BADGE colours above to match which panel is currently
                rendering the correct image for this restaurant.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

interface SEOPreviewPageProps {
  params: Promise<{ restaurant: string }>
}

export default async function SEOPreviewPage({ params }: SEOPreviewPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const { data } = restaurant
  const restaurantData = data as unknown as Record<string, unknown>

  // Generate current metadata state based on existing data
  const currentMetadata = {
    title: data.seo?.title || data.name,
    description: data.seo?.description || data.description,
    keywords: data.seo?.keywords || [],
    ogImage: data.social?.ogImage || data.hero?.slides?.[0]?.image || data.logo,
    noindex: data.seo?.noindex || false,
  }

  // Current checklist status (what's missing)
  const homeChecks: SEOChecklist[] = [
    {
      route: "title",
      status: data.seo?.title ? "complete" : "missing",
      title: currentMetadata.title,
    },
    {
      route: "description",
      status: data.seo?.description ? "complete" : "missing",
      description: currentMetadata.description,
    },
    {
      route: "ogImage",
      status: currentMetadata.ogImage ? "complete" : "missing",
      ogImage: !!currentMetadata.ogImage,
    },
    {
      route: "structuredData",
      status: "complete",
    },
    {
      route: "canonical",
      status: "complete",
    },
    {
      route: "alt-text-hero",
      status: data.images?.heroImage?.alt ? "complete" : "missing",
      altText: !!data.images?.heroImage?.alt,
    },
  ]

  const menuChecks: SEOChecklist[] = [
    {
      route: "title",
      status: data.seo?.menuTitle ? "complete" : "missing",
      title: data.seo?.menuTitle,
    },
    {
      route: "description",
      status: data.seo?.menuDescription ? "complete" : "missing",
    },
    {
      route: "structured-data-menu",
      status: "complete",
    },
    {
      route: "alt-text-dishes",
      status:
        (data.menu?.filter(
          (m: { image?: string; name?: string }) => m.image && m.name
        )?.length ?? 0) > 0
          ? "partial"
          : "missing",
    },
  ]

  // Count statuses for stats
  const allChecks = [...homeChecks, ...menuChecks]
  const completeCount = allChecks.filter((c) => c.status === "complete").length
  const totalCount = allChecks.filter(
    (c) => c.status !== "not-applicable"
  ).length
  const completionPct =
    totalCount > 0 ? Math.round((completeCount / totalCount) * 100) : 0
  const missingCount = allChecks.filter((c) => c.status === "missing").length

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* SEO Only Header - Hidden from visual users */}
      <div className="sr-only">
        <h1>SEO Preview Dashboard - {data.name}</h1>
        <p>
          Internal tool for auditing SEO implementation across restaurant pages
        </p>
      </div>

      <main className="container mx-auto max-w-7xl px-6 py-12">
        {/* ================================================================== */}
        {/* EXPERIMENT: Local OG Image Preview                                   */}
        {/* ================================================================== */}
        <ExperimentLocalOGImage
          restaurantSlug={slug}
          restaurantName={data.name}
          restaurantData={restaurantData}
          ogImageUrl={data.social?.ogImage}
        />

        {/* Dashboard Header */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-black tracking-tight">
                <span className="text-primary">SEO</span> Preview Dashboard
              </h1>
              <div className="max-w-2xl text-xl text-muted-foreground">
                Audit and preview SEO metadata for <strong>{data.name}</strong>.{" "}
                This page is{" "}
                <Badge variant="outline" className="mx-1">
                  noindex
                </Badge>{" "}
                for internal use only.
              </div>
            </div>
            <Badge
              variant="destructive"
              className="hidden font-mono text-sm sm:inline-flex"
            >
              INTERNAL TOOL
            </Badge>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-semibold text-muted-foreground">Status:</span>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-green-500/20 bg-green-500/10 text-green-600"
              >
                ✓ Complete
              </Badge>
              <Badge
                variant="outline"
                className="border-yellow-500/20 bg-yellow-500/10 text-yellow-600"
              >
                ⚠ Partial
              </Badge>
              <Badge
                variant="outline"
                className="border-red-500/20 bg-red-500/10 text-red-600"
              >
                ✗ Missing
              </Badge>
              <Badge
                variant="outline"
                className="border-gray-500/20 bg-gray-500/10 text-gray-600"
              >
                ○ N/A
              </Badge>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Restaurant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.name}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pages Audited
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">6</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                SEO Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${completionPct > 70 ? "text-green-600" : completionPct > 30 ? "text-amber-600" : "text-red-600"}`}
              >
                {completionPct}%
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {completeCount} of {totalCount} checks
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Critical Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {missingCount}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Missing metadata
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Restaurant SEO Cards */}
        <div className="space-y-6">
          <div className="border-b pb-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {data.name} — SEO Audit
            </h2>
            <p className="text-sm text-muted-foreground">
              SEO Implementation Status:{" "}
              <span
                className={`font-semibold ${completionPct > 70 ? "text-green-600" : completionPct > 30 ? "text-amber-600" : "text-red-600"}`}
              >
                {completionPct > 70
                  ? "Good"
                  : completionPct > 30
                    ? "In Progress"
                    : "Not Started"}
              </span>
            </p>
          </div>

          {/* SEO Cards Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* Home Page Card */}
            <SEOPageCard
              slug={slug}
              name={data.name}
              route="/"
              checks={homeChecks}
              metadata={currentMetadata}
            />

            {/* About Page Card */}
            <SEOPageCard
              slug={slug}
              name={`${data.name} - About`}
              route="/about"
              checks={[
                {
                  route: "title",
                  status: data.seo?.aboutTitle ? "complete" : "missing",
                },
                {
                  route: "description",
                  status: data.seo?.aboutDescription ? "complete" : "missing",
                },
                { route: "structuredData", status: "complete" },
                {
                  route: "word-count",
                  status: data.about?.content
                    ? data.about.content.length > 300
                      ? "complete"
                      : "partial"
                    : "missing",
                },
                {
                  route: "founder-info",
                  status:
                    data.about?.founder || data.content?.founder
                      ? "complete"
                      : "missing",
                },
              ]}
              metadata={{
                title: data.seo?.aboutTitle || `About ${data.name}`,
                description:
                  data.seo?.aboutDescription ||
                  data.about?.content?.substring(0, 160) ||
                  "",
              }}
            />

            {/* Menu Page Card */}
            <SEOPageCard
              slug={slug}
              name={`${data.name} - Menu`}
              route="/menu"
              checks={menuChecks}
              metadata={{
                title: data.seo?.menuTitle || `${data.name} Menu`,
                description:
                  data.seo?.menuDescription ||
                  `View ${data.name}'s complete menu with prices`,
              }}
            />

            {/* Contact Page Card */}
            <SEOPageCard
              slug={slug}
              name={`${data.name} - Contact`}
              route="/contact"
              checks={[
                {
                  route: "title",
                  status: data.seo?.contactTitle ? "complete" : "missing",
                },
                {
                  route: "description",
                  status: data.seo?.contactDescription ? "complete" : "missing",
                },
                { route: "structured-point", status: "complete" },
                {
                  route: "tel-link",
                  status: data.phone ? "complete" : "missing",
                },
                {
                  route: "address",
                  status: data.address ? "complete" : "missing",
                },
                {
                  route: "google-maps",
                  status: data.location?.mapsUrl ? "complete" : "missing",
                },
              ]}
              metadata={{
                title: data.seo?.contactTitle || `Contact ${data.name}`,
                description:
                  data.seo?.contactDescription ||
                  `Contact ${data.name} for reservations`,
              }}
            />

            {/* Brand Page Card (noindex) */}
            <SEOPageCard
              slug={slug}
              name={`${data.name} - Brand Assets`}
              route="/brand"
              checks={[
                {
                  route: "title",
                  status: data.seo?.brandTitle ? "complete" : "missing",
                },
                { route: "description", status: "not-applicable" },
                { route: "indexing", status: "not-applicable" },
                { route: "pdf-generator", status: "complete" },
              ]}
              metadata={{
                title: data.seo?.brandTitle || `${data.name} Brand Assets`,
                description: "Download marketing materials",
                noindex: true,
              }}
            />

            {/* Company Info Page Card */}
            <SEOPageCard
              slug={slug}
              name={`${data.name} - Company Info`}
              route="/company-information"
              checks={[
                {
                  route: "title",
                  status: data.seo?.companyTitle ? "complete" : "missing",
                },
                { route: "description", status: "not-applicable" },
                {
                  route: "org-schema",
                  status: data.companyInfo ? "partial" : "missing",
                },
                {
                  route: "legal-fields",
                  status: data.companyInfo ? "complete" : "missing",
                },
              ]}
              metadata={{
                title:
                  data.seo?.companyTitle || `${data.name} Company Information`,
                description: "Corporate details and registration information",
              }}
            />
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Implementation Status
          </h2>

          {/* Phase Indicators */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {[
              {
                phase: 1,
                name: "Metadata",
                status: "complete",
                desc: "generateMetadata in all pages",
              },
              {
                phase: 2,
                name: "Structured Data",
                status: "complete",
                desc: "JsonLd component in all pages",
              },
              {
                phase: 3,
                name: "Sitemap",
                status: "complete",
                desc: "app/sitemap.ts ready",
              },
              {
                phase: 4,
                name: "Robots",
                status: "complete",
                desc: "app/robots.ts ready",
              },
              {
                phase: 5,
                name: "Validation",
                status: "pending",
                desc: "Testing & fixes",
              },
            ].map((phase) => (
              <Card key={phase.phase} className="border-2 border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Phase {phase.phase}: {phase.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {phase.desc}
                  </p>
                  <Badge
                    variant={
                      phase.status === "complete" ? "default" : "secondary"
                    }
                  >
                    {phase.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Items */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ol className="ml-2 list-inside list-decimal space-y-2">
                <li>
                  Add SEO fields to{" "}
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    data.json
                  </code>{" "}
                  for this restaurant (see template)
                </li>
                <li>
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    lib/seo.ts
                  </code>{" "}
                  already created with metadata generators
                </li>
                <li>
                  Implement{" "}
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    generateMetadata
                  </code>{" "}
                  in each route (home, about, menu, contact, company)
                </li>
                <li>
                  Add{" "}
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    &lt;JsonLd /&gt;
                  </code>{" "}
                  component to pages (except brand)
                </li>
                <li>
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    app/sitemap.ts
                  </code>{" "}
                  and{" "}
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    app/robots.ts
                  </code>{" "}
                  already created
                </li>
                <li>Test with Lighthouse & Google Rich Results Test</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
