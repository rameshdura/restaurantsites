import * as idb from './idb'

// Local storage keys for Site Builder (retained for migration)
const STORAGE_PREFIX = 'sitebuilder_v1_'

export const STORAGE_KEYS = {
  SITES: `${STORAGE_PREFIX}sites`,
  CURRENT_SITE: `${STORAGE_PREFIX}currentSite`,
  TEMP_IMAGES: `${STORAGE_PREFIX}tempImages`,
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
  siteName: string
  siteSlug: string
  description: string
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
  seoMenuTitle?: string
  seoMenuDescription?: string
  seoAboutTitle?: string
  seoAboutDescription?: string
  seoContactTitle?: string
  seoContactDescription?: string
  seoBrandTitle?: string
  seoBrandDescription?: string
  seoCompanyTitle?: string
  seoCompanyDescription?: string
  ogLocale?: string
  twitterCard?: 'summary' | 'summary_large_image'

  // Step 3: Local SEO
  neighborhood?: string
  city?: string
  region?: string
  country?: string
  countryCode?: string
  postalCode?: string
  googleMapsUrl?: string
  timezone?: string

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
  }>

  // Step 5: About Us
  aboutContent: string
  aboutAdditionalContent: string[]
  foundedYear?: number
  founderName?: string
  founderRole?: string
  founderBio?: string
  founderImage?: string | null
  team: Array<{
    name: string
    role: string
    image: string | null
    bio: string
  }>

  // Step 6: Company Info
  companyName: string
  companyLegalName?: string
  registrationNumber?: string
  companyAddress?: string
  companyPhone?: string
  establishedDate?: string
  capital?: string
  fiscalYearEnd?: string
  representative?: string

  // Step 7: Location & Maps
  lat?: number
  lng?: number
  embedUrl?: string

  // Step 8: Operational & Social
  openingHours: Array<{
    day: string
    lunch?: string
    lunchLO?: string
    dinner?: string
    dinnerLO?: string
  }>
  holidayNotes?: string
  socialInstagram?: string
  socialFacebook?: string
  socialTwitter?: string
  socialTabelog?: string
  priceRange: '$' | '$$' | '$$$' | '$$$$'
  cuisineTypes: string[]
  acceptsReservations: boolean
  isTakeout: boolean
  isDelivery: boolean
  priceCurrency: string

  // Step 9: Menu & Reviews
  menuCategories: Array<{
    name: string
    items: Array<{
      name: string
      description: string
      price: string
      isPopular?: boolean
      image?: string | null
    }>
  }>
  reviews: Array<{
    author: string
    rating: number
    date: string
    comment: string
    source: string
  }>
}

/**
 * Migration: Check if data exists in localStorage and move it to IndexedDB
 */
async function migrateFromLocalStorage() {
  if (typeof window === 'undefined') return

  try {
    // Migrate Sites
    const localSites = localStorage.getItem(STORAGE_KEYS.SITES)
    if (localSites) {
      const currentIdbSites = await idb.get<SiteBuilderData[]>(STORAGE_KEYS.SITES)
      if (!currentIdbSites || currentIdbSites.length === 0) {
        await idb.set(STORAGE_KEYS.SITES, JSON.parse(localSites))
        console.log('Migrated sites from localStorage to IndexedDB')
      }
      localStorage.removeItem(STORAGE_KEYS.SITES)
    }

    // Migrate Current Site
    const localCurrent = localStorage.getItem(STORAGE_KEYS.CURRENT_SITE)
    if (localCurrent) {
      const currentIdbCurrent = await idb.get<SiteBuilderData>(STORAGE_KEYS.CURRENT_SITE)
      if (!currentIdbCurrent) {
        await idb.set(STORAGE_KEYS.CURRENT_SITE, JSON.parse(localCurrent))
        console.log('Migrated current site from localStorage to IndexedDB')
      }
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SITE)
    }

    // Migrate Temp Images
    const localImages = localStorage.getItem(STORAGE_KEYS.TEMP_IMAGES)
    if (localImages) {
      const currentIdbImages = await idb.get<Record<string, string>>(STORAGE_KEYS.TEMP_IMAGES)
      if (!currentIdbImages) {
        await idb.set(STORAGE_KEYS.TEMP_IMAGES, JSON.parse(localImages))
        console.log('Migrated temp images from localStorage to IndexedDB')
      }
      localStorage.removeItem(STORAGE_KEYS.TEMP_IMAGES)
    }
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Initialize migration
if (typeof window !== 'undefined') {
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
    const images = await idb.get<Record<string, string>>(STORAGE_KEYS.TEMP_IMAGES)
    return images ? images[name] : null
  } catch {
    return null
  }
}

export async function saveTempImage(name: string, dataUrl: string): Promise<void> {
  try {
    const images = (await idb.get<Record<string, string>>(STORAGE_KEYS.TEMP_IMAGES)) || {}
    images[name] = dataUrl
    await idb.set(STORAGE_KEYS.TEMP_IMAGES, images)
  } catch (error) {
    console.error('Error saving temp image:', error)
  }
}

export async function deleteTempImage(name: string): Promise<void> {
  try {
    const images = (await idb.get<Record<string, string>>(STORAGE_KEYS.TEMP_IMAGES)) || {}
    delete images[name]
    await idb.set(STORAGE_KEYS.TEMP_IMAGES, images)
  } catch (error) {
    console.error('Error deleting temp image:', error)
  }
}

export async function clearAllData(): Promise<void> {
  await idb.clear()
  localStorage.removeItem(STORAGE_KEYS.SITES)
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SITE)
  localStorage.removeItem(STORAGE_KEYS.TEMP_IMAGES)
}
