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
import Image from "next/image"
import { cn } from "@workspace/ui/lib/utils"
import { FoodMenu } from "@/components/food-menu/food-menu"
import { groupMenuByCategory } from "@/lib/restaurant"

interface BlockRendererProps {
  section: SectionBlock
  data: RestaurantData
  translations: Record<string, unknown>
  restaurantSlug: string
}

// ---------------------------------------------------------------------------
// Individual block renderers
// ---------------------------------------------------------------------------

function HeroBlock({ section }: { section: SectionBlock }) {
  const d = section.data as {
    slides?: RestaurantData["hero"] extends { slides: infer S } ? S : never[]
  }
  if (!d.slides?.length) return null
  return <Hero slides={d.slides} />
}

function AboutBlock({
  section,
  data,
  translations,
}: {
  section: SectionBlock
  data: RestaurantData
  translations: Record<string, unknown>
}) {
  const t = translations as {
    home?: {
      about?: { subtitle?: string; title?: string; backgroundTitle?: string }
    }
  }
  const d = section.data as {
    title?: string
    content?: string
    images?: string[]
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
              title={d.title ?? t.home?.about?.title ?? `About ${data.name}`}
              backgroundTitle={t.home?.about?.backgroundTitle ?? "Heritage"}
            />
            <p className="mb-10 text-xl leading-relaxed text-muted-foreground">
              {d.content ?? data.description}
            </p>
          </div>

          {d.images ? (
            <ImageSlider images={d.images} />
          ) : d.image ? (
            <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src={d.image}
                alt={d.title ?? "About image"}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function MenuBlock({
  data,
  translations,
}: {
  data: RestaurantData
  translations: Record<string, unknown>
}) {
  const categories = groupMenuByCategory((data.menu ?? []) as MenuItem[])
  if (!categories.length) return null
  return (
    <section className="paper-noise border-t border-border/40 bg-accent/5 py-12">
      <FoodMenu
        categories={categories}
        menuLink={data.menuLink}
        translations={translations}
      />
    </section>
  )
}

function GalleryBlock({
  data,
  translations,
}: {
  data: RestaurantData
  translations: Record<string, unknown>
}) {
  const gallery =
    data.images?.gallery?.map((img) => ({ src: img.url, alt: img.alt })) ??
    data.about?.images?.map((url) => ({ src: url, alt: data.name }))

  return (
    <GallerySection
      images={gallery}
      translations={translations}
      restaurantName={data.name}
    />
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
  hero: ({ section }) => <HeroBlock section={section} />,
  about: ({ section, data, translations }) => (
    <AboutBlock section={section} data={data} translations={translations} />
  ),
  menu: ({ data, translations }) => (
    <MenuBlock data={data} translations={translations} />
  ),
  gallery: ({ data, translations }) => (
    <GalleryBlock data={data} translations={translations} />
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
