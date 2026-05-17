import { Metadata } from "next"
import { getRestaurant, groupMenuByCategory } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { getTranslations } from "@/lib/i18n"
import { Navbar } from "@workspace/ui/components/navbar"
import { Hero } from "@workspace/ui/components/hero"
import { ContactSection } from "@workspace/ui/components/contact-section"
import { FoodMenu } from "@/components/food-menu/food-menu"
import { cn } from "@workspace/ui/lib/utils"
import { GallerySection } from "@workspace/ui/components/gallery-section"
import { Footer } from "@/components/footer"
import { SectionHeader } from "@workspace/ui/components/section-header"
import { ImageSlider } from "@workspace/ui/components/image-slider"
import { JsonLd } from "@/components/json-ld"
import { generateHomeMetadata, generateRestaurantSchema } from "@/lib/seo"
import { ReviewsSection } from "@workspace/ui/components/reviews-section"
import Image from "next/image"
import { BlockRenderer } from "@/components/BlockRenderer"

interface RestaurantPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: RestaurantPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)
  if (!restaurant) return {}
  return generateHomeMetadata(restaurant.data, slug)
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)

  if (!restaurant) {
    notFound()
  }

  const { data, menu } = restaurant
  const categories = groupMenuByCategory(menu)
  const translations = getTranslations(data.app?.language)

  // -------------------------------------------------------------------------
  // V1 block-schema: render page sections dynamically
  // -------------------------------------------------------------------------
  const homePage = data.pages?.home
  if (homePage) {
    const visibleSections = homePage.sections
      .filter((s) => s.ui.visible !== false)
      .sort((a, b) => a.ui.order - b.ui.order)

    return (
      <div className="flex min-h-svh flex-col">
        <JsonLd data={generateRestaurantSchema(data, slug)} />
        <Navbar
          restaurant={{ ...data, name: data.name || slug }}
          translations={translations}
          defaultLanguage={data.app?.language}
        />
        <main className="flex-1">
          {visibleSections.map((section) => (
            <BlockRenderer
              key={section.id}
              section={section}
              data={data}
              translations={translations}
              restaurantSlug={slug}
            />
          ))}
        </main>
        <Footer
          restaurantName={data.name || slug}
          restaurantSlug={slug}
          translations={translations}
        />
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Legacy schema: keep existing hardwired layout (backward compat)
  // -------------------------------------------------------------------------
  return (
    <div className="flex min-h-svh flex-col">
      <JsonLd data={generateRestaurantSchema(data, slug)} />
      <Navbar
        restaurant={{ ...data, name: data.name || slug }}
        translations={translations}
        defaultLanguage={data.app?.language}
      />

      <main className="flex-1">
        {data.hero && <Hero slides={data.hero.slides} />}

        <div className="mx-auto max-w-7xl px-6 pb-12">
          {/* About Section */}
          <section id="about" className={cn("py-20", !data.hero && "pt-32")}>
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <div>
                <SectionHeader
                  subtitle={
                    (
                      translations as {
                        home?: { about?: { subtitle?: string } }
                      }
                    ).home?.about?.subtitle || "Our Story"
                  }
                  title={
                    data.about?.title ||
                    (translations as { home?: { about?: { title?: string } } })
                      .home?.about?.title ||
                    (translations as { aboutPage?: { title?: string } })
                      .aboutPage?.title ||
                    `About ${data.name}`
                  }
                  backgroundTitle={
                    (
                      translations as {
                        home?: { about?: { backgroundTitle?: string } }
                      }
                    ).home?.about?.backgroundTitle || "Heritage"
                  }
                />
                <p className="mb-10 text-xl leading-relaxed text-muted-foreground">
                  {data.about?.content || data.description}
                </p>
              </div>

              {data.about?.images ? (
                <ImageSlider images={data.about.images} />
              ) : (
                data.about?.image && (
                  <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl">
                    <Image
                      src={data.about.image}
                      alt={data.about.title || "About image"}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                )
              )}
            </div>
          </section>
        </div>

        {categories.length > 0 && (
          <section className="paper-noise border-t border-border/40 bg-accent/5 py-12">
            <FoodMenu
              categories={categories}
              menuLink={data.menuLink}
              translations={translations}
            />
          </section>
        )}

        <GallerySection
          images={
            data.images?.gallery?.map((img) => ({
              src: img.url,
              alt: img.alt,
            })) ||
            data.about?.images?.map((url) => ({ src: url, alt: data.name }))
          }
          translations={translations}
          restaurantName={data.name}
        />

        {data.reviews && (
          <ReviewsSection
            className="bg-background"
            reviews={
              Array.isArray(data.reviews)
                ? data.reviews
                : (
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
                  })) || []
            }
            googleMapsUrl={
              data.localSEO?.googleMapsUrl ||
              data.schema?.aggregateRating?.sourceUrl
            }
            translations={translations}
          />
        )}

        <ContactSection
          isHomePage={true}
          restaurantSlug={slug}
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
      </main>

      <Footer
        restaurantName={data.name || slug}
        restaurantSlug={slug}
        translations={translations}
      />
    </div>
  )
}
