import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { getTranslations } from "@/lib/i18n"
import { Navbar } from "@workspace/ui/components/navbar"
import { Footer } from "@/components/footer"
import { JsonLd } from "@/components/json-ld"
import { generateHomeMetadata, generateRestaurantSchema } from "@/lib/seo"
import { BlockRenderer } from "@/components/BlockRenderer"
import { FloatingActions } from "@/components/floating-actions"

interface RestaurantPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: RestaurantPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}
  return generateHomeMetadata(restaurant.data, slug)
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  // Server-side link helper
  const getLink = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`
    if (normalizedPath === "/") return `/${slug}`
    return `/${slug}${normalizedPath}`
  }

  const { data } = restaurant
  const translations = getTranslations(data.app?.language)
  const onlineBookingUrl =
    data.reservation?.onlineBookingUrl ||
    data.operations?.services?.onlineBookingUrl

  const homePage = data.pages?.home
  if (!homePage) {
    notFound()
  }

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
            getLink={getLink}
          />
        ))}
      </main>
      <FloatingActions
        onlineBookingUrl={onlineBookingUrl}
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
