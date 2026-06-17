/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "node:fs/promises"
import path from "node:path"

// ---------------------------------------------------------------------------
// Block-based schema types (v1)
// ---------------------------------------------------------------------------

export interface UiMeta {
  order: number
  visible: boolean
  fullBleed?: boolean
  layout?: string
  theme?: string
}

export interface SectionBlock<T = Record<string, unknown>> {
  id: string
  type: string
  ui: UiMeta
  data: T & { ref?: string }
}

export interface PageDef {
  id: string
  coverImage?: string
  sections: SectionBlock[]
}

/** Fields present only in the v1 block schema */
export interface BlockSchemaFields {
  uid?: string
  version?: string
  pages?: Record<string, PageDef>
  /** Canonical contact pool (address, phone, email, location, openingHours) */
  contact?: {
    address: string
    phone: string
    email: string
    location?: RestaurantData["location"]
    openingHours?: RestaurantData["openingHours"]
    holidayNotes?: string
  }
  /** Canonical team pool */
  team?: Array<{
    id: string
    name: string
    role: string
    image: string
    bio?: string
    social?: Record<string, string>
  }>
  /** Canonical reviews pool — new schema uses id + comment field */
  reviewsPool?: Array<{
    id: string
    author: string
    rating: number
    date: string
    comment: string
    source?: string
  }>
}

export interface CompanyInfo {
  name: string
  registrationNumber: string
  address: string
  phone: string
  establishedDate: string
  capital: string
  fiscalYearEnd: string
}

export interface RestaurantData extends BlockSchemaFields {
  name: string
  description: string
  tagline?: string
  address: string
  phone: string
  email: string
  logo?: string
  menuLink?: string

  // SEO fields
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
    noindex?: boolean
    canonical?: string
    menuTitle?: string
    menuDescription?: string
    aboutTitle?: string
    aboutDescription?: string
    contactTitle?: string
    contactDescription?: string
    brandTitle?: string
    brandDescription?: string
    companyTitle?: string
    companyDescription?: string
  }

  // Social media
  social?: {
    ogImage?: string
    ogLocale?: string
    twitterCard?: string
    twitterSite?: string
    sameAs?: string[]
  }

  // Schema.org hints
  schema?: {
    priceRange?: "$" | "$$" | "$$$" | "$$$$"
    servesCuisine?: string[]
    acceptsReservations?: boolean
    isTakeout?: boolean
    isDelivery?: boolean
    priceCurrency?: string
    aggregateRating?: {
      ratingValue: number
      reviewCount: number
      bestRating?: number
      worstRating?: number
      source?: string
      sourceUrl?: string
    }
  }

  // Local SEO
  localSEO?: {
    neighborhood?: string
    city?: string
    region?: string
    country?: string
    countryCode?: string
    postalCode?: string
    placeId?: string
    googleMapsPlaceId?: string
    googleMapsUrl?: string
    wazeUrl?: string
    appleMapsUrl?: string
    timezone?: string
  }

  // Content SEO
  content?: {
    tagline?: string
    shortDescription?: string
    mission?: string
    philosophy?: string
    keywordsByPage?: {
      home?: string[]
      about?: string[]
      menu?: string[]
      contact?: string[]
    }
    founder?: {
      name: string
      role: string
      bio: string
      image?: string
      qualifications?: string[]
      social?: Record<string, string>
      since?: string
    }
    awards?: Array<{
      year: number
      title: string
      issuer: string
    }>
  }

  // Image SEO
  images?: {
    logo?: {
      url: string
      alt: string
      width?: number
      height?: number
    }
    heroImage?: {
      url: string
      alt: string
      credit?: string
    }
    coverImage?: {
      url: string
      alt: string
      credit?: string
    }
    gallery?: Array<{
      url: string
      alt: string
      credit?: string
    }>
    team?: Array<{
      url: string
      alt: string
      name: string
      role: string
    }>
    featured?: Array<{
      id: string
      url: string
      alt: string
    }>
    drinks?: Array<{
      id: string
      url: string
      alt: string
    }>
    about?: Array<{
      id: string
      url: string
      alt: string
    }>
  }

  // Operations & features
  operations?: {
    paymentMethods?: string[]
    dietaryOptions?: {
      vegetarian?: boolean
      vegan?: boolean
      glutenFree?: boolean
      halal?: boolean
      kosher?: boolean
      dairyFree?: boolean
      nutFree?: boolean
    }
    features?: {
      privateDining?: boolean
      privateDiningCapacity?: number
      privateDiningDescription?: string
      outdoorSeating?: boolean
      wifi?: boolean
      wifiPassword?: string
      parking?: string
      parkingDetails?: string
      wheelchairAccessible?: boolean
      petFriendly?: boolean
      romantic?: boolean
      goodForGroups?: boolean
      goodForFamilies?: boolean
      goodForDateNight?: boolean
    }
    services?: {
      takeout?: boolean
      delivery?: boolean
      deliveryPlatforms?: string[]
      deliveryRadius?: string
      catering?: boolean
      cateringRadius?: string
      cateringMinimum?: string
      reservations?: boolean
      reservationMethods?: string[]
      onlineBookingUrl?: string
      banquets?: boolean
      banquetCapacity?: number
    }
  }

  // Advanced schema
  advancedSchema?: {
    foundedDate?: string
    foundingLocation?: string
    numberOfEmployees?: number
    hasMap?: string
    currenciesAccepted?: string[]
    paymentAccepted?: string[]
    servesCuisine?: string[]
    menuType?: string[]
    starRating?: number
    priceRange?: string
    eventType?: string[]
    seats?: number
    smoking?: string
    music?: string
    attire?: string
  }

  // Multi-location support
  locations?: Array<{
    name: string
    slug: string
    address: string
    phone: string
    lat: number
    lng: number
    isPrimary: boolean
    openingHours?: RestaurantData["openingHours"]
    parking?: string
  }>

  hero?: {
    slides: {
      image: string
      title: string
      subtitle: string
      ctaText?: string
      ctaLink?: string
      alt?: string
    }[]
  }

  about?: {
    title: string
    content: string
    image?: string
    images?: string[]
    additionalContent?: string[]
    foundedYear?: number
    founder?: {
      name: string
      role: string
      bio: string
      image?: string
      qualifications?: string[]
      social?: Record<string, string>
      since?: string
    }
    awards?: Array<{
      year: number
      title: string
      issuer: string
    }>
    mission?: string
    philosophy?: string
    heritage?: string
    team?: Array<{
      name: string
      role: string
      image: string
      bio?: string
      social?: Record<string, string>
      since?: string
    }>
  }

  companyInfo?: CompanyInfo

  location?: {
    lat: number
    lng: number
    address?: string
    mapsUrl?: string
    embedUrl?: string
    plusCode?: string
  }

  openingHours?: {
    day: string
    lunch?: string
    lunchLO?: string
    dinner?: string
    dinnerLO?: string
    time?: string
    isClosed?: boolean
    notes?: string
  }[]
  holidayNotes?: string
  tables?: Array<{ id: number | string; label: string; capacity?: number }>
  menu?: MenuItem[]
  menuCategories?: any[]
  reviews?:
    | {
        aggregate?: {
          ratingValue: number
          reviewCount: number
          bestRating?: number
          worstRating?: number
          source?: string
          sourceUrl?: string
        }
        individual?: Array<{
          author: string
          date: string
          rating: number
          reviewBody: string
          source?: string
        }>
      }
    | Array<{
        author: string
        rating: number
        date: string
        comment: string
        source?: string
      }>
  reservation?: {
    acceptsReservations: boolean
    reservationMethods: string[]
    onlineBookingUrl?: string
    minimumPartySize?: number
    maximumPartySize?: number
    largeGroups?: boolean
    largeGroupCapacity?: number
    privateDining?: {
      available: boolean
      capacity: number
      minimumSpend?: string
      description?: string
    }
  }
  media?: {
    videos?: Array<{
      url: string
      title: string
      description: string
      thumbnail: string
      duration: string
      uploadDate: string
    }>
    virtualTour?: string
    pressPhotos?: string
  }
  foundingDate?: string
  numberOfEmployees?: number
  knowsLanguage?: string[]
  cuisineType?: string

  app?: {
    language?: string
    currency?: string
  }
  theme?: {
    mode?: "light" | "dark" | "system"
    palette?: {
      primary?: string
      primaryForeground?: string
      background?: string
      foreground?: string
      accent?: string
      muted?: string
    }
    layout?: {
      buttonRadius?: string
      cardRadius?: string
      inputRadius?: string
    }
    typography?: {
      fontHeading?: string
      fontSans?: string
    }
  }
}

export interface MenuOptionSelection {
  id: string
  name: string
  price?: string | number
}

export interface MenuOption {
  id: string
  name: string
  selections: MenuOptionSelection[]
}

export interface MenuItem {
  id?: string
  name: string
  description: string
  price: string
  category: string
  image?: string
  isPopular?: boolean
  isSpicy?: boolean
  isVegetarian?: boolean
  secondaryName?: string
  options?: MenuOption[]
}

export interface Restaurant {
  slug: string
  data: RestaurantData
  menu: MenuItem[]
}

export interface MenuCategory {
  id: string
  title: string
  items: Array<{
    id: string
    name: string
    description: string
    price: string
    image?: string
    isPopular?: boolean
    isSpicy?: boolean
    isVegetarian?: boolean
    secondaryName?: string
    options?: MenuOption[]
  }>
}

const RESTAURANTS_PATH = path.join(process.cwd(), "restaurants")

// Pre-process/resolve embed URL for Google Maps
// This runs once per restaurant load instead of on every page render
function resolveEmbedUrl(
  location?: RestaurantData["location"],
  name?: string,
  address?: string
): string | null {
  // The most reliable way to get a map with a business pin without an API key
  if (name && address) {
    const query = encodeURIComponent(`${name} ${address}`)
    return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`
  }

  if (!location?.mapsUrl) return null

  try {
    const mapsUrl = location.mapsUrl

    // Handle Google Maps URLs (including short goo.gl links)
    if (mapsUrl.includes("goo.gl") || mapsUrl.includes("google.com/maps")) {
      let embedUrlStr = mapsUrl

      if (mapsUrl.includes("/place/")) {
        embedUrlStr = mapsUrl
          .replace("/place/", "/embed/")
          .replace(/\/data=!.*$/, "")
      } else if (mapsUrl.includes("@")) {
        const match = mapsUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),(\d+[a-z]?)/)
        if (match && match[3]) {
          // Use pb format for reliable coordinate-based maps without API key
          embedUrlStr = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d14488!2d${match[2]}!3d${match[1]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1s0x0%3A0x0!3e0`
        }
      }

      if (embedUrlStr === mapsUrl || !embedUrlStr.includes("embed")) {
        // For short goo.gl / maps.app.goo.gl links, build embed URL from lat/lng
        if (
          (mapsUrl.includes("goo.gl") || mapsUrl.includes("maps.app.goo.gl")) &&
          location.lat &&
          location.lng
        ) {
          // Use pb format with proper coordinates - shows map centered on location
          embedUrlStr = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d14488!2d${location.lng}!3d${location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1s0x0%3A0x0!3e0`
        } else {
          embedUrlStr = mapsUrl.includes("?")
            ? mapsUrl + "&output=embed"
            : mapsUrl + "?output=embed"
        }
      }

      return embedUrlStr
    }
  } catch (error) {
    console.error("Failed to resolve embed URL:", error)
  }

  return null
}

/**
 * Normalise a v1 block-schema data.json so every page and legacy field works
 * exactly as before. Legacy restaurants (no `uid`) pass through unchanged.
 */
function normaliseBlockSchema(data: RestaurantData): RestaurantData {
  if (!data.uid || !data.pages) return data // legacy — nothing to do

  const home = data.pages.home

  // Hoist shared contact pool → top-level legacy fields
  if (data.contact) {
    data.address ??= data.contact.address
    data.phone ??= data.contact.phone
    data.email ??= data.contact.email
    data.openingHours ??= data.contact.openingHours
    data.holidayNotes ??= data.contact.holidayNotes
    if (!data.location && data.contact.location) {
      data.location = data.contact.location
    }
  }

  // Hoist hero section → data.hero
  if (home && !data.hero) {
    const heroSection = home.sections.find((s) => s.id === "hero")
    if (heroSection) {
      const d = heroSection.data as {
        slides?: RestaurantData["hero"] extends { slides: infer S }
          ? S
          : never[]
      }
      data.hero = { slides: d.slides ?? [] }
    }
  }

  // Hoist about section → data.about
  if (home && !data.about) {
    const aboutSection = home.sections.find((s) => s.id === "about")
    if (
      aboutSection?.data &&
      !(
        "ref" in aboutSection.data &&
        aboutSection.data.ref !== "pages.home.sections.about.data"
      )
    ) {
      const d = aboutSection.data as {
        title?: string
        content?: string
        images?: string[]
        additionalContent?: string[]
        foundedYear?: number
        founder?: RestaurantData["about"] extends { founder?: infer F }
          ? F
          : never
      }
      data.about = {
        title: d.title ?? "",
        content: d.content ?? "",
        images: d.images,
        additionalContent: d.additionalContent,
        foundedYear: d.foundedYear,
        founder: d.founder,
        team: data.team?.map((m) => ({
          name: m.name,
          role: m.role,
          image: getImageSrc(data.uid || "", m.image),
          bio: m.bio,
          social: m.social,
        })),
      }
    }
  }

  // Hoist gallery images → images.gallery
  if (data.images && Array.isArray(data.images.gallery)) {
    // already an array of objects — keep as-is
  } else if (data.images && !data.images.gallery) {
    // no gallery yet — nothing to hoist
  }

  // Hoist reviews pool → legacy data.reviews array
  if (
    data.reviews === undefined &&
    Array.isArray((data as unknown as Record<string, unknown>).reviews)
  ) {
    // already set
  } else if (data.reviews === undefined) {
    const reviewsSection = home?.sections.find((s) => s.id === "reviews")
    if (
      reviewsSection?.data?.ref === "reviews" &&
      Array.isArray(
        (data as unknown as Record<string, unknown & { reviews?: unknown[] }>)
          .reviews
      )
    ) {
      // reviews pool is at data.reviews (same key) — already populated by JSON
    }
  }

  return data
}

export async function getRestaurant(slug: string): Promise<Restaurant | null> {
  // If the slug is empty or looks like a file/asset request (contains a dot), skip loading
  if (!slug || slug.includes(".")) {
    return null
  }

  try {
    const restaurantPath = path.join(RESTAURANTS_PATH, slug)

    // Read data.json
    const dataPath = path.join(restaurantPath, "data.json")
    const dataRaw = await fs.readFile(dataPath, "utf8")
    let data: RestaurantData = JSON.parse(dataRaw)
    console.log(`[DEBUG] Loaded restaurant ${slug} name:`, data.name)

    // Normalise v1 block schema → legacy fields
    data = normaliseBlockSchema(data)

    // Pre-resolve embed URL once at load time
    if (data.location && !data.location.embedUrl) {
      const address =
        data.location.address || data.address || data.contact?.address
      data.location.embedUrl =
        resolveEmbedUrl(data.location, data.name, address) || undefined
    }

    // Also resolve for contact.location if it's a separate object
    if (data.contact?.location && !data.contact.location.embedUrl) {
      const address =
        data.contact.location.address || data.contact.address || data.address
      data.contact.location.embedUrl =
        resolveEmbedUrl(data.contact.location, data.name, address) || undefined
    }

    // Extract menu from data or default to empty array
    const menu = data.menu || []

    return {
      slug,
      data,
      menu,
    }
  } catch (error) {
    console.error(`Error loading restaurant data for ${slug}:`, error)
    return null
  }
}

export async function getAllRestaurantSlugs(): Promise<string[]> {
  try {
    const dirs = await fs.readdir(RESTAURANTS_PATH, { withFileTypes: true })
    return dirs
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
  } catch (error) {
    console.error("Error reading restaurants directory:", error)
    return []
  }
}

/** Resolve an image URL and serve it from the `public/` folder.
 *
 * v2 convention — URLs already point directly into
 *   public/images/restaurants/<slug>/…
 *   e.g. "/images/restaurants/ramen-taro/homeslider/ramen-1.jpg"
 * is the filesystem path:
 *   public/images/restaurants/ramen-taro/homeslider/ramen-1.jpg
 *
 * External URLs (http/https) are returned as-is.
 * All other relative/absolute paths are returned as-is for global static assets.
 */
export function getImageSrc(
  slug: string,
  url: string | undefined | null
): string {
  if (!url) return ""
  if (/^https?:\/\//i.test(url)) return url

  // Rewrite any static absolute restaurant image paths to be fully dynamic to the current slug
  if (url.startsWith("/images/restaurants/")) {
    const relativePart = url.replace(/^\/images\/restaurants\/[^/]+\//, "")
    return `/images/restaurants/${slug}/${relativePart}`
  }

  // If it's a relative path (doesn't start with /), assume it's in the restaurant's image folder
  if (!url.startsWith("/")) {
    return `/images/restaurants/${slug}/${url}`
  }

  return url
}

export function groupMenuByCategory(
  menu: MenuItem[],
  slug: string
): MenuCategory[] {
  return menu.reduce((acc, item) => {
    const existingCategory = acc.find((c) => c.title === item.category)
    const menuItem = {
      id: item.id || item.name.toLowerCase().replace(/\s+/g, "-"),
      name: item.name,
      description: item.description,
      price: item.price,
      image: getImageSrc(slug, item.image),
      isPopular: item.isPopular,
      isSpicy: item.isSpicy,
      isVegetarian: item.isVegetarian,
      secondaryName: item.secondaryName,
      options: item.options,
    }

    if (existingCategory) {
      existingCategory.items.push(menuItem)
    } else {
      acc.push({
        id: item.category.toLowerCase().replace(/\s+/g, "-"),
        title: item.category,
        items: [menuItem],
      })
    }
    return acc
  }, [] as MenuCategory[])
}

/**
 * Generates an extremely rich, AI-agent-friendly Markdown document (llms.txt)
 * representing a restaurant's profile, contact info, hours, backstory, and complete menu.
 */
export function generateRestaurantLlmTxt(data: RestaurantData): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://restaurantsites.vercel.app"
  const slug = data.uid || ""
  const restaurantUrl = `${baseUrl}/${slug}`

  let md = `# ${data.name}\n\n`

  const desc = data.seo?.description || data.description || data.tagline || ""
  if (desc) {
    md += `> ${desc}\n\n`
  }

  md += `## Pages\n`
  md += `- [Home](${restaurantUrl})\n`
  md += `- [Full Menu](${restaurantUrl}/menu) - A machine-readable view of our current menu and prices.\n`
  md += `- [Contact & Location](${restaurantUrl}/contact)\n`

  return md
}
