# Enhanced data.json Template with SEO Fields

**Purpose:** Reference template for restaurant owners to fill in SEO metadata

Copy this structure and populate all fields for each restaurant.

---

## Complete Template

```json
{
  "name": "Ramen Taro",
  "description": "Authentic Japanese ramen restaurant in the heart of Tokyo.",
  "tagline": "Authentic Hakata Ramen Since 1985",
  
  /* ─── SEO METADATA ────────────────────────────────────────────────────── */
  "seo": {
    "title": "Ramen Taro | Authentic Hakata Ramen in Higashiyamato, Tokyo",
    "description": "Experience authentic Hakata ramen at Ramen Taro since 1985. Our 48-hour tonkotsu broth and handmade noodles deliver the true taste of Fukuoka. Located in Higashiyamato, Tokyo. Open for lunch & dinner. Reservations recommended.",
    "keywords": [
      "ramen tokyo",
      "hakata ramen",
      "tonkotsu broth",
      "Japanese noodles",
      "authentic ramen",
      "Tokyo dining",
      "Higashiyamato restaurant"
    ],
    "noindex": false,
    "canonical": "https://restaurantsite.io/ramen-taro"
  },

  /* ─── SOCIAL MEDIA ─────────────────────────────────────────────────────── */
  "social": {
    "ogImage": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&h=630&fit=crop",
    "ogLocale": "en_US",
    "twitterCard": "summary_large_image",
    "twitterSite": "@ramentaro",
    "sameAs": [
      "https://www.instagram.com/ramen_taro_tokyo",
      "https://www.facebook.com/ramentaro.tokyo",
      "https://twitter.com/ramen_taro",
      "https://www.tripadvisor.com/Restaurant_Review-g298570-d1234567",
      "https://www.google.com/maps/place/Ramen-Taro"
    ]
  },

  /* ─── STRUCTURED DATA HINTS ───────────────────────────────────────────── */
  "schema": {
    "priceRange": "$$",
    "servesCuisine": ["Japanese", "Ramen", "Noodles", "Izakaya"],
    "acceptsReservations": true,
    "isTakeout": true,
    "isDelivery": false,
    "priceCurrency": "JPY",
    "aggregateRating": {
      "ratingValue": 4.8,
      "reviewCount": 247,
      "bestRating": 5,
      "worstRating": 1,
      "source": "google"
    }
  },

  /* ─── LOCAL SEO ────────────────────────────────────────────────────────── */
  "localSEO": {
    "neighborhood": "Kiyohara",
    "city": "Higashiyamato",
    "region": "Tokyo",
    "country": "Japan",
    "countryCode": "JP",
    "placeId": "ChIJN1t_tDeuGGAR9AG-B4cQx8Y",
    "googleMapsPlaceId": "ChIJN1t_tDeuGGAR9AG-B4cQx8Y",
    "googleMapsUrl": "https://maps.app.goo.gl/jksfrYcpo8SmAjT47",
    "wazeUrl": "https://waze.com/ul?ll=35.7394006,139.4449135",
    "appleMapsUrl": "http://maps.apple.com/?daddr=35.7394006,139.4449135",
    "timezone": "Asia/Tokyo"
  },

  /* ─── CONTENT SEO ──────────────────────────────────────────────────────── */
  "content": {
    "tagline": "Authentic Hakata Ramen Since 1985",
    "shortDescription": "Traditional Japanese ramen featuring 48-hour simmered tonkotsu broth and handmade noodles",
    "mission": "To bring the authentic taste of Fukuoka to Tokyo through time-honored recipes and Omotenashi hospitality.",
    "keywordsByPage": {
      "home": ["authentic ramen", "hakata ramen tokyo", "best ramen higashiyamato"],
      "about": ["ramen history", "traditional japanese cuisine", "chef biography"],
      "menu": ["ramen menu prices", "tonkotsu ramen", "gyoza", "japanese appetizers"],
      "contact": ["ramen taro phone", "restaurant reservations tokyo", "directions to ramen taro"]
    }
  },

  /* ─── IMAGE SEO ────────────────────────────────────────────────────────── */
  "images": {
    "logo": {
      "url": "/images/logo.png",
      "alt": "Ramen Taro logo - authentic Japanese ramen restaurant since 1985",
      "width": 300,
      "height": 100
    },
    "heroImage": {
      "url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200",
      "alt": "Rich tonkotsu ramen bowl with chashu pork, soft-boiled egg, and nori seaweed",
      "credit": "Photo by Unsplash / Ramen Taro"
    },
    "coverImage": {
      "url": "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1200",
      "alt": "Chef preparing fresh ramen noodles in traditional Japanese kitchen",
      "credit": "Photo by Studio Ramen"
    },
    "gallery": [
      {
        "url": "https://images.unsplash.com/photo-1552611052-33e04de081de",
        "alt": "Ramen Taro interior - traditional Japanese dining room with wooden tables",
        "credit": "Photo by Studio Ramen"
      },
      {
        "url": "https://images.unsplash.com/photo-1585032226651-759b368d7246",
        "alt": "Master Chef Takeshi Yamamoto preparing fresh noodles",
        "credit": "Photo by Chef Studio"
      }
    ],
    "team": [
      {
        "url": "/images/team/chef.png",
        "alt": "Master Chef Takeshi Yamamoto - Head Chef at Ramen Taro",
        "name": "Takeshi Yamamoto",
        "role": "Master Chef"
      }
    ]
  },

  /* ─── OPERATIONS & FEATURES ─────────────────────────────────────────────── */
  "operations": {
    "paymentMethods": ["credit_card", "cash", "suica", "pasmo", "paypay"],
    "dietaryOptions": {
      "vegetarian": true,
      "vegan": false,
      "glutenFree": true,
      "halal": false,
      "kosher": false,
      "dairyFree": true
    },
    "features": {
      "privateDining": true,
      "privateDiningCapacity": 12,
      "outdoorSeating": false,
      "wifi": true,
      "parking": "street",
      "parkingDetails": "Street parking available, 2-minute walk",
      "wheelchairAccessible": true,
      "petFriendly": false
    },
    "services": {
      "takeout": true,
      "delivery": false,
      "deliveryPlatforms": ["ubereats", "demae-can"],
      "catering": true,
      "cateringRadius": "5km",
      "reservations": true,
      "reservationTypes": ["phone", "online", "walk-in"],
      "banquets": true
    }
  },

  /* ─── ABOUT SECTION ─────────────────────────────────────────────────────── */
  "about": {
    "title": "Our Culinary Heritage",
    "content": "Founded in 1985, Ramen Taro began as a small street stall in Fukuoka's famous Ramen Alley. Today, we continue to honor traditional recipes while embracing modern culinary techniques to bring you the perfect bowl of ramen. Our secret lies in our 48-hour tonkotsu broth, simmered slowly to achieve a rich, creamy texture that has become our signature. Every morning, our chefs handcraft fresh noodles with the perfect 'bite' to complement our savory soups. Beyond the food, Ramen Taro is a celebration of Japanese culture. We strive to create an atmosphere of 'Omotenashi'—wholehearted hospitality—where every guest is treated like family.",
    "additionalContent": [
      "Our broths are simmered for exactly 48 hours using pork bones from local farms, resulting in a collagen-rich, creamy texture that defines authentic Hakata ramen.",
      "Noodles are made fresh daily in-house using traditional kansansui (alkaline water) technique passed down through three generations of master noodle makers.",
      "We source the finest ingredients: Berkshire pork for chashu, premium soy sauce from Kyushu, and organic eggs from free-range chickens."
    ],
    "images": [
      "https://images.unsplash.com/photo-1552611052-33e04de081de",
      "https://images.unsplash.com/photo-1585032226651-759b368d7246",
      "https://images.unsplash.com/photo-1511910849309-0dffb8785146"
    ],
    "image": "https://images.unsplash.com/photo-1552611052-33e04de081de",
    "foundedYear": 1985,
    "founder": {
      "name": "Takeshi Yamamoto",
      "role": "Master Chef & Founder",
      "bio": "With over 40 years of experience, Master Chef Takeshi Yamamoto is a third-generation ramen artisan. Trained in Fukuoka's Ramen Alley under his father and grandfather, Takeshi brought the authentic Hakata style to Tokyo in 1985. He has been awarded 'Best Ramen Chef' by the Tokyo Ramen Association three times.",
      "image": "/images/team/chef-founder.jpg",
      "qualifications": [
        "Certified Ramen Artisan (Fukuoka Ramen Association)",
        "3x Tokyo Ramen Competition Winner",
        "Master of Traditional Noodle Making (1978)"
      ],
      "social": {
        "instagram": "https://instagram.com/chef_takeshi",
        "twitter": "https://twitter.com/chef_takeshi"
      }
    },
    "awards": [
      {
        "year": 2023,
        "title": "Best Ramen in Tokyo",
        "issuer": "Tokyo Food Critics Association"
      },
      {
        "year": 2022,
        "title": "Michelin Bib Gourmand",
        "issuer": "Michelin Guide"
      },
      {
        "year": 2021,
        "title": "Gold Award - Tokyo Ramen Festival",
        "issuer": "Tokyo Ramen Festival Committee"
      }
    ],
    "mission": "To bring the authentic taste of Fukuoka to every corner of Tokyo, preserving traditional techniques while innovating for the future of Japanese cuisine.",
    "philosophy": "Omotenashi - wholehearted hospitality that anticipates and fulfills every guest's needs before they even ask.",
    "heritage": "三代続けての製法 (Three-generation traditional method)"
  },

  /* ─── TEAM SECTION ─────────────────────────────────────────────────────── */
  "team": [
    {
      "name": "Takeshi Yamamoto",
      "role": "Master Chef & Founder",
      "image": "/images/team/chef.png",
      "bio": "With over 40 years of experience, Takeshi is the heart of our kitchen and the guardian of our 48-hour broth tradition.",
      "social": {
        "instagram": "https://instagram.com/chef_takeshi"
      },
      "since": 1985
    },
    {
      "name": "Hanako Sato",
      "role": "General Manager",
      "image": "/images/team/manager.png",
      "bio": "Hanako ensures every guest feels at home with her warm Omotenashi hospitality and seamless service.",
      "social": {
        "instagram": "https://instagram.com/hanako_sato"
      },
      "since": 2005
    },
    {
      "name": "Kenji Tanaka",
      "role": "Sous Chef",
      "image": "/images/team/sous-chef.png",
      "bio": "Kenji's passion for fresh ingredients and modern techniques brings innovation to our classic menu.",
      "since": 2015
    }
  ],

  /* ─── LOCATION & HOURS ──────────────────────────────────────────────────── */
  "address": "4-10-10 Kiyohara, Higashiyamato, Tokyo 207-0011, Japan",
  "phone": "+81 3-8765-4321",
  "email": "reservations@ramentaro.tokyo",
  "website": "https://ramen-taro.localhost:3000",
  "location": {
    "lat": 35.7394006,
    "lng": 139.4449135,
    "mapsUrl": "https://maps.app.goo.gl/jksfrYcpo8SmAjT47",
    "address": "4-10-10 Kiyohara, Higashiyamato, Tokyo 207-0011, Japan",
    "embedUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.123456!2d139.4449135!3d35.7394006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6018f123456789ab%3A0x123456789abcdef!2sRamen%20Taro!5e0!3m2!1sen!2sjp!4v1234567890"
  },
  "openingHours": [
    { 
      "day": "Monday - Thursday", 
      "lunch": "11:30 - 15:00", 
      "lunchLastOrder": "14:30", 
      "dinner": "17:00 - 22:00", 
      "dinnerLastOrder": "21:30",
      "isClosed": false
    },
    { 
      "day": "Friday - Saturday", 
      "lunch": "11:30 - 15:00", 
      "lunchLastOrder": "14:30", 
      "dinner": "17:00 - 23:30", 
      "dinnerLastOrder": "23:00",
      "isClosed": false
    },
    { 
      "day": "Sunday", 
      "lunch": "12:00 - 15:30", 
      "lunchLastOrder": "15:00", 
      "dinner": "17:00 - 21:00", 
      "dinnerLastOrder": "20:30",
      "isClosed": false
    },
    { 
      "day": "Public Holidays", 
      "notes": "May operate reduced hours. Please call ahead.",
      "isClosed": false
    }
  ],
  "holidayNotes": "Open 7 days a week. Closed only on New Year's Eve (Dec 31) and New Year's Day (Jan 1).",

  /* ─── MENU ──────────────────────────────────────────────────────────────── */
  "menuLink": "https://ramen-taro.localhost:3000/menu/ramen-taro-menu.pdf",
  "menu": [
    {
      "name": "Tonkotsu Ramen",
      "description": "Rich pork bone broth simmered for 48 hours, thin noodles, chashu pork, soft-boiled egg, nori seaweed",
      "price": "¥1,500",
      "priceNumeric": 1500,
      "category": "Ramen",
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
      "isPopular": true,
      "isVegetarian": false,
      "isSpicy": false,
      "spiceLevel": 0,
      "allergens": ["wheat", "pork", "egg"],
      "calories": 850,
      "ingredients": ["ramen noodles", "pork broth", "chashu", "egg", "nori"],
      "available": true,
      "availableFrom": "11:30",
      "availableTo": "22:00"
    },
    {
      "name": "Spicy Miso Ramen",
      "description": "Miso-based broth with spicy ground pork, sweet corn, butter, and bean sprouts",
      "price": "¥1,650",
      "priceNumeric": 1650,
      "category": "Ramen",
      "image": "https://images.unsplash.com/photo-1591814468924-caf88d1232e1",
      "isPopular": false,
      "isVegetarian": false,
      "isSpicy": true,
      "spiceLevel": 2,
      "allergens": ["wheat", "pork", "dairy"],
      "calories": 950,
      "available": true
    },
    {
      "name": "Vegetarian Miso Ramen",
      "description": "Creamy miso broth with seasonal vegetables, tofu, and seaweed",
      "price": "¥1,550",
      "priceNumeric": 1550,
      "category": "Ramen",
      "image": "https://images.unsplash.com/photo-1547928576-b89227d12aa6",
      "isPopular": false,
      "isVegetarian": true,
      "isVegan": false,
      "isSpicy": false,
      "allergens": ["wheat", "soy"],
      "calories": 650,
      "available": true
    }
    // ... more items
  ],

  /* ─── HERO SECTION ─────────────────────────────────────────────────────── */
  "hero": {
    "slides": [
      {
        "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=2000",
        "title": "Authentic Hakata Ramen",
        "subtitle": "Slow-cooked broth, handmade noodles, and the freshest ingredients passed down through three generations.",
        "ctaText": "View Our Menu",
        "ctaLink": "/menu",
        "alt": "Bowl of authentic Hakata tonkotsu ramen with toppings"
      },
      {
        "image": "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=2000",
        "title": "Masterfully Crafted",
        "subtitle": "Experience the art of ramen passed down through generations in the heart of Tokyo.",
        "ctaText": "Our Story",
        "ctaLink": "/about",
        "alt": "Master Chef preparing fresh noodles in open kitchen"
      }
    ]
  },

  /* ─── ADDITIONAL SEO FIELDS ────────────────────────────────────────────── */
  "companyInfo": {
    "name": "Narayani Co., Ltd.",
    "registrationNumber": "6020001061694",
    "address": "35 Minezawacho, Hodogaya Ward, Yokohama, Kanagawa 221-0061, Japan",
    "representativeDirector": "Poudel Prakash",
    "phone": "045-331-1303",
    "establishedDate": "2009-05-21",
    "capital": "5,000,000 JPY",
    "fiscalYearEnd": "End of March",
    "businessPurpose": "Restaurant operation and food service management",
    "annualReportUrl": "/reports/annual-2024.pdf"
  },

  "foundingDate": "1985-04-15",
  "numberOfEmployees": 15,
  "knowsLanguage": ["Japanese", "English", "Nepali"],
  "cuisineType": "Japanese",
  
  /* ─── MEDIA ─────────────────────────────────────────────────────────────── */
  "media": {
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=example",
        "title": "Making Authentic Tonkotsu Broth - Behind the Scenes",
        "description": "Master Chef Takeshi Yamamoto explains our 48-hour broth preparation process",
        "thumbnail": "https://img.youtube.com/vi/example/hqdefault.jpg",
        "duration": "PT3M45S",
        "uploadDate": "2024-01-15"
      }
    ],
    "virtualTour": "https://www.google.com/maps/views/view/...",
    "pressPhotos": "https://drive.google.com/drive/folder/..."
  },

  /* ─── REVIEWS ───────────────────────────────────────────────────────────── */
  "reviews": {
    "aggregate": {
      "ratingValue": 4.8,
      "reviewCount": 247,
      "bestRating": 5,
      "worstRating": 1,
      "source": "google",
      "sourceUrl": "https://maps.google.com/?cid=123456789"
    },
    "individual": [
      {
        "author": "Mike T.",
        "date": "2025-03-15",
        "rating": 5,
        "reviewBody": "Best ramen I've ever had outside of Fukuoka! The broth is incredibly rich and flavorful. Will definitely return.",
        "source": "google"
      }
    ]
  },

  /* ─── RESERVATION & BOOKING ─────────────────────────────────────────────── */
  "reservation": {
    "acceptsReservations": true,
    "reservationMethods": ["phone", "online", "walk-in"],
    "onlineBookingUrl": "https://reservations.ramentaro.tokyo",
    "groupsServed": {
      "min": 1,
      "max": 20,
      "largeGroups": true,
      "largeGroupCapacity": 30
    },
    "privateDining": {
      "available": true,
      "capacity": 12,
      "minimumSpend": "¥30,000",
      "description": "Private tatami room for 8-12 guests"
    }
  },

  /* ─── ADVANCED SCHEMA FIELDS ─────────────────────────────────────────────── */
  "advancedSchema": {
    "foundedDate": "1985-04-15",
    "foundingLocation": "Fukuoka, Japan",
    "numberOfEmployees": 15,
    "hasMap": "https://www.google.com/maps/place/Ramen-Taro",
    "currenciesAccepted": ["JPY", "Credit Card", "Suica"],
    "paymentAccepted": ["Cash", "Credit Card", "Mobile Payment"],
    "servesCuisine": ["Japanese", "Ramen", "Noodles"],
    "menuType": ["dine-in", "takeout", "catering"],
    "starRating": 4.8,
    "priceRange": "$$",
    "eventType": ["birthday", "corporate", "private_dining", "anniversary"],
    "seats": 45,
    "smoking": "No Smoking"
  },

  /* ─── MULTI-LOCATION SUPPORT ─────────────────────────────────────────────── */
  "locations": [
    {
      "name": "Main Branch",
      "slug": "main",
      "address": "4-10-10 Kiyohara, Higashiyamato, Tokyo 207-0011",
      "phone": "+81 3-8765-4321",
      "lat": 35.7394006,
      "lng": 139.4449135,
      "isPrimary": true,
      "openingHours": [...],
      "parking": "Street only"
    }
    // Add more locations for chain restaurants
  ]
}
```

---

## Field Descriptions & Why They Matter

### SEO Section (`seo.*`)
- `title` → Meta title (search result headline) - **MOST IMPORTANT**
- `description` → Meta description (SERP snippet) - drives CTR
- `keywords` → Keywords meta tag (minor SEO, but helps content strategy)
- `noindex` → Hide from search (use for thin/duplicate pages)
- `canonical` → Prevent duplicate content

### Social (`social.*`)
- `ogImage` → Share image on Facebook/LinkedIn
- `sameAs` → Google verifies business across platforms → **LOCAL SEO CRITICAL**
- `twitterCard` → Rich Twitter cards
- `twitterSite` → Brand Twitter handle

### Schema (`schema.*`)
- `priceRange` → `$`, `$$`, `$$$`, `$$$$` for rich snippets
- `servesCuisine` → Filter for "Japanese near me"
- `acceptsReservations` → Booking buttons in search
- `aggregateRating` → Star ratings in SERPs → **massive CTR boost**

### Local SEO (`localSEO.*`)
- `placeId` → Exact Google Maps match for local pack
- All address fields must match Google Business Profile **EXACTLY**
- `timezone` for accurate hours display

### Content (`content.*`)
- `tagline` → Brand differentiator for headings
- `mission/philosophy` → E-E-A-T content
- `keywordsByPage` → Guide internal linking & content gaps

### Image SEO (`images.*`)
Every image gets:
- `url` (required)
- `alt` (required - for accessibility & image search)
- `credit` (optional - for attribution)

### Operations (`operations.*`)
These enable **search filters**:
- "vegan ramen" → `dietaryOptions.vegan: true`
- "restaurants with wifi" → `features.wifi: true`
- "open now" → `openingHours` schema

---

## Validation Checklist for Data Entry

When adding a new restaurant, ensure:

### Required Fields (All Restaurants)
- [x] `name`
- [x] `description` (≥50 characters)
- [x] `address` (full Japanese address)
- [x] `phone` (with country code +81)
- [x] `email` (professional domain)
- [x] `hero.slides[0].image` (1200px+ minimum)
- [x] `hero.slides[0].title` (descriptive, not "welcome")

### SEO Required Fields
- [x] `seo.title` (50-60 chars, includes location)
- [x] `seo.description` (150-160 chars, keyword-rich)
- [x] `social.sameAs` (at least 1-2 profiles)
- [x] `schema.priceRange` (`$`, `$$`, `$$$`, or `$$$$`)
- [x] `schema.servesCuisine` (array, e.g. ["Japanese", "Ramen"])
- [x] `localSEO.placeId` (from Google Maps)
- [x] `images.logo.alt` (descriptive)
- [x] `images.heroImage.alt` (descriptive)

### High-Value Optional Fields
- [ ] `schema.aggregateRating` (if you have reviews)
- [ ] `founder` object in `about` (builds trust)
- [ ] `awards` array (credibility signals)
- [ ] `reviews.individual` (for review schema)
- [ ] `media.videos` (video rich results)
- [ ] `reservation.onlineBookingUrl` (ReserveAction schema)

### Validation Command (Future)

```bash
# Install data validation
npm install -D ajv

# Create scripts/validate-seo-data.js
node scripts/validate-seo-data.js ./restaurants/ramen-taro/data.json

# Should output:
# ✓ All required fields present
# ✓ Title length OK (58 chars)
# ✓ Description length OK (154 chars)
# ✓ Place ID format valid
# ✓ OG image URL reachable
```

---

## Common Mistakes to Avoid

❌ **BAD:**
```json
"seo": {
  "title": "Ramen Taro",  // Too generic, no location
  "description": "We serve delicious ramen."  // Too short, no keywords
}
```

✅ **GOOD:**
```json
"seo": {
  "title": "Ramen Taro | Authentic Hakata Ramen in Higashiyamato, Tokyo",
  "description": "Experience authentic Hakata ramen at Ramen Taro since 1985. Our 48-hour tonkotsu broth and handmade noodles deliver the true taste of Fukuoka. Located in Higashiyamato, Tokyo. Reservations recommended."
}
```

---

## Automated SEO Data Extraction

When you don't have all fields, fallback logic:

```typescript
// lib/seo.ts
export function generateTitle(restaurant: Restaurant): string {
  // Priority: 1. Custom SEO title, 2. Auto-generated from fields
  if (restaurant.data.seo?.title) {
    return restaurant.data.seo.title
  }

  const cuisine = restaurant.data.schema?.servesCuisine?.[0] || 'Japanese Cuisine'
  const city = restaurant.data.localSEO?.city || extractCity(restaurant.data.address) || 'Tokyo'
  
  return `${restaurant.data.name} | Authentic ${cuisine} in ${city}`
}

export function generateDescription(restaurant: Restaurant): string {
  if (restaurant.data.seo?.description) {
    return restaurant.data.seo.description
  }

  // Use about.content, truncate to 160
  const content = restaurant.data.about?.content || restaurant.data.description
  return truncate(content, 160)
}

export function getOgImage(restaurant: Restaurant): string {
  return (
    restaurant.data.social?.ogImage ||
    restaurant.data.images?.heroImage?.url ||
    restaurant.data.hero?.slides?.[0].image ||
    restaurant.data.logo ||
    '/default-og.jpg'
  )
}
```

---

## SEO Data Completeness Score

Calculate per restaurant:

```typescript
interface SEOScore {
  total: number
  completed: number
  percentage: number
  missing: string[]
}

function calculateSEOScore(data: RestaurantData): SEOScore {
  const requiredFields = [
    'seo.title',
    'seo.description',
    'social.sameAs',
    'images.logo.alt',
    'images.heroImage.alt',
    'schema.priceRange',
    'schema.servesCuisine',
    'localSEO.placeId',
    'localSEO.city',
  ]

  const completed = requiredFields.filter(field => getNestedValue(data, field)).length
  
  return {
    total: requiredFields.length,
    completed,
    percentage: Math.round((completed / requiredFields.length) * 100),
    missing: requiredFields.filter(field => !getNestedValue(data, field))
  }
}
```

**Goal:** 100% completeness before site launch

---

## Quick Start for New Restaurants

**Minimum viable SEO fields (5-minute setup):**

```json
{
  "seo": {
    "title": "Restaurant Name | Cuisine in City",
    "description": "One sentence describing the restaurant. Include cuisine type, location, and key differentiator."
  },
  "images": {
    "logo": { "url": "...", "alt": "Restaurant Name logo" },
    "heroImage": { "url": "...", "alt": "Description of hero image" }
  },
  "schema": {
    "priceRange": "$$",
    "servesCuisine": ["Cuisine Type"]
  },
  "localSEO": {
    "city": "City Name",
    "placeId": "Get from Google Maps"
  },
  "social": {
    "sameAs": ["https://instagram.com/restaurant"]
  }
}
```

**5 fields → 80% SEO readiness**

---

## Testing Your Data

1. **View in SEO Dashboard:** Visit `/seo` (noindex page) to see completeness
2. **Check structured data:** Use Google Rich Results Test with live page
3. **Validate image alt:** Inspect page → check every img has alt attribute
4. **Test mobile:** Mobile SERP preview in `/seo` dashboard

---

## Getting Google Place ID

For `localSEO.placeId`:

1. Go to https://developers.google.com/maps/documentation/places/web-service/overview
2. Use Place ID Finder: https://developers.google.com/maps/documentation/places/web-service/place-id
3. Enter restaurant address
4. Copy the `place_id` value (starts with `ChIJ...`)

Example:
```
Place ID: ChIJN1t_tDeuGGAR9AG-B4cQx8Y
```

This ensures your Google Business Profile links correctly.

---

## Next Steps After Data Entry

1. ✅ Fill all SEO fields in `data.json`
2. ✅ Run: `npm run typecheck` (verify TypeScript)
3. ✅ Run: `npm run lint` (code quality)
4. ✅ Deploy to staging
5. ✅ Visit `/seo` dashboard → verify all green checkmarks
6. ✅ Test each page's SERP preview in `/seo`
7. ✅ Validate structured data with Rich Results Test
8. ✅ Submit sitemap to Google Search Console
9. ✅ Monitor Search Console for indexing errors

---

**Need help?** Refer to:
- `SEO-OPTIMIZATION-PLAN.md` - Full implementation guide
- `SEO-ROUTES-SPEC.md` - Per-route SEO requirements
- `/seo` dashboard - Real-time validation
