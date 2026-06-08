# SEO Optimization Strategy for RestaurantSite Platform

## Executive Summary

**Project:** Multi-tenant restaurant website platform built with Next.js 16 (App Router)
**Routes Analyzed:** 7 dynamic routes across 2+ restaurant tenants
**Current SEO Status:** No metadata generation, missing structured data, no sitemap/robots.txt
**Priority:** HIGH - Foundation implementation needed before content optimization

---

## 1. Website Architecture & Routes Analysis

### 1.1 Route Structure

```
apps/web/app/
├── layout.tsx                    # Root layout (NO metadata export)
├── page.tsx                      # Restaurant listing (homepage)
└── [restaurant]/
    ├── page.tsx                  # Restaurant home (hero, about preview, CTA)
    ├── about/page.tsx           # Full about page with team
    ├── menu/page.tsx            # Menu display with PDF download
    ├── contact/page.tsx         # Contact form + map embed
    ├── brand/page.tsx           # Marketing assets (PDF generators)
    └── company-information/page.tsx  # Corporate details (Japan-specific)
```

### 1.2 Data Flow

```
Restaurant JSON Data ( restaurants/[slug]/data.json )
         ↓
lib/restaurant.ts (getRestaurant, getAllRestaurantSlugs)
         ↓
Page Components (Server Components)
         ↓
UI Components (@workspace/ui) - Mostly Client Components
```

---

## 2. Current SEO Implementation Audit

### 2.1 Critical Missing Elements

| Element | Status | Impact | Priority |
|---------|--------|--------|----------|
| `generateMetadata` functions | ❌ MISSING | **CRITICAL** | P0 |
| Page titles (per-route) | ❌ MISSING | **CRITICAL** | P0 |
| Meta descriptions | ❌ MISSING | **CRITICAL** | P0 |
| Canonical URLs | ❌ MISSING | HIGH | P1 |
| Open Graph tags | ❌ MISSING | HIGH | P1 |
| Twitter Card tags | ❌ MISSING | MEDIUM | P2 |
| JSON-LD structured data | ❌ MISSING | HIGH | P1 |
| Sitemap.xml | ❌ MISSING | CRITICAL | P0 |
| robots.txt | ❌ MISSING | CRITICAL | P0 |
| Image alt attributes | ⚠️ PARTIAL | MEDIUM | P2 |
| Heading hierarchy (h1-h6) | ⚠️ INCONSISTENT | MEDIUM | P2 |
| URL slugs (restaurant) | ✅ GOOD | N/A | N/A |
| Mobile responsiveness | ✅ GOOD | N/A | N/A |

### 2.2 Existing SEO-Friendly Patterns

✅ **Strengths:**
- Clean URL structure: `/[slug]/`, `/[slug]/menu`, etc.
- Semantic HTML structure in place
- Fast client-side navigation with Next.js Link
- Image optimization via `next/image` with proper `alt` props in most places
- Server components used where appropriate (data fetching)

⚠️ **Issues to Address:**
- ALL pages render with same default browser title ("RestaurantSite Platform" from root layout)
- No dynamic metadata per restaurant or per page type
- `Image` alt text often generic: `"Slide 1"`, `"About image"` instead of descriptive
- Missing `lang` attribute variations for multilingual content
- Google Translate integration may cause duplicate content issues
- No `noindex` tags for low-value pages (brand assets PDF gen pages)

---

## 3. SEO Optimization Roadmap

### Phase 1: Foundation Metadata (Week 1) ✅ HIGHEST PRIORITY

**Goal:** Enable search engines to index and understand each page properly.

#### 3.1.1 Update Root Layout (`app/layout.tsx`)
```typescript
// Add viewport meta (if missing), theme-color
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional head elements can be injected here */}
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

#### 3.1.2 Implement `generateMetadata` for ALL Routes

**For each page file, add:**

```typescript
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await getRestaurant(slug)
  
  return {
    title: `${restaurant.data.name} | Authentic Japanese Dining`,
    description: restaurant.data.description,
    // ... expand below
  }
}
```

**Metadata Strategy per Route:**

| Route | Title Template | Description Source | Unique Elements |
|-------|---------------|-------------------|-----------------|
| `/[slug]` (home) | `{name} | Authentic {cuisine} in {city}` | `data.description` | Hero images as OG, CTA to menu |
| `/[slug]/about` | `About {name} | Our Story & Heritage` | `data.about.content` | Team members OG, founder story |
| `/[slug]/menu` | `{name} Menu | Prices & Dishes` | Intro paragraph | Menu categories, price range schema |
| `/[slug]/contact` | `Contact {name} | Reservations & Directions` | Location-based | Map embed, phone click-to-call |
| `/[slug]/brand` | `{name} Brand Assets | Logos & Marketing` | N/A (assets page) | **noindex** suggestion |
| `/[slug]/company-information` | `{name} Corporate Info | Company Details` | N/A (Japan only) | Corporate schema |

#### 3.1.3 Open Graph & Social Media Optimization

Per-page OG tags needed:
```typescript
openGraph: {
  title: string,
  description: string,
  url: `https://${domain}/${slug}`,
  siteName: restaurant.data.name,
  images: [
    {
      url: restaurant.data.logo || heroImage,
      width: 1200,
      height: 630,
      alt: `${restaurant.data.name} hero image`,
    }
  ],
  locale: 'en_US',
  type: 'restaurant.restaurant',
}
```

**Twitter Card:**
```typescript
twitter: {
  card: 'summary_large_image',
  title: string,
  description: string,
  images: [heroImage],
}
```

#### 3.1.4 Canonical URLs

Every page needs:
```typescript
alternates: {
  canonical: `https://${domain}/${slug}${pathname}`,
}
```

**Handle language variants:**
```typescript
alternates: {
  canonical: canonicalUrl,
  languages: {
    'en-US': `https://${domain}/${slug}`,
    'ja-JP': `https://${domain}/ja/${slug}`, // if implementing i18n routes
  }
}
```

---

### Phase 2: Technical SEO (Week 1-2)

#### 3.2.1 Sitemap Generation

**Create `app/sitemap.ts`:**

```typescript
import { MetadataRoute } from 'next'
import { getAllRestaurantSlugs, getRestaurant } from '@/lib/restaurant'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllRestaurantSlugs()
  const restaurants = await Promise.all(
    slugs.map(async (slug) => {
      const res = await getRestaurant(slug)
      return res ? { slug, data: res.data } : null
    })
  )
  const activeRestaurants = restaurants.filter(Boolean)

  const staticPages = [
    {
      url: 'https://restaurantsite.io',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    }
  ]

  const restaurantPages = activeRestaurants.flatMap((restaurant) => [
    // Main page
    {
      url: `https://restaurantsite.io/${restaurant.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // About
    {
      url: `https://restaurantsite.io/${restaurant.slug}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Menu
    {
      url: `https://restaurantsite.io/${restaurant.slug}/menu`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Contact
    {
      url: `https://restaurantsite.io/${restaurant.slug}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ])

  return [...staticPages, ...restaurantPages]
}
```

#### 3.2.2 Robots.txt

**Create `app/robots.ts`:**

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // Block API routes from indexing
          '/[restaurant]/brand',  // PDF generator pages (thin content)
        ],
      },
    ],
    sitemap: 'https://restaurantsite.io/sitemap.xml',
  }
}
```

#### 3.2.3 Image SEO Optimization

**Current Issues:**
- Generic alt text: `"Slide 1"`, `"About image"`
- Missing `image` objects in metadata
- No structured data for restaurant images

**Action Items:**
1. Update all `Image` components with descriptive alt text:
```tsx
<Image
  src={slide.image}
  alt={slide.title}  // Already good in Hero
  ...
/>
```

2. Add fallback alt text logic:
```typescript
const getImageAlt = (slide: HeroSlide, index: number) => {
  return slide.title || `${restaurant.name} hero image ${index + 1}`
}
```

3. Implement `next/image` proper sizing:
- Already using `sizes` prop in gallery - extend to all images
- Add `loading="eager"` for hero, `loading="lazy"` for below-fold

#### 3.2.4 Structured Data (JSON-LD)

**Create reusable component:** `components/structured-data.tsx`

```typescript
'use client'

import { Script } from 'next/script'
import { Restaurant, MenuItem } from '@/lib/restaurant'

interface RestaurantSchemaProps {
  restaurant: Restaurant
}

export function RestaurantSchema({ restaurant }: RestaurantSchemaProps) {
  const { data, menu } = restaurant
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: data.name,
    description: data.description,
    image: data.hero?.slides?.[0]?.image || data.logo,
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address?.split(',')[0],
      addressLocality: extractCity(data.address),
      addressCountry: 'JP', // or detect from data
    },
    telephone: data.phone,
    email: data.email,
    openingHours: formatOpeningHours(data.openingHours),
    servesCuisine: extractCuisineTypes(menu),
    priceRange: getPriceRange(menu),
    menu: menu?.slice(0, 10).map(item => ({
      '@type': 'MenuItem',
      name: item.name,
      description: item.description,
      offers: {
        '@type': 'Offer',
        price: item.price,
        priceCurrency: 'JPY', // or USD based on location
      }
    })),
    sameAs: [
      // Instagram, Facebook URLs from data if available
    ]
  }

  return (
    <Script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

**Add to each restaurant page:**
```tsx
import { RestaurantSchema } from '@/components/structured-data'

export default async function RestaurantPage({ params }) {
  // ... existing code
  
  return (
    <>
      <RestaurantSchema restaurant={restaurant} />
      {/* existing JSX */}
    </>
  )
}
```

---

### Phase 3: Content & On-Page SEO (Week 2-3)

#### 3.3.1 Heading Hierarchy Audit

**Current Issues:**
- `/[slug]/page.tsx`: Uses h1 for hero, but `about/page.tsx` uses h1 again on separate page → OK
- `menu/page.tsx`: Uses h4 (subtitle), h1 (title) → Good
- `contact/page.tsx`: Uses h1 → Good
- **Missing h2/h3 hierarchy within pages**

**Fix heading order in `/[slug]/page.tsx`:**
```tsx
// Current: direct h1 in hero (already fine)
// Current: About section uses SectionHeader with h2 → OK
// Add: Menu section should use h2
// Add: Gallery h2
// Add: Contact h2
```

#### 3.3.2 Keyword Strategy per Page Type

Based on data.json samples, extract keywords:

**Home Page:**
- Primary: `{restaurant name}`, `{cuisine type} {city}`
- Secondary: `authentic {cuisine}`, `best {cuisine} in {city}`
- Long-tail: `{dish name} near me`, `{restaurant} reservations`

**Menu Page:**
- Primary: `{restaurant name} menu`, `{cuisine} menu prices`
- Secondary: `{dish category}`, `{popular dish} price`
- Schema: Use `MenuItem` schema for each dish (optional but recommended)

**About Page:**
- Primary: `{restaurant} story`, `{founder name} {restaurant}`
- Secondary: `our heritage`, `chef profile`, `restaurant history`

**Contact Page:**
- Primary: `{restaurant} contact`, `{restaurant} phone`, `{restaurant} reservations`
- Secondary: `directions to {restaurant}`, `opening hours {restaurant}`

#### 3.3.3 Content Gaps & Optimization

**Current content issues:**
- Some restaurants missing `about.additionalContent` or `about.images`
- Empty `holidayNotes` in ramen-taro data
- Incomplete `openingHours` format differences between restaurants

**Action items for data entry:**
1. Ensure ALL restaurants have complete data:
   - `about.title` (50-60 chars max)
   - `about.content` (150-160 chars for meta desc, full version for page)
   - `about.images` (3-5 high-quality, properly compressed)
   - `hero.slides` (2-3 slides with unique titles)

2. Optimize existing content:
   - Menu descriptions: expand to 50-100 chars (currently very short)
   - Add `secondaryName` field for dishes with local names
   - Add `isPopular`, `isVegetarian`, `isSpicy` flags to all relevant items (already supported)

3. Create location-specific pages if needed:
   - If multiple locations, create separate restaurant entries (already multi-tenant)
   - Add city/neighborhood keywords to descriptions

---

### Phase 4: Advanced SEO Features (Week 3-4)

#### 3.4.1 Local Business SEO

**Google Business Profile sync:**
- Add `sameAs` field to JSON for social links
- Embed structured data for `Place` or `LocalBusiness`
- Add `geo` coordinates already present → use in schema

**LocalBusiness schema extension:**
```typescript
{
  '@type': 'LocalBusiness',
  // ... restaurant fields
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '247'
  }
}
```

**Add review schema when reviews available via API.**

#### 3.4.2 Multilingual SEO (Google Translate)

**Current setup:** Google Translate client-side injection
**Issues:**
- No translated page versions (just JS translation overlay)
- Potential duplicate content with translated view
- Missing `hreflang` tags

**Recommendation:** If expanding i18n, move to Next.js i18n routing:
```
/app/[locale]/[restaurant]/page.tsx
```
But for now, add to head:
```html
<link rel="alternate" hreflang="x-default" href="https://domain.com/[slug]" />
<link rel="alternate" hreflang="en" href="https://domain.com/[slug]" />
<!-- Add actual translated pages later -->
```

#### 3.4.3 Blog/Content Integration (Future)

**Recommendation:** Add blog for long-tail keywords
- `/blog` directory with articles about cuisine, culture, chef interviews
- Internal linking between blog and restaurant pages
- Recipe schema for featured dishes

---

### Phase 5: Performance & Core Web Vitals (Ongoing)

SEO is tied to performance. Current status:

**Image optimization:**
✅ Using `next/image` with proper `fill`, `sizes`
⚠️ Consider adding `placeholder="blur"` for hero images (need blurDataURL)
⚠️ Gallery images use grayscale filter - CSS-only, OK for performance

**JavaScript:**
✅ Server components for data fetching
⚠️ Many client components (Navbar, Hero, ContactSection) - bundle size impact
- Consider moving non-interactive parts to server where possible

**Lazy loading:**
✅ Images with `loading="lazy"` below the fold (implicit in next/image)
⚠️ Lightbox component loads all gallery images at once - consider virtualization

**Monitoring:**
- Set up Google Search Console for domain
- Monitor Core Web Vitals (LCP, FID, CLS)
- Use Next.js Analytics if available

---

## 4. Implementation Checklist

### Week 1 Tasks

- [ ] **Create `lib/seo.ts`** - utility functions for metadata generation
- [ ] **Update `app/layout.tsx`** with base meta tags
- [ ] **Add `generateMetadata`** to each page:
  - [ ] `app/page.tsx` (listing page)
  - [ ] `app/[restaurant]/page.tsx`
  - [ ] `app/[restaurant]/about/page.tsx`
  - [ ] `app/[restaurant]/menu/page.tsx`
  - [ ] `app/[restaurant]/contact/page.tsx`
  - [ ] `app/[restaurant]/brand/page.tsx`
  - [ ] `app/[restaurant]/company-information/page.tsx`
- [ ] **Create `app/sitemap.ts`**
- [ ] **Create `app/robots.ts`**
- [ ] **Create `components/structured-data.tsx`** and add to all pages
- [ ] **Fix image alt text** in all components
- [ ] **Add canonical URLs** to metadata

### Week 2 Tasks

- [ ] **Add JSON-LD** specific schemas per page type
  - [ ] Restaurant schema (all pages)
  - [ ] Menu schema (menu page)
  - [ ] Contact page schema
  - [ ] Organization schema (company info)
- [ ] **Implement proper heading hierarchy** audit
- [ ] **Create Open Graph images** (dynamic OG images with `@vercel/og` optional)
- [ ] **Add Twitter Card metadata**
- [ ] **Test with Google Rich Results Test**
- [ ] **Submit sitemap** to Google Search Console

### Week 3 Tasks

- [ ] **Review and optimize** all page titles & descriptions (50-60 char titles, 150-160 desc)
- [ ] **Add FAQ schema** to contact page (common questions)
- [ ] **Add breadcrumb schema** for site navigation
- [ ] **Implement `noindex`** on `brand` page if thin content
- [ ] **Add `robots` meta tag** to API routes: `noindex, nofollow`
- [ ] **Set up monitoring** (Search Console, Analytics)
- [ ] **Run Lighthouse SEO audit** (target >90)

### Ongoing Tasks

- [ ] **Maintain structured data** when restaurant data changes
- [ ] **Update sitemap** automatically (already dynamic via code)
- [ ] **Monitor search rankings** for key terms
- [ ] **Add new restaurants** with complete SEO data
- [ ] **Regular content updates** to keep pages fresh

---

## 5. Code Examples

### 5.1 `lib/seo.ts` - Metadata Utilities

```typescript
import { Metadata } from 'next'
import { Restaurant, RestaurantData } from './restaurant'

const DOMAIN = 'https://restaurantsite.io'

export function generateRestaurantMetadata(
  data: RestaurantData,
  slug: string,
  pathname: string = '/'
): Metadata {
  const title = `${data.name} | Authentic Japanese Dining in Tokyo`
  const description = data.about?.content || data.description
  const canonical = `${DOMAIN}/${slug}${pathname}`
  const heroImage = data.hero?.slides?.[0]?.image || data.logo

  return {
    title,
    description: description.substring(0, 160),
    keywords: [
      data.name,
      'Japanese restaurant',
      'authentic cuisine',
      'Tokyo dining',
      data.menu?.map(item => item.category).join(', '),
    ].join(', '),
    authors: [{ name: data.name }],
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: data.name,
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: `${data.name} - Authentic Japanese Dining Experience`,
        },
      ],
      locale: 'en_US',
      type: 'restaurant.restaurant' as const,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [heroImage],
    },
    alternates: {
      canonical,
    },
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: data.name,
        description: data.description,
      }),
    },
  }
}
```

### 5.2 Component: `components/seo/JsonLd.tsx`

```typescript
'use client'

import { Script } from 'next/script'
import { useEffect, useState } from 'react'

interface JsonLdProps {
  json: Record<string, unknown>
}

export function JsonLd({ json }: JsonLdProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}
```

---

## 6. Testing & Validation

### 6.1 Tools to Use

1. **Google Search Console** - submit sitemap, monitor indexing
2. **Google Rich Results Test** - validate structured data
3. **Lighthouse (Chrome DevTools)** - SEO score audit
4. **Screaming Frog SEO Spider** - crawl entire site
5. **PageSpeed Insights** - performance + SEO correlation
6. **Schema Markup Validator** (validator.schema.org)

### 6.2 Validation Checklist per Page

For `/[slug]` (home):
- ✅ Title includes restaurant name + location/cuisine
- ✅ Meta description 150-160 chars, compelling
- ✅ Open Graph image present and 1200x630px minimum
- ✅ Canonical URL set correctly
- ✅ Restaurant JSON-LD valid
- ✅ H1 only once per page
- ✅ Images have descriptive alt text
- ✅ No JavaScript-rendered critical content

For `/[slug]/menu`:
- ✅ Menu items readable as text (not just images)
- ✅ MenuItem schema for at least top 5 dishes (optional)
- ✅ Prices in structured format

---

## 7. Common Pitfalls & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Duplicate content (Translate) | Google Translate JS modifies DOM | Add `data-translate="no"` to main content, use `hreflang` if creating separate translated URLs |
| Thin content on `/brand` page | PDF generator, little text | Add `noindex, follow` robots meta |
| Dynamic pages not indexed | No sitemap, no internal linking | Ensure sitemap includes all restaurant slugs, add cross-linking between restaurants if relevant |
| Missing alt images | Generic alt text | Audit all Image components, replace with content-based alt from data |
| Slow LCP from hero images | Large unsized images | Already using next/image with fill, but add `sizes="100vw"` for hero, consider WebP via `loader` config |

---

## 8. Monitoring & Maintenance

### 8.1 KPI Tracking

- **Indexed pages:** Search Console → Pages indexed
- **Search impressions & clicks:** By restaurant name, dish names
- **Average position:** Track top 10 keywords per restaurant
- **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Click-through rate (CTR):** Improve with better meta descriptions

### 8.2 Regular Audits (Monthly)

- Check for broken internal links
- Update stale content (menu changes, hours updates)
- Validate structured data after schema changes
- Review search performance for new/disappearing queries
- Check for crawl errors in Search Console

### 8.3 Content Update Process

When restaurant data changes:
1. Update JSON file in `/restaurants/[slug]/data.json`
2. Rebuild site (Next.js re-generates static pages if using SSR/SSG)
3. Sitemap auto-updates on next build
4. Search Console will recrawl within days

---

## 9. Future Enhancements

### 9.1 Advanced Features

**A. Dynamic OG Image Generation**
- Use `@vercel/og` to create branded OG images with restaurant name/logo
- Route: `app/api/og/[slug]/route.ts`

**B. Internationalized Routing**
- Create locale-specific paths: `/en/ramen-taro`, `/ja/ramen-taro`
- Translate metadata per locale
- Implement `i18n` in next.config

**C. Review Schema Integration**
- If adding review system: `Review` schema markup
- AggregateRating for overall score

**D. Reservation Schema**
- Add `BookingAction` schema for reservation CTAs
- Connect with Google Reserve if available

**E. Recipe Schema for Featured Dishes**
- For signature dishes, implement `Recipe` schema
- Include ingredients, cook time, nutrition (if available)

---

## 10. SEO-First Development Guidelines

For future feature additions:

1. **Always add metadata** when creating new pages
2. **Use semantic HTML** (heading hierarchy, lists, sections)
3. **Keep content server-rendered** (avoid pure client-side rendered text)
4. **Optimize images** before uploading (compress, proper dimensions)
5. **Add alt text** to ALL images (alt is required, not optional)
6. **Test with Lighthouse** before deploying new features
7. **Update sitemap** automatically (already dynamic)
8. **Document new SEO fields** in lib/restaurant.ts types

---

## 11. Next Immediate Steps (This Week)

1. ✅ Create `lib/seo.ts` with helper functions
2. ✅ Add `generateMetadata` to `/[slug]/page.tsx` (home)
3. ✅ Test metadata output with `next build` and view source
4. ✅ Deploy to staging, verify with Rich Results Test
5. ✅ Submit staging sitemap to Search Console (if accessible)
6. ✅ Repeat for remaining pages ([slug]/about, menu, contact)

---

## Appendix: File Reference

**Routes needing SEO updates:**
```
apps/web/app/
├── layout.tsx                          # Add base meta
├── page.tsx                            # Restaurant listing metadata
└── [restaurant]/
    ├── page.tsx                        # Restaurant home
    ├── about/page.tsx                  # About
    ├── menu/page.tsx                   # Menu
    ├── contact/page.tsx                # Contact
    ├── brand/page.tsx                  # Brand assets
    └── company-information/page.tsx    # Corporate info
```

**Components to update:**
```
packages/ui/src/components/
├── navbar.tsx                          # Add aria-labels, link titles
├── hero.tsx                            # Image alt already uses title ✓
├── contact-section.tsx                 # Iframe accessibility
├── image-slider.tsx                    # Alt text from props
├── gallery-section.tsx                 # Lightbox alt text
└── section-header.tsx                  # Already semantic ✓
```

**Data structures to enhance:**
```
lib/restaurant.ts - Add optional SEO fields:
- seo: {
    customTitle?: string,
    customDescription?: string,
    ogImage?: string,
    noindex?: boolean
  }
```

---

## Conclusion

This restaurant platform has solid technical foundations but lacks SEO implementation. By implementing:

1. **Dynamic metadata generation** (generateMetadata)
2. **Structured data (JSON-LD)** for rich results
3. **Sitemap + robots.txt** for crawlability
4. **Proper image alt text** and heading hierarchy
5. **Performance monitoring**

The site will be fully optimized for search engines. The multi-tenant architecture means improvementsscale automatically to all restaurant entries.

**Estimated time to full SEO implementation:** 2-3 weeks for initial release, ongoing optimization.

**Expected results (3-6 months):**
- Restaurant names appearing in local search results
- Menu pages ranking for dish-specific queries
- Sitemap submission → indexing of all restaurant pages within 2-4 weeks
- Rich snippets in SERPs (star ratings, hours, price range)
- 20-50% increase in organic traffic from local searchers
