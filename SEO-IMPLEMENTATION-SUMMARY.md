# SEO Implementation Summary

## Files Created

### 1. SEO Dashboard Route (`/seo`)
**File:** `apps/web/app/seo/page.tsx`  
**Purpose:** Internal diagnostic tool showing SEO status per restaurant page  
**Features:** SERP preview cards, checklist, character counts, keyword cloud  
**Indexing:** `noindex, nofollow` (safe for internal use)

```
Route: /seo
Shows: 6 SEO cards per restaurant + platform stats
Usage: Visit http://localhost:3000/seo while developing
```

---

### 2. SEO Utility Library
**File:** `apps/web/lib/seo.ts`  
**Purpose:** Helper functions for generating metadata & structured data  
**Exports:**

```typescript
// Metadata generators (per route)
generateHomeMetadata(data, slug)
generateAboutMetadata(data, slug)
generateMenuMetadata(data, slug)
generateContactMetadata(data, slug)
generateBrandMetadata(data, slug)
generateCompanyMetadata(data, slug)
generateListingMetadata(restaurantCount)

// Structured data generators
generateRestaurantSchema(data, slug)
generateMenuSchema(data, slug)
generateContactSchema(data)
generateAboutPageSchema(data, slug)
generatePersonSchema(person)
generateOrganizationSchema(data)

// Utilities
truncate(text, maxLength)
extractCity(address)
detectCuisine(data)
formatOpeningHours(hours)
getPriceRange(menu)
validateSEOData(data)
generateRestaurantSitemapEntries(slug, data)
```

---

### 3. TypeScript Interfaces (Updated)
**File:** `apps/web/lib/restaurant.ts`  
**Changes:** Added 8 new optional SEO interfaces to `RestaurantData`

**New nested interfaces:**
```typescript
seo?: { title, description, keywords, noindex, canonical, ... }
social?: { ogImage, ogLocale, twitterCard, twitterSite, sameAs }
schema?: { priceRange, servesCuisine, acceptsReservations, ... }
localSEO?: { city, region, placeId, googleMapsUrl, ... }
content?: { tagline, mission, founder, awards, ... }
images?: { logo, heroImage, coverImage, gallery, team }
operations?: { paymentMethods, dietaryOptions, features, services }
advancedSchema?: { foundedDate, numberOfEmployees, ... }
```

**Full doc:** See `DATA-JSON-SEO-FIELDS-REF.md` for field descriptions

---

### 4. JSON-LD Structured Data Component
**File:** `apps/web/components/seo/JsonLd.tsx`  
**Purpose:** Client component that injects schema.org JSON-LD scripts  
**Usage:**

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
      <main>...</main>
    </>
  )
}
```

**Schema output by page type:**
- `home` → Restaurant + BreadcrumbList
- `about` → Restaurant + AboutPage + Person (founder)
- `menu` → Restaurant + Menu
- `contact` → Restaurant + ContactPoint[]
- `company` → Organization
- `brand` → none (noindex page)

---

### 5. Sitemap Generator
**File:** `apps/web/app/sitemap.ts`  
**Purpose:** Dynamic sitemap.xml generation for all restaurants  
**Routes included:**
- `/` (platform listing)
- `/[slug]` (home)
- `/[slug]/menu`
- `/[slug]/about`
- `/[slug]/contact`
- `/[slug]/company-information` (if data exists)
- `/[slug]/brand` (low priority)

**URL:** Automatically served at `https://yoursite.com/sitemap.xml`  
**Priority:** High for home & menu (0.9, 0.8), low for brand/company (0.3)  
**Change frequency:** Weekly for menu/home, monthly for static pages

---

### 6. Robots.txt
**File:** `apps/web/app/robots.ts`  
**Purpose:** Search engine crawl directives  
**Rules:**
- Allow all on restaurant pages (default)
- Disallow `/api/`, `/_next/`, `/seo`, `/admin/`
- Point to sitemap.xml

**URL:** `https://yoursite.com/robots.txt`  
**Blocks:**
- API routes from indexing
- Admin/dashboard pages
- GPTBot & CCBot (AI scrapers)

---

### 7. Documentation Suite

| File | Purpose | Audience |
|------|---------|----------|
| `SEO-MASTER-PLAN.md` | Central index & timeline | PM, team lead |
| `SEO-OPTIMIZATION-PLAN.md` | Technical architecture | Senior dev |
| `SEO-ROUTES-SPEC.md` | Per-route SEO requirements | Developer |
| `SEO-DASHBOARD-README.md` | `/seo` route docs | QA, content team |
| `DATA-JSON-SEO-TEMPLATE.md` | Complete data.json structure | Content editor |
| `DATA-JSON-SEO-FIELDS-REF.md` | Field-by-field examples | Data entry |

**Total:** 6 comprehensive guides, 15+ pages of documentation

---

## 🎯 Next Implementation Steps

### Step 1: Populate data.json (5 min per restaurant)

For **each restaurant** (`restaurants/ramen-taro/data.json`, `sushi-yama/data.json`):

```json
{
  "seo": {
    "title": "Ramen Taro | Authentic Hakata Ramen in Higashiyamato, Tokyo",
    "description": "Experience authentic Hakata ramen at Ramen Taro since 1985..."
  },
  "images": {
    "heroImage": {
      "url": "https://images.unsplash.com/...",
      "alt": "Rich tonkotsu ramen bowl with chashu pork"
    }
  },
  "schema": {
    "priceRange": "$$",
    "servesCuisine": ["Japanese", "Ramen"]
  },
  "social": {
    "sameAs": ["https://instagram.com/ramen_taro_tokyo"]
  },
  "localSEO": {
    "city": "Higashiyamato",
    "placeId": "ChIJN1t_tDeuGGAR9AG-B4cQx8Y"
  }
}
```

**Validation:** Visit `/seo` → all cards should turn green ✓

---

### Step 2: Implement generateMetadata (10 min per route)

In each `page.tsx` file:

```typescript
import { Metadata } from 'next'
import { getRestaurant } from '@/lib/restaurant'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateHomeMetadata } from '@/lib/seo'

// Add generateMetadata export
export async function generateMetadata(): Promise<Metadata> {
  const { restaurant } = await getRestaurant(slug)
  const metadata = generateHomeMetadata(restaurant.data, slug)
  return metadata
}

export default async function RestaurantPage({ params }) {
  const { restaurant } = await getRestaurant(slug)
  
  return (
    <>
      <JsonLd restaurant={restaurant.data} slug={slug} pageType="home" />
      {/* existing page content */}
    </>
  )
}
```

**Routes to update:**
1. `app/[restaurant]/page.tsx` → `pageType: 'home'`
2. `app/[restaurant]/about/page.tsx` → `pageType: 'about'`
3. `app/[restaurant]/menu/page.tsx` → `pageType: 'menu'`
4. `app/[restaurant]/contact/page.tsx` → `pageType: 'contact'`
5. `app/[restaurant]/brand/page.tsx` → `pageType: 'brand'` (noindex)
6. `app/[restaurant]/company-information/page.tsx` → `pageType: 'company'`

---

### Step 3: Update root layout (optional but recommended)

**File:** `app/layout.tsx`

```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* Apple touch icon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        {/* Theme color for mobile */}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

---

### Step 4: Test locally

```bash
# Build and start
npm run build
npm run start

# Test each route
- http://localhost:3000/ramen-taro
- http://localhost:3000/ramen-taro/menu
- http://localhost:3000/ramen-taro/about
- /seo dashboard → verify green checks

# View source → verify meta tags present
# Test structured data → Google Rich Results Test
```

---

### Step 5: Deploy & submit to Google

1. **Deploy to production**
2. **Submit sitemap** in Google Search Console:
   - URL: `https://yourdomain.com/sitemap.xml`
3. **URL Inspection** → Request indexing for each restaurant homepage
4. **Monitor** Search Console → Coverage report
5. **Wait 2-4 weeks** for indexing → Track impressions in Performance report

---

## 🎨 Customization Guide

### Change meta title format globally

**File:** `lib/seo.ts`, function `generateHomeMetadata()`

```typescript
export function generateHomeMetadata(...): Metadata {
  const title = data.seo?.title || 
    `${data.name} | ${detectCuisine(data)} in ${extractCity(data.address)}`
  // Customize above template as needed
}
```

### Add new SEO field

1. Add to `RestaurantData` interface in `lib/restaurant.ts`
2. Update `DATA-JSON-SEO-TEMPLATE.md`
3. Add to appropriate `generate*Metadata` function
4. Add input field to `/seo` dashboard (optional)

### Add custom schema for new page type

1. Create generator in `lib/seo.ts`:
   ```typescript
   export function generateMySchema(data, slug): object { ... }
   ```
2. Add to `JsonLd.tsx` `switch (pageType)` case
3. Update `SEO-ROUTES-SPEC.md` with schema requirements

---

## 🔍 Troubleshooting

### "All SEO cards show ✗ in /seo"

**Cause:** SEO fields not added to data.json yet  
**Solution:** Add minimum 3 fields (`seo.title`, `seo.description`, `images.heroImage.alt`)

### "generateMetadata is not exported" error

**Cause:** Missing export in page.tsx  
**Solution:** Add `export async function generateMetadata()` before component

### "Cannot find module '@/components/seo/JsonLd'"

**Cause:** JsonLd.tsx not in correct directory  
**Fix:** File should be at `apps/web/components/seo/JsonLd.tsx` (create `seo` folder)

### "Schema validation error"

**Cause:** Structured data doesn't match schema.org format  
**Fix:** Paste JSON-LD into https://validator.schema.org/ to debug

### "OG image broken"

**Cause:** Image URL blocked by CORS  
**Fix:** Add hostname to `next.config.js` `images.remotePatterns`

---

## 📞 Support & Resources

**Google Tools:**
- Rich Results Test: https://search.google.com/test/rich-results
- Search Console: https://search.google.com/search-console
- Schema Markup Validator: https://validator.schema.org/

**Testing:**
- Chrome DevTools → Lighthouse → SEO
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator

**Learning:**
- Next.js Metadata: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- Schema.org: https://schema.org/
- Google SEO Guide: https://developers.google.com/search/docs

---

## ✅ Final Checklist Before Launch

**Per Restaurant:**

- [ ] `data.json` has all SEO fields filled (see `/seo` dashboard green)
- [ ] `generateMetadata` implemented on all 6 pages
- [ ] `<JsonLd />` component added to all pages (except brand)
- [ ] All images have descriptive alt text
- [ ] Canonical URLs set correctly
- [ ] No `noindex` on restaurant pages (only brand page)
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] Lighthouse SEO > 90
- [ ] Rich Results Test passes (no errors)

**Deployment:**

- [ ] Deploy to production domain
- [ ] Add domain to Google Search Console
- [ ] Submit sitemap.xml
- [ ] Request indexing for homepage URLs
- [ ] Monitor indexing for 2 weeks

---

## 📚 Quick Reference Card

**Route → Metadata Generator → Page Type**

| URL | Function | Schema |
|-----|----------|--------|
| `/` | `generateListingMetadata()` | ItemList |
| `/[slug]` | `generateHomeMetadata()` | Restaurant |
| `/[slug]/about` | `generateAboutMetadata()` | AboutPage |
| `/[slug]/menu` | `generateMenuMetadata()` | Menu |
| `/[slug]/contact` | `generateContactMetadata()` | ContactPoint |
| `/[slug]/brand` | `generateBrandMetadata()` | (none, noindex) |
| `/[slug]/company` | `generateCompanyMetadata()` | Organization |

---

**You now have everything needed for full SEO implementation.** 🚀

Start by populating the data.json files, then watch the `/seo` dashboard turn green as you implement `generateMetadata`.

**Expected completion time:** 2-3 weeks for a developer familiar with Next.js.
