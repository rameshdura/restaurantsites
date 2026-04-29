import { Metadata } from 'next'
import { RestaurantData, MenuItem } from './restaurant'

/**
 * Configuration
 */
const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://restaurantsite.io'
const DEFAULT_OG_IMAGE = `${DOMAIN}/og-default.jpg`

/**
 * Generate icons metadata from restaurant logo
 */
export function generateIcons(data: RestaurantData) {
  const logoUrl = data.images?.logo?.url || data.logo || '/favicon.ico'
  
  return {
    icon: [
      { url: logoUrl },
      { url: logoUrl, sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: logoUrl, sizes: '180x180', type: 'image/png' },
    ],
  }
}

/**
 * Truncate text to max length, preserving word boundaries
 */
export function truncate(text: string | undefined, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  
  // Try to truncate at word boundary
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}

/**
 * Extract city name from address string
 * Simple implementation - enhance with address parsing library for production
 */
export function extractCity(address: string | undefined): string {
  if (!address) return 'Tokyo'
  
  // Try to extract city from Japanese address format
  // Example: "4-chōme-10-10 Kiyohara, Higashiyamato, Tokyo 207-0011, Japan"
  const parts = address.split(',').map(p => p.trim())
  
  // Look for Tokyo, Osaka, etc.
  for (const part of parts) {
    if (part.includes('Tokyo') || part.includes('Ōsaka') || part.includes('Kyoto')) {
      return part
    }
  }
  
  // Return last part before country
  return parts[parts.length - 2] || 'Tokyo'
}

/**
 * Detect cuisine type from menu categories
 */
export function detectCuisine(data: RestaurantData): string {
  if (data.schema?.servesCuisine?.[0]) {
    return data.schema.servesCuisine[0]
  }
  
  const categories = data.menu?.map(item => item.category) || []
  const uniqueCategories = [...new Set(categories)]
  
  // Map categories to cuisine types
  const cuisineMap: Record<string, string> = {
    'Ramen': 'Japanese Ramen',
    'Sushi': 'Japanese Sushi',
    'Sashimi': 'Japanese Sushi',
    'Tempura': 'Japanese',
    'Udon': 'Japanese',
    'Soba': 'Japanese',
    'Yakitori': 'Japanese Izakaya',
    'Tonkatsu': 'Japanese',
    'Curry': 'Japanese Curry',
    'Yakiniku': 'Japanese BBQ',
    'Pizza': 'Italian',
    'Pasta': 'Italian',
    'Burger': 'American',
    'Steak': 'American',
    'Tacos': 'Mexican',
    'Salsa': 'Mexican',
  }
  
  for (const category of uniqueCategories) {
    if (cuisineMap[category]) {
      return cuisineMap[category]
    }
  }
  
  return 'Japanese Cuisine'
}

/**
 * Format opening hours for schema.org
 * Input: [{ day: "Mon - Thu", lunch: "11:30 - 15:00", dinner: "17:00 - 22:00" }]
 * Output: ["Mo-Fr 11:30-15:00 17:00-22:00"]
 */
export function formatOpeningHours(
  hours: RestaurantData['openingHours']
): string[] {
  if (!hours || hours.length === 0) return []
  
  const dayMap: Record<string, string> = {
    'Mon': 'Mo', 'Tue': 'Tu', 'Wed': 'We', 'Thu': 'Th',
    'Fri': 'Fr', 'Sat': 'Sa', 'Sun': 'Su',
    'Monday': 'Mo', 'Tuesday': 'Tu', 'Wednesday': 'We', 'Thursday': 'Th',
    'Friday': 'Fr', 'Saturday': 'Sa', 'Sunday': 'Su',
    'Mon - Thu': 'Mo-Th', 'Mon-Thu': 'Mo-Th',
    'Fri - Sat': 'Fr-Sa', 'Fri-Sat': 'Fr-Sa',
  }
  
  return hours
    .filter(h => !h.isClosed)
    .map(h => {
      const day = dayMap[h.day] || h.day
      const times = [h.lunch, h.dinner].filter(Boolean).join(', ')
      return `${day} ${times}`
    })
}

/**
 * Get price range from menu prices
 */
export function getPriceRange(menu: MenuItem[]): string {
  if (!menu || menu.length === 0) return '$$'
  
  const prices = menu
    .map(item => {
      const num = typeof item.price === 'number' 
        ? item.price 
        : parseFloat(item.price.replace(/[^0-9.]/g, ''))
      return num
    })
    .filter(p => !isNaN(p))
  
  if (prices.length === 0) return '$$'
  
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  
  // Convert to $ scale (assuming roughly $10 = $1)
  const avg = (min + max) / 2
  
  if (avg < 15) return '$'
  if (avg < 30) return '$$'
  if (avg < 60) return '$$$'
  return '$$$$'
}

/**
 * Calculate estimated delivery time from menu items
 */
export function getAverageDishPrice(menu: MenuItem[]): number {
  if (!menu || menu.length === 0) return 0
  
  const prices = menu.map(item => {
    const num = typeof item.price === 'number' 
      ? item.price 
      : parseFloat(String(item.price).replace(/[^0-9.]/g, ''))
    return num || 0
  })
  
  return prices.reduce((sum, p) => sum + p, 0) / prices.length
}

/**
 * Generate primary keywords from restaurant data
 */
export function generateKeywords(data: RestaurantData): string[] {
  const keywords: string[] = []
  
  // Restaurant name
  if (data.name) keywords.push(data.name.toLowerCase())
  
  // Cuisine types
  if (data.schema?.servesCuisine) {
    keywords.push(...data.schema.servesCuisine.map(c => c.toLowerCase()))
  }
  
  // From menu categories
  const categories = [...new Set((data.menu || []).map(item => item.category))]
  keywords.push(...categories.map(c => c.toLowerCase()))
  
  // Popular dishes (top 5)
  const popularDishes = (data.menu || [])
    .filter(item => item.isPopular)
    .slice(0, 5)
    .map(item => item.name.toLowerCase())
  keywords.push(...popularDishes)
  
  // Location-based keywords
  if (data.localSEO?.city) {
    keywords.push(`${detectCuisine(data)} ${data.localSEO.city}`)
    keywords.push(`${data.name} ${data.localSEO.city}`)
  }
  
  // Remove duplicates
  return [...new Set(keywords)].slice(0, 20)
}

// ============================================================================
// METADATA GENERATORS PER ROUTE
// ============================================================================

/**
 * Generate metadata for restaurant home page (/[slug])
 */
export function generateHomeMetadata(
  data: RestaurantData,
  slug: string,
  pathname: string = '/'
): Metadata {
  const title = data.seo?.title || 
    `${data.name} | Authentic ${detectCuisine(data)} in ${extractCity(data.address)}`
  
  const description = data.seo?.description || 
    truncate(data.about?.content || data.description, 160)
  
  const heroImage = data.hero?.slides?.[0]?.image || 
    data.images?.heroImage?.url || 
    data.logo || 
    DEFAULT_OG_IMAGE
  
  const keywords = data.seo?.keywords || generateKeywords(data)
  
  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: data.name }],
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/${slug}${pathname}`,
      siteName: data.name,
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: data.images?.heroImage?.alt || `${data.name} - Authentic dining experience`,
        },
      ],
      locale: data.social?.ogLocale || 'en_US',
      type: 'website',
    },
    twitter: {
      card: (data.social?.twitterCard || 'summary_large_image') as 'summary_large_image' | 'summary' | 'player' | 'app',
      title,
      description,
      images: [heroImage],
      site: data.social?.twitterSite,
    },
    alternates: {
      canonical: data.seo?.canonical || `${DOMAIN}/${slug}${pathname}`,
    },
    robots: {
      index: data.seo?.noindex ? false : true,
      follow: true,
    },
    icons: generateIcons(data),
  }
}

/**
 * Generate metadata for About page (/[slug]/about)
 */
export function generateAboutMetadata(
  data: RestaurantData,
  slug: string
): Metadata {
  const title = data.seo?.aboutTitle || 
    `About ${data.name} | ${data.about?.title || 'Our Story & Heritage'}`
  
  const description = data.seo?.aboutDescription || 
    truncate(data.about?.content || `Discover the story of ${data.name}. Learn about our heritage, culinary philosophy, and the team behind our authentic cuisine.`, 160)
  
  const aboutImage = data.about?.image || 
    data.images?.coverImage?.url || 
    data.hero?.slides?.[0]?.image || 
    data.logo || 
    DEFAULT_OG_IMAGE
  
  const keywords = data.seo?.keywords || [
    ...generateKeywords(data),
    'about us', 'our story', 'culinary heritage', 'restaurant history'
  ]

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/${slug}/about`,
      images: [
        {
          url: aboutImage,
          width: 1200,
          height: 630,
          alt: data.images?.coverImage?.alt || `${data.name} - Our story and heritage`,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [aboutImage],
    },
    alternates: {
      canonical: `${DOMAIN}/${slug}/about`,
    },
    icons: generateIcons(data),
  }
}

/**
 * Generate metadata for Menu page (/[slug]/menu)
 */
export function generateMenuMetadata(
  data: RestaurantData,
  slug: string
): Metadata {
  const cuisineTypes = data.schema?.servesCuisine?.slice(0, 3).join(', ') || 'Japanese cuisine'
  const popularDishes = (data.menu || [])
    .filter(item => item.isPopular)
    .slice(0, 3)
    .map(item => item.name)
    .join(', ')
  
  const title = data.seo?.menuTitle || 
    `${data.name} Menu | ${cuisineTypes} & Prices`
  
  const baseDescription = `Explore ${data.name}'s complete menu featuring ${cuisineTypes}. ` +
    `Popular dishes include ${popularDishes || 'our signature Specials'}. ` +
    (data.menuLink ? 'Download our full menu PDF.' : '')
  
  const description = data.seo?.menuDescription || truncate(baseDescription, 160)
  
  const menuImage = data.menu?.find(item => item.image && item.isPopular)?.image ||
    data.hero?.slides?.[0]?.image ||
    data.logo ||
    DEFAULT_OG_IMAGE
  
  const keywords = data.seo?.keywords || [
    ...generateKeywords(data),
    'menu', 'dishes', 'prices', 'food selection', cuisineTypes
  ]

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/${slug}/menu`,
      images: [
        {
          url: menuImage,
          width: 1200,
          height: 630,
          alt: `${data.name} menu - ${popularDishes}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [menuImage],
    },
    alternates: {
      canonical: `${DOMAIN}/${slug}/menu`,
    },
    icons: generateIcons(data),
  }
}

/**
 * Generate metadata for Contact page (/[slug]/contact)
 */
export function generateContactMetadata(
  data: RestaurantData,
  slug: string
): Metadata {
  const city = extractCity(data.address)
  
  const title = data.seo?.contactTitle || 
    `Contact ${data.name} | Reservations & Directions in ${city}`
  
  const description = data.seo?.contactDescription || 
    `Contact ${data.name} for reservations, directions, and inquiries. ` +
    `Located at ${data.address?.substring(0, 50)}. ` +
    `Phone: ${data.phone}. ` +
    `Open daily for lunch and dinner.`
  
  const keywords = data.seo?.keywords || [
    ...generateKeywords(data),
    'contact', 'reservations', 'directions', 'location', 'phone number', city
  ]

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/${slug}/contact`,
      images: [
        {
          url: data.images?.logo?.url || DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${data.name} contact information and map`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${DOMAIN}/${slug}/contact`,
    },
    icons: generateIcons(data),
  }
}

/**
 * Generate metadata for Brand Assets page (/[slug]/brand)
 * Default: noindex (thin content utility page)
 */
export function generateBrandMetadata(
  data: RestaurantData,
  slug: string
): Metadata {
  const title = data.seo?.brandTitle || 
    `${data.name} Brand Assets | Marketing Materials`
  
  const description = data.seo?.brandDescription || 
    `Download professional marketing materials for ${data.name}. ` +
    `Printable visiting cards, flyers, and brand assets pre-populated with your restaurant's information.`
  
  const keywords = data.seo?.keywords || [
    ...generateKeywords(data),
    'brand assets', 'marketing materials', 'business cards', 'flyers', 'branding'
  ]

  return {
    title,
    description,
    keywords: keywords.join(', '),
    robots: {
      index: false,  // noindex for thin content
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/${slug}/brand`,
      images: [
        {
          url: data.images?.logo?.url || DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${data.name} brand assets and marketing materials`,
        },
      ],
    },
    alternates: {
      canonical: `${DOMAIN}/${slug}/brand`,
    },
    icons: generateIcons(data),
  }
}

/**
 * Generate metadata for Company Information page (/[slug]/company-information)
 */
export function generateCompanyMetadata(
  data: RestaurantData,
  slug: string
): Metadata {
  const companyName = data.companyInfo?.name || data.name
  
  const title = data.seo?.companyTitle || 
    `${companyName} | Corporate Information`
  
  const description = data.seo?.companyDescription || 
    `Corporate information for ${data.name}: company registration, headquarters address, ` +
    `established date, capital, and fiscal year end.`
  
  const keywords = data.seo?.keywords || [
    ...generateKeywords(data),
    'corporate information', 'company details', 'legal', 'registration', companyName
  ]

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/${slug}/company-information`,
      images: [
        {
          url: data.images?.logo?.url || DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${data.name} corporate information`,
        },
      ],
      type: 'website',
    },
    alternates: {
      canonical: `${DOMAIN}/${slug}/company-information`,
    },
    icons: generateIcons(data),
  }
}

/**
 * Generate metadata for listing page (homepage)
 */
export function generateListingMetadata(
  restaurantCount: number
): Metadata {
  return {
    title: 'RestaurantSite Platform | Multi-Tenant Restaurant Websites',
    description: `A high-performance platform powering ${restaurantCount} authentic restaurant websites. Discover unique dining experiences at our partner restaurants.`,
    openGraph: {
      title: 'RestaurantSite Platform',
      description: 'Discover authentic dining experiences at our partner restaurants.',
      url: DOMAIN,
      type: 'website' as const,
    },
    alternates: {
      canonical: DOMAIN,
    },
  }
}

// ============================================================================
// STRUCTURED DATA GENERATORS (JSON-LD)
// ============================================================================

/**
 * Generate Restaurant JSON-LD schema
 */
export function generateRestaurantSchema(data: RestaurantData, slug: string): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: data.name,
    description: truncate(data.description, 500),
    image: data.hero?.slides?.[0]?.image || data.logo || DEFAULT_OG_IMAGE,
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address?.split(',')[0],
      addressLocality: extractCity(data.address),
      addressRegion: data.localSEO?.region,
      postalCode: extractPostalCode(data.address),
      addressCountry: data.localSEO?.countryCode || 'JP',
    },
    telephone: formatPhone(data.phone),
    email: data.email,
    url: `${DOMAIN}/${slug}`,
  }

  // Add opening hours
  const formattedHours = formatOpeningHours(data.openingHours)
  if (formattedHours.length > 0) {
    schema.openingHours = formattedHours
  }

  // Add price range
  if (data.schema?.priceRange) {
    schema.priceRange = data.schema.priceRange
  }

  // Add cuisine types
  if (data.schema?.servesCuisine?.length) {
    schema.servesCuisine = data.schema.servesCuisine
  }

  // Add reservations info
  if (data.schema?.acceptsReservations !== undefined) {
    schema.acceptsReservations = data.schema.acceptsReservations
  }

  // Add aggregate rating
  if (data.schema?.aggregateRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: data.schema.aggregateRating.ratingValue,
      reviewCount: data.schema.aggregateRating.reviewCount,
      bestRating: data.schema.aggregateRating.bestRating || 5,
      worstRating: data.schema.aggregateRating.worstRating || 1,
    }
  }

  // Add social profiles
  if (data.social?.sameAs?.length) {
    schema.sameAs = data.social.sameAs
  }

  // Add coordinates
  if (data.location?.lat && data.location?.lng) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: data.location.lat,
      longitude: data.location.lng,
    }
  }

  return schema
}

/**
 * Generate Menu schema (simplified for large menus)
 */
export function generateMenuSchema(data: RestaurantData, slug: string): object {
  const menuSections = (data.menu || [])
    .reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category]!.push(item)
      return acc
    }, {} as Record<string, MenuItem[]>)

  const hasMenuSection = Object.entries(menuSections).map(([category, items]) => ({
    '@type': 'MenuSection' as const,
    name: category,
    hasMenuItem: items.slice(0, 20).map(item => ({
      '@type': 'MenuItem' as const,
      name: item.name,
      description: truncate(item.description, 200),
      image: item.image,
      offers: {
        '@type': 'Offer' as const,
        price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')),
        priceCurrency: data.schema?.priceCurrency || 'JPY',
      },
    })),
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: `${data.name} Menu`,
    description: truncate(data.description, 500),
    hasMenuSection: hasMenuSection,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${DOMAIN}/${slug}/menu`,
    },
  }
}

/**
 * Generate ContactPoint schema
 */
export function generateContactSchema(data: RestaurantData): object[] {
  const contacts: Record<string, unknown>[] = []
  
  if (data.phone) {
    contacts.push({
      '@type': 'ContactPoint',
      telephone: formatPhone(data.phone),
      contactType: 'reservations',
      areaServed: data.localSEO?.city || 'Tokyo',
      availableLanguage: ['English', 'Japanese'],
    })
  }
  
  if (data.email) {
    contacts.push({
      '@type': 'ContactPoint',
      email: data.email,
      contactType: 'customer service',
      areaServed: data.localSEO?.city || 'Tokyo',
    })
  }
  
  return contacts
}

/**
 * Generate Person schema for founder/chef
 */
export function generatePersonSchema(person: {
  name: string
  role: string
  bio: string
  image?: string
  social?: Record<string, string>
}): object {
  const schema: Record<string, unknown> = {
    '@type': 'Person',
    name: person.name,
    jobTitle: person.role,
    description: truncate(person.bio, 500),
  }
  
  if (person.image) {
    schema.image = person.image
  }
  
  if (person.social) {
    schema.sameAs = Object.values(person.social)
  }
  
  return schema
}

/**
 * Generate AboutPage schema
 */
export function generateAboutPageSchema(data: RestaurantData, slug: string): object {
  const mainEntity: Record<string, unknown> = {
    '@type': 'Organization',
    name: data.name,
    description: truncate(data.about?.content || data.description, 500),
  }
  
  // Add founder as person
  if (data.about?.founder) {
    mainEntity.founder = generatePersonSchema(data.about.founder)
  }
  
  // Add founding date
  if (data.foundingDate || data.about?.foundedYear) {
    mainEntity.foundingDate = data.foundingDate || 
      `${data.about?.foundedYear}-01-01`
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    mainEntity,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${DOMAIN}/${slug}/about`,
    },
  }
}

/**
 * Generate Brand Page schema
 */
export function generateBrandSchema(data: RestaurantData, slug: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${data.name} Brand Assets`,
    description: `Marketing materials and brand assets for ${data.name}.`,
    url: `${DOMAIN}/${slug}/brand`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Business Cards',
          description: 'Printable visiting cards'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Marketing Flyers',
          description: 'A5 promotional flyers'
        }
      ]
    }
  }
}

/**
 * Generate Organization schema (for company info page)
 */
export function generateOrganizationSchema(data: RestaurantData): object {
  const info = data.companyInfo
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: info?.name || data.name,
    legalName: (info as any)?.legalName || info?.name || data.name,
    identifier: info?.registrationNumber,
    taxID: info?.registrationNumber,
    address: {
      '@type': 'PostalAddress',
      streetAddress: info?.address?.split(',')[0],
      addressLocality: extractCity(info?.address),
      addressRegion: info?.address?.includes('Kanagawa') ? 'Kanagawa' : info?.address?.includes('Tokyo') ? 'Tokyo' : undefined,
      postalCode: extractPostalCode(info?.address),
      addressCountry: 'JP',
    },
    telephone: formatPhone(info?.phone || data.phone),
    email: data.email,
    url: (info as any)?.url || `${DOMAIN}/${data.name.toLowerCase().replace(/\s+/g, '-')}/company-information`,
    logo: data.images?.logo?.url || data.logo,
    foundingDate: data.foundingDate || info?.establishedDate,
  }

  if (data.social?.sameAs?.length) {
    schema.sameAs = data.social.sameAs
  }

  return schema
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format phone number to E.164
 */
function formatPhone(phone?: string): string {
  if (!phone) return ''
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  
  // Japanese numbers: +81 3-8765-4321 → +81387654321
  if (digits.startsWith('81') && digits.length === 11) {
    return `+${digits}`
  }
  
  // US numbers: assume +1 if 10 digits
  if (digits.length === 10) {
    return `+1${digits}`
  }
  
  return phone
}

/**
 * Extract postal code from address
 */
function extractPostalCode(address?: string): string {
  if (!address) return ''
  
  // Match Japanese postal code: XXX-XXXX
  const jpMatch = address.match(/\d{3}-\d{4}/)
  if (jpMatch) return jpMatch[0]
  
  // Match US zip: XXXXX or XXXXX-XXXX
  const usMatch = address.match(/\d{5}(?:-\d{4})?/)
  if (usMatch) return usMatch[0]
  
  return ''
}

/**
 * Validate SEO data completeness
 */
export function validateSEOData(data: RestaurantData): {
  isValid: boolean
  missing: string[]
  warnings: string[]
} {
  const missing: string[] = []
  const warnings: string[] = []
  
  // Required fields check
  if (!data.seo?.title) missing.push('seo.title')
  if (!data.seo?.description) missing.push('seo.description')
  if (!data.images?.logo?.alt) missing.push('images.logo.alt')
  if (!data.images?.heroImage?.alt) missing.push('images.heroImage.alt')
  if (!data.schema?.priceRange) missing.push('schema.priceRange')
  if (!data.schema?.servesCuisine?.length) missing.push('schema.servesCuisine')
  if (!data.localSEO?.placeId) missing.push('localSEO.placeId')
  
  // Warnings (not critical but should fix)
  if (data.seo?.title && data.seo.title.length > 60) {
    warnings.push('seo.title exceeds 60 characters')
  }
  if (data.seo?.description && data.seo.description.length > 160) {
    warnings.push('seo.description exceeds 160 characters')
  }
  if (!data.social?.sameAs?.length) {
    warnings.push('social.sameAs empty - add social profiles for link equity')
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  }
}

/**
 * Generate sitemap entries for a restaurant
 */
export function generateRestaurantSitemapEntries(
  slug: string,
  data: RestaurantData
): Array<{
  url: string
  lastModified: Date
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}> {
  const lastMod = new Date()
  const baseUrl = `${DOMAIN}/${slug}`
  
  const pages: Array<{
    url: string
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
    priority: number
  }> = [
    {
      url: baseUrl,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/menu`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]
  
  // Mark brand page as low priority
  pages.push({
    url: `${baseUrl}/brand`,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  })
  
  // Company info page (if exists)
  if (data.companyInfo) {
    pages.push({
      url: `${baseUrl}/company-information`,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })
  }
  
  return pages.map(page => ({
    ...page,
    lastModified: lastMod,
  }))
}

/**
 * Get structured data type for each route
 */
export const ROUTE_SCHEMA_MAP: Record<string, string[]> = {
  '/': ['ItemList'],
  'home': ['Restaurant', 'BreadcrumbList'],
  'about': ['AboutPage', 'Person'],
  'menu': ['Menu', 'MenuItem'],
  'contact': ['ContactPoint'],
  'brand': [],
  'company': ['Organization'],
}
