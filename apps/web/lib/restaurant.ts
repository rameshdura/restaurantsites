import fs from "node:fs/promises"
import path from "node:path"

export interface CompanyInfo {
  name: string
  registrationNumber: string
  address: string
  phone: string
  establishedDate: string
  capital: string
  fiscalYearEnd: string
}

export interface RestaurantData {
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
    openingHours?: RestaurantData['openingHours']
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
    day: string; 
    lunch?: string; 
    lunchLO?: string; 
    dinner?: string; 
    dinnerLO?: string;
    time?: string;
    isClosed?: boolean;
    notes?: string;
  }[]
  holidayNotes?: string
  menu?: MenuItem[]
  reviews?: {
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
}

export interface MenuItem {
  name: string
  description: string
  price: string
  category: string
  image?: string
  isPopular?: boolean
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
  }>
}

const RESTAURANTS_PATH = path.join(process.cwd(), "../../restaurants")

export async function getRestaurant(slug: string): Promise<Restaurant | null> {
  try {
    const restaurantPath = path.join(RESTAURANTS_PATH, slug)
    
    // Read data.json
    const dataPath = path.join(restaurantPath, "data.json")
    const dataRaw = await fs.readFile(dataPath, "utf8")
    const data: RestaurantData = JSON.parse(dataRaw)
    
    // Extract menu from data or default to empty array
    const menu = data.menu || []
    
    return {
      slug,
      data,
      menu
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

export function groupMenuByCategory(menu: MenuItem[]): MenuCategory[] {
  return menu.reduce((acc, item) => {
    const existingCategory = acc.find((c) => c.title === item.category)
    const menuItem = {
      id: item.name.toLowerCase().replace(/\s+/g, "-"),
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
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
