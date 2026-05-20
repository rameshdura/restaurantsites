import Image from "next/image"
import { Metadata } from "next"
import { getRestaurant, getImageSrc } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { getTranslations } from "@/lib/i18n"
import { Navbar } from "@workspace/ui/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@workspace/ui/components/button"
import { TeamSection } from "@workspace/ui/components/team-section"
import { ContactSection } from "@workspace/ui/components/contact-section"
import { JsonLd } from "@/components/json-ld"
import { generateAboutMetadata, generateAboutPageSchema } from "@/lib/seo"
import { CoverSection } from "@workspace/ui/components/cover-section"
import { cn } from "@workspace/ui/lib/utils"
import { ImageSlider } from "@workspace/ui/components/image-slider"

interface AboutPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}
  return generateAboutMetadata(restaurant.data, slug)
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const { data } = restaurant
  const translations = getTranslations(data.app?.language)

  // Get data for the story section, preferring home-page about data
  const storyData =
    data.pages?.home?.sections?.find((s: { id: string }) => s.id === "about")
      ?.data || data.about

  const coverImage = getImageSrc(
    slug,
    data.pages?.about?.coverImage || data.hero?.slides?.[0]?.image
  )
  const aboutImage = getImageSrc(slug, storyData?.image as string | undefined)
  const aboutImages = data.images?.gallery?.map((im: { url: string }) =>
    getImageSrc(slug, im.url)
  )

  return (
    <div className="flex min-h-svh flex-col">
      <JsonLd data={generateAboutPageSchema(data, slug)} />
      <Navbar
        restaurant={{ ...data, name: data.name || slug }}
        translations={translations}
        defaultLanguage={data.app?.language}
      />

      {coverImage && (
        <CoverSection
          image={coverImage}
          title={
            (translations as { home?: { about?: { title?: string } } }).home
              ?.about?.title || "Our Story"
          }
          subtitle={
            (translations as { home?: { about?: { subtitle?: string } } }).home
              ?.about?.subtitle || "Our Story"
          }
        />
      )}

      <main className={cn("flex-1", !coverImage ? "pt-32" : "pt-8", "pb-20")}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              {!coverImage && (
                <h4 className="mb-4 text-xs font-bold tracking-widest text-primary uppercase">
                  {(
                    translations as { home?: { about?: { subtitle?: string } } }
                  ).home?.about?.subtitle || "Our Story"}
                </h4>
              )}
              {!coverImage && (
                <h1 className="mb-8 text-4xl font-bold tracking-tight md:text-6xl">
                  {(translations as { home?: { about?: { title?: string } } })
                    .home?.about?.title || "Our Story"}
                </h1>
              )}
              <div className="space-y-6">
                <p className="text-xl leading-relaxed text-muted-foreground">
                  {typeof storyData?.content === "string"
                    ? storyData.content
                    : data.description}
                </p>
                {(storyData?.additionalContent as string[])?.map(
                  (paragraph: string, index: number) => (
                    <p
                      key={index}
                      className="text-lg leading-relaxed text-muted-foreground/80"
                    >
                      {paragraph}
                    </p>
                  )
                )}
                <div className="pt-4">
                  <Button asChild variant="outline" className="rounded-full">
                    <a href={`/${slug}/company-information`}>About Company</a>
                  </Button>
                </div>
              </div>
            </div>
            {aboutImages ? (
              <ImageSlider
                images={aboutImages}
                aspectRatio="aspect-square lg:aspect-4/5"
              />
            ) : (
              aboutImage && (
                <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl lg:aspect-4/5">
                  <Image
                    src={aboutImage}
                    alt={
                      typeof storyData?.title === "string"
                        ? storyData.title
                        : "About image"
                    }
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              )
            )}
          </div>

          {/* Mission/Vision or additional sections could go here */}
          <div className="mt-24 grid grid-cols-1 gap-12 border-t border-border/40 pt-24 md:grid-cols-3">
            <div>
              <h3 className="mb-4 text-2xl font-bold">
                {translations.common?.aboutPhilosophy?.title ||
                  "Our Philosophy"}
              </h3>
              <p className="text-muted-foreground">
                {translations.common?.aboutPhilosophy?.description ||
                  "We believe in sourcing the freshest local ingredients to create authentic, memorable dining experiences for every guest."}
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-2xl font-bold">
                {translations.common?.culinaryExcellence?.title ||
                  "Culinary Excellence"}
              </h3>
              <p className="text-muted-foreground">
                {translations.common?.culinaryExcellence?.description ||
                  "Our chefs bring years of tradition and innovation to the kitchen, ensuring every dish is a masterpiece of flavor and presentation."}
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-2xl font-bold">
                {translations.common?.communityFocused?.title ||
                  "Community Focused"}
              </h3>
              <p className="text-muted-foreground">
                {translations.common?.communityFocused?.description ||
                  "More than just a restaurant, we are a gathering place for friends and family, dedicated to enriching our local neighborhood."}
              </p>
            </div>
          </div>

          {console.log("About data:", data.about)}
          {(data.about as any)?.representative && (
            <section className="mt-24 rounded-3xl bg-accent/30 p-12 lg:p-20">
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                {getImageSrc(
                  slug,
                  (data.about as any).representative.image
                ) && (
                  <div className="relative aspect-square overflow-hidden rounded-3xl">
                    <Image
                      src={getImageSrc(
                        slug,
                        (data.about as any).representative.image
                      )}
                      alt={(data.about as any).representative.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="space-y-6">
                  <blockquote className="text-2xl font-medium text-primary italic md:text-3xl">
                    &ldquo;{(data.about as any).representative.message}&rdquo;
                  </blockquote>
                  <div>
                    <h4 className="text-xl font-bold">
                      {(data.about as any).representative.name}
                    </h4>
                    <p className="text-muted-foreground">
                      {(data.about as any).representative.position}
                    </p>
                  </div>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {(data.about as any).representative.story}
                  </p>
                </div>
              </div>
            </section>
          )}

          {data.team && (
            <TeamSection team={data.team} translations={translations} />
          )}
        </div>
      </main>

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

      <Footer
        restaurantName={data.name || slug}
        restaurantSlug={slug}
        translations={translations}
      />
    </div>
  )
}
