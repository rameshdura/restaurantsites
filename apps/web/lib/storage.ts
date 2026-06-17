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
  // --- Core Info ---
  uid: string
  siteName: string
  siteSlug: string
  description: string
  tagline: string
  address: string
  phone: string
  email: string
  website: string
  menuLink: string
  foundingDate: string
  language: string
  currency: string

  // --- SEO & Social ---
  seoTitle: string
  seoDescription: string
  keywords: string[]
  noindex: boolean
  menuTitle: string
  menuDescription: string
  aboutTitle: string
  aboutDescription: string
  contactTitle: string
  contactDescription: string
  brandTitle: string
  brandDescription: string
  companyTitle: string
  companyDescription: string
  ogLocale: string

  twitterCard: "summary" | "summary_large_image"
  twitterSite: string
  socialInstagram: string
  socialFacebook: string
  socialTwitter: string
  socialTabelog: string
  sameAs: string[]

  // --- Local SEO & Schema ---
  neighborhood: string
  city: string
  region: string
  country: string
  countryCode: string
  postalCode: string
  placeId: string
  googleMapsUrl: string
  embedUrl: string
  lat: number
  lng: number
  timezone: string
  priceRange: "$" | "$$" | "$$$" | "$$$$"
  cuisineTypes: string[]
  acceptsReservations: boolean
  isTakeout: boolean
  isDelivery: boolean
  aggregateRating: {
    ratingValue: number
    reviewCount: number
    source: string
    sourceUrl: string
  } | null

  // --- Images ---
  logoImage: string | null
  heroImage: string | null
  coverImage: string | null
  imagesGallery: Array<{ url: string; alt: string }>
  imagesFeatured: Array<{ url: string; alt: string }>
  imagesDrinks: Array<{ url: string; alt: string }>
  heroSlides: Array<{
    image: string | null
    title: string
    subtitle: string
    ctaText: string
    ctaLink: string
    alt: string
  }>

  // --- Content (About/Team) ---
  aboutContent: string
  aboutShortDescription: string
  aboutMission: string
  aboutPhilosophy: string
  aboutAdditionalContent: string[]
  aboutImage: string | null // NEW: About page specific hero
  aboutImages: Array<{ id: string; url: string; alt: string }>
  aboutRepresentative: {
    name: string
    role: string
    bio: string
    image: string | null
    message: string
    story: string
  }
  team: Array<{
    name: string
    role: string
    image: string | null
    bio: string
  }>
  awards: Array<{ year: number; title: string; issuer: string }>

  // --- Company Info ---
  companyName: string
  companyLegalName: string
  registrationNumber: string
  representative: string
  companyAddress: string
  companyPhone: string
  establishedDate: string
  capital: string
  fiscalYearEnd: string
  businessPurpose: string
  annualReportUrl: string
  numberOfEmployees: number

  // --- Operational & Features ---
  openingHours: Array<{
    day: string
    lunch: string
    lunchLO: string
    dinner: string
    dinnerLO: string
    isClosed: boolean
    notes: string
  }>
  holidayNotes: string
  paymentMethods: string[]
  dietaryOptions: Record<string, boolean>
  features: {
    privateDining: boolean
    privateDiningCapacity: number
    privateDiningDescription: string
    outdoorSeating: boolean
    wifi: boolean
    wifiPassword: string
    parking: "street" | "lot" | "garage" | "none"
    parkingDetails: string
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
    deliveryRadius: string
    catering: boolean
    cateringRadius: string
    cateringMinimum: string
    reservations: boolean
    reservationMethods: string[]
    onlineBookingUrl: string
    banquets: boolean
    banquetCapacity: number
  }

  // --- Menu & Content ---
  tables?: Array<{ id: number | string; label: string; capacity?: number }>
  menuCategories: Array<{
    name: string
    items: Array<{
      id?: string
      name: string
      description: string
      price: string
      category: string
      image: string | null
      isPopular: boolean
      isSpicy: boolean
      spiceLevel: number
      allergens: string[]
      isVegetarian?: boolean
      isVegan?: boolean
      calories?: number
      ingredients?: string[]
      options?: Array<{
        id: string
        name: string
        selections: Array<{ id: string; name: string; price: number }>
      }>
      available?: boolean
      availableFrom?: string
      availableTo?: string
      size?: string
      limited?: boolean
      availableUntil?: string
    }>
  }>
  reviews: Array<{
    id: string
    author: string
    rating: number
    date: string
    comment: string
    source: string
  }>
  videos: Array<{ url: string; title: string; description: string }>
  virtualTour: string
  advancedSchema: {
    foundedDate: string
    foundingLocation: string
    numberOfEmployees: number
    knowsLanguage: string[]
    cuisineType: string
    hasMap: string
    currenciesAccepted: string[]
    paymentAccepted: string[]
    servesCuisine: string[]
    menuType: string[]
    starRating: number
    priceRange: string
    eventType: string[]
    seats: number
    smoking: "No Smoking" | "Yes" | "Outdoor"
    music: "Background jazz" | "None" | "Live music"
    attire: "casual" | "smart casual" | "formal"
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
