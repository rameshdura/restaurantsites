# generateMetadata Implementation Reference

Copy-paste these snippets into each page component to add SEO metadata.

---

## Prerequisites

All pages already have access to:
- `getRestaurant(slug)` from `@/lib/restaurant`
- `JsonLd` component from `@/components/seo/JsonLd`
- Helper functions from `@/lib/seo`

---

## Implementation Pattern

Each page needs **TWO things:**

1. **`export async function generateMetadata()`** - returns `Metadata`
2. **`<JsonLd />` component** inside the component JSX

---

## Page-Specific Implementations

### 1. Home Page
**File:** `apps/web/app/[restaurant]/page.tsx`

```typescript
import { Metadata } from 'next'
import { getRestaurant } from '@/lib/restaurant'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateHomeMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant } = await getRestaurant(slug)
  return generateHomeMetadata(restaurant.data, slug)
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { restaurant } = await getRestaurant(slug)

  return (
    <>
      <JsonLd 
        restaurant={restaurant.data} 
        slug={slug} 
        pageType="home" 
      />
      {/* existing JSX */}
    </>
  )
}
```

---

### 2. About Page
**File:** `apps/web/app/[restaurant]/about/page.tsx`

```typescript
import { Metadata } from 'next'
import { getRestaurant } from '@/lib/restaurant'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateAboutMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant } = await getRestaurant(slug)
  return generateAboutMetadata(restaurant.data, slug)
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { restaurant } = await getRestaurant(slug)

  return (
    <>
      <JsonLd 
        restaurant={restaurant.data} 
        slug={slug} 
        pageType="about" 
      />
      {/* existing JSX */}
    </>
  )
}
```

---

### 3. Menu Page
**File:** `apps/web/app/[restaurant]/menu/page.tsx`

```typescript
import { Metadata } from 'next'
import { getRestaurant } from '@/lib/restaurant'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateMenuMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant } = await getRestaurant(slug)
  return generateMenuMetadata(restaurant.data, slug)
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { restaurant } = await getRestaurant(slug)

  return (
    <>
      <JsonLd 
        restaurant={restaurant.data} 
        slug={slug} 
        pageType="menu" 
      />
      {/* existing JSX */}
    </>
  )
}
```

---

### 4. Contact Page
**File:** `apps/web/app/[restaurant]/contact/page.tsx`

```typescript
import { Metadata } from 'next'
import { getRestaurant } from '@/lib/restaurant'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateContactMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant } = await getRestaurant(slug)
  return generateContactMetadata(restaurant.data, slug)
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { restaurant } = await getRestaurant(slug)

  return (
    <>
      <JsonLd 
        restaurant={restaurant.data} 
        slug={slug} 
        pageType="contact" 
      />
      {/* existing JSX */}
    </>
  )
}
```

---

### 5. Brand Page (NOINDEX)
**File:** `apps/web/app/[restaurant]/brand/page.tsx`

```typescript
import { Metadata } from 'next'
import { getRestaurant } from '@/lib/restaurant'
import { generateBrandMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant } = await getRestaurant(slug)
  return generateBrandMetadata(restaurant.data, slug)
  // Note: This returns { robots: { index: false } } - page will be noindex
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { restaurant } = await getRestaurant(slug)

  return (
    // NO JsonLd needed for thin content page
    <>
      {/* existing JSX */}
    </>
  )
}
```

---

### 6. Company Information Page
**File:** `apps/web/app/[restaurant]/company-information/page.tsx`

```typescript
import { Metadata } from 'next'
import { getRestaurant } from '@/lib/restaurant'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateCompanyMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant } = await getRestaurant(slug)
  return generateCompanyMetadata(restaurant.data, slug)
}

export default async function CompanyInfoPage({ params }: CompanyInformationPageProps) {
  const { restaurant } = await getRestaurant(slug)

  return (
    <>
      <JsonLd 
        restaurant={restaurant.data} 
        slug={slug} 
        pageType="company" 
      />
      {/* existing JSX */}
    </>
  )
}
```

---

## Quick Checklist

For each page:
- [ ] Import `generate*Metadata` from `@/lib/seo`
- [ ] Add `export async function generateMetadata()` before component
- [ ] Call appropriate generator with `restaurant.data` and `slug`
- [ ] Import `JsonLd` from `@/components/seo/JsonLd` (except brand page)
- [ ] Add `<JsonLd restaurant={...} slug={slug} pageType="..." />` in JSX
- [ ] Verify pageType string matches: `'home' | 'about' | 'menu' | 'contact' | 'company'`

---

## Generator Function Reference

| Page | Function | pageType |
|------|----------|----------|
| Home | `generateHomeMetadata()` | `'home'` |
| About | `generateAboutMetadata()` | `'about'` |
| Menu | `generateMenuMetadata()` | `'menu'` |
| Contact | `generateContactMetadata()` | `'contact'` |
| Brand | `generateBrandMetadata()` | (none - skip JsonLd) |
| Company | `generateCompanyMetadata()` | `'company'` |

---

## What the Generators Do

Each generator:
1. **Reads** from `data.seo` (custom fields) OR falls back to auto-generated
2. **Builds** title: 50-60 chars optimal
3. **Builds** description: 150-160 chars optimal
4. **Selects** OG image (hero > logo > default)
5. **Sets** canonical URL using `process.env.NEXT_PUBLIC_SITE_URL`
6. **Configures** robots (index/follow or noindex for brand)
7. **Returns** `Metadata` object Next.js understands

---

## Testing After Implementation

```bash
# 1. Build
npm run build

# 2. Start production server
npm run start

# 3. View source for each page
#   Should see <title>Custom Restaurant Name...</title>
#   Should see <meta name="description" content="...">
#   Should see <script type="application/ld+json">{...}</script>

# 4. Check robots meta on brand page
#   Should see: <meta name="robots" content="noindex, follow">

# 5. Run Lighthouse
#   Chrome DevTools → Lighthouse → SEO → Score >90

# 6. Test structured data
#   https://search.google.com/test/rich-results
#   Paste URL → Check for errors
```

---

## Troubleshooting

### "generateMetadata is not exported above component"
**Fix:** Ensure `export async function generateMetadata()` is defined **before** the component default export.

### "Cannot find module '@/lib/seo'"
**Fix:** File should be at `apps/web/lib/seo.ts` (exists ✅)

### "No metadata generated - uses default title"
**Fix:** Check that `getRestaurant(slug)` returns data. If restaurant not found, `notFound()` is thrown.

### "Schema validation error"
**Fix:** Open browser console → view source → copy JSON-LD → paste into https://validator.schema.org/

---

## Expected Output

**Home page source snippet:**
```html
<title>Ramen Taro | Authentic Hakata Ramen in Higashiyamato, Tokyo</title>
<meta name="description" content="Experience authentic Hakata ramen at Ramen Taro since 1985...">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Ramen Taro",
  ...
}
</script>
```

**Brand page source snippet:**
```html
<title>Ramen Taro Brand Assets | Marketing Materials</title>
<meta name="robots" content="noindex, follow">
<!-- No JsonLd -->
```

---

**All 6 pages done?** → Move to testing phase → submit sitemap to Google Search Console.
