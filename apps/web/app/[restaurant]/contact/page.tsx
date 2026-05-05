import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { getTranslations } from "@/lib/i18n"
import { Navbar } from "@workspace/ui/components/navbar"
import { ContactSection } from "@workspace/ui/components/contact-section"
import { Footer } from "@/components/footer"
import { JsonLd } from "@/components/json-ld"
import { generateContactMetadata, generateContactSchema, generateRestaurantSchema } from "@/lib/seo"

interface ContactPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)
  if (!restaurant) return {}
  return generateContactMetadata(restaurant.data, slug)
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)

  if (!restaurant) {
    notFound()
  }

  const { data } = restaurant
  const t = getTranslations(data.app?.language)

  return (
    <div className="flex flex-col min-h-svh">
      <JsonLd data={[
        generateRestaurantSchema(data, slug),
        ...generateContactSchema(data)
      ]} />
      <Navbar restaurant={{ ...data, name: data.name || slug }} translations={t} />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">{t.contact?.title || "Contact Us"}</h1>
          <p className="text-xl text-muted-foreground">
            {t.contact?.pageSubtitle || "We'd love to hear from you. Get in touch with us today."}
          </p>
        </div>
        
        <ContactSection 
          hideHeader={true} 
          address={data.address}
          phone={data.phone}
          email={data.email}
          location={data.location}
          embedUrl={data.location?.embedUrl ?? null}
          restaurantName={data.name}
          restaurantSlug={slug}
          translations={t}
        />
      </main>

      <Footer restaurantName={data.name || slug} restaurantSlug={slug} translations={t} />
    </div>
  )
}
