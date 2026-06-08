# 🚀 Quick Start: SEO Implementation

## TL;DR

1. **Add Badge component** ✅ (already done - imported from UI package)
2. **Populate `data.json`** for each restaurant (see template)
3. **Visit `/seo`** - watch checkmarks turn green
4. **Add `generateMetadata`** to each page (copy from lib/seo.ts)
5. **Add `<JsonLd />`** component to each page
6. **Deploy** and submit sitemap

---

## Step 1: Populate data.json (5 min)

### Minimum Required Fields

Add this to **both** restaurants' `data.json`:

```json
{
  "seo": {
    "title": "Ramen Taro | Authentic Hakata Ramen in Higashiyamato, Tokyo",
    "description": "Experience authentic Hakata ramen at Ramen Taro since 1985. Our 48-hour tonkotsu broth and handmade noodles deliver the true taste of Fukuoka. Located in Higashiyamato, Tokyo. Reservations recommended."
  },
  "images": {
    "heroImage": {
      "url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
      "alt": "Bowl of rich tonkotsu ramen with chashu pork, soft-boiled egg, and nori"
    },
    "logo": {
      "url": "/images/logo.png",
      "alt": "Ramen Taro logo"
    }
  },
  "schema": {
    "priceRange": "$$",
    "servesCuisine": ["Japanese", "Ramen"],
    "acceptsReservations": true
  },
  "social": {
    "sameAs": [
      "https://www.google.com/maps/place/Ramen-Taro",
      "https://www.instagram.com/ramen_taro_tokyo"
    ]
  },
  "localSEO": {
    "city": "Higashiyamato",
    "region": "Tokyo",
    "placeId": "ChIJN1t_tDeuGGAR9AG-B4cQx8Y"
  }
}
```

**Get Place ID:** Go to Google Maps → search your restaurant → click "Share" → "Embed" → extract from URL or use https://developers.google.com/maps/documentation/places/web-service/place-id

---

## Step 2: Verify in `/seo` Dashboard

```bash
npm run dev
# Visit http://localhost:3000/seo
```

You should see:
- ✅ Green checkmarks for title, description, ogImage, alt-text
- ⚠️ Yellow/red for structuredData (not implemented yet in code)
- SERP preview accurate

If still red, fix missing fields.

---

## Step 3: Implement generateMetadata (10 min per page)

### Home Page (`app/[restaurant]/page.tsx`)

Add after imports, before component:

```typescript
import { Metadata } from 'next'
import { generateHomeMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant } = await getRestaurant(slug)
  return generateHomeMetadata(restaurant.data, slug)
}
```

### About Page (`app/[restaurant]/about/page.tsx`)

```typescript
import { generateAboutMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant } = await getRestaurant(slug)
  return generateAboutMetadata(restaurant.data, slug)
}
```

### Menu Page

```typescript
import { generateMenuMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant } = await getRestaurant(slug)
  return generateMenuMetadata(restaurant.data, slug)
}
```

### Contact Page

```typescript
import { generateContactMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant } = await getRestaurant(slug)
  return generateContactMetadata(restaurant.data, slug)
}
```

### Brand Page (noindex)

```typescript
import { generateBrandMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant } = await getRestaurant(slug)
  return generateBrandMetadata(restaurant.data, slug)
}
```

### Company Information Page

```typescript
import { generateCompanyMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant } = await getRestaurant(slug)
  return generateCompanyMetadata(restaurant.data, slug)
}
```

---

## Step 4: Add Structured Data (JsonLd Component)

In each page component, add inside the return (before main content):

```typescript
import { JsonLd } from '@/components/seo/JsonLd'

export default async function RestaurantPage({ params }) {
  const { restaurant } = await getRestaurant(slug)

  return (
    <>
      <JsonLd 
        restaurant={restaurant.data} 
        slug={slug} 
        pageType="home"  // Change per page: 'about', 'menu', 'contact', 'company'
      />
      <main>...</main>
    </>
  )
}
```

**Page type mapping:**
- Home: `'home'`
- About: `'about'`
- Menu: `'menu'`
- Contact: `'contact'`
- Brand: skip (no index)
- Company: `'company'`

---

## Step 5: Test

```bash
npm run build
npm run start
```

**Check each page:**
1. View source (`Ctrl+U` or ⌘+Option+U)
2. Search for `<title>` - should be custom
3. Search for `application/ld+json` - should have schema
4. Check image `alt` attributes

**Run Lighthouse:**
- Chrome DevTools → Lighthouse → SEO
- Target: >90

**Rich Results Test:**
- https://search.google.com/test/rich-results
- Paste URL → Test

---

## Step 6: Deploy & Submit to Google

1. Deploy to production
2. Go to Google Search Console
3. Add property (if new)
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`
5. URL Inspection → Request indexing for each restaurant homepage
6. Wait 2-4 days for indexing

---

## Common Fixes

### "Module not found: Can't resolve '@workspace/ui/components/badge'"

✅ Already fixed - Badge component added at `packages/ui/src/components/badge.tsx`

If it persists:
```bash
# Restart dev server
Ctrl+C
npm run dev
```

### "Cannot find module '@/lib/seo'"

Make sure file exists: `apps/web/lib/seo.ts`

### "Badge not in components.json"

That's fine - `components.json` is just shadcn/ui config. The Badge component was manually added.

---

## File Reference

### Created Files

```
📦 apps/web/
├── app/
│   ├── seo/page.tsx                   (✅ SEO dashboard)
│   ├── sitemap.ts                     (✅ auto sitemap)
│   ├── robots.ts                      (✅ robots.txt)
│   └── [restaurant]/
│       └── page.tsx                   (⬜ add generateMetadata)
├── components/
│   └── seo/
│       └── JsonLd.tsx                (✅ structured data)
└── lib/
    ├── seo.ts                         (✅ utilities)
    └── restaurant.ts                  (✅ types updated)

📦 packages/ui/src/components/
└── badge.tsx                         (✅ new Badge component)

📄 Documentation/
├── SEO-MASTER-PLAN.md
├── SEO-OPTIMIZATION-PLAN.md
├── SEO-ROUTES-SPEC.md
├── SEO-DASHBOARD-README.md
├── DATA-JSON-SEO-TEMPLATE.md
└── SEO-IMPLEMENTATION-SUMMARY.md

📄 restaurants/ramen-taro/data-seo-example.json  (✅ full example)
```

---

## Need Help?

1. **Dashboard not showing green?** → Check `/seo` → see missing fields
2. **Build error?** → Restart dev server
3. **Schema invalid?** → https://validator.schema.org/
4. **Meta tags missing?** → View source, check `generateMetadata` export exists

---

## What's Next?

After completing all steps:

- [ ] Monitor Google Search Console for indexing
- [ ] Check rankings after 2-4 weeks
- [ ] Add more reviews to `data.json.reviews` for star ratings
- [ ] Consider adding blog for long-tail keywords

---

**You're ready to go!** Start with Step 1: populate `data.json` and watch the `/seo` dashboard light up green.
