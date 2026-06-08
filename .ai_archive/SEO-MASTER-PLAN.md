# RestaurantSite SEO Master Plan

**Complete Implementation Guide for Multi-Tenant Restaurant Websites**

**Last Updated:** April 29, 2026  
**Project:** RestaurantSite Platform (Next.js 16, App Router, Monorepo)  
**Goal:** Full SEO optimization across all restaurant client sites

---

## 📋 Executive Summary

This repository contains a complete SEO implementation plan for a multi-tenant restaurant website platform. Each restaurant gets its own subdirectory site (e.g., `/ramen-taro`, `/sushi-yama`) with individual SEO metadata, structured data, and content optimization.

**Status:** Foundation built, SEO implementation pending  
**Routes:** 7 per restaurant (home, about, menu, contact, brand, company-info, plus listing)  
**Timeline:** 2-3 weeks to full implementation  
**Expected Impact:** 20-50% increase in organic traffic within 3-6 months

---

## 🗺️ Documentation Structure

```
restaurantsite/
├── SEO-MASTER-PLAN.md              ← YOU ARE HERE (overview & index)
├── SEO-OPTIMIZATION-PLAN.md        ← Technical implementation details
├── SEO-ROUTES-SPEC.md              ← Per-route SEO requirements
├── SEO-DASHBOARD-README.md         ← /seo route documentation
├── DATA-JSON-SEO-TEMPLATE.md       ← Complete data.json template
├── apps/
│   └── web/
│       ├── app/
│       │   ├── seo/page.tsx        ← ✅ SEO Preview Dashboard (created)
│       │   ├── sitemap.ts          ← ✅ Sitemap generator (created)
│       │   ├── robots.ts           ← ✅ Robots.txt (created)
│       │   ├── layout.tsx          ← ⚠️  Needs base meta tags
│       │   ├── page.tsx            ← ⚠️  Needs generateMetadata
│       │   └── [restaurant]/
│       │       ├── page.tsx        ← ⚠️  Needs generateMetadata (PRIMARY)
│       │       ├── about/page.tsx  ← ⚠️  Needs generateMetadata
│       │       ├── menu/page.tsx   ← ⚠️  Needs generateMetadata
│       │       ├── contact/page.tsx← ⚠️  Needs generateMetadata
│       │       ├── brand/page.tsx  ← ⚠️  Needs noindex metadata
│       │       └── company-information/page.tsx ← ⚠️  Needs metadata
│       ├── components/
│       │   └── seo/
│       │       └── JsonLd.tsx     ← ✅ Structured data component (created)
│       └── lib/
│           ├── seo.ts              ← ✅ SEO utilities (created)
│           └── restaurant.ts       ← ⚠️  Interfaces updated (SEO fields added)
└── restaurants/
    ├── ramen-taro/
    │   └── data.json               ← ⚠️  Needs SEO fields populated
    └── sushi-yama/
        └── data.json               ← ⚠️  Needs SEO fields populated
```

---

## 🎯 Quick Start: 5-Minute Implementation

### For Each Restaurant:

1. **Add SEO fields to `data.json`** (minimum viable)
   ```json
   {
     "seo": {
       "title": "Restaurant Name | Cuisine in City",
       "description": "150-160 char description with keywords"
     },
     "images": {
       "heroImage": { "url": "...", "alt": "Descriptive text" }
     },
     "schema": {
       "priceRange": "$$",
       "servesCuisine": ["Japanese", "Ramen"]
     },
     "social": {
       "sameAs": ["https://instagram.com/restaurant"]
     },
     "localSEO": {
       "city": "Tokyo",
       "placeId": "ChIJ..." (from Google Maps)
     }
   }
   ```

2. **Visit `/seo` dashboard**
   - See red ✗ checkmarks turn green ✓ as you add fields
   - Character count warnings appear in real-time

3. **Implement `generateMetadata` in code**
   - Use `lib/seo.ts` helpers
   - See "Implementation Tasks" below

4. **Test**
   ```bash
   npm run build
   npm run start
   # Visit each page, view source for meta tags
   # Test with Google Rich Results Test
   ```

---

## ✅ Completed Tasks

| Task | File | Status |
|------|------|--------|
| SEO Dashboard route (`/seo`) | `app/seo/page.tsx` | ✅ Done |
| SEO utility functions | `lib/seo.ts` | ✅ Done |
| SEO TypeScript interfaces | `lib/restaurant.ts` | ✅ Done |
| JSON-LD component | `components/seo/JsonLd.tsx` | ✅ Done |
| Sitemap generator | `app/sitemap.ts` | ✅ Done |
| Robots.txt | `app/robots.ts` | ✅ Done |
| Data template (full) | `DATA-JSON-SEO-TEMPLATE.md` | ✅ Done |
| Data template (example) | `restaurants/ramen-taro/data-seo-example.json` | ✅ Done |
| Route-specific specs | `SEO-ROUTES-SPEC.md` | ✅ Done |
| Implementation plan | `SEO-OPTIMIZATION-PLAN.md` | ✅ Done |
| Dashboard docs | `SEO-DASHBOARD-README.md` | ✅ Done |

---

## ⏳ Implementation Tasks (Next)

### Phase 1: Metadata Implementation (Week 1)

- [ ] **Update `app/layout.tsx`** with base meta tags
- [ ] **Add `generateMetadata` to** `app/[restaurant]/page.tsx` (home) - HIGHEST PRIORITY
- [ ] **Add `generateMetadata` to** `app/[restaurant]/about/page.tsx`
- [ ] **Add `generateMetadata` to** `app/[restaurant]/menu/page.tsx`
- [ ] **Add `generateMetadata` to** `app/[restaurant]/contact/page.tsx`
- [ ] **Add `generateMetadata` to** `app/[restaurant]/brand/page.tsx` (with `noindex: true`)
- [ ] **Add `generateMetadata` to** `app/[restaurant]/company-information/page.tsx`
- [ ] **Add structured data** (`<JsonLd />` component) to all pages except brand
- [ ] **Fix image alt text** throughout (use data.json fields)
- [ ] **Integrate sitemap** (auto-served at `/sitemap.xml`)
- [ ] **Integrate robots.txt** (auto-served at `/robots.txt`)

### Phase 2: Data Population (Week 1-2)

- [ ] **Update Ramen Taro** `data.json` with all SEO fields
- [ ] **Update Sushi Yama** `data.json` with all SEO fields  
- [ ] **Validate** JSON syntax & TypeScript types
- [ ] **Verify** `/seo` dashboard shows all green ✓

### Phase 3: Testing & Validation (Week 2)

- [ ] **Lighthouse SEO audit** (target >90/100)
- [ ] **Google Rich Results Test** - validate all structured data
- [ ] **Fetch as Google** (Search Console) for each page
- [ ] **Check core web vitals** (LCP, FID, CLS)
- [ ] **Verify canonical URLs** in source
- [ ] **Test OG sharing** (Facebook, Twitter, LinkedIn debuggers)

### Phase 4: Deployment (Week 3)

- [ ] **Deploy to staging** (preview domain)
- [ ] **Submit staging sitemap** to Search Console
- [ ] **Resolve any indexing errors**
- [ ] **Deploy to production**
- [ ] **Submit production sitemap**
- [ ] **Set up monitoring** (Search Console, Analytics)

---

## 📊 SEO Success Criteria

### Immediate (Post-Launch, 2 weeks)
- ✅ All pages indexed in Google Search Console
- ✅ No crawl errors
- ✅ Structured data valid (no errors in Rich Results Test)
- ✅ Lighthouse SEO score > 85

### Short-term (1-3 months)
- 📈 Restaurant names ranking on page 1 for "restaurant name" searches
- 📈 Menu pages ranking for dish-specific queries ("tonkotsu ramen tokyo")
- 📈 Contact page ranking for "restaurant phone" queries
- 📈 Impressions increasing 20% month-over-month

### Long-term (3-6 months)
- 📈 Organic traffic up 30-50%
- 📈 Rich snippets appearing (star ratings, hours, price range)
- 📈 Click-through rate (CTR) improving due to better meta descriptions
- 📈 Conversions (calls, reservations) from organic search

---

## 🎯 Route-by-Route SEO Quick Reference

| Route | Priority | Title Template | Description Length | Schema |
|-------|----------|----------------|-------------------|---------|
| `/` (listing) | Medium | Platform description | 150-160 | ItemList |
| `/[slug]` (home) | **CRITICAL** | `{name} | {cuisine} in {city}` | 150-160 | Restaurant |
| `/[slug]/about` | High | `About {name} | Our Story` | 150-160 | AboutPage |
| `/[slug]/menu` | **CRITICAL** | `{name} Menu | Prices` | 150-160 | Menu |
| `/[slug]/contact` | High | `Contact {name}` | < 150 | ContactPoint |
| `/[slug]/brand` | Low | `{name} Brand Assets` | -- | **noindex** |
| `/[slug]/company` | Low | `{name} Company Info` | -- | Org |

---

## 📁 Data Structure Reference

### New Top-Level Fields in `data.json`

```typescript
interface RestaurantData {
  // ... existing fields ...
  
  // NEW SEO sections
  seo?: {
    title?: string                           // Meta title
    description?: string                     // Meta description
    keywords?: string[]                      // Keywords meta
    noindex?: boolean                        // noindex flag
    canonical?: string                       // Canonical URL
    menuTitle?: string                       // Menu page title
    aboutTitle?: string                      // About page title
    contactTitle?: string                    // Contact page title
    // ...
  }
  
  social?: {
    ogImage?: string                         // OG image URL
    ogLocale?: string                        // OG locale (en_US)
    twitterCard?: string                     // Twitter card type
    twitterSite?: string                     // @handle
    sameAs?: string[]                        // Social URLs
  }
  
  schema?: {
    priceRange?: "$" | "$$" | "$$$" | "$$$$" // Price level
    servesCuisine?: string[]                 // Cuisine types
    acceptsReservations?: boolean            // Reservation button in SERP
    isTakeout?: boolean                      // Takeout available
    aggregateRating?: {                     // Star ratings
      ratingValue: number
      reviewCount: number
      source?: string
    }
  }
  
  localSEO?: {
    city?: string                            // Tokyo, Osaka, etc.
    region?: string                          // Tokyo-to, etc.
    placeId?: string                         // Google Maps Place ID
    googleMapsUrl?: string                   // Maps URL
  }
  
  images?: {
    logo?: { url: string; alt: string }
    heroImage?: { url: string; alt: string }
    coverImage?: { url: string; alt: string }
    gallery?: Array<{ url: string; alt: string }>
    team?: Array<{ url: string; alt: string }>
  }
  
  content?: {
    tagline?: string                         // Short slogan
    mission?: string                         // Mission statement
    founder?: { name; role; bio; image; }    // Founder bio
  }
  
  operations?: {
    paymentMethods?: string[]
    dietaryOptions?: { vegetarian: boolean; /* ... */ }
    features?: { wifi: boolean; parking: string; /* ... */ }
  }
  
  reviews?: {
    aggregate?: { ratingValue; reviewCount }
    individual?: Array<{ author; rating; reviewBody }>
  }
  
  // ... more
}
```

---

## 🔧 Utility Functions (`lib/seo.ts`)

**Exported functions:**

| Function | Purpose | Returns |
|----------|---------|---------|
| `generateHomeMetadata()` | Homepage SEO metadata | `Metadata` object |
| `generateAboutMetadata()` | About page metadata | `Metadata` |
| `generateMenuMetadata()` | Menu page metadata | `Metadata` |
| `generateContactMetadata()` | Contact page metadata | `Metadata` |
| `generateBrandMetadata()` | Brand page (noindex) | `Metadata` |
| `generateCompanyMetadata()` | Company info metadata | `Metadata` |
| `generateRestaurantSchema()` | Restaurant JSON-LD | `object` |
| `generateMenuSchema()` | Menu JSON-LD | `object` |
| `generateContactSchema()` | ContactPoint JSON-LD | `object[]` |
| `generateAboutPageSchema()` | AboutPage + Person | `object` |
| `validateSEOData()` | Data completeness check | `{isValid, missing, warnings}` |
| `truncate()` | Smart text truncation | `string` |
| `extractCity()` | Parse city from address | `string` |
| `detectCuisine()` | Guess cuisine from menu | `string` |

**Usage in page components:**
```typescript
import { generateHomeMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant } = await getRestaurant(slug)
  return generateHomeMetadata(restaurant.data, slug)
}
```

---

## 🎨 JSON-LD Component Usage

```tsx
import { JsonLd } from '@/components/seo/JsonLd'

export default async function RestaurantPage({ params }) {
  const { restaurant } = await getRestaurant(slug)
  
  return (
    <>
      <JsonLd 
        restaurant={restaurant.data} 
        slug={slug} 
        pageType="home" 
      />
      {/* Rest of page */}
    </>
  )
}
```

**Behavior by page type:**
- `home` → Restaurant schema only
- `about` → Restaurant + AboutPage + Person (founder)
- `menu` → Restaurant + Menu
- `contact` → Restaurant + ContactPoint array
- `company` → Organization schema
- `brand` → No schema (thin content)

---

## 🧪 Testing & QA

### Manual Testing Checklist

**Per page, view source and verify:**

1. **Meta tags** (within first 10 lines):
   ```html
   <title>...</title>
   <meta name="description" content="...">
   <link rel="canonical" href="...">
   ```

2. **Open Graph tags**:
   ```html
   <meta property="og:title" content="...">
   <meta property="og:description" content="...">
   <meta property="og:image" content="...">
   ```

3. **Twitter Card tags**:
   ```html
   <meta name="twitter:card" content="summary_large_image">
   ```

4. **Structured data** (search for `application/ld+json`):
   ```html
   <script type="application/ld+json">
   { "@context": "https://schema.org", "@type": "Restaurant", ... }
   </script>
   ```

5. **Image alt attributes**:
   ```html
   <img src="..." alt="Descriptive alt text here">
   ```

### Automated Testing

```bash
# 1. Lighthouse (Chrome DevTools)
# Open page → DevTools → Lighthouse → SEO category
# Target: >90/100

# 2. Rich Results Test
# https://search.google.com/test/rich-results
# Paste URL → Test

# 3. Schema Markup Validator
# https://validator.schema.org/
# Paste JSON-LD → Validate

# 4. Screaming Frog SEO Spider
# Crawl site → Check meta descriptions, titles, alt text

# 5. View source & search for "noindex"
# Brand page should have: <meta name="robots" content="noindex, follow">
```

### Dashboard Validation

Visiting `/seo` should show:
- All green ✓ checkmarks for pages with complete data
- Character counts: Title 50-60, Desc 150-160 (blue = good, yellow = warn, red = bad)
- SERP preview accurate (matches what Google will show)

---

## 🚨 Common Pitfalls & Solutions

| Problem | Cause | Fix |
|---------|-------|-----|
| All cards in `/seo` show ✗ missing | `seo` object not in data.json | Add `"seo": { "title": "...", "description": "..." }` |
| OG image not showing | Wrong URL or CORS blocked | Verify image accessible, add to `remotePatterns` in next.config |
| Duplicate meta titles | Missing `generateMetadata` implementations | Add `generateMetadata` export to each page |
| Schema validation error | JSON syntax incorrect | Validate with schema.org validator |
| Noindex not respected | Missing `robots` meta tag | Add `robots: { index: false }` to metadata |
| Images not indexed | Missing alt text | Fill `images.*.alt` in data.json |

---

## 📈 Monitoring & Maintenance

### Google Search Console

1. **Submit sitemap**: `https://restaurantsite.io/sitemap.xml`
2. **Monitor Coverage**:
   - Errors (red) → fix immediately
   - Valid with warnings → investigate
   - Valid → good
3. **Performance report**:
   - Track impressions, clicks, CTR, position
   - Filter by page (e.g., `/*/menu` for all menu pages)
4. **URL Inspection**:
   - Test individual pages (especially new ones)
   - Request indexing after SEO implementation

### Google Analytics 4

Track:
- **Organic search traffic** by landing page
- **Conversions** (calls, reservations) from organic
- **Bounce rate** & time on page (quality signals)

### Automated Monitoring (optional)

Set up cron job to:
```bash
# Daily check for broken links
npx broken-link-checker https://restaurantsite.io

# Weekly Lighthouse CI
npx @lhci/cli auto

# Monthly SEO audit
npx seo-audit-cli https://restaurantsite.io
```

---

## 🗓️ Implementation Timeline

**Week 1: Foundation**
- Day 1-2: Populate data.json SEO fields for all restaurants
- Day 3-4: Implement `generateMetadata` for all 7 routes
- Day 5: Add JsonLd components + test

**Week 2: Sitemap + Robots + Testing**
- Day 1: Create sitemap.ts + robots.ts
- Day 2-3: Test locally (Lighthouse, Rich Results Test)
- Day 4: Fix validation errors
- Day 5: Deploy to staging

**Week 3: Launch**
- Day 1: Submit staging sitemap, request indexing
- Day 2-3: Verify indexing (Search Console)
- Day 4: Deploy to production
- Day 5: Submit production sitemap

**Ongoing (Monthly)**
- Check Search Console for new errors
- Update menus/hours data.json when restaurant changes
- Monitor rankings & adjust metadata if needed

---

## 📚 Documentation Index

| Document | Purpose | Read If... |
|----------|---------|------------|
| **SEO-MASTER-PLAN.md** | Central hub, index, timeline | Starting point, project manager |
| **SEO-OPTIMIZATION-PLAN.md** | Technical architecture, code examples | Senior dev, implementer |
| **SEO-ROUTES-SPEC.md** | Per-route SEO requirements | Developer implementing metadata |
| **SEO-DASHBOARD-README.md** | `/seo` route documentation | QA, content team |
| **DATA-JSON-SEO-TEMPLATE.md** | Complete data.json structure | Content editor, data entry |
| **DATA-JSON-SEO-FIELDS-REF.md** *(this doc)* | Full template with examples | Data population guide |

---

## 🎓 Training Materials

### For Developers

1. Read `SEO-OPTIMIZATION-PLAN.md` (architecture)
2. Review `SEO-ROUTES-SPEC.md` (what to implement per route)
3. Copy code examples from `lib/seo.ts` (utility functions)
4. Use `JsonLd` component pattern from `components/seo/JsonLd.tsx`
5. Test with `/seo` dashboard

### For Content Editors

1. Read `DATA-JSON-SEO-TEMPLATE.md`
2. Fill SEO fields in `data.json` for each restaurant:
   - `seo.title` (50-60 chars, includes location)
   - `seo.description` (150-160 chars, compelling)
   - `images.heroImage.alt` (descriptive sentence)
   - `social.sameAs` (at least Google Maps + one social)
   - `schema.priceRange` (`$`–`$$$$`)
   - `localSEO.placeId` (from Google Maps)
3. Validate in `/seo` dashboard → all green ✓

---

## 🆘 Support & Questions

**Found a bug?** Open issue with:
1. Route name
2. Current behavior
3. Expected behavior
4. Screenshot from `/seo` dashboard

**Need a new field?** 
- Update `restaurant.ts` interfaces
- Add to `DATA-JSON-SEO-FIELDS-REF.md`
- Document in `SEO-ROUTES-SPEC.md`
- Add to `lib/seo.ts` helpers

**Stuck on implementation?**
- Check `/seo` dashboard → shows missing fields
- Review route-specific spec in `SEO-ROUTES-SPEC.md`
- Copy example code from `SEO-OPTIMIZATION-PLAN.md`

---

## 📝 Changelog

**v1.0** (2026-04-29) - Initial release
- ✅ Created SEO dashboard route (`/seo`)
- ✅ Built `lib/seo.ts` utility library
- ✅ Added JSON-LD component
- ✅ Implemented sitemap + robots
- ✅ Expanded TypeScript interfaces
- ✅ Wrote 5 comprehensive documentation files

---

## 🎯 Success Metrics Dashboard

Once live, track these KPIs:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Pages indexed | 100% | Search Console Coverage |
| Lighthouse SEO score | >90 | Chrome DevTools |
| Rich results impressions | Increasing | Search Console Performance |
| Organic traffic | +30% in 6mo | Google Analytics |
| CTR from SERP | >3% | Search Console |
| Avg position for brand | #1 | Search Console |
| Avg position for menu items | Top 10 | Search Console |

---

## 🚀 Ready to Deploy?

**Before going live, ensure:**

1. ✅ All restaurants have complete `data.json` (check `/seo` dashboard)
2. ✅ `generateMetadata` implemented on all routes
3. ✅ JsonLd component added to all pages
4. ✅ Sitemap loads at `/sitemap.xml`
5. ✅ Robots.txt loads at `/robots.txt`
6. ✅ No `noindex` on restaurant pages (only `/brand`)
7. ✅ All images have descriptive alt text
8. ✅ Lighthouse SEO >90 on all pages
9. ✅ Rich Results Test passes
10. ✅ Deploy → submit sitemap → monitor

**Good luck! 🍀**

---

**Questions?** Refer to the specific documentation files above or open an issue.
