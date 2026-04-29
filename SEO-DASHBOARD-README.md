# SEO Preview Dashboard

**Route:** `/seo` (noindex - not indexed by search engines)  
**Purpose:** Internal diagnostic tool to audit SEO implementation across all restaurant pages  
**Status:** Implementation Ready

---

## Overview

The `/seo` dashboard provides a real-time preview of SEO metadata for every restaurant page, showing:

- **SERP Preview** - How each page appears in Google search results
- **SEO Checklist** - Color-coded status for each SEO element
- **Metadata Validation** - Title length, description length
- **Structured Data Status** - Schema.org completeness
- **Image Alt Text** - Accessibility audit
- **Backlinks** - Internal linking validation

---

## Features

### 1. Restaurant Cards Grid

Each restaurant displays up to 6 SEO cards:
- Home page (`/`)
- About (`/about`)
- Menu (`/menu`)
- Contact (`/contact`)
- Brand (`/brand`) - marked noindex
- Company Info (`/company-information`)

### 2. SERP Blue Link Preview

Shows exactly how Google will display the page:
```
Page Title (blue, clickable)
  URL (green)
  Meta Description (gray)
```

Live character counts check:
- Title: ✓ 58/60 chars (optimal)
- Description: ✓ 154/160 chars (optimal)

### 3. SEO Status Badges

| Badge | Meaning | Action |
|-------|---------|--------|
| ✓ Complete | All SEO fields present | ✅ Ready |
| ⚠ Partial | Some SEO fields present but incomplete | 🔄 Add missing fields |
| ✗ Missing | Required SEO field missing | ❌ Fix immediately |
| ○ N/A | Not applicable to this page type | ℹ️ Ignore |

### 4. Keyword Cloud

Displays `seo.keywords` array as clickable badges for content planning.

### 5. Structured Data Preview

Shows OG image preview and lists JSON-LD schema status.

### 6. Implementation Progress Bar

Tracks SEO rollout phases:
- Phase 1: Metadata
- Phase 2: Structured Data
- Phase 3: Sitemap
- Phase 4: Robots.txt
- Phase 5: Validation

---

## Usage

### Access Dashboard

```bash
# Start dev server
npm run dev

# Navigate to
http://localhost:3000/seo
```

**Note:** This page has `noindex, nofollow` robots meta - safe to expose in dev.

### Dashboard UI

```
┌─────────────────────────────────────────────────────────┐
│  SEO Preview Dashboard                                  │
│  Internal tool for auditing SEO implementation          │
│  [INTERNAL TOOL] [noindex badge]                       │
├─────────────────────────────────────────────────────────┤
│  Total Restaurants: 2                                   │
│  Pages Audited: 14                                      │
│  SEO Complete: 0%                                       │
│  Critical Issues: 10 (missing metadata)                  │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ Ramen Taro [ /ramen-taro ]                      │   │
│  │ [Open]                                          │   │
│  │ ┌─────────────────────────────────────────────┐ │   │
│  │ │ SERP Preview:                               │ │   │
│  │ │ Ramen Taro | Authentic... [blue link]      │ │   │
│  │ │ https://.../ramen-taro [green URL]         │ │   │
│  │ │ Desc: Experience authentic...              │ │   │
│  │ └─────────────────────────────────────────────┘ │   │
│  │ SEO Checklist: [✓ title][✗ desc][✗ schema]  │   │
│  │ Stats: Title 58/60, Desc 142/160              │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Phase 1: Metadata [pending]                            │
│  Phase 2: Structured Data [pending]                     │
│  ...                                                     │
└─────────────────────────────────────────────────────────┘
```

---

## Data Requirements

The dashboard reads from each restaurant's `data.json`. To show green checkmarks, populate these fields:

### Essential (for 100% green)

**Home Page (`/`):**
```json
{
  "seo": {
    "title": "Restaurant Name | Cuisine in City",
    "description": "150-160 char compelling description"
  },
  "images": {
    "heroImage": {
      "alt": "Descriptive alt text for hero image"
    }
  }
}
```

**Menu Page (`/menu`):**
```json
{
  "seo": {
    "menuTitle": "Restaurant Name Menu",
    "menuDescription": "Menu description with popular dishes"
  }
}
```

**Contact Page (`/contact`):**
```json
{
  "phone": "+81 3-1234-5678",
  "email": "info@restaurant.com",
  "location": {
    "mapsUrl": "https://maps.google.com/..."
  }
}
```

### Validation Status

The dashboard computes completeness:

```typescript
const checks = {
  title: data.seo?.title ? 'complete' : 'missing',
  description: data.seo?.description ? 'complete' : 'missing',
  ogImage: data.social?.ogImage ? 'complete' : 'missing',
  structuredData: implementationStatus, // from schema ✓/✗
  canonical: data.seo?.canonical ? 'complete' : 'missing',
  'alt-text-hero': data.images?.heroImage?.alt ? 'complete' : 'missing',
}
```

---

## SEO Checklist Per Route

### Home Page (`/`)
- [ ] Meta title (50-60 chars)
- [ ] Meta description (150-160 chars)
- [ ] Open Graph image
- [ ] Structured data (Restaurant schema)
- [ ] Canonical URL
- [ ] Hero image alt text

### About Page (`/about`)
- [ ] Meta title (About + name)
- [ ] Meta description (story excerpt)
- [ ] Word count > 300
- [ ] Founder info present
- [ ] AboutPage + Person schema
- [ ] Team bios formatted

### Menu Page (`/menu`)
- [ ] Menu page meta title
- [ ] Menu description
- [ ] Menu schema markup
- [ ] All dish images have alt
- [ ] Prices displayed clearly
- [ ] Category descriptions

### Contact Page (`/contact`)
- [ ] Contact meta title
- [ ] Contact description
- [ ] ContactPoint schema
- [ ] Phone is tel: link
- [ ] Address present
- [ ] Google Maps embed
- [ ] Hours in schema format

### Brand Page (`/brand`)
- [ ] Noindex robots tag (VERY IMPORTANT)
- [ ] PDF generator working
- [ ] Canonical to self

### Company Info (`/company-information`)
- [ ] Org schema
- [ ] All legal fields filled
- [ ] Registration number

---

## Technical Implementation

### Route Definition

`apps/web/app/seo/page.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'SEO Preview Dashboard',
  robots: {
    index: false,
    follow: false,
  },
  noindex: true,
}
```

### Data Fetching

```typescript
const slugs = await getAllRestaurantSlugs()
const restaurants = await Promise.all(
  slugs.map(async (slug) => {
    const res = await getRestaurant(slug)
    return res ? { slug, restaurant: res } : null
  })
)
```

### Status Computation

Each route's SEO checklist is generated dynamically:

```typescript
const routeChecklists: Record<string, SEOChecklist[]> = {
  home: [...],
  about: [...],
  menu: [...],
  contact: [...],
  brand: [...],
  company: [...],
}
```

### Card Component

`SEOPageCard` displays:
- Route name & URL
- SERP preview snippet
- Status badges grid
- Character count warnings
- Keywords cloud (if any)
- OG image preview
- Indexing status warning (if noindex)

---

## Integration with SEO Pipeline

The `/seo` dashboard does NOT implement SEO itself. It only **reads** from `data.json` and reports what's missing.

**Workflow:**

```
1. Fill data.json with SEO fields
   ↓
2. Visit /seo dashboard
   ↓
3. See red ✗ missing items
   ↓
4. Add missing data.json fields
   ↓
5. Implement generateMetadata in code
   ↓
6. Revisit /seo → now see green ✓ checks
   ↓
7. Deploy → submit sitemap
```

---

## Future Enhancements

### Phase 1 (soon)
- [ ] Real-time TypeScript validation of data.json
- [ ] JSON schema validation with error messages
- [ ] Import/export SEO data as CSV
- [ ] Bulk edit mode for multiple restaurants

### Phase 2 (later)
- [ ] Live Lighthouse score per page
- [ ] Sitemap validation (broken links)
- [ ] Google Search Console API integration
- [ ] Keyword rank tracking (weekly)
- [ ] Competitor analysis

### Phase 3 (vision)
- [ ] AI-generated meta descriptions from content
- [ ] Automated alt text suggestions for images
- [ ] Internal linking recommendations
- [ ] Content gap analysis vs competitors

---

## Troubleshooting

### Dashboard shows all ✗ missing

**Cause:** SEO fields not added to `data.json` yet  
**Fix:** Add the `seo`, `social`, `schema`, `images` objects to each restaurant's `data.json`

### OG image preview broken

**Cause:** Image URL unreachable or CORS issue  
**Fix:** Ensure `next.config.js` has `remotePatterns` for image host (Unsplash already configured)

### Status still "missing" after implementing generateMetadata

**Cause:** Dashboard reads from `data.json` only, not actual rendered page  
**Fix:** The dashboard shows **data readiness**, not implementation status. Once data.json is complete, you'll see green. Then implement `generateMetadata` in code.

### No restaurants showing

**Cause:** `getAllRestaurantSlugs()` returned empty  
**Fix:** Check that `/restaurants` directory has subfolders with `data.json`

---

## Monitoring SEO Health

Check `/seo` regularly:

**Before deploying new restaurant:**
- All 6 page cards show mostly green ✓
- No red ✗ critical items
- Character counts within limits

**After any data.json change:**
- Refresh `/seo`
- Verify checklist updates

**Monthly SEO audit:**
- Spot-check each restaurant's `/seo` card
- Verify structured data with Rich Results Test
- Check for broken OG images

---

## Security Note

The `/seo` route:

- Is **not indexed** (noindex meta)
- Shows internal data (restaurant names, URLs)
- Should only be used in **development/staging** environments
- Consider **basic auth** or **IP whitelist** for production access

Add protection if needed:

```typescript
// app/seo/page.tsx
export const dynamic = 'force-dynamic'

export async function GET() {
  const allowedIPs = ['127.0.0.1', '::1']
  const clientIP = request.headers.get('x-forwarded-for') || request.ip
  
  if (!allowedIPs.includes(clientIP)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // ... render dashboard
}
```

---

## Related Documentation

- `SEO-OPTIMIZATION-PLAN.md` - Full implementation guide
- `SEO-ROUTES-SPEC.md` - Per-route SEO requirements
- `DATA-JSON-SEO-TEMPLATE.md` - Complete data.json template
- `lib/restaurant.ts` - TypeScript interfaces (to be updated with SEO types)

---

## API Reference

### SEOChecklist Interface
```typescript
interface SEOChecklist {
  route: string           // 'title', 'description', 'ogImage', etc.
  status: 'complete' | 'partial' | 'missing' | 'not-applicable'
  title?: string          // actual title value
  description?: string    // actual description value
}
```

### SEOPageCard Props
```typescript
interface SEOPageCardProps {
  slug: string            // restaurant slug
  name: string            // display name
  route: string           // URL path (e.g., '/about')
  checks: SEOChecklist[]  // checklist items
  metadata: {
    title?: string
    description?: string
    keywords?: string[]
    ogImage?: string
    noindex?: boolean
  }
}
```

---

## Contributing

When adding new routes to the platform:

1. Add route to `routeChecklists` object in `page.tsx`
2. Define SEO checks for the new route
3. Update `DATA-JSON-SEO-TEMPLATE.md` with required fields
4. Add to `SEO-ROUTES-SPEC.md` route table
