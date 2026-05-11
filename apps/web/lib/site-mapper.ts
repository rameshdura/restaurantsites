import { SiteBuilderData } from './storage'

export function mapBuilderToDataJson(formData: SiteBuilderData) {
  return {
    name: formData.siteName,
    description: formData.description,
    address: formData.address,
    phone: formData.phone,
    email: formData.email,
    menuLink: formData.menuLink || '',
    foundingDate: formData.foundingDate || '',

    app: {
      language: formData.language || 'EN',
      currency: formData.currency || 'USD',
    },

    seo: {
      title: formData.seoTitle,
      description: formData.seoDescription,
      keywords: formData.keywords,
      menuTitle: formData.seoMenuTitle || '',
      menuDescription: formData.seoMenuDescription || '',
      aboutTitle: formData.seoAboutTitle || '',
      aboutDescription: formData.seoAboutDescription || '',
      contactTitle: formData.seoContactTitle || '',
      contactDescription: formData.seoContactDescription || '',
      brandTitle: formData.seoBrandTitle || '',
      brandDescription: formData.seoBrandDescription || '',
      companyTitle: formData.seoCompanyTitle || '',
      companyDescription: formData.seoCompanyDescription || '',
    },

    social: {
      ogImage: formData.heroImage || '',
      ogLocale: formData.ogLocale || 'en_US',
      twitterCard: formData.twitterCard || 'summary_large_image',
      sameAs: [
        formData.socialInstagram ? `https://www.instagram.com/${formData.socialInstagram}` : null,
        formData.socialFacebook ? `https://www.facebook.com/${formData.socialFacebook}` : null,
        formData.socialTwitter ? `https://twitter.com/${formData.socialTwitter}` : null,
        formData.socialTabelog || null,
      ].filter(Boolean),
    },

    schema: {
      priceRange: formData.priceRange,
      servesCuisine: formData.cuisineTypes,
      acceptsReservations: formData.acceptsReservations,
      isTakeout: formData.isTakeout,
      isDelivery: formData.isDelivery,
      priceCurrency: formData.priceCurrency || 'USD',
    },

    localSEO: {
      neighborhood: formData.neighborhood || '',
      city: formData.city || '',
      region: formData.region || '',
      country: formData.country || '',
      countryCode: formData.countryCode || '',
      postalCode: formData.postalCode || '',
      googleMapsUrl: formData.googleMapsUrl || '',
      timezone: formData.timezone || 'UTC',
    },

    images: {
      logo: {
        url: formData.logoImage ? `/images/logo.png` : '', // Placeholder paths for exported JSON
        alt: `${formData.siteName} logo`,
        width: 200,
        height: 200,
      },
      heroImage: {
        url: formData.heroImage ? `/images/hero.jpg` : '',
        alt: `${formData.siteName} hero image`,
      },
      coverImage: {
        url: formData.coverImage ? `/images/cover.jpg` : '',
        alt: `${formData.siteName} cover image`,
      },
    },

    hero: {
      slides: formData.heroSlides && formData.heroSlides.length > 0 
        ? formData.heroSlides.map(slide => ({
            image: slide.image || '',
            title: slide.title,
            subtitle: slide.subtitle,
            ctaText: slide.ctaText,
            ctaLink: slide.ctaLink,
          }))
        : [
            {
              image: formData.heroImage || '',
              title: formData.siteName,
              subtitle: formData.description,
              ctaText: 'View Menu',
              ctaLink: '#menu',
            },
          ],
    },

    about: {
      content: formData.aboutContent,
      foundedYear: formData.foundedYear || 0,
      founder: {
        name: formData.founderName || '',
        role: formData.founderRole || '',
        bio: formData.founderBio || '',
        image: formData.founderImage || '',
      },
      additionalContent: formData.aboutAdditionalContent || [],
      images: formData.imagesGallery.slice(0, 3),
      image: formData.coverImage || '',
      team: formData.team.map(member => ({
        name: member.name,
        role: member.role,
        image: member.image || '',
        bio: member.bio,
      })),
    },

    companyInfo: {
      name: formData.companyName,
      legalName: formData.companyLegalName || '',
      registrationNumber: formData.registrationNumber || '',
      address: formData.companyAddress || '',
      phone: formData.companyPhone || '',
      establishedDate: formData.establishedDate || '',
      capital: formData.capital || '',
      fiscalYearEnd: formData.fiscalYearEnd || '',
      representative: formData.representative || '',
      url: `https://restaurantsite.io/${formData.siteSlug}/company-information`,
    },

    location: {
      lat: formData.lat || 0,
      lng: formData.lng || 0,
      mapsUrl: formData.googleMapsUrl || '',
      embedUrl: formData.embedUrl || '',
      address: formData.address,
    },

    openingHours: formData.openingHours,
    holidayNotes: formData.holidayNotes || '',

    menu: formData.menuCategories.flatMap(category =>
      category.items.map(item => ({
        name: item.name,
        description: item.description,
        price: item.price,
        category: category.name,
        isPopular: item.isPopular || false,
        image: item.image || '',
      }))
    ),

    reviews: formData.reviews,
  }
}
