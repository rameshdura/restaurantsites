/* eslint-disable @typescript-eslint/no-explicit-any */
import { SiteBuilderData } from "./storage"

/**
 * Maps data.json format → SiteBuilderData (for import / autofill)
 */
export function mapDataJsonToBuilder(data: any): Partial<SiteBuilderData> {
  const result: Partial<SiteBuilderData> = {}

  // Step 1: Basic Info
  if (data.uid) result.uid = data.uid
  if (data.name) result.siteName = data.name
  if (data.description) result.description = data.description
  if (data.tagline) result.tagline = data.tagline
  if (data.address) result.address = data.address
  if (data.phone) result.phone = data.phone
  if (data.email) result.email = data.email
  if (data.menuLink) result.menuLink = data.menuLink
  if (data.foundingDate) result.foundingDate = data.foundingDate
  if (data.app?.language) result.language = data.app.language
  if (data.app?.currency) result.currency = data.app.currency

  // Step 2: SEO & Metadata
  if (data.seo?.title) result.seoTitle = data.seo.title
  if (data.seo?.description) result.seoDescription = data.seo.description
  if (data.seo?.keywords) result.keywords = data.seo.keywords
  if (data.seo?.menuTitle) result.menuTitle = data.seo.menuTitle
  if (data.seo?.menuDescription)
    result.menuDescription = data.seo.menuDescription
  if (data.seo?.aboutTitle) result.aboutTitle = data.seo.aboutTitle
  if (data.seo?.aboutDescription)
    result.aboutDescription = data.seo.aboutDescription
  if (data.seo?.contactTitle) result.contactTitle = data.seo.contactTitle
  if (data.seo?.contactDescription)
    result.contactDescription = data.seo.contactDescription
  if (data.seo?.brandTitle) result.brandTitle = data.seo.brandTitle
  if (data.seo?.brandDescription)
    result.brandDescription = data.seo.brandDescription
  if (data.seo?.companyTitle) result.companyTitle = data.seo.companyTitle
  if (data.seo?.companyDescription)
    result.companyDescription = data.seo.companyDescription
  if (data.social?.ogLocale) result.ogLocale = data.social.ogLocale
  if (data.social?.twitterCard) result.twitterCard = data.social.twitterCard
  if (data.social?.twitterSite) result.twitterSite = data.social.twitterSite
  if (data.schema?.noindex !== undefined) result.noindex = data.schema.noindex

  // Step 3: Local SEO & Schema
  if (data.localSEO?.neighborhood)
    result.neighborhood = data.localSEO.neighborhood
  if (data.localSEO?.city) result.city = data.localSEO.city
  if (data.localSEO?.region) result.region = data.localSEO.region
  if (data.localSEO?.country) result.country = data.localSEO.country
  if (data.localSEO?.countryCode) result.countryCode = data.localSEO.countryCode
  if (data.localSEO?.postalCode) result.postalCode = data.localSEO.postalCode
  if (data.localSEO?.googleMapsUrl)
    result.googleMapsUrl = data.localSEO.googleMapsUrl
  if (data.localSEO?.embedUrl) result.embedUrl = data.localSEO.embedUrl
  if (data.localSEO?.placeId) result.placeId = data.localSEO.placeId
  if (data.localSEO?.timezone) result.timezone = data.localSEO.timezone
  if (data.contact?.location?.lat !== undefined)
    result.lat = data.contact.location.lat
  if (data.contact?.location?.lng !== undefined)
    result.lng = data.contact.location.lng
  if (data.contact?.location?.plusCode)
    result.plusCode = data.contact.location.plusCode
  if (data.schema?.priceRange) result.priceRange = data.schema.priceRange
  if (data.schema?.servesCuisine)
    result.cuisineTypes = data.schema.servesCuisine
  if (data.schema?.acceptsReservations !== undefined)
    result.acceptsReservations = data.schema.acceptsReservations
  if (data.schema?.isTakeout !== undefined)
    result.isTakeout = data.schema.isTakeout
  if (data.schema?.isDelivery !== undefined)
    result.isDelivery = data.schema.isDelivery
  if (data.schema?.priceCurrency)
    result.priceCurrency = data.schema.priceCurrency
  if (data.schema?.aggregateRating) {
    result.aggregateRating = {
      ratingValue: data.schema.aggregateRating.ratingValue,
      reviewCount: data.schema.aggregateRating.reviewCount,
      bestRating: data.schema.aggregateRating.bestRating,
      worstRating: data.schema.aggregateRating.worstRating,
      source: data.schema.aggregateRating.source,
      sourceUrl: data.schema.aggregateRating.sourceUrl,
    }
  }

  // Step 4: Images & Hero
  if (data.images?.logo?.url) result.logoImage = data.images.logo.url
  if (data.hero?.slides?.length > 0) {
    result.heroSlides = data.hero.slides.map((s: any) => ({
      image: s.image || "",
      title: s.title || "",
      subtitle: s.subtitle || "",
      ctaText: s.ctaText || "View Menu",
      ctaLink: s.ctaLink || "#menu",
      alt: s.alt || "",
    }))
  }
  if (data.images?.gallery) {
    result.imagesGallery = data.images.gallery.map((g: any) => g.url)
  }

  // Step 5: About Us
  if (data.about?.title) result.aboutTitle = data.about.title
  if (data.about?.content) result.aboutContent = data.about.content
  if (data.about?.shortDescription)
    result.aboutShortDescription = data.about.shortDescription
  if (data.about?.mission) result.aboutMission = data.about.mission
  if (data.about?.philosophy) result.aboutPhilosophy = data.about.philosophy
  if (data.about?.additionalContent)
    result.aboutAdditionalContent = data.about.additionalContent
  if (data.about?.foundedYear) result.foundedYear = data.about.foundedYear
  if (data.about?.foundingLocation)
    result.foundingLocation = data.about.foundingLocation
  if (data.about?.founder) {
    result.founderName = data.about.founder.name
    result.founderRole = data.about.founder.role
    result.founderBio = data.about.founder.bio
    result.founderImage = data.about.founder.image
    result.founderQualifications = data.about.founder.qualifications || []
    result.founderSocial = data.about.founder.social || {}
    result.founderSince = data.about.founder.since
  }
  if (data.about?.awards) result.awards = data.about.awards
  if (data.about?.keywordsByPage)
    result.keywordsByPage = data.about.keywordsByPage

  // Team from about or top-level
  const teamSource = data.about?.team || data.team || []
  if (teamSource.length > 0) {
    result.team = teamSource.map((m: any) => ({
      name: m.name || "",
      role: m.role || "",
      image: m.image || null,
      bio: m.bio || "",
      social: m.social || {},
      since: m.since || "",
    }))
  }

  // Step 6: Company Info
  if (data.companyInfo?.name) result.companyName = data.companyInfo.name
  if (data.companyInfo?.legalName)
    result.companyLegalName = data.companyInfo.legalName
  if (data.companyInfo?.registrationNumber)
    result.registrationNumber = data.companyInfo.registrationNumber
  if (data.companyInfo?.representative)
    result.representative = data.companyInfo.representative
  if (data.companyInfo?.address)
    result.companyAddress = data.companyInfo.address
  if (data.companyInfo?.phone) result.companyPhone = data.companyInfo.phone
  if (data.companyInfo?.establishedDate)
    result.establishedDate = data.companyInfo.establishedDate
  if (data.companyInfo?.capital) result.capital = data.companyInfo.capital
  if (data.companyInfo?.fiscalYearEnd)
    result.fiscalYearEnd = data.companyInfo.fiscalYearEnd
  if (data.companyInfo?.businessPurpose)
    result.businessPurpose = data.companyInfo.businessPurpose
  if (data.companyInfo?.annualReportUrl)
    result.annualReportUrl = data.companyInfo.annualReportUrl
  if (data.numberOfEmployees !== undefined)
    result.numberOfEmployees = data.numberOfEmployees

  // Step 7: Operational
  if (data.openingHours) {
    result.openingHours = data.openingHours.map((h: any) => ({
      day: h.day || "",
      lunch: h.lunch || "",
      lunchLO: h.lunchLastOrder || h.lunchLO || "",
      dinner: h.dinner || "",
      dinnerLO: h.dinnerLastOrder || h.dinnerLO || "",
      isClosed: h.isClosed || false,
      notes: h.notes || "",
    }))
  }
  if (data.holidayNotes) result.holidayNotes = data.holidayNotes
  if (data.contact?.openingHours) {
    result.openingHours = (data.contact.openingHours || []).map((h: any) => ({
      day: h.day || "",
      lunch: h.lunch || "",
      lunchLO: h.lunchLO || "",
      dinner: h.dinner || "",
      dinnerLO: h.dinnerLO || "",
      isClosed: h.isClosed || false,
      notes: h.notes || "",
    }))
    if (data.contact.holidayNotes)
      result.holidayNotes = data.contact.holidayNotes
  }
  if (data.operations?.paymentMethods)
    result.paymentMethods = data.operations.paymentMethods
  if (data.operations?.dietaryOptions) {
    result.dietaryOptions = {
      vegetarian: !!data.operations.dietaryOptions.vegetarian,
      vegan: !!data.operations.dietaryOptions.vegan,
      glutenFree: !!data.operations.dietaryOptions.glutenFree,
      halal: !!data.operations.dietaryOptions.halal,
      kosher: !!data.operations.dietaryOptions.kosher,
      dairyFree: !!data.operations.dietaryOptions.dairyFree,
      nutFree: !!data.operations.dietaryOptions.nutFree,
    }
  }
  if (data.operations?.features) {
    result.features = {
      privateDining: !!data.operations.features.privateDining,
      privateDiningCapacity: data.operations.features.privateDiningCapacity,
      privateDiningDescription:
        data.operations.features.privateDiningDescription,
      outdoorSeating: !!data.operations.features.outdoorSeating,
      wifi: !!data.operations.features.wifi,
      wifiPassword: data.operations.features.wifiPassword,
      parking: data.operations.features.parking,
      parkingDetails: data.operations.features.parkingDetails,
      wheelchairAccessible: !!data.operations.features.wheelchairAccessible,
      petFriendly: !!data.operations.features.petFriendly,
      romantic: !!data.operations.features.romantic,
      goodForGroups: !!data.operations.features.goodForGroups,
      goodForFamilies: !!data.operations.features.goodForFamilies,
      goodForDateNight: !!data.operations.features.goodForDateNight,
    }
  }
  if (data.operations?.services) {
    result.services = {
      takeout: !!data.operations.services.takeout,
      delivery: !!data.operations.services.delivery,
      deliveryPlatforms: data.operations.services.deliveryPlatforms || [],
      deliveryRadius: data.operations.services.deliveryRadius,
      catering: !!data.operations.services.catering,
      cateringRadius: data.operations.services.cateringRadius,
      cateringMinimum: data.operations.services.cateringMinimum,
      reservations: !!data.operations.services.reservations,
      reservationMethods: data.operations.services.reservationMethods || [],
      onlineBookingUrl: data.operations.services.onlineBookingUrl,
      banquets: !!data.operations.services.banquets,
      banquetCapacity: data.operations.services.banquetCapacity,
    }
  }

  // Social
  if (data.social?.sameAs) {
    const social = data.social.sameAs
    const ig = social.find((s: string) => s.includes("instagram.com"))
    const fb = social.find((s: string) => s.includes("facebook.com"))
    const tw = social.find(
      (s: string) => s.includes("twitter.com") || s.includes("x.com")
    )
    if (ig)
      result.socialInstagram = ig
        .replace("https://www.instagram.com/", "")
        .replace(/\/$/, "")
    if (fb)
      result.socialFacebook = fb
        .replace("https://www.facebook.com/", "")
        .replace(/\/$/, "")
    if (tw)
      result.socialTwitter = tw
        .replace("https://twitter.com/", "")
        .replace("https://x.com/", "")
        .replace(/\/$/, "")
  }
  if (data.social?.tabelog) result.socialTabelog = data.social.tabelog

  // Step 8: Menu
  if (data.menu) {
    // data.json has menu as flat array with categories
    const categories: Record<string, any[]> = {}
    data.menu.forEach((item: any) => {
      const cat = item.category || "Other"
      if (!categories[cat]) categories[cat] = []
      categories[cat].push(item)
    })
    result.menuCategories = Object.entries(categories).map(([name, items]) => ({
      name,
      items: items.map((item: any) => ({
        name: item.name || "",
        secondaryName: item.secondaryName || "",
        description: item.description || "",
        price: String(item.price || ""),
        category: item.category || name,
        image: item.image || null,
        isPopular: !!item.isPopular,
        isVegetarian: !!item.isVegetarian,
        isVegan: !!item.isVegan,
        isSpicy: !!item.isSpicy,
        spiceLevel: item.spiceLevel || 0,
        allergens: item.allergens || [],
        calories: item.calories || undefined,
        ingredients: item.ingredients || [],
        available: item.available !== false,
        availableFrom: item.availableFrom || "",
        availableTo: item.availableTo || "",
        size: item.size || "",
        limited: !!item.limited,
        availableUntil: item.availableUntil || "",
      })),
    }))
  }

  // Step 9: Reviews
  if (data.reviews) {
    // Handle both flat array and {aggregate, individual} formats
    if (Array.isArray(data.reviews)) {
      result.reviews = data.reviews.map((r: any) => ({
        id: r.id || `${Date.now()}-${r.author}`,
        author: r.author || "",
        rating: r.rating || 0,
        date: r.date || "",
        comment: r.comment || r.reviewBody || "",
        source: r.source || "Google Reviews",
      }))
    } else if (data.reviews.individual) {
      result.reviews = data.reviews.individual.map((r: any) => ({
        id: r.id || `${Date.now()}-${r.author}`,
        author: r.author || "",
        rating: r.rating || 0,
        date: r.date || "",
        comment: r.comment || r.reviewBody || "",
        source: r.source || "Google Reviews",
      }))
    }
  }

  // Media
  if (data.media) {
    result.videos = data.media.videos || []
    result.virtualTour = data.media.virtualTour || ""
  }

  // Advanced
  if (data.knowsLanguage) result.knowLanguages = data.knowsLanguage
  if (data.cuisineType) result.cuisineType = data.cuisineType
  if (data.reservation) result.reservation = data.reservation
  if (data.advancedSchema) result.advancedSchema = data.advancedSchema

  return result
}

/**
 * Maps SiteBuilderData → data.json format (for export)
 */
export function mapBuilderToDataJson(formData: SiteBuilderData) {
  return {
    uid: formData.uid || "",
    version: "1",
    name: formData.siteName,
    description: formData.description,
    tagline: formData.tagline || "",
    address: formData.address,
    phone: formData.phone,
    email: formData.email,
    menuLink: formData.menuLink || "",
    foundingDate: formData.foundingDate || "",

    app: {
      language: formData.language || "EN",
      currency: formData.currency || "USD",
    },

    seo: {
      title: formData.seoTitle,
      description: formData.seoDescription,
      keywords: formData.keywords,
      menuTitle: formData.menuTitle || "",
      menuDescription: formData.menuDescription || "",
      aboutTitle: formData.aboutTitle || "",
      aboutDescription: formData.aboutDescription || "",
      contactTitle: formData.contactTitle || "",
      contactDescription: formData.contactDescription || "",
      brandTitle: formData.brandTitle || "",
      brandDescription: formData.brandDescription || "",
      companyTitle: formData.companyTitle || "",
      companyDescription: formData.companyDescription || "",
    },

    social: {
      ogImage: formData.heroImage || "",
      ogLocale: formData.ogLocale || "en_US",
      twitterCard: formData.twitterCard || "summary_large_image",
      twitterSite: formData.twitterSite || "",
      sameAs: [
        formData.socialInstagram
          ? `https://www.instagram.com/${formData.socialInstagram}`
          : null,
        formData.socialFacebook
          ? `https://www.facebook.com/${formData.socialFacebook}`
          : null,
        formData.socialTwitter
          ? `https://twitter.com/${formData.socialTwitter}`
          : null,
        formData.socialTabelog || null,
      ].filter(Boolean),
    },

    schema: {
      priceRange: formData.priceRange,
      servesCuisine: formData.cuisineTypes,
      acceptsReservations: formData.acceptsReservations,
      isTakeout: formData.isTakeout,
      isDelivery: formData.isDelivery,
      priceCurrency: formData.priceCurrency || "USD",
      aggregateRating: formData.aggregateRating
        ? {
            ratingValue: formData.aggregateRating.ratingValue,
            reviewCount: formData.aggregateRating.reviewCount,
            bestRating: formData.aggregateRating.bestRating ?? 5,
            worstRating: formData.aggregateRating.worstRating ?? 1,
            source: formData.aggregateRating.source || "",
            sourceUrl: formData.aggregateRating.sourceUrl || "",
          }
        : undefined,
    },

    localSEO: {
      neighborhood: formData.neighborhood || "",
      city: formData.city || "",
      region: formData.region || "",
      country: formData.country || "",
      countryCode: formData.countryCode || "",
      postalCode: formData.postalCode || "",
      placeId: formData.placeId || "",
      googleMapsUrl: formData.googleMapsUrl || "",
      timezone: formData.timezone || "UTC",
    },

    contact: {
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      location: {
        lat: formData.lat || 0,
        lng: formData.lng || 0,
        mapsUrl: formData.googleMapsUrl || "",
        embedUrl: formData.embedUrl || "",
        address: formData.address,
        plusCode: formData.plusCode || "",
      },
      openingHours: formData.openingHours,
      holidayNotes: formData.holidayNotes || "",
    },

    images: {
      logo: {
        id: formData.uid || "logo",
        url: formData.logoImage ? `/images/logo.png` : "",
        alt: `${formData.siteName} logo`,
        width: 200,
        height: 200,
      },
      heroImage: {
        url: formData.heroImage ? `/images/hero.jpg` : "",
        alt: `${formData.siteName} hero image`,
        credit: "",
      },
      coverImage: {
        url: formData.coverImage ? `/images/cover.jpg` : "",
        alt: `${formData.siteName} cover image`,
        credit: "",
      },
      gallery: formData.imagesGallery.map((img, i) => ({
        url: img,
        alt: `${formData.siteName} gallery image ${i + 1}`,
        credit: "",
      })),
      team: formData.team.map((member) => ({
        url: member.image || "",
        alt: `${member.name} - ${member.role}`,
        name: member.name,
        role: member.role,
      })),
    },

    hero: {
      slides:
        formData.heroSlides && formData.heroSlides.length > 0
          ? formData.heroSlides.map((slide) => ({
              image: slide.image || "",
              title: slide.title,
              subtitle: slide.subtitle,
              ctaText: slide.ctaText,
              ctaLink: slide.ctaLink,
              alt: slide.alt || "",
            }))
          : [
              {
                image: formData.heroImage || "",
                title: formData.siteName,
                subtitle: formData.description,
                ctaText: "View Menu",
                ctaLink: "#menu",
                alt: `${formData.siteName} hero`,
              },
            ],
    },

    about: {
      title: formData.aboutTitle || "",
      content: formData.aboutContent,
      shortDescription: formData.aboutShortDescription || "",
      mission: formData.aboutMission || "",
      philosophy: formData.aboutPhilosophy || "",
      additionalContent: formData.aboutAdditionalContent || [],
      foundedYear: formData.foundedYear || 0,
      foundingLocation: formData.foundingLocation || "",
      founder: {
        name: formData.founderName || "",
        role: formData.founderRole || "",
        bio: formData.founderBio || "",
        image: formData.founderImage || "",
        qualifications: formData.founderQualifications || [],
        social: formData.founderSocial || {},
        since: formData.founderSince || "",
      },
      awards: formData.awards || [],
      keywordsByPage: formData.keywordsByPage || {},
      images: formData.imagesGallery.slice(0, 3),
      image: formData.coverImage || "",
      team: formData.team.map((member) => ({
        name: member.name,
        role: member.role,
        image: member.image || "",
        bio: member.bio,
        social: member.social || {},
        since: member.since || "",
      })),
    },

    companyInfo: {
      name: formData.companyName,
      legalName: formData.companyLegalName || "",
      registrationNumber: formData.registrationNumber || "",
      address: formData.companyAddress || "",
      phone: formData.companyPhone || "",
      establishedDate: formData.establishedDate || "",
      capital: formData.capital || "",
      fiscalYearEnd: formData.fiscalYearEnd || "",
      representative: formData.representative || "",
      businessPurpose: formData.businessPurpose || "",
      annualReportUrl: formData.annualReportUrl || "",
      url: `https://restaurantsites.vercel.app/${formData.siteSlug}/company-information`,
    },

    location: {
      lat: formData.lat || 0,
      lng: formData.lng || 0,
      mapsUrl: formData.googleMapsUrl || "",
      embedUrl: formData.embedUrl || "",
      address: formData.address,
      plusCode: formData.plusCode || "",
    },

    openingHours: formData.openingHours,
    holidayNotes: formData.holidayNotes || "",

    operations: {
      paymentMethods: formData.paymentMethods || [],
      dietaryOptions: formData.dietaryOptions || {
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        halal: false,
        kosher: false,
        dairyFree: false,
        nutFree: false,
      },
      features: formData.features || {
        privateDining: false,
        outdoorSeating: false,
        wifi: false,
        parking: "",
        wheelchairAccessible: false,
        petFriendly: false,
        romantic: false,
        goodForGroups: false,
        goodForFamilies: false,
        goodForDateNight: false,
      },
      services: formData.services || {
        takeout: true,
        delivery: false,
        deliveryPlatforms: [],
        catering: false,
        reservations: true,
        reservationMethods: [],
        banquets: false,
      },
    },

    menu: formData.menuCategories.flatMap((category) =>
      category.items.map((item) => ({
        id: item.name.toLowerCase().replace(/\s+/g, "-"),
        name: item.name,
        secondaryName: item.secondaryName || "",
        description: item.description,
        price: item.price,
        priceNumeric: parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0,
        category: category.name,
        image: item.image || "",
        isPopular: item.isPopular || false,
        isVegetarian: item.isVegetarian || false,
        isVegan: item.isVegan || false,
        isSpicy: item.isSpicy || false,
        spiceLevel: item.spiceLevel || 0,
        allergens: item.allergens || [],
        calories: item.calories || 0,
        ingredients: item.ingredients || [],
        available: item.available !== false,
        availableFrom: item.availableFrom || "",
        availableTo: item.availableTo || "",
        size: item.size || "Regular",
        limited: item.limited || false,
        availableUntil: item.availableUntil || "",
      }))
    ),

    reviews: {
      aggregate: formData.aggregateRating
        ? {
            ratingValue: formData.aggregateRating.ratingValue,
            reviewCount: formData.aggregateRating.reviewCount,
            bestRating: formData.aggregateRating.bestRating ?? 5,
            worstRating: formData.aggregateRating.worstRating ?? 1,
            source: formData.aggregateRating.source || "google",
            sourceUrl: formData.aggregateRating.sourceUrl || "",
          }
        : undefined,
      individual: formData.reviews.map((review) => ({
        id: review.id || `${Date.now()}-${review.author}`,
        author: review.author,
        rating: review.rating,
        date: review.date,
        reviewBody: review.comment,
        source: review.source || "Google Reviews",
      })),
    },

    reservation: formData.reservation || {
      acceptsReservations: formData.acceptsReservations,
      reservationMethods: formData.services?.reservationMethods || [],
      onlineBookingUrl: formData.services?.onlineBookingUrl || "",
      largeGroups: formData.features?.privateDining || false,
      largeGroupCapacity: formData.features?.privateDiningCapacity || 0,
      privateDining: formData.features?.privateDining
        ? {
            available: true,
            capacity: formData.features.privateDiningCapacity || 12,
            minimumSpend: formData.services?.cateringMinimum || "",
            description: formData.features.privateDiningDescription || "",
          }
        : undefined,
    },

    media: {
      videos: formData.videos || [],
      virtualTour: formData.virtualTour || "",
    },

    numberOfEmployees: formData.numberOfEmployees,
    knowsLanguage: formData.knowLanguages || [],
    cuisineType: formData.cuisineType || "",

    advancedSchema: formData.advancedSchema
      ? {
          foundedDate: formData.foundingDate || "",
          foundingLocation: formData.foundingLocation || "",
          numberOfEmployees: formData.numberOfEmployees,
          currenciesAccepted: formData.advancedSchema.currenciesAccepted || [],
          paymentAccepted: formData.advancedSchema.paymentAccepted || [],
          servesCuisine: formData.cuisineTypes,
          menuType: formData.advancedSchema.menuType || ["dine-in", "takeout"],
          starRating: formData.aggregateRating?.ratingValue,
          priceRange: formData.priceRange,
          eventType: formData.advancedSchema.eventType || [],
          seats: formData.advancedSchema.seats,
          smoking: formData.advancedSchema.smoking || "No Smoking",
          music: formData.advancedSchema.music || "",
          attire: formData.advancedSchema.attire || "casual",
        }
      : undefined,

    // Generate pages structure from the form data
    pages: {
      home: {
        id: "home",
        sections: [
          {
            id: "hero",
            type: "hero",
            ui: { order: 1, visible: true, fullBleed: true },
            data: {
              slides:
                formData.heroSlides && formData.heroSlides.length > 0
                  ? formData.heroSlides.map((slide) => ({
                      id: `slide-${slide.title.toLowerCase().replace(/\s+/g, "-")}`,
                      image: slide.image || "",
                      alt: slide.alt || `${formData.siteName} hero`,
                      title: slide.title,
                      subtitle: slide.subtitle,
                      ctaText: slide.ctaText,
                      ctaLink: slide.ctaLink,
                    }))
                  : [
                      {
                        id: "slide-1",
                        image: formData.heroImage || "",
                        alt: `${formData.siteName} hero image`,
                        title: formData.siteName,
                        subtitle: formData.description,
                        ctaText: "View Menu",
                        ctaLink: "#menu",
                      },
                    ],
            },
          },
          {
            id: "about",
            type: "about",
            ui: { order: 2, visible: true, layout: "image-right" },
            data: {
              ref: "pages.home.sections.about.data",
              title: formData.aboutTitle || "Our Story",
              content: formData.aboutContent,
              additionalContent: formData.aboutAdditionalContent || [],
              foundedYear: formData.foundedYear || 0,
              founder: {
                id: "team-founder",
                name: formData.founderName || "",
                role: formData.founderRole || "",
                bio: formData.founderBio || "",
                image: formData.founderImage || "",
              },
              images: formData.imagesGallery.slice(0, 3),
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
  }
}
