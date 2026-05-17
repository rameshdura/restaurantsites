import * as idb from "./idb"

// Local storage keys for Site Builder (retained for migration)
const STORAGE_PREFIX = "sitebuilder_v1_"

export const STORAGE_KEYS = {
  SITES: `${STORAGE_PREFIX}sites`,
  CURRENT_SITE: `${STORAGE_PREFIX}currentSite`,
  TEMP_IMAGES: `${STORAGE_PREFIX}tempImages`,
  SEND_HISTORY: `${STORAGE_PREFIX}sendHistory`,
}

// Site Builder Data Types
export interface SiteImageData {
  name: string
  dataUrl: string
  size: number
  type: string
  uploadedAt: number
}

export interface SiteBuilderData {
  // Step 1: Basic Info
  uid: string
  siteName: string
  siteSlug: string
  description: string
  tagline: string
  address: string
  phone: string
  email: string
  menuLink?: string
  foundingDate?: string
  language: string
  currency: string

  // Step 2: SEO & Metadata
  seoTitle: string
  seoDescription: string
  keywords: string[]
  menuTitle: string
  menuDescription: string
  aboutTitle: string
  aboutDescription: string
  contactTitle: string
  contactDescription: string
  brandTitle?: string
  brandDescription?: string
  companyTitle?: string
  companyDescription?: string
  ogLocale?: string
  twitterCard?: "summary" | "summary_large_image"
  twitterSite?: string
  noindex?: boolean

  // Step 3: Local SEO & Schema
  neighborhood?: string
  city?: string
  region?: string
  country?: string
  countryCode?: string
  postalCode?: string
  googleMapsUrl?: string
  timezone?: string
  lat?: number
  lng?: number
  embedUrl?: string
  plusCode?: string
  placeId?: string
  priceRange: "$" | "$$" | "$$$" | "$$$$"
  cuisineTypes: string[]
  acceptsReservations: boolean
  isTakeout: boolean
  isDelivery: boolean
  priceCurrency: string
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
    bestRating?: number
    worstRating?: number
    source?: string
    sourceUrl?: string
  }

  // Step 4: Images & Hero
  logoImage: string | null // Base64 data URL
  heroImage: string | null
  coverImage: string | null
  imagesGallery: string[] // Array of base64 data URLs
  heroSlides: Array<{
    image: string | null
    title: string
    subtitle: string
    ctaText: string
    ctaLink: string
    alt?: string
  }>

  // Step 5: About Us
  aboutContent: string
  aboutShortDescription: string
  aboutMission: string
  aboutPhilosophy: string
  aboutAdditionalContent: string[]
  foundedYear?: number
  foundingLocation?: string
  founderName: string
  founderRole: string
  founderBio: string
  founderImage: string | null
  founderQualifications: string[]
  founderSocial: Record<string, string>
  founderSince?: string
  awards: Array<{
    year: number
    title: string
    issuer: string
  }>
  keywordsByPage?: {
    home?: string[]
    about?: string[]
    menu?: string[]
    contact?: string[]
  }
  team: Array<{
    name: string
    role: string
    image: string | null
    bio: string
    social?: Record<string, string>
    since?: string
  }>

  // Step 6: Company Info
  companyName: string
  companyLegalName?: string
  registrationNumber?: string
  representative?: string
  companyAddress?: string
  companyPhone?: string
  establishedDate?: string
  capital?: string
  fiscalYearEnd?: string
  businessPurpose?: string
  annualReportUrl?: string
  numberOfEmployees?: number

  // Step 7: Operations
  openingHours: Array<{
    day: string
    lunch?: string
    lunchLO?: string
    dinner?: string
    dinnerLO?: string
    isClosed?: boolean
    notes?: string
  }>
  holidayNotes?: string
  paymentMethods: string[]
  dietaryOptions: {
    vegetarian: boolean
    vegan: boolean
    glutenFree: boolean
    halal: boolean
    kosher: boolean
    dairyFree: boolean
    nutFree: boolean
  }
  features: {
    privateDining: boolean
    privateDiningCapacity?: number
    privateDiningDescription?: string
    outdoorSeating: boolean
    wifi: boolean
    wifiPassword?: string
    parking?: string
    parkingDetails?: string
    wheelchairAccessible: boolean
    petFriendly: boolean
    romantic: boolean
    goodForGroups: boolean
    goodForFamilies: boolean
    goodForDateNight: boolean
  }
  services: {
    takeout: boolean
    delivery: boolean
    deliveryPlatforms: string[]
    deliveryRadius?: string
    catering: boolean
    cateringRadius?: string
    cateringMinimum?: string
    reservations: boolean
    reservationMethods: string[]
    onlineBookingUrl?: string
    banquets: boolean
    banquetCapacity?: number
  }
  socialInstagram?: string
  socialFacebook?: string
  socialTwitter?: string
  socialTabelog?: string

  // Step 8: Menu
  menuCategories: Array<{
    name: string
    items: Array<{
      name: string
      secondaryName?: string
      description: string
      price: string
      category: string
      image?: string | null
      isPopular?: boolean
      isVegetarian?: boolean
      isVegan?: boolean
      isSpicy?: boolean
      spiceLevel?: number
      allergens?: string[]
      calories?: number
      ingredients?: string[]
      available?: boolean
      availableFrom?: string
      availableTo?: string
      size?: string
      limited?: boolean
      availableUntil?: string
    }>
  }>

  // Step 9: Reviews
  reviews: Array<{
    id?: string
    author: string
    rating: number
    date: string
    comment: string
    source: string
  }>

  // Media
  videos: Array<{
    url: string
    title: string
    description: string
    thumbnail: string
    duration: string
    uploadDate: string
  }>
  virtualTour?: string

  // Advanced
  knowLanguages?: string[]
  cuisineType?: string
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
}

/**
 * Migration: Check if data exists in localStorage and move it to IndexedDB
 */
async function migrateFromLocalStorage() {
  if (typeof window === "undefined") return

  try {
    // Migrate Sites
    const localSites = localStorage.getItem(STORAGE_KEYS.SITES)
    if (localSites) {
      const currentIdbSites = await idb.get<SiteBuilderData[]>(
        STORAGE_KEYS.SITES
      )
      if (!currentIdbSites || currentIdbSites.length === 0) {
        await idb.set(STORAGE_KEYS.SITES, JSON.parse(localSites))
        console.log("Migrated sites from localStorage to IndexedDB")
      }
      localStorage.removeItem(STORAGE_KEYS.SITES)
    }

    // Migrate Current Site
    const localCurrent = localStorage.getItem(STORAGE_KEYS.CURRENT_SITE)
    if (localCurrent) {
      const currentIdbCurrent = await idb.get<SiteBuilderData>(
        STORAGE_KEYS.CURRENT_SITE
      )
      if (!currentIdbCurrent) {
        await idb.set(STORAGE_KEYS.CURRENT_SITE, JSON.parse(localCurrent))
        console.log("Migrated current site from localStorage to IndexedDB")
      }
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SITE)
    }

    // Migrate Temp Images
    const localImages = localStorage.getItem(STORAGE_KEYS.TEMP_IMAGES)
    if (localImages) {
      const currentIdbImages = await idb.get<Record<string, string>>(
        STORAGE_KEYS.TEMP_IMAGES
      )
      if (!currentIdbImages) {
        await idb.set(STORAGE_KEYS.TEMP_IMAGES, JSON.parse(localImages))
        console.log("Migrated temp images from localStorage to IndexedDB")
      }
      localStorage.removeItem(STORAGE_KEYS.TEMP_IMAGES)
    }
  } catch (error) {
    console.error("Migration failed:", error)
  }
}

// Initialize migration
if (typeof window !== "undefined") {
  migrateFromLocalStorage()
}

// Storage management functions
export async function getSites(): Promise<SiteBuilderData[]> {
  try {
    const sites = await idb.get<SiteBuilderData[]>(STORAGE_KEYS.SITES)
    return sites || []
  } catch {
    return []
  }
}

export async function saveSites(sites: SiteBuilderData[]): Promise<void> {
  await idb.set(STORAGE_KEYS.SITES, sites)
}

export async function getCurrentSite(): Promise<SiteBuilderData | null> {
  try {
    const current = await idb.get<SiteBuilderData>(STORAGE_KEYS.CURRENT_SITE)
    return current || null
  } catch {
    return null
  }
}

export async function saveCurrentSite(site: SiteBuilderData): Promise<void> {
  await idb.set(STORAGE_KEYS.CURRENT_SITE, site)
}

export async function deleteCurrentSite(): Promise<void> {
  await idb.del(STORAGE_KEYS.CURRENT_SITE)
}

export async function getTempImage(name: string): Promise<string | null> {
  try {
    const images = await idb.get<Record<string, string>>(
      STORAGE_KEYS.TEMP_IMAGES
    )
    return images ? (images[name] ?? null) : null
  } catch {
    return null
  }
}

export async function saveTempImage(
  name: string,
  dataUrl: string
): Promise<void> {
  try {
    const images =
      (await idb.get<Record<string, string>>(STORAGE_KEYS.TEMP_IMAGES)) || {}
    images[name] = dataUrl
    await idb.set(STORAGE_KEYS.TEMP_IMAGES, images)
  } catch (error) {
    console.error("Error saving temp image:", error)
  }
}

export async function deleteTempImage(name: string): Promise<void> {
  try {
    const images =
      (await idb.get<Record<string, string>>(STORAGE_KEYS.TEMP_IMAGES)) || {}
    delete images[name]
    await idb.set(STORAGE_KEYS.TEMP_IMAGES, images)
  } catch (error) {
    console.error("Error deleting temp image:", error)
  }
}

export async function clearAllData(): Promise<void> {
  await idb.clear()
  localStorage.removeItem(STORAGE_KEYS.SITES)
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SITE)
  localStorage.removeItem(STORAGE_KEYS.TEMP_IMAGES)
  localStorage.removeItem(STORAGE_KEYS.SEND_HISTORY)
}

// Send History
export interface SendHistoryEntry {
  id: string
  siteSlug: string
  siteName: string
  to: string[]
  subject: string
  sentAt: number // timestamp
  status: "success" | "failed"
  errorMessage?: string
}

export async function getSendHistory(): Promise<SendHistoryEntry[]> {
  try {
    const history = await idb.get<SendHistoryEntry[]>(STORAGE_KEYS.SEND_HISTORY)
    return history || []
  } catch {
    return []
  }
}

export async function addSendHistory(entry: SendHistoryEntry): Promise<void> {
  try {
    const history = await getSendHistory()
    history.unshift(entry)
    // Keep only last 50 entries
    if (history.length > 50) {
      history.length = 50
    }
    await idb.set(STORAGE_KEYS.SEND_HISTORY, history)
  } catch (error) {
    console.error("Error saving send history:", error)
  }
}

export async function deleteSendHistoryEntry(id: string): Promise<void> {
  try {
    if (id === "*") {
      // Clear all history
      await idb.set(STORAGE_KEYS.SEND_HISTORY, [])
      return
    }
    const history = await getSendHistory()
    const filtered = history.filter((entry) => entry.id !== id)
    await idb.set(STORAGE_KEYS.SEND_HISTORY, filtered)
  } catch (error) {
    console.error("Error deleting send history entry:", error)
  }
}
