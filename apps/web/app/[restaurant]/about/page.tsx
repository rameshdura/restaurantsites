import Image from "next/image"
import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { getTranslations } from "@/lib/i18n"
import { Navbar } from "@workspace/ui/components/navbar"
import { Footer } from "@/components/footer"
import { TeamSection } from "@workspace/ui/components/team-section"
import { JsonLd } from "@/components/json-ld"
import { generateAboutMetadata, generateAboutPageSchema } from "@/lib/seo"

interface AboutPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)
  if (!restaurant) return {}
  return generateAboutMetadata(restaurant.data, slug)
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)

  if (!restaurant) {
    notFound()
  }

  const { data } = restaurant
  const translations = getTranslations(data.app?.language)

  return (
    <div className="flex min-h-svh flex-col">
      <JsonLd data={generateAboutPageSchema(data, slug)} />
      <Navbar
        restaurant={{ ...data, name: data.name || slug }}
        translations={translations}
        defaultLanguage={data.app?.language}
      />

      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <h4 className="mb-4 text-xs font-bold tracking-widest text-primary uppercase">
                {translations.aboutPage?.subtitle || "Our Story"}
              </h4>
              <h1 className="mb-8 text-4xl font-bold tracking-tight md:text-6xl">
                {data.about?.title ||
                  translations.aboutPage?.title ||
                  `About ${data.name}`}
              </h1>
              <div className="space-y-6">
                <p className="text-xl leading-relaxed text-muted-foreground">
                  {data.about?.content || data.description}
                </p>
                {data.about?.additionalContent?.map(
                  (paragraph: string, index: number) => (
                    <p
                      key={index}
                      className="text-lg leading-relaxed text-muted-foreground/80"
                    >
                      {paragraph}
                    </p>
                  )
                )}
              </div>
            </div>

            {data.about?.image && (
              <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl lg:aspect-4/5">
                <Image
                  src={data.about.image}
                  alt={data.about.title || "About image"}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
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

          {data.about?.team && (
            <TeamSection team={data.about.team} translations={translations} />
          )}
        </div>
      </main>

      <Footer
        restaurantName={data.name || slug}
        restaurantSlug={slug}
        translations={translations}
      />
    </div>
  )
}
