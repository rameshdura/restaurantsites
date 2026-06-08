"use client"

export const dynamic = "force-dynamic"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SiteBuilderForm } from "./SiteBuilderForm"
import { SiteList } from "@/components/sitebuilder/SiteList"
import { SiteBuilderHeader } from "@/components/sitebuilder/SiteBuilderHeader"
import { Button } from "@workspace/ui/components/button"
import { SiteBuilderData, getSites } from "@/lib/storage"

const defaultSiteData: SiteBuilderData = {
  uid: "",
  siteName: "",
  siteSlug: "",
  description: "",
  tagline: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  menuLink: "",
  foundingDate: "",
  language: "EN",
  currency: "USD",
  seoTitle: "",
  seoDescription: "",
  keywords: [],
  noindex: false,
  menuTitle: "",
  menuDescription: "",
  aboutTitle: "",
  aboutDescription: "",
  contactTitle: "",
  contactDescription: "",
  brandTitle: "",
  brandDescription: "",
  companyTitle: "",
  companyDescription: "",
  ogLocale: "en_US",
  twitterCard: "summary_large_image",
  twitterSite: "",
  socialInstagram: "",
  socialFacebook: "",
  socialTwitter: "",
  socialTabelog: "",
  sameAs: [],
  neighborhood: "",
  city: "",
  region: "",
  country: "",
  countryCode: "",
  postalCode: "",
  placeId: "",
  googleMapsUrl: "",
  embedUrl: "",
  lat: 0,
  lng: 0,
  timezone: "Asia/Tokyo",
  priceRange: "$$",
  cuisineTypes: [],
  acceptsReservations: true,
  isTakeout: true,
  isDelivery: false,
  aggregateRating: null,
  logoImage: null,
  heroImage: null,
  coverImage: null,
  imagesGallery: [],
  imagesFeatured: [],
  imagesDrinks: [],
  heroSlides: [],
  aboutContent: "",
  aboutShortDescription: "",
  aboutMission: "",
  aboutPhilosophy: "",
  aboutAdditionalContent: [],
  aboutImage: null,
  aboutImages: [],
  aboutRepresentative: {
    name: "",
    role: "",
    bio: "",
    image: null,
    message: "",
    story: "",
  },
  team: [],
  awards: [],
  companyName: "",
  companyLegalName: "",
  registrationNumber: "",
  representative: "",
  companyAddress: "",
  companyPhone: "",
  establishedDate: "",
  capital: "",
  fiscalYearEnd: "",
  businessPurpose: "",
  annualReportUrl: "",
  numberOfEmployees: 0,
  openingHours: [],
  holidayNotes: "",
  paymentMethods: [],
  dietaryOptions: {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    halal: false,
    kosher: false,
    dairyFree: false,
    nutFree: false,
  },
  features: {
    privateDining: false,
    privateDiningCapacity: 0,
    privateDiningDescription: "",
    outdoorSeating: false,
    wifi: false,
    wifiPassword: "",
    parking: "none",
    parkingDetails: "",
    wheelchairAccessible: false,
    petFriendly: false,
    romantic: false,
    goodForGroups: false,
    goodForFamilies: false,
    goodForDateNight: false,
  },
  services: {
    takeout: false,
    delivery: false,
    deliveryPlatforms: [],
    deliveryRadius: "",
    catering: false,
    cateringRadius: "",
    cateringMinimum: "",
    reservations: false,
    reservationMethods: [],
    onlineBookingUrl: "",
    banquets: false,
    banquetCapacity: 0,
  },
  menuCategories: [],
  tables: [],
  reviews: [],
  videos: [],
  virtualTour: "",
  advancedSchema: {
    foundedDate: "",
    foundingLocation: "",
    numberOfEmployees: 0,
    knowsLanguage: [],
    cuisineType: "",
    hasMap: "",
    currenciesAccepted: [],
    paymentAccepted: [],
    servesCuisine: [],
    menuType: [],
    starRating: 0,
    priceRange: "$",
    eventType: [],
    seats: 0,
    smoking: "No Smoking",
    music: "None",
    attire: "casual",
  },
}

export default function SiteBuilderPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const action = searchParams.get("action")
  const slug = searchParams.get("slug")

  const [formData, setFormData] = useState<SiteBuilderData | undefined>(
    undefined
  )
  const [isLoading, setIsLoading] = useState(true)

  const updateFormData = <K extends keyof SiteBuilderData>(
    field: K,
    value: SiteBuilderData[K]
  ) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  useEffect(() => {
    const init = async () => {
      if (action === "edit" && slug) {
        const sites = await getSites()
        const found = sites.find((s) => s.siteSlug === slug)
        if (found) {
          setFormData({
            ...defaultSiteData,
            ...found,
            aboutRepresentative: {
              ...defaultSiteData.aboutRepresentative,
              ...(found.aboutRepresentative || {}),
            },
            dietaryOptions: {
              ...defaultSiteData.dietaryOptions,
              ...(found.dietaryOptions || {}),
            },
            features: {
              ...defaultSiteData.features,
              ...(found.features || {}),
            },
            services: {
              ...defaultSiteData.services,
              ...(found.services || {}),
            },
            advancedSchema: {
              ...defaultSiteData.advancedSchema,
              ...(found.advancedSchema || {}),
            },
          })
        } else {
          setFormData(undefined)
        }
      } else {
        setFormData(defaultSiteData)
      }
      setIsLoading(false)
    }
    init()
  }, [action, slug])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (action === "edit" || action === "create") {
    if (!formData) return null
    return (
      <>
        <SiteBuilderHeader siteName={formData?.siteName} />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {action === "edit" ? "Edit Site" : "Create New Site"}
            </h2>
            <Button
              variant="outline"
              onClick={() => router.push("/sitebuilder")}
            >
              Back to Dashboard
            </Button>
          </div>
          <SiteBuilderForm
            formData={formData}
            updateFormData={updateFormData}
          />
        </main>
      </>
    )
  }

  // Default: Show site list
  return (
    <>
      <SiteBuilderHeader />
      <main className="container mx-auto px-4 py-8">
        <SiteList
          onSelectSite={(site) => {
            router.push(`/sitebuilder?action=edit&slug=${site.siteSlug}`)
          }}
          onCreateNew={() => {
            router.push("/sitebuilder?action=create")
          }}
        />
      </main>
    </>
  )
}
