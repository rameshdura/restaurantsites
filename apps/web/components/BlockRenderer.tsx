import type React from "react"
import {
  type SectionBlock,
  type RestaurantData,
  type MenuItem,
} from "@/lib/restaurant"
import { Hero } from "@workspace/ui/components/hero"
import { ContactSection } from "@workspace/ui/components/contact-section"
import { GallerySection } from "@workspace/ui/components/gallery-section"
import { ReviewsSection } from "@workspace/ui/components/reviews-section"
import { SectionHeader } from "@workspace/ui/components/section-header"
import { ImageSlider } from "@workspace/ui/components/image-slider"
import { FeaturedSection } from "@workspace/ui/components/featured-section"
import { SafeImage } from "@/components/safe-image"
import Image from "next/image"
import Link from "next/link"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { FoodMenu } from "@/components/food-menu/food-menu"
import { groupMenuByCategory, getImageSrc } from "@/lib/restaurant"

interface BlockRendererProps {
  section: SectionBlock
  data: RestaurantData
  translations: Record<string, unknown>
  restaurantSlug: string
  getLink: (path: string) => string
}

// ---------------------------------------------------------------------------
// Individual block renderers
// ---------------------------------------------------------------------------

function HeroBlock({
  section,
  data,
  translations,
  restaurantSlug,
}: {
  section: SectionBlock
  data: RestaurantData
  translations: Record<string, unknown>
  restaurantSlug: string
}) {
  const t = translations as {
    home?: {
      hero?: {
        slide1?: { title?: string; subtitle?: string; buttonLabel?: string }
        slide2?: { title?: string; subtitle?: string; buttonLabel?: string }
      }
    }
  }
  const d = section.data as {
    slides?: Array<{
      id?: string
      image: string
      alt?: string
      title?: string
      subtitle?: string
      ctaText?: string
      ctaLink?: string
    }>
  }

  if (!d.slides?.length) return null

  const localeSlides = [t.home?.hero?.slide1, t.home?.hero?.slide2]

  const slides = d.slides.map((slide, i) => {
    const locale = localeSlides[i] || {}
    const merged = {
      ...slide,
      image: getImageSrc(restaurantSlug, slide.image),
      title: slide.title || locale.title || "",
      subtitle: slide.subtitle || locale.subtitle || "",
      ctaText: slide.ctaText || locale.buttonLabel || "",
    }
    return merged
  })

  return <Hero slides={slides} phone={data.phone} />
}

function AboutBlock({
  section,
  data,
  translations,
  restaurantSlug,
  getLink,
}: {
  section: SectionBlock
  data: RestaurantData
  translations: Record<string, unknown>
  restaurantSlug: string
  getLink: (path: string) => string
}) {
  const t = translations as {
    home?: {
      about?: { subtitle?: string; title?: string; backgroundTitle?: string }
    }
    navbar?: {
      about?: string
    }
  }
  const d = section.data as {
    title?: string
    content?: string
    image?: string
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-12">
      <section
        id="about"
        className={cn("py-20", section.ui.fullBleed && "pt-32")}
      >
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <SectionHeader
              subtitle={t.home?.about?.subtitle ?? "Our Story"}
              title={
                d.title ||
                (t.home?.about?.title as string | undefined) ||
                "Our Story"
              }
              backgroundTitle={t.home?.about?.backgroundTitle ?? "Heritage"}
            />
            <p className="mb-10 text-xl leading-relaxed text-muted-foreground">
              {d.content ?? data.description}
            </p>
            <div className="mt-8">
              <Link
                href={getLink("/about")}
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "group h-12 min-w-[180px] px-6 text-sm font-semibold tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 active:scale-95"
                )}
              >
                {t.navbar?.about ?? "About Us"}
                <svg
                  className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {(() => {
            const imagesList =
              data.images?.about || data.about?.images || data.images?.gallery
            if (imagesList && imagesList.length > 0) {
              return (
                <ImageSlider
                  images={imagesList.map((im: string | { url: string }) =>
                    getImageSrc(
                      restaurantSlug,
                      typeof im === "string" ? im : im.url
                    )
                  )}
                />
              )
            }
            if (d.image) {
              return (
                <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl">
                  <Image
                    src={getImageSrc(restaurantSlug, d.image)}
                    alt={d.title ?? "About image"}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              )
            }
            return null
          })()}
        </div>
      </section>
    </div>
  )
}
// ... existing code ...

function MenuBlock({
  section,
  data,
  translations,
  restaurantSlug,
  getLink,
}: {
  section: SectionBlock
  data: RestaurantData
  translations: Record<string, unknown>
  restaurantSlug: string
  getLink: (path: string) => string
}) {
  const categories = groupMenuByCategory(
    (data.menu ?? []) as MenuItem[],
    restaurantSlug
  )
  if (!categories.length) return null

  const isPreview = section.id === "menu-preview"

  if (isPreview) {
    const t = translations as {
      home?: {
        menu?: {
          subtitle?: string
          title?: string
          backgroundTitle?: string
          description?: string
          description2?: string
          openMenuButton?: string
          makeReservationButton?: string
        }
      }
    }
    const d = section.data as {
      title?: string
      description?: string
      description2?: string
      openMenuButton?: string
      makeReservationButton?: string
    }

    const subtitle = t.home?.menu?.subtitle ?? "Our Menu"
    const title = d.title || t.home?.menu?.title || "A Taste of Tradition"
    const backgroundTitle = t.home?.menu?.backgroundTitle ?? "Delicious Food"
    const description =
      d.description ||
      t.home?.menu?.description ||
      "Every dish on our menu is prepared using fresh ingredients, aromatic herbs, and carefully selected spices to create rich, balanced flavors inspired by authentic culinary traditions."
    const description2 =
      d.description2 ||
      t.home?.menu?.description2 ||
      "From healthy light bites to bold signature specialties, each plate is crafted with care and passion — combining freshness, quality, and authentic taste in every serving."
    const openMenuButton =
      d.openMenuButton || t.home?.menu?.openMenuButton || "Open Menu"
    const makeReservationButton =
      d.makeReservationButton ||
      t.home?.menu?.makeReservationButton ||
      "Make Reservation"

    const featuredItems = (data.images?.featured ?? [])
      .filter(Boolean)
      .map((item: { id: string; url: string; alt: string }) => ({
        id: item.id,
        image: getImageSrc(restaurantSlug, item.url),
        alt: item.alt,
      }))

    const drinkItems = (data.images?.drinks ?? [])
      .filter(Boolean)
      .map((item: { id: string; url: string; alt: string }) => ({
        id: item.id,
        image: getImageSrc(restaurantSlug, item.url),
        alt: item.alt,
      }))

    return (
      <section className="paper-noise relative overflow-hidden border-t border-border/40 bg-accent/5 py-24">
        <div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mb-8 text-center">
            <SectionHeader
              subtitle={subtitle}
              title={title}
              backgroundTitle={backgroundTitle}
              align="center"
            />
          </div>

          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={getLink("/menu")}
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "group h-12 min-w-[180px] px-6 text-sm font-semibold tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 active:scale-95"
              )}
            >
              {openMenuButton}
            </Link>
            <Link
              href={getLink("/contact")}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "group h-12 min-w-[180px] px-6 text-sm font-semibold tracking-wider transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20 active:scale-95"
              )}
            >
              {makeReservationButton}
            </Link>
          </div>

          <p className="mx-auto mb-20 max-w-2xl text-center text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>

          {/* Featured food images — sourced from data.images.featured */}
          {featuredItems.length > 0 && (
            <div className="mb-20">
              <div className="grid grid-cols-2 gap-6 max-sm:-mx-6 max-sm:gap-0 sm:grid-cols-4">
                {featuredItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex flex-col gap-3 max-sm:rounded-none max-sm:border-none max-sm:shadow-none"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/40 bg-accent/30 shadow-md backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5">
                      <SafeImage
                        src={item.image || "/images/placeholder.png"}
                        alt={item.alt}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent to-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    <p className="text-center text-sm font-medium text-muted-foreground group-hover:text-foreground">
                      {item.alt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {featuredItems.length > 0 && (
            <p className="mx-auto my-20 max-w-2xl text-center text-lg leading-relaxed text-muted-foreground">
              {description2}
            </p>
          )}

          {/* Featured drinks images — sourced from data.images.drinks */}
          {drinkItems.length > 0 && (
            <div className="mt-20">
              <div className="mx-auto grid max-w-lg grid-cols-2 gap-6 max-sm:-mx-6 max-sm:gap-0 sm:max-w-2xl sm:grid-cols-4 md:max-w-3xl">
                {drinkItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex flex-col gap-3"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/40 bg-accent/30 shadow-md backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5">
                      <SafeImage
                        src={item.image || "/images/placeholder.png"}
                        alt={item.alt}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent to-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    <p className="text-center text-sm font-medium text-muted-foreground group-hover:text-foreground">
                      {item.alt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="paper-noise border-t border-border/40 bg-accent/5 py-12">
      <FoodMenu
        categories={categories}
        menuLink={data.menuLink}
        currency={data.app?.currency}
        translations={translations}
      />
    </section>
  )
}

function GalleryBlock({
  data,
  restaurantSlug,
  translations,
}: {
  data: RestaurantData
  restaurantSlug: string
  translations: Record<string, unknown>
}) {
  const gallery =
    data.images?.gallery?.map((img) => ({
      src: getImageSrc(restaurantSlug, img.url),
      alt: img.alt,
    })) ??
    data.about?.images?.map((url) => ({
      src: getImageSrc(restaurantSlug, url),
      alt: data.name,
    }))

  return (
    <GallerySection
      images={gallery}
      translations={translations}
      restaurantName={data.name}
    />
  )
}

function DrinksBlock({
  data,
  restaurantSlug,
  getLink,
}: {
  data: RestaurantData
  restaurantSlug: string
  getLink: (path: string) => string
}) {
  const drinks = (data.images?.drinks ?? []) as Array<{
    id: string
    url: string
    alt: string
  }>
  if (!drinks.length) return null

  return (
    <section className="relative overflow-hidden border-t border-border/40 bg-accent/5 py-24">
      <div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Our Drinks
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore our carefully curated selection of beverages, from classic
            Japanese lagers and premium sake to refreshing teas and sodas — the
            perfect pairing for every dish.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {drinks.map((item) => (
            <div key={item.id} className="group relative flex flex-col gap-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border/40 bg-accent/30 shadow-md backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5">
                <SafeImage
                  src={
                    getImageSrc(restaurantSlug, item.url) ||
                    "/images/placeholder.png"
                  }
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent to-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <p className="text-center text-sm font-medium text-muted-foreground group-hover:text-foreground">
                {item.alt}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={getLink("/menu")}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "group h-12 min-w-[180px] px-6 text-sm font-semibold tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 active:scale-95"
            )}
          >
            Open Menu
          </Link>
          <Link
            href={getLink("/contact")}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "group h-12 min-w-[180px] px-6 text-sm font-semibold tracking-wider transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20 active:scale-95"
            )}
          >
            Make Reservation
          </Link>
        </div>
      </div>
    </section>
  )
}

function ReviewsBlock({
  data,
  translations,
}: {
  data: RestaurantData
  translations: Record<string, unknown>
}) {
  if (!data.reviews) return null

  const reviews = Array.isArray(data.reviews)
    ? data.reviews
    : ((
        data.reviews as {
          individual?: Array<{
            author: string
            rating: number
            date: string
            reviewBody: string
            source?: string
          }>
        }
      ).individual?.map((r) => ({
        author: r.author,
        rating: r.rating,
        date: r.date,
        comment: r.reviewBody,
        source: r.source,
      })) ?? [])

  return (
    <ReviewsSection
      className="bg-background"
      reviews={reviews}
      googleMapsUrl={
        data.localSEO?.googleMapsUrl ?? data.schema?.aggregateRating?.sourceUrl
      }
      translations={translations}
    />
  )
}

function ContactBlock({
  data,
  translations,
  restaurantSlug,
}: {
  data: RestaurantData
  translations: Record<string, unknown>
  restaurantSlug: string
}) {
  return (
    <ContactSection
      isHomePage={true}
      restaurantSlug={restaurantSlug}
      openingHours={data.openingHours}
      holidayNotes={data.holidayNotes}
      restaurantName={data.name}
      address={data.address}
      phone={data.phone}
      email={data.email}
      location={data.location}
      embedUrl={null}
      paymentMethods={data.operations?.paymentMethods}
      deliveryPlatforms={data.operations?.services?.deliveryPlatforms}
      translations={translations}
    />
  )
}

// ---------------------------------------------------------------------------
// Block type → renderer map
// ---------------------------------------------------------------------------

const BLOCK_MAP: Record<
  string,
  (props: BlockRendererProps) => React.ReactElement | null
> = {
  hero: ({ section, data, translations, restaurantSlug }) => (
    <HeroBlock
      section={section}
      data={data}
      translations={translations}
      restaurantSlug={restaurantSlug}
    />
  ),
  about: ({ section, data, translations, restaurantSlug, getLink }) => (
    <AboutBlock
      section={section}
      data={data}
      translations={translations}
      restaurantSlug={restaurantSlug}
      getLink={getLink}
    />
  ),
  menu: ({ section, data, translations, restaurantSlug, getLink }) => (
    <MenuBlock
      section={section}
      data={data}
      translations={translations}
      restaurantSlug={restaurantSlug}
      getLink={getLink}
    />
  ),
  featured: ({ data, restaurantSlug }) => {
    const featuredItems =
      data.images?.featured?.map((item) => ({
        id: item.id,
        image: getImageSrc(restaurantSlug, item.url),
        alt: item.alt,
      })) ?? []

    return <FeaturedSection items={featuredItems} />
  },
  drinks: ({ data, restaurantSlug, getLink }) => (
    <DrinksBlock
      data={data}
      restaurantSlug={restaurantSlug}
      getLink={getLink}
    />
  ),
  gallery: ({ data, restaurantSlug, translations }) => (
    <GalleryBlock
      data={data}
      restaurantSlug={restaurantSlug}
      translations={translations}
    />
  ),
  reviews: ({ data, translations }) => (
    <ReviewsBlock data={data} translations={translations} />
  ),
  contact: ({ data, translations, restaurantSlug }) => (
    <ContactBlock
      data={data}
      translations={translations}
      restaurantSlug={restaurantSlug}
    />
  ),
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

/**
 * Renders a single page section driven by its block descriptor.
 * Sections with `ui.visible = false` are skipped by the caller.
 */
export function BlockRenderer(props: BlockRendererProps) {
  const renderer = BLOCK_MAP[props.section.type]
  if (!renderer) {
    console.warn(
      `[BlockRenderer] Unknown section type: "${props.section.type}"`
    )
    return null
  }
  return renderer(props)
}
