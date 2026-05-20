/* eslint-disable @typescript-eslint/no-explicit-any */
import { SiteBuilderData } from "./storage"

/**
 * Modular mapper to keep logic clean and maintainable.
 */

const mapSeoData = (data: any): Partial<SiteBuilderData> => ({
  seoTitle: data.seo?.title || "",
  seoDescription: data.seo?.description || "",
  keywords: data.seo?.keywords || [],
  noindex: !!data.seo?.noindex,
  menuTitle: data.seo?.menuTitle || data.seo?.title || "",
  menuDescription: data.seo?.menuDescription || data.seo?.description || "",
  aboutTitle: data.seo?.aboutTitle || data.seo?.title || "",
  aboutDescription: data.seo?.aboutDescription || data.seo?.description || "",
  contactTitle: data.seo?.contactTitle || data.seo?.title || "",
  contactDescription:
    data.seo?.contactDescription || data.seo?.description || "",
  brandTitle: data.seo?.brandTitle || data.seo?.title || "",
  brandDescription: data.seo?.brandDescription || data.seo?.description || "",
  companyTitle: data.seo?.companyTitle || data.seo?.title || "",
  companyDescription:
    data.seo?.companyDescription || data.seo?.description || "",
  ogLocale: data.social?.ogLocale || "en_US",
  twitterCard: data.social?.twitterCard || "summary_large_image",
  twitterSite: data.social?.twitterSite || "",
  socialInstagram: data.socialInstagram || "",
  socialFacebook: data.socialFacebook || "",
  socialTwitter: data.socialTwitter || "",
  socialTabelog: data.socialTabelog || "",
  sameAs: data.social?.sameAs || [],
})

const mapLocalSeoData = (data: any): Partial<SiteBuilderData> => ({
  city: data.localSEO?.city || "",
  region: data.localSEO?.region || "",
  country: data.localSEO?.country || "",
  countryCode: data.localSEO?.countryCode || "",
  postalCode: data.localSEO?.postalCode || "",
  placeId: data.localSEO?.placeId || "",
  googleMapsUrl: data.localSEO?.googleMapsUrl || "",
  embedUrl: data.localSEO?.embedUrl || "",
  lat: data.contact?.location?.lat || 0,
  lng: data.contact?.location?.lng || 0,
  timezone: data.localSEO?.timezone || "Asia/Tokyo",
  priceRange: data.schema?.priceRange || "$$",
  cuisineTypes: data.schema?.servesCuisine || [],
  acceptsReservations: !!data.schema?.acceptsReservations,
  isTakeout: !!data.schema?.isTakeout,
  isDelivery: !!data.schema?.isDelivery,
  aggregateRating: data.schema?.aggregateRating || null,
})

const mapCompanyData = (data: any): Partial<SiteBuilderData> => ({
  companyName: data.companyInfo?.name || "",
  companyLegalName: data.companyInfo?.legalName || "",
  registrationNumber: data.companyInfo?.registrationNumber || "",
  representative: data.companyInfo?.representative || "",
  companyAddress: data.companyInfo?.address || "",
  companyPhone: data.companyInfo?.phone || "",
  establishedDate: data.companyInfo?.establishedDate || "",
  capital: data.companyInfo?.capital || "",
  fiscalYearEnd: data.companyInfo?.fiscalYearEnd || "",
  businessPurpose: data.companyInfo?.businessPurpose || "",
  annualReportUrl: data.companyInfo?.annualReportUrl || "",
  numberOfEmployees: data.numberOfEmployees || 0,
})

export function mapDataJsonToBuilder(data: any): Partial<SiteBuilderData> {
  const aboutSection = (data.pages?.home?.sections ?? []).find(
    (s: any) => s.id === "about" || s.type === "about"
  )
  const rawAboutImages =
    data.images?.about || data.about?.images || aboutSection?.data?.images || []
  const aboutImagesList = Array.isArray(rawAboutImages) ? rawAboutImages : []

  return {
    uid: data.uid || "",
    siteName: data.name || "",
    siteSlug: data.uid || "", // Default slug to uid
    description: data.description || "",
    tagline: data.tagline || "",
    address: data.address || "",
    phone: data.phone || "",
    email: data.email || "",
    website: data.website || "",
    menuLink: data.menuLink || "",
    foundingDate: data.foundingDate || "",
    language: data.app?.language || "EN",
    currency: data.app?.currency || "USD",
    ...mapSeoData(data),
    ...mapLocalSeoData(data),
    ...mapCompanyData(data),
    logoImage: data.images?.logo?.url || null,
    heroImage: data.images?.heroImage?.url || null,
    coverImage: data.images?.coverImage?.url || null,
    imagesGallery:
      data.images?.gallery?.map((g: any) => ({
        url: g.url || "",
        alt: g.alt || "",
      })) || [],
    imagesFeatured:
      data.images?.featured?.map((g: any) => ({
        url: g.url || "",
        alt: g.alt || "",
      })) || [],
    imagesDrinks:
      data.images?.drinks?.map((g: any) => ({
        url: g.url || "",
        alt: g.alt || "",
      })) || [],
    aboutImages: aboutImagesList.map((g: any) => {
      if (typeof g === "string") {
        return { id: `a-${g}`, url: g, alt: "" }
      }
      return {
        id: g?.id || "",
        url: g?.url || "",
        alt: g?.alt || "",
      }
    }),
    heroSlides:
      data.hero?.slides ||
      (data.pages?.home?.sections ?? []).find((s: any) => s.type === "hero")
        ?.data?.slides ||
      [],
    aboutTitle: data.about?.title || aboutSection?.data?.title || "",
    aboutContent:
      data.about?.content ||
      aboutSection?.data?.content ||
      data.about?.representative?.message ||
      "",
    aboutShortDescription:
      data.about?.shortDescription ||
      aboutSection?.data?.shortDescription ||
      "",
    aboutMission: data.about?.mission || aboutSection?.data?.mission || "",
    aboutPhilosophy:
      data.about?.philosophy || aboutSection?.data?.philosophy || "",
    aboutAdditionalContent:
      data.about?.additionalContent ||
      aboutSection?.data?.additionalContent ||
      [],
    aboutImage: data.about?.image || aboutSection?.data?.image || null,
    aboutRepresentative: data.about?.founder ||
      data.about?.representative || {
        name: "",
        role: "",
        bio: "",
        image: null,
        message: "",
        story: "",
      },
    team: data.about?.team || data.team || [],
    awards: data.about?.awards || [],
    openingHours: data.openingHours || data.contact?.openingHours || [],
    holidayNotes: data.holidayNotes || data.contact?.holidayNotes || "",
    paymentMethods: data.operations?.paymentMethods || [],
    dietaryOptions: data.operations?.dietaryOptions || {},
    features: data.operations?.features || {},
    services: data.operations?.services || {},
    menuCategories: data.menuCategories || [],
    reviews: data.reviews || [],
    videos: data.videos || [],
    virtualTour: data.virtualTour || "",
    advancedSchema: data.advancedSchema || {},
  }
}

export function mapBuilderToDataJson(formData: SiteBuilderData): any {
  return {
    uid: formData.uid,
    version: "1",
    name: formData.siteName,
    description: formData.description,
    tagline: formData.tagline,
    address: formData.address,
    phone: formData.phone,
    email: formData.email,
    website: formData.website,
    foundingDate: formData.foundingDate,
    menuLink: formData.menuLink,
    app: { language: formData.language, currency: formData.currency },
    seo: {
      title: formData.seoTitle,
      description: formData.seoDescription,
      keywords: formData.keywords,
      noindex: formData.noindex,
      menuTitle: formData.menuTitle,
      menuDescription: formData.menuDescription,
      aboutTitle: formData.aboutTitle,
      aboutDescription: formData.aboutDescription,
      contactTitle: formData.contactTitle,
      contactDescription: formData.contactDescription,
      brandTitle: formData.brandTitle,
      brandDescription: formData.brandDescription,
      companyTitle: formData.companyTitle,
      companyDescription: formData.companyDescription,
    },

    social: {
      ogImage: formData.coverImage,
      ogLocale: formData.ogLocale,
      twitterCard: formData.twitterCard,
      sameAs: formData.sameAs,
    },
    schema: {
      priceRange: formData.priceRange,
      servesCuisine: formData.cuisineTypes,
      acceptsReservations: formData.acceptsReservations,
      isTakeout: formData.isTakeout,
      isDelivery: formData.isDelivery,
      priceCurrency: formData.currency,
      aggregateRating: formData.aggregateRating,
    },
    localSEO: {
      city: formData.city,
      region: formData.region,
      country: formData.country,
      countryCode: formData.countryCode,
      postalCode: formData.postalCode,
      placeId: formData.placeId,
      googleMapsUrl: formData.googleMapsUrl,
      timezone: formData.timezone,
    },
    images: {
      logo: {
        url: formData.logoImage,
        alt: `${formData.siteName} logo`,
        width: 200,
        height: 200,
      },
      gallery: formData.imagesGallery,
      featured: (formData.imagesFeatured ?? []).map((img, i) => ({
        id: `f${i + 1}`,
        url: img.url,
        alt: img.alt,
      })),
      drinks: (formData.imagesDrinks ?? []).map((img, i) => ({
        id: `d${i + 1}`,
        url: img.url,
        alt: img.alt,
      })),
      about: (formData.aboutImages ?? []).map((img, i) => ({
        id: img.id || `a${i + 1}`,
        url: img.url,
        alt: img.alt,
      })),
    },
    companyInfo: {
      name: formData.companyName,
      legalName: formData.companyLegalName,
      registrationNumber: formData.registrationNumber,
      representative: formData.representative,
      address: formData.companyAddress,
      phone: formData.companyPhone,
      establishedDate: formData.establishedDate,
      capital: formData.capital,
      fiscalYearEnd: formData.fiscalYearEnd,
      businessPurpose: formData.businessPurpose,
      annualReportUrl: formData.annualReportUrl,
      url: `/${formData.siteSlug}/company-information`,
    },
    openingHours: formData.openingHours,
    holidayNotes: formData.holidayNotes,
    operations: {
      paymentMethods: formData.paymentMethods,
      dietaryOptions: formData.dietaryOptions,
      features: formData.features,
      services: {
        ...formData.services,
        takeout: formData.isTakeout,
        delivery: formData.isDelivery,
        reservations: formData.acceptsReservations,
        deliveryPlatforms: formData.services?.deliveryPlatforms || [],
      },
    },
    menuCategories: formData.menuCategories,
    menu: formData.menuCategories.flatMap((c) =>
      c.items.map((i) => ({
        ...i,
        id: i.name.toLowerCase().replace(/\s+/g, "-"),
        available: true,
        availableFrom: "",
        availableTo: "",
        availableUntil: "",
        size: "Regular",
        limited: false,
        spiceLevel: 0,
        allergens: [],
      }))
    ),
    about: {
      representative: formData.aboutRepresentative,
    },
    pages: {
      home: {
        id: "home",
        sections: [
          {
            id: "hero",
            type: "hero",
            ui: { order: 1, visible: true, fullBleed: true },
            data: { slides: formData.heroSlides },
          },
          {
            id: "about",
            type: "about",
            ui: { order: 2, visible: true, layout: "image-right" },
            data: {
              title: formData.aboutTitle,
              content: formData.aboutContent,
              additionalContent: formData.aboutAdditionalContent,
              representative: formData.representative,
            },
          },
          {
            id: "menu-preview",
            type: "menu",
            ui: { order: 3, visible: true },
            data: { ref: "menu" },
          },
          {
            id: "gallery",
            type: "gallery",
            ui: { order: 4, visible: true },
            data: { ref: "images.gallery" },
          },
          {
            id: "reviews",
            type: "reviews",
            ui: { order: 5, visible: true },
            data: { ref: "reviews" },
          },
          {
            id: "contact",
            type: "contact",
            ui: { order: 6, visible: true },
            data: { ref: "contact" },
          },
        ],
      },
      about: {
        id: "about",
        coverImage: formData.coverImage,
        sections: [
          {
            id: "about-full",
            type: "about",
            ui: { order: 1, visible: true, layout: "image-right" },
            data: { ref: "pages.home.sections.about.data" },
          },
          {
            id: "team",
            type: "team",
            ui: { order: 2, visible: true },
            data: { ref: "team" },
          },
        ],
      },
      menu: {
        id: "menu",
        coverImage: formData.coverImage,
        sections: [
          {
            id: "full-menu",
            type: "menu",
            ui: { order: 1, visible: true },
            data: { ref: "menu" },
          },
        ],
      },
      contact: {
        id: "contact",
        coverImage: formData.coverImage,
        sections: [
          {
            id: "contact-full",
            type: "contact",
            ui: { order: 1, visible: true },
            data: { ref: "contact" },
          },
        ],
      },
    },
    contact: {
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      location: {
        lat: formData.lat,
        lng: formData.lng,
        mapsUrl: formData.googleMapsUrl,
        address: formData.address,
        plusCode: "",
      },
      openingHours: formData.openingHours,
      holidayNotes: formData.holidayNotes,
    },
    team: formData.team,
    reviews: formData.reviews,
    videos: formData.videos,
    virtualTour: formData.virtualTour,
    advancedSchema: formData.advancedSchema,
  }
}
