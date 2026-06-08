# Route-Level SEO Specification for RestaurantSite

**Document Version:** 1.0  
**Last Updated:** 2026-04-29  
**Purpose:** Define SEO requirements for each route in the multi-tenant restaurant platform

---

## Overview

Each restaurant site has 6 main pages plus the homepage listing. This document specifies the exact SEO elements required per route, including metadata, structured data, content optimization, and technical requirements.

---

## Table of Routes

| Route | Page Type | Primary SEO Goal | Target Keywords |
|-------|-----------|------------------|-----------------|
| `/` | Restaurant listing | Discoverability | "restaurant site", platform |
| `/[slug]` | Restaurant home | Brand + conversion | Restaurant name, location, cuisine |
| `/[slug]/about` | Story/heritage | Trust + E-E-A-T | History, chef, tradition |
| `/[slug]/menu` | Menu showcase | Menu search rankings | Dish names, prices, categories |
| `/[slug]/contact` | Contact + map | Local pack + directions | "near me", reservations, phone |
| `/[slug]/brand` | Brand assets | Thin content - noindex | Marketing materials |
| `/[slug]/company-information` | Corporate info | Japanese compliance | Corporate details, registration |

---

## Route 1: Homepage (`/`)

**File:** `apps/web/app/page.tsx`  
**Type:** Restaurant listing (platform homepage)  
**Indexing:** ✅ INDEX (important for discovery)

### SEO Metadata

```typescript
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "RestaurantSite Platform | Multi-Tenant Restaurant Websites",
    description: "A high-performance, multi-tenant platform powering the next generation of restaurant websites. Discover authentic dining experiences at our partner restaurants.",
    keywords: ["restaurant website platform", "multi-tenant restaurant sites", "restaurant management", "dining experiences"],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: "RestaurantSite Platform",
      description: "Discover authentic dining experiences at our partner restaurants.",
      url: "https://restaurantsite.io",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "RestaurantSite Platform",
      description: "Discover authentic dining experiences at our partner restaurants.",
    },
  }
}
```

### Content SEO

- **H1:** "RestaurantSite Platform" (unique, descriptive)
- **H2s:** None (simple listing page)
- **Body content:** 150+ words describing the platform
- **Images:** Alt text for restaurant logos/cards: `"${restaurant.name} restaurant website"`

### Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Restaurant Sites",
  "description": "List of restaurant websites on the RestaurantSite platform",
  "numberOfItems": 2,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": "https://restaurantsite.io/ramen-taro",
      "name": "Ramen Taro"
    }
  ]
}
```

### Data.json Requirements

N/A (platform page only)

### Validation Checklist

- [ ] Title under 60 chars
- [ ] Description 150-160 chars
- [ ] OG image set (platform logo or hero)
- [ ] No duplicate meta tags
- [ ] Valid schema.org markup

---

## Route 2: Restaurant Home (`/[slug]`)

**File:** `apps/web/app/[restaurant]/page.tsx`  
**Type:** Restaurant homepage with hero, about preview, menu teaser, contact CTA  
**Indexing:** ✅ INDEX (primary landing page)

### SEO Metadata

**Title Formula:**
```
{restaurant.seo?.title || `${restaurant.data.name} | Authentic ${cuisine} in ${city}`}
```

**Examples:**
- `Ramen Taro | Authentic Hakata Ramen in Higashiyamato, Tokyo`
- `Sushi Yama | Premium Sushi & Sashimi in Ginza, Tokyo`

**Description Formula:**
```
{restaurant.seo?.description || 
 restaurant.about?.content?.substring(0, 160) || 
 restaurant.data.description}
```

**Target length:** 150-160 characters, includes:
- Restaurant name
- Specialty/cuisine
- Location (city/neighborhood)
- Unique differentiator (e.g., "since 1985", "award-winning")
- Call-to-action (e.g., "book a table", "view menu")

### Required Data.json Fields

```json
{
  "seo": {
    "title": "Ramen Taro | Authentic Hakata Ramen in Higashiyamato, Tokyo",
    "description": "Experience authentic Hakata ramen at Ramen Taro since 1985. Our 48-hour tonkotsu broth and handmade noodles deliver the true taste of Fukuoka. Reservations recommended.",
    "keywords": ["ramen Tokyo", "hakata ramen", "tonkotsu", "Japanese noodles", "Higashiyamato dining"],
    "noindex": false
  },
  "images": {
    "heroImage": {
      "url": "https://images.unsplash.com/...",
      "alt": "Rich tonkotsu ramen bowl with chashu pork, soft-boiled egg, and nori"
    }
  }
}
```

### Structured Data (JSON-LD)

**Primary Schema:** `Restaurant`

**Schema.org fields to populate from data.json:**
- `name` → `RestaurantData.name`
- `description` → `RestaurantData.description`
- `image` → `RestaurantData.hero.slides[0].image` OR `RestaurantData.logo`
- `address` → `RestaurantData.address` (parse into PostalAddress)
- `telephone` → `RestaurantData.phone`
- `email` → `RestaurantData.email`
- `priceRange` → `RestaurantData.schema.priceRange` (`$`, `$$`, `$$$`, `$$$$`)
- `servesCuisine` → `RestaurantData.schema.servesCuisine` array
- `openingHours` → format `RestaurantData.openingHours` to `Mo-Fr 11:00-22:00` format
- `acceptsReservations` → `RestaurantData.schema.acceptsReservations`
- `url` → `https://domain.com/[slug]`
- `sameAs` → `RestaurantData.social?.sameAs[]` (social profiles)

**Optional but recommended:**
- `aggregateRating` if `RestaurantData.reviews?.aggregate` exists
- `menu` URL if `RestaurantData.menuLink` exists

### Content Optimization

**Hero Section:**
- H1: Restaurant name (auto from data.name) ← **CRITICAL: Only one H1 per page**
- Hero slides: Each slide title should be unique, keyword-rich
  - Example: "Authentic Hakata Ramen" (good) vs "Welcome" (bad)

**About Preview:**
- H2: "Our Story" or `RestaurantData.about?.title` → "Our Culinary Heritage"
- Content: First 150 chars of `about.content` used in meta description
- Include primary keyword near start of first paragraph

**Menu Teaser Section:**
- H2: "Our Menu" or `RestaurantData.menuLink ? "View Full Menu" : "Featured Dishes"`
- Show 3-6 popular menu items with:
  - Descriptive names (not just "Ramen Set")
  - Price visible (important for search snippets)
  - Badges: "Popular", "Chef's Special", "Vegetarian"

**Contact CTA:**
- H2: "Visit Us Today" or "Reservations"
- Include phone number as text (click-to-call): `tel:+81387654321`
- Address as text (not just image)

**Image SEO:**
- All images need descriptive alt text from `RestaurantData.images.*.alt` fields
- If alt missing, generate from context:
  - Hero: `"${name} - ${slide.title}"` → `"Ramen Taro - Authentic Hakata Ramen"`
  - About image: `"${name} interior"` or `"${name} chef preparing dishes"`
  - Team photos: `"${name} - ${teamMember.role} ${teamMember.name}"`

### Internal Linking

**Must link to:**
- `/[slug]/menu` (anchor: "View Full Menu" or "Explore Our Menu")
- `/[slug]/about` (anchor: "Our Story" in about preview)
- `/[slug]/contact` (anchor: "Contact Us", "Get Directions")
- `/[slug]/company-information` (optional, footer)

**Breadcrumb markup:**
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://restaurantsite.io"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Ramen Taro",
      "item": "https://restaurantsite.io/ramen-taro"
    }
  ]
}
```

### Schema.org Checklist

- [x] Restaurant schema (full)
- [x] BreadcrumbList schema
- [ ] WebSite schema with SearchAction (optional)
- [ ] Social media profiles in `sameAs`

---

## Route 3: About Page (`/[slug]/about`)

**File:** `apps/web/app/[restaurant]/about/page.tsx`  
**Type:** Brand story, heritage, team section  
**Indexing:** ✅ INDEX (builds E-E-A-T)

### SEO Metadata

**Title Formula:**
```
{restaurant.seo?.aboutTitle || `About ${restaurant.data.name} | Our Story & Heritage`}
```

**Examples:**
- `About Ramen Taro | Our Culinary Heritage & History`
- `About Sushi Yama | The Art of Sushi Since 2012`

**Description Formula:**
```
{restaurant.seo?.aboutDescription || 
 restaurant.data.about?.content?.substring(0, 160) || 
 `Discover the story of ${restaurant.data.name}. Learn about our heritage, culinary philosophy, and the team behind our authentic cuisine.`}
```

### Required Data.json Fields

```json
{
  "about": {
    "title": "Our Culinary Heritage",
    "content": "Full story text...",
    "additionalContent": ["Additional paragraphs..."],
    "founder": {
      "name": "Takeshi Yamamoto",
      "role": "Master Chef",
      "story": "Founded in 1985 by Master Chef Takeshi Yamamoto...",
      "image": "/images/chef-founder.jpg"
    }
  }
}
```

**New optional fields to add:**
```json
{
  "about": {
    "foundedYear": 1985,
    "founder": {
      "name": "Takeshi Yamamoto",
      "bio": "With over 30 years of experience...",
      "image": "...",
      "qualifications": ["Certified Sushi Chef", "Master of Fukuoka Ramen Association"]
    },
    "heritage": "三代続けての製法 (Three-generation traditional method)",
    "awards": [
      {
        "year": 2023,
        "title": "Best Ramen in Tokyo",
        "issuer": "Tokyo Food Awards"
      }
    ],
    "mission": "To bring the authentic taste of Fukuoka to Tokyo through time-honored recipes"
  }
}
```

### Structured Data

**Primary Schema:** `AboutPage` + `Organization` snippet

**Add to page:**
```json
{
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "mainEntity": {
    "@type": "Organization",
    "name": "Ramen Taro",
    "foundingDate": "1985-04-15",
    "founder": {
      "@type": "Person",
      "name": "Takeshi Yamamoto",
      "jobTitle": "Master Chef"
    },
    "description": "Our mission..."
  }
}
```

**If founder information exists:**
```json
{
  "@type": "Person",
  "name": "Takeshi Yamamoto",
  "jobTitle": "Master Chef",
  "worksFor": {
    "@type": "Restaurant",
    "name": "Ramen Taro"
  },
  "sameAs": ["https://www.instagram.com/chef_takeshi"]
}
```

### Content Optimization

**Heading Structure:**
```
H1: About {Restaurant Name}
H2: Our Story (or custom about.title)
H2: [Founder Name] - Founder & Master Chef (if founder data exists)
H2: Our Philosophy / Mission / Values
H2: Meet the Team (if team section shown)
```

**Word Count Minimum:** 300+ words for about page
- Story: 150-200 words
- Founder bio: 50-100 words
- Philosophy: 50-100 words
- Team bios: 30-50 words each

**Image Alt Text:**
- About image: `"${name} - ${about.title}"` → `"Ramen Taro - Our Culinary Heritage"`
- Team photos: `"${name} - ${member.role} ${member.name}"`

### Internal Linking

Link to:
- `/[slug]` (back to home)
- `/[slug]/menu` (call-to-action: "Taste our dishes")
- `/[slug]/contact` (call-to-action: "Visit us")

### Validation Checklist

- [ ] H1 matches page title (about + restaurant name)
- [ ] At least 300 words of unique content
- [ ] Founder/team information with bios
- [ ] Images have descriptive alt text
- [ ] Organization or Person schema markup
- [ ] No duplicate content from homepage

---

## Route 4: Menu Page (`/[slug]/menu`)

**File:** `apps/web/app/[restaurant]/menu/page.tsx`  
**Type:** Complete menu with prices, categories  
**Indexing:** ✅ INDEX (high-value for long-tail keywords)

### SEO Metadata

**Title Formula:**
```
{restaurant.seo?.menuTitle || `${restaurant.data.name} Menu | Prices & Dishes`}
```

**Examples:**
- `Ramen Taro Menu | Prices & Dishes | 2025`
- `Sushi Yama Menu | Sushi, Sashimi & Rolls | Tokyo`

**Description Formula:**
```
{restaurant.seo?.menuDescription || 
 `Explore ${restaurant.data.name}'s complete menu featuring ${cuisineTypes}. View prices for ${popularDishes} and more. ${hasPDF ? 'Download our full menu PDF.' : ''}`}
```

**Target:** 150-160 chars, include:
- Cuisine types
- 2-3 popular dishes by name
- Price range (if applicable)
- PDF download mention

### Required Data.json Fields

```json
{
  "menu": [
    {
      "name": "Tonkotsu Ramen",
      "description": "Rich pork bone broth, thin noodles, chashu, soft-boiled egg",
      "price": "15.00",
      "category": "Ramen",
      "image": "https://...",
      "isPopular": true,
      "isVegetarian": false,
      "isSpicy": false,
      "spiceLevel": 0,
      "allergens": ["wheat", "pork", "egg"]
    }
  ]
}
```

**New optional fields for menu items:**
```json
{
  "menu": [
    {
      "name": "Truffle Ramen",
      "description": "...",
      "price": "25.00",
      "category": "Chef's Specials",
      "calories": 850,
      "ingredients": ["noodles", "truffle oil", "chashu", "egg"],
      "dietary": {
        "vegetarian": false,
        "vegan": false,
        "glutenFree": false,
        "dairyFree": true
      },
      "available": true,
      "spicyLevel": 0,
      "sliceCount": 3
    }
  ]
}
```

### Structured Data

**Primary Schema:** `Menu` + multiple `MenuItem` OR single `Menu` with sections

**Option A: Full Menu schema (if < 50 items):**
```json
{
  "@context": "https://schema.org",
  "@type": "Menu",
  "name": "Ramen Taro Menu",
  "description": "Authentic Hakata ramen and Japanese dishes",
  "hasMenuSection": [
    {
      "@type": "MenuSection",
      "name": "Ramen",
      "description": "Traditional Japanese noodle soups",
      "hasMenuItem": [
        {
          "@type": "MenuItem",
          "name": "Tonkotsu Ramen",
          "description": "Rich pork bone broth, thin noodles, chashu, soft-boiled egg",
          "offers": {
            "@type": "Offer",
            "price": "15.00",
            "priceCurrency": "JPY"
          },
          "suitableForDiet": "https://schema.org/NonVegetarian"
        }
      ]
    }
  ]
}
```

**Option B: Simplified (if many items):**
```json
{
  "@context": "https://schema.org",
  "@type": "Menu",
  "name": "${restaurant.name} Menu",
  "description": "${shortDescription}",
  "url": "https://domain.com/[slug]/menu"
}
```

**Recipe schema for signature dishes** (optional, high-value):
```json
{
  "@type": "Recipe",
  "name": "Tonkotsu Ramen",
  "recipeIngredient": ["ramen noodles", "pork bone broth", "chashu pork", "soft-boiled egg"],
  "recipeInstructions": "...",
  "totalTime": "PT48H",  // broth prep time
  "image": "tonkotsu-image.jpg"
}
```

### Content Optimization

**Heading Structure:**
```
H1: Our Menu
H2: [Category Name]  (repeat for each category)
  H3: [Dish Name]  (each menu item card)
```

**Category Optimization:**
- Use heading hierarchy: H1 → H2 (categories) → each item as `<h3>` OR `<p>` with strong
- Add category descriptions if possible:
  ```html
  <h2>Ramen</h2>
  <p class="category-desc">Our signature bowls featuring 48-hour simmered broth...</p>
  ```
- 3-10 items per category ideal (not too many)

**Dish Name Formatting:**
- Use consistent naming: "Dish Name" (not "dish name" lowercase)
- Include key attributes in parentheses if needed:
  - `Truffle Ramen (Chef's Special)`
  - `Spicy Miso Ramen (Very Spicy)`

**Price Display:**
- Always show currency symbol: `¥1,500` or `$15.00`
- Use consistent currency (match restaurant locale)
- If `price` is empty/null → hide price gracefully

**Menu PDF:**
- If `data.menuLink` exists, prominently feature download button
- PDF should be: < 5MB, text-searchable (not just image), include prices

### Image SEO for Menu Items

Each dish image should have:
```tsx
<Image
  src={item.image}
  alt={`${item.name} - ${item.description.substring(0, 50)}`}
  ...
/>
```

**Ideal:** 400x400px minimum for dish thumbnails

### Internal Linking

- Link to `/[slug]/contact` for reservations
- Link to `/[slug]` (homepage hero CTA)

### Validation Checklist

- [ ] All menu items have names, descriptions, prices
- [ ] At least 10 menu items (thin content < 10 items)
- [ ] Menu schema OR Recipe schema implemented
- [ ] Prices formatted consistently with currency
- [ ] Category descriptions > 50 words total
- [ ] All dish images have alt text
- [ ] PDF menu is optimized (compressed, text layer)

---

## Route 5: Contact Page (`/[slug]/contact`)

**File:** `apps/web/app/[restaurant]/contact/page.tsx`  
**Type:** Contact form, map, hours, phone, email  
**Indexing:** ✅ INDEX (important for local SEO)

### SEO Metadata

**Title Formula:**
```
{restaurant.seo?.contactTitle || `Contact ${restaurant.data.name} | Reservations & Directions`}
```

**Examples:**
- `Contact Ramen Taro | Reservations, Phone & Directions`
- `Sushi Yama Contact Info | Book a Table & Find Us`

**Description Formula:**
```
{restaurant.seo?.contactDescription || 
 `Contact ${restaurant.data.name} for reservations, directions, and inquiries. Located at ${shortAddress}. Phone: ${phone}. Open ${hoursSummary}.`}
```

**Include in description:**
- Restaurant name
- One call-to-action (call, book, directions)
- Neighborhood/city
- Hours summary if concise

### Required Data.json Fields

```json
{
  "phone": "+81 3-8765-4321",
  "email": "reservations@ramentaro.tokyo",
  "address": "4-10-10 Kiyohara, Higashiyamato, Tokyo 207-0011, Japan",
  "location": {
    "lat": 35.7394006,
    "lng": 139.4449135,
    "mapsUrl": "https://maps.app.goo.gl/...",
    "address": "4-10-10 Kiyohara..."
  },
  "openingHours": [
    { "day": "Mon - Thu", "lunch": "11:30 - 15:00", "dinner": "17:00 - 22:00" },
    ...
  ]
}
```

### Structured Data

**Primary Schema:** `ContactPage` + `Restaurant` (with contact details)

**Add ContactPoint schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Ramen Taro",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "4-10-10 Kiyohara",
    "addressLocality": "Higashiyamato",
    "addressRegion": "Tokyo",
    "postalCode": "207-0011",
    "addressCountry": "JP"
  },
  "telephone": "+81-3-8765-4321",
  "email": "reservations@ramentaro.tokyo",
  "openingHours": [
    "Mo-Th 11:30-15:00 17:00-22:00",
    "Fr 11:30-15:00 17:00-23:30",
    "Sa 11:30-15:00 17:00-23:30",
    "Su 12:00-15:30 17:00-21:00"
  ],
  "priceRange": "$$",
  "servesCuisine": ["Japanese", "Ramen"],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+81-3-8765-4321",
      "contactType": "reservations",
      "areaServed": "Higashiyamato, Tokyo",
      "availableLanguage": ["Japanese", "English"]
    },
    {
      "@type": "ContactPoint",
      "telephone": "+81-3-8765-4321",
      "contactType": "customer service",
      "areaServed": "Higashiyamato, Tokyo"
    }
  ]
}
```

**PotentialAction for reservations:**
```json
{
  "@type": "Restaurant",
  "potentialAction": {
    "@type": "ReserveAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "tel:+81387654321",
      "actionPlatform": ["http://schema.org/Phone"]
    }
  }
}
```

### Content Optimization

**Heading Structure:**
```
H1: Contact Us
H2: Contact Information
H2: Hours
H2: Send Us a Message (form section)
H2: Find Us (map)
```

**Address Format:**
- Display full address as text (not just map pin image)
- Format:
  ```
  4-10-10 Kiyohara
  Higashiyamato, Tokyo 207-0011
  Japan
  ```
- Add schema.org/PostalAddress microdata (optional)

**Phone Number:**
- Click-to-call link: `<a href="tel:+81387654321">+81 3-8765-4321</a>`
- Mobile: show large CTA button
- Desktop: show phone next to header

**Hours Display:**
- Use structured table (days + hours)
- Include last seating time if available: "Lunch: 11:30-15:00 (last order 14:30)"
- Holiday notes section for special closures

**Contact Form:**
- Form fields: Name, Email, Subject, Message
- Subject options:
  - Reservation Inquiry
  - Private Event
  - General Inquiry
  - Feedback
- After submit: show "Message sent!" confirmation
- API route must be `POST` and handle errors gracefully

**Map Integration:**
- Use `google-maps-embed-scraper` for embed URL
- Fallback to Google Maps link if embed fails
- Add `loading="lazy"` to iframe

### Internal Linking

- Link to `/[slug]/menu` ("View our menu before visiting")
- Link to `/[slug]/about` ("Learn about our story")
- Link to `/[slug]/brand` ("Download brand assets" - for press)

### Validation Checklist

- [ ] Phone number is clickable (tel: link)
- [ ] Address is structured text + schema markup
- [ ] Hours in both human-readable AND schema.org format
- [ ] Google Maps embed working (or link)
- [ ] ContactPoint schema present
- [ ] Form accessible (labels, error states)
- [ ] No duplicate contact info across pages

---

## Route 6: Brand Assets Page (`/[slug]/brand`)

**File:** `apps/web/app/[restaurant]/brand/page.tsx`  
**Type:** PDF generator (visiting cards, flyers)  
**Indexing:** ⚠️ NOINDEX RECOMMENDED (thin content, utility page)

### SEO Metadata

**Title Formula:**
```
{restaurant.seo?.brandTitle || `${restaurant.data.name} Brand Assets`}
```

**Description Formula:**
```
{restaurant.seo?.brandDescription || 
 `Download professional marketing materials for ${restaurant.data.name}. Print-ready visiting cards, flyers, and brand assets pre-populated with your restaurant's information.`}
```

### Indexing Decision: NOINDEX

**Reasoning:**
- Thin content (mostly for utility, not search)
- Duplicate across all restaurants (same template)
- Low search value ("brand assets" queries not relevant)
- May cannibalize main pages

**Implementation:**
```typescript
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${data.name} Brand Assets | Marketing Materials`,
    description: "...",
    robots: {
      index: false,  // ← NOINDEX
      follow: true,   // Still follow links
    },
    noindex: true,
    nofollow: false,
  }
}
```

**Add robots meta tag in page:**
```tsx
<head>
  <meta name="robots" content="noindex, follow" />
</head>
```

### Optional Structured Data

No special schema needed. If indexed (not recommended), could use:
```json
{
  "@type": "WebPage",
  "name": "Brand Assets",
  "description": "Marketing materials for download"
}
```

### Content Optimization

Even though noindex, still optimize for:
- **Internal linking:** Only linked from footer
- **Accessibility:** Alt text on generated elements (already PDF-based)

### Validation Checklist

- [ ] `noindex` robots meta confirmed
- [ ] No internal links pointing here from main nav (footer only)
- [ ] PDF generation works (html2canvas + jsPDF)
- [ ] Print CSS optimized (already present)

---

## Route 7: Company Information (`/[slug]/company-information`)

**File:** `apps/web/app/[restaurant]/company-information/page.tsx`  
**Type:** Corporate details (Japanese legal requirements)  
**Indexing:** ✅ INDEX but LOW PRIORITY (Japan-specific legal SEO)

### SEO Metadata

**Title Formula:**
```
{restaurant.seo?.companyTitle || `${restaurant.data.name} Company Information`}
```

**Description Formula:**
```
{restaurant.seo?.companyDescription || 
 `Corporate information for ${restaurant.data.name}: company name, registration number, headquarters address, established date, capital, and fiscal year end.`}
```

### Required Data.json Fields

Ensure `RestaurantData.companyInfo` exists:
```json
{
  "companyInfo": {
    "name": "Narayani Co., Ltd.",
    "registrationNumber": "6020001061694",
    "address": "35 Minezawacho, Hodogaya Ward, Yokohama, Kanagawa 221-0061, Japan. Representative Director: Poudel Prakash",
    "phone": "045-331-1303",
    "establishedDate": "May 21, 2009",
    "capital": "5,000,000 JPY",
    "fiscalYearEnd": "End of March"
  }
}
```

**Add fields:**
```json
{
  "companyInfo": {
    "name": "...",
    "registrationNumber": "...",
    "address": "...",
    "phone": "...",
    "establishedDate": "...",
    "capital": "...",
    "fiscalYearEnd": "...",
    "representativeDirector": "Poudel Prakash",
    "businessPurpose": "Restaurant operation and food service",
    "registeredOffice": "ZIP: 221-0061, Kanagawa...",
    "annualReportUrl": "/reports/2024.pdf"  // optional
  }
}
```

### Structured Data

**Primary Schema:** `Organization` (Japanese corporate)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Narayani Co., Ltd.",
  "identifier": "6020001061694",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "35 Minezawacho, Hodogaya Ward",
    "addressLocality": "Yokohama",
    "addressRegion": "Kanagawa",
    "postalCode": "221-0061",
    "addressCountry": "JP"
  },
  "telephone": "+81-45-331-1303",
  "foundingDate": "2009-05-21",
  "numberOfEmployees": 50,
  "founder": {
    "@type": "Person",
    "name": "Poudel Prakash"
  }
}
```

**Legal requirement in Japan:** Corporate number display is mandatory on website. This page fulfills that.

### Content Optimization

**Heading Structure:**
```
H1: Company Information
H2: Corporate Details
```

**Content:**
- Display all company info in clean table/list format
- Ensure all fields visible (no hidden/JS-only content)
- Link to `/[slug]/about` for brand story (separate from legal info)

### Indexing Notes

- **Priority: LOW** - only for legal compliance
- **Canonical:** to self (no duplicates)
- **No special schema markup required** beyond Organization

**Optional:** Add `.noindex` if the legal page is not relevant to customers

### Validation Checklist

- [ ] All corporate fields filled (Japanese law requires complete info)
- [ ] Registration number accurate
- [ ] Representative director name correct
- [ ] Address matches legal registration
- [ ] Organization schema valid

---

## Missing Routes: Future Additions

### `/blog/{slug}` (Future)

**Title:** `{post.title} | ${restaurant.name} Blog`  
**Description:** Post excerpt (150-200 chars)  
**Schema:** `BlogPosting` or `Article`  
**SEO Strategy:** Long-tail keyword content, internal linking to menu/about

### `/reservations` (Future)

**Title:** `Make a Reservation | ${restaurant.name}`  
**Schema:** `ReserveAction`  
**SEO Goal:** Rank for "reservations [restaurant name]", "book table [city]"  

### `/locations` (Multi-location future)

If single restaurant has multiple locations:
```
/[slug]/locations
/[slug]/locations/{neighborhood}
```
**Schema:** `Place` + multiple `branchOf`

---

## Metadata Field Reference Table

Per route, reference these data.json fields:

| Route | Title Source | Description Source | OG Image | Unique Schema |
|-------|-------------|-------------------|----------|---------------|
| `/` | Hardcoded (+ restaurant count) | Platform description | Platform logo | ItemList |
| `/[slug]` | `seo.title` | `about.content` or `description` | `hero.slides[0].image` | Restaurant |
| `/[slug]/about` | `About {name}` | `about.content` | `about.image` | AboutPage + Person (founder) |
| `/[slug]/menu` | `{name} Menu` | Intro paragraph from `about.content` OR auto-gen | Hero image OR menu hero | Menu + MenuItem |
| `/[slug]/contact` | `Contact {name}` | Location-based summary | N/A | ContactPoint (embedded in Restaurant schema) |
| `/[slug]/brand` | `{name} Brand Assets` | Marketing materials description | N/A | None (noindex) |
| `/[slug]/company-information` | `{name} Company Info` | N/A | N/A | Organization |

---

## Canonical URL Strategy

### Base URL
```
https://restaurantsite.io
```

### Per-Route Canonical

| Route | Canonical |
|-------|-----------|
| `/` | `https://restaurantsite.io` |
| `/[slug]` | `https://restaurantsite.io/${slug}` |
| `/[slug]/about` | `https://restaurantsite.io/${slug}/about` |
| `/[slug]/menu` | `https://restaurantsite.io/${slug}/menu` |
| `/[slug]/contact` | `https://restaurantsite.io/${slug}/contact` |
| `/[slug]/brand` | `https://restaurantsite.io/${slug}/brand` |
| `/[slug]/company-information` | `https://restaurantsite.io/${slug}/company-information` |

**Implementation in generateMetadata:**
```typescript
alternates: {
  canonical: `https://restaurantsite.io/${slug}${pathname}`,
}
```

---

## Hreflang Tags (Future i18n)

If implementing language variants:

**Structure:**
```
/en/ramen-taro/about
/ja/ramen-taro/about
/es/ramen-taro/about
```

**In head:**
```html
<link rel="alternate" hreflang="en" href="https://restaurantsite.io/en/ramen-taro/about" />
<link rel="alternate" hreflang="ja" href="https://restaurantsite.io/ja/ramen-taro/about" />
<link rel="alternate" hreflang="x-default" href="https://restaurantsite.io/ramen-taro/about" />
```

---

## Sitemap Priority & Change Frequency

Define sitemap priorities per route:

| Route | Priority | Change Frequency | Reason |
|-------|----------|------------------|--------|
| `/` | 1.0 | daily | Platform homepage (high value) |
| `/[slug]` | 0.9 | weekly | Restaurant homepage (main landing) |
| `/[slug]/menu` | 0.8 | weekly | Menu changes possible |
| `/[slug]/about` | 0.7 | monthly | Rarely changes |
| `/[slug]/contact` | 0.7 | monthly | Hours may update |
| `/[slug]/brand` | 0.3 | yearly | Rare updates, thin content |
| `/[slug]/company-information` | 0.3 | yearly | Legal info static |

---

## Open Graph Images Strategy

### Dynamic OG Image Generation (Future)

**Current:** Use hero image from data.json  
**Future:** Generate branded OG images with:

```typescript
// app/api/og/[slug]/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const restaurant = await getRestaurant(slug)
  
  return ImageResponse(
    // Generate image with restaurant name, logo, tagline
  )
}
```

**OG Image Specs:**
- Dimensions: 1200 × 630px (minimum)
- Format: JPEG or WebP
- Text overlay: Restaurant name + tagline
- Fallback: First hero image if not generated

---

## Performance SEO Implications

### Core Web Vitals per Route

| Route | LCP Throttles | CLS Risk | SEO Impact |
|-------|---------------|----------|------------|
| `/` | Low (simple grid) | Minimal | None |
| `/[slug]` | High (hero image) | Low (fixed positions) | Critical - LCP impacts rankings |
| `/[slug]/menu` | Medium (lazy images) | Low | Moderate - interactivity affects FID |
| `/[slug]/contact` | Low | Low (form) | None |
| `/[slug]/brand` | Low | None | None |

**Optimization:**
- Hero images: Use `priority` prop already implemented ✓
- Gallery: Add `loading="lazy"` (already default)
- Images: Convert to WebP via Next.js automatically

---

## Data.json Schema Expansion

**Recommended additions to `RestaurantData` interface:**

```typescript
export interface RestaurantData {
  // ... existing fields ...
  
  // SEO fields (NEW)
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
    noindex?: boolean
    canonical?: string
  }
  
  // Social media (NEW)
  social?: {
    ogImage?: string
    ogLocale?: string
    twitterCard?: string
    twitterSite?: string
    sameAs?: string[]  // Social profile URLs
  }
  
  // Structured data hints (NEW)
  schema?: {
    priceRange?: "$" | "$$" | "$$$" | "$$$$"
    servesCuisine?: string[]
    acceptsReservations?: boolean
    isTakeout?: boolean
    isDelivery?: boolean
    aggregateRating?: {
      ratingValue: number
      reviewCount: number
      bestRating?: number
      worstRating?: number
    }
  }
  
  // Local SEO (NEW)
  localSEO?: {
    neighborhood?: string
    city?: string  // Extract from address
    region?: string  // Extract from address
    country?: string
    placeId?: string  // Google Place ID
    googleMapsPlaceId?: string
  }
  
  // Content SEO (NEW)
  content?: {
    tagline?: string
    shortDescription?: string
    mission?: string
    keywordsByPage?: {
      home?: string[]
      about?: string[]
      menu?: string[]
      contact?: string[]
    }
  }
  
  // Image SEO (NEW - more structured)
  images?: {
    logo?: { url: string; alt: string; width?: number; height?: number }
    heroImage?: { url: string; alt: string; credit?: string }
    coverImage?: { url: string; alt: string; credit?: string }
    gallery?: Array<{ url: string; alt: string; credit?: string }>
    team?: Array<{ url: string; alt: string; name: string; role: string }>
  }
  
  // Operations (NEW - for filter/search)
  operations?: {
    paymentMethods?: string[]
    dietaryOptions?: {
      vegetarian?: boolean
      vegan?: boolean
      glutenFree?: boolean
      halal?: boolean
      kosher?: boolean
    }
    features?: {
      privateDining?: boolean
      outdoorSeating?: boolean
      wifi?: boolean
      parking?: string
      wheelchairAccessible?: boolean
    }
    services?: {
      takeout?: boolean
      delivery?: boolean
      catering?: boolean
      reservations?: boolean
    }
  }
}
```

---

## Implementation Priority Matrix

| Route | Priority | Effort | Impact | Sequence |
|-------|----------|--------|--------|----------|
| `/[slug]` (home) | P0 | 2h | HIGH | 1 |
| `/[slug]/menu` | P0 | 2h | HIGH | 2 |
| `/[slug]/contact` | P1 | 1.5h | HIGH | 3 |
| `/[slug]/about` | P1 | 1.5h | MEDIUM | 4 |
| `/` (listing) | P1 | 1h | MEDIUM | 5 |
| `/[slug]/brand` | P2 | 0.5h | LOW | 6 (optional) |
| `/[slug]/company-information` | P2 | 0.5h | LOW | 6 |

**Total estimated implementation:** 8-10 hours for all routes

---

## Testing Checklist per Route

For each route after implementation:

1. **View Source** - Check meta tags present
2. **Google Rich Results Test** - Validate schema
3. **Lighthouse SEO** - Score > 90
4. **Mobile-Friendly Test** - Check mobile rendering
5. **Screaming Frog crawl** - Verify all 6+ pages indexed
6. **Fetch as Google (Search Console)** - Request indexing
7. **Search Console Coverage** - Check for errors

---

## Migration Path

**Phase 1:** Implement metadata for `/[slug]` (home) only  
**Phase 2:** Add sitemap + robots  
**Phase 3:** Add structured data to home page  
**Phase 4:** Implement remaining routes one by one  
**Phase 5:** Validate + submit to Search Console

---

## Appendix: Quick Reference

### Route → Template Mapping

```typescript
// Route: /[slug]
const homeMetadata = {
  title: (data) => data.seo?.title || `${data.name} | Authentic ${detectCuisine(data)} in ${extractCity(data.address)}`,
  description: (data) => data.seo?.description || truncate(data.about?.content || data.description, 160),
  ogImage: (data) => data.hero?.slides?.[0]?.image || data.logo,
  schema: 'Restaurant',
  index: true
}

// Route: /[slug]/about
const aboutMetadata = {
  title: (data) => `About ${data.name} | ${data.about?.title || 'Our Story'}`,
  description: (data) => truncate(data.about?.content, 160),
  ogImage: (data) => data.about?.image,
  schema: 'AboutPage + Person',
  index: true
}

// Continue for all routes...
```

---

**Next Step:** Create `lib/seo.ts` with route-specific generators, then implement `generateMetadata` in each page component.
