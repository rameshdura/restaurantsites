import { Metadata } from "next"
import { getRestaurant, getImageSrc } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { getTranslations } from "@/lib/i18n"
import { Navbar } from "@workspace/ui/components/navbar"
import { ContactSection } from "@workspace/ui/components/contact-section"
import { Footer } from "@/components/footer"
import { JsonLd } from "@/components/json-ld"
import {
  generateContactMetadata,
  generateContactSchema,
  generateRestaurantSchema,
} from "@/lib/seo"
import { CoverSection } from "@workspace/ui/components/cover-section"
import { cn } from "@workspace/ui/lib/utils"

interface ContactPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}
  return generateContactMetadata(restaurant.data, slug)
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const { data } = restaurant
  const t = getTranslations(data.app?.language)

  // Get cover image from page data, fallback to first hero slide image
  const coverImage = getImageSrc(
    slug,
    data.pages?.contact?.coverImage || data.hero?.slides?.[0]?.image
  )

  return (
    <div className="flex min-h-svh flex-col">
      <JsonLd
        data={[
          generateRestaurantSchema(data, slug),
          ...generateContactSchema(data),
        ]}
      />
      <Navbar
        restaurant={{ ...data, name: data.name || slug }}
        translations={t}
        defaultLanguage={data.app?.language}
      />

      {coverImage && (
        <CoverSection
          image={coverImage}
          title={t.contact?.title || "Contact Us"}
          subtitle={t.contact?.pageSubtitle || "Get in Touch"}
        />
      )}

      <main className={cn("flex-1", !coverImage ? "pt-32" : "pt-0")}>
        {!coverImage && (
          <div className="mx-auto mb-12 max-w-7xl px-6">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
              {t.contact?.title || "Contact Us"}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t.contact?.pageSubtitle ||
                "We'd love to hear from you. Get in touch with us today."}
            </p>
          </div>
        )}

        <ContactSection
          hideHeader={true}
          address={data.address}
          phone={data.phone}
          email={data.email}
          location={data.location}
          embedUrl={data.location?.embedUrl ?? null}
          restaurantName={data.name}
          restaurantSlug={slug}
          paymentMethods={data.operations?.paymentMethods}
          deliveryPlatforms={data.operations?.services?.deliveryPlatforms}
          translations={t}
        />
      </main>

      <Footer
        restaurantName={data.name || slug}
        restaurantSlug={slug}
        translations={t}
      />
    </div>
  )
}
