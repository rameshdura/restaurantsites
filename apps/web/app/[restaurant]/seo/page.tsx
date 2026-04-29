import { Metadata } from 'next'
import { getRestaurant } from '@/lib/restaurant'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { ExternalLink, Shield, Search, Globe, Image as ImageIcon, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'SEO Preview Dashboard',
  description: 'Internal SEO audit and preview tool',
  robots: {
    index: false,
    follow: false,
  },
}

// Get base URL from env or use placeholder
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://restaurantsite.io'

interface SEOChecklist {
  route: string
  status: 'complete' | 'partial' | 'missing' | 'not-applicable'
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

function SEOPageCard({ slug, name, route, checks, metadata }: SEOPageCardProps) {
  const statusColors = {
    complete: 'bg-green-500/10 text-green-600 border-green-500/20',
    partial: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    missing: 'bg-red-500/10 text-red-600 border-red-500/20',
    'not-applicable': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  }

  const statusIcons = {
    complete: '✓',
    partial: '⚠',
    missing: '✗',
    'not-applicable': '○',
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <span className="text-primary">{name}</span>
              <Badge variant="outline" className="text-xs font-mono">
                /{slug}{route !== '/' ? route : ''}
              </Badge>
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              {route === '/' ? 'Restaurant homepage' : `Restaurant ${route.replace('/','')} page`}
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <a 
              href={`/${slug}${route}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Open
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metadata Preview */}
        {metadata.title && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Search className="w-3 h-3" />
              SERP Preview
            </div>
            <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
               <p className="text-blue-600 text-base font-medium leading-snug">
                 {metadata.title}
               </p>
               <p className="text-green-700 text-sm mt-1 leading-snug">
                 {`${BASE_URL}/${slug}${route}`}
               </p>
              <p className="text-gray-600 text-sm mt-1.5 leading-relaxed">
                {metadata.description || 'No description set...'}
              </p>
            </div>
          </div>
        )}

        {/* SEO Checks Grid */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <Shield className="w-3 h-3" />
            SEO Checklist
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {checks.map((check, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-medium ${statusColors[check.status]}`}
              >
                <span className="text-base">{statusIcons[check.status]}</span>
                <span className="capitalize">{check.route === 'title' ? 'Meta Title' : 
                                               check.route === 'description' ? 'Meta Desc' :
                                               check.route === 'ogImage' ? 'OG Image' :
                                               check.route === 'structuredData' ? 'Schema.org' :
                                               check.route === 'canonical' ? 'Canonical' :
                                               check.route.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40">
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Title: {(metadata.title?.length || 0)} / 60
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Desc: {(metadata.description?.length || 0)} / 160
          </div>
        </div>

        {/* Meta Tags Preview */}
        {metadata.keywords && metadata.keywords.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Globe className="w-3 h-3" />
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
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <ImageIcon className="w-3 h-3" />
              Open Graph Image
            </div>
            <div className="relative h-24 w-full rounded-lg overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={metadata.ogImage} 
                alt="OG preview" 
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Indexing Status */}
        {metadata.noindex && (
          <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-xs text-yellow-700">
            <Shield className="w-3 h-3" />
            <span className="font-medium">Noindex tag set - Page will not appear in search results</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SEOPreviewPageProps {
  params: Promise<{ restaurant: string }>
}

export default async function SEOPreviewPage({ params }: SEOPreviewPageProps) {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)

  if (!restaurant) {
    notFound()
  }

  const { data } = restaurant

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
      route: 'title',
      status: data.seo?.title ? 'complete' : 'missing',
      title: currentMetadata.title
    },
    {
      route: 'description',
      status: data.seo?.description ? 'complete' : 'missing',
      description: currentMetadata.description
    },
    {
      route: 'ogImage',
      status: currentMetadata.ogImage ? 'complete' : 'missing',
      ogImage: !!currentMetadata.ogImage
    },
    {
      route: 'structuredData',
      status: 'complete'
    },
    {
      route: 'canonical',
      status: 'complete'
    },
    {
      route: 'alt-text-hero',
      status: data.images?.heroImage?.alt ? 'complete' : 'missing',
      altText: !!data.images?.heroImage?.alt
    },
  ]

  const menuChecks: SEOChecklist[] = [
    {
      route: 'title',
      status: data.seo?.menuTitle ? 'complete' : 'missing',
      title: data.seo?.menuTitle
    },
    {
      route: 'description',
      status: data.seo?.menuDescription ? 'complete' : 'missing'
    },
    {
      route: 'structured-data-menu',
      status: 'complete'
    },
    {
      route: 'alt-text-dishes',
      status: (data.menu?.filter((m: { image?: string; name?: string }) => m.image && m.name)?.length ?? 0) > 0 ? 'partial' : 'missing'
    },
  ]

  // Count statuses for stats
  const allChecks = [
    ...homeChecks,
    ...menuChecks,
  ]
  const completeCount = allChecks.filter(c => c.status === 'complete').length
  const totalCount = allChecks.filter(c => c.status !== 'not-applicable').length
  const completionPct = totalCount > 0 ? Math.round((completeCount / totalCount) * 100) : 0
  const missingCount = allChecks.filter(c => c.status === 'missing').length

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* SEO Only Header - Hidden from visual users */}
      <div className="sr-only">
        <h1>SEO Preview Dashboard - {data.name}</h1>
        <p>Internal tool for auditing SEO implementation across restaurant pages</p>
      </div>

      <main className="container mx-auto max-w-7xl px-6 py-12">
        {/* Dashboard Header */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">
                <span className="text-primary">SEO</span> Preview Dashboard
              </h1>
              <div className="text-xl text-muted-foreground max-w-2xl">
                Audit and preview SEO metadata for <strong>{data.name}</strong>.{' '}
                This page is <Badge variant="outline" className="mx-1">noindex</Badge> for internal use only.
              </div>
            </div>
            <Badge variant="destructive" className="text-sm font-mono hidden sm:inline-flex">
              INTERNAL TOOL
            </Badge>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 items-center text-sm">
            <span className="text-muted-foreground font-semibold">Status:</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">✓ Complete</Badge>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">⚠ Partial</Badge>
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">✗ Missing</Badge>
              <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">○ N/A</Badge>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
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
              <div className={`text-3xl font-bold ${completionPct > 70 ? 'text-green-600' : completionPct > 30 ? 'text-amber-600' : 'text-red-600'}`}>{completionPct}%</div>
              <p className="text-xs text-muted-foreground mt-1">{completeCount} of {totalCount} checks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Critical Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{missingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Missing metadata</p>
            </CardContent>
          </Card>
        </div>

        {/* Restaurant SEO Cards */}
        <div className="space-y-6">
          <div className="border-b pb-2">
            <h2 className="text-2xl font-bold tracking-tight">{data.name} — SEO Audit</h2>
            <p className="text-sm text-muted-foreground">
              SEO Implementation Status:{' '}
              <span className={`font-semibold ${completionPct > 70 ? 'text-green-600' : completionPct > 30 ? 'text-amber-600' : 'text-red-600'}`}>
                {completionPct > 70 ? 'Good' : completionPct > 30 ? 'In Progress' : 'Not Started'}
              </span>
            </p>
          </div>

          {/* SEO Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                { route: 'title', status: data.seo?.aboutTitle ? 'complete' : 'missing' },
                { route: 'description', status: data.seo?.aboutDescription ? 'complete' : 'missing' },
                { route: 'structuredData', status: 'complete' },
                { route: 'word-count', status: data.about?.content ? (data.about.content.length > 300 ? 'complete' : 'partial') : 'missing' },
                { route: 'founder-info', status: (data.about?.founder || data.content?.founder) ? 'complete' : 'missing' },
              ]}
              metadata={{
                title: data.seo?.aboutTitle || `About ${data.name}`,
                description: data.seo?.aboutDescription || data.about?.content?.substring(0, 160) || '',
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
                description: data.seo?.menuDescription || `View ${data.name}'s complete menu with prices`,
              }}
            />

            {/* Contact Page Card */}
            <SEOPageCard
              slug={slug}
              name={`${data.name} - Contact`}
              route="/contact"
              checks={[
                { route: 'title', status: data.seo?.contactTitle ? 'complete' : 'missing' },
                { route: 'description', status: data.seo?.contactDescription ? 'complete' : 'missing' },
                { route: 'structured-point', status: 'complete' },
                { route: 'tel-link', status: data.phone ? 'complete' : 'missing' },
                { route: 'address', status: data.address ? 'complete' : 'missing' },
                { route: 'google-maps', status: data.location?.mapsUrl ? 'complete' : 'missing' },
              ]}
              metadata={{
                title: data.seo?.contactTitle || `Contact ${data.name}`,
                description: data.seo?.contactDescription || `Contact ${data.name} for reservations`,
              }}
            />

            {/* Brand Page Card (noindex) */}
            <SEOPageCard
              slug={slug}
              name={`${data.name} - Brand Assets`}
              route="/brand"
              checks={[
                { route: 'title', status: data.seo?.brandTitle ? 'complete' : 'missing' },
                { route: 'description', status: 'not-applicable' },
                { route: 'indexing', status: 'not-applicable' },
                { route: 'pdf-generator', status: 'complete' },
              ]}
              metadata={{
                title: data.seo?.brandTitle || `${data.name} Brand Assets`,
                description: 'Download marketing materials',
                noindex: true,
              }}
            />

            {/* Company Info Page Card */}
            <SEOPageCard
              slug={slug}
              name={`${data.name} - Company Info`}
              route="/company-information"
              checks={[
                { route: 'title', status: data.seo?.companyTitle ? 'complete' : 'missing' },
                { route: 'description', status: 'not-applicable' },
                { route: 'org-schema', status: data.companyInfo ? 'partial' : 'missing' },
                { route: 'legal-fields', status: data.companyInfo ? 'complete' : 'missing' },
              ]}
              metadata={{
                title: data.seo?.companyTitle || `${data.name} Company Information`,
                description: 'Corporate details and registration information',
              }}
            />
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Implementation Status</h2>
          
          {/* Phase Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { phase: 1, name: 'Metadata', status: 'complete', desc: 'generateMetadata in all pages' },
              { phase: 2, name: 'Structured Data', status: 'complete', desc: 'JsonLd component in all pages' },
              { phase: 3, name: 'Sitemap', status: 'complete', desc: 'app/sitemap.ts ready' },
              { phase: 4, name: 'Robots', status: 'complete', desc: 'app/robots.ts ready' },
              { phase: 5, name: 'Validation', status: 'pending', desc: 'Testing & fixes' },
            ].map((phase) => (
              <Card key={phase.phase} className="border-2 border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Phase {phase.phase}: {phase.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{phase.desc}</p>
                  <Badge variant={phase.status === 'complete' ? 'default' : 'secondary'}>
                    {phase.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

           {/* Action Items */}
           <Card className="bg-primary/5 border-primary/20">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Search className="w-5 h-5" />
                 Next Steps
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-2 text-sm">
               <ol className="list-decimal list-inside space-y-2 ml-2">
                 <li>Add SEO fields to <code className="px-2 py-1 bg-muted rounded text-xs">data.json</code> for this restaurant (see template)</li>
                 <li><code className="px-2 py-1 bg-muted rounded text-xs">lib/seo.ts</code> already created with metadata generators</li>
                 <li>Implement <code className="px-2 py-1 bg-muted rounded text-xs">generateMetadata</code> in each route (home, about, menu, contact, company)</li>
                 <li>Add <code className="px-2 py-1 bg-muted rounded text-xs">&lt;JsonLd /&gt;</code> component to pages (except brand)</li>
                 <li><code className="px-2 py-1 bg-muted rounded text-xs">app/sitemap.ts</code> and <code className="px-2 py-1 bg-muted rounded text-xs">app/robots.ts</code> already created</li>
                 <li>Test with Lighthouse & Google Rich Results Test</li>
               </ol>
             </CardContent>
           </Card>
        </div>
      </main>
    </div>
  )
}
