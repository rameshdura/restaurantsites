import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
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

  let embedUrl: string | null = null;
  if (data.location?.mapsUrl) {
    try {
      const scraperModule = await import('google-maps-embed-scraper');
      const getEmbedUrl = scraperModule.getEmbedUrl || scraperModule.default?.getEmbedUrl;
      
      if (typeof getEmbedUrl === 'function') {
        const result = await getEmbedUrl(data.location.mapsUrl);
        // Ensure result is a string or an object with the embed property
        if (typeof result === 'string') {
          embedUrl = result;
        } else if (result && typeof result === 'object') {
          embedUrl = (result as unknown as { embed?: string; url?: string }).embed || (result as unknown as { embed?: string; url?: string }).url || null;
        }
      }
    } catch (error) {
      console.error("Failed to scrape map URL:", error);
    }
  }

  return (
    <div className="flex flex-col min-h-svh">
      <JsonLd data={[
        generateRestaurantSchema(data, slug),
        ...generateContactSchema(data)
      ]} />
      <Navbar restaurant={{ ...data, name: data.name || slug }} />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            We&apos;d love to hear from you. Get in touch with {data.name} today.
          </p>
        </div>
        
        <ContactSection 
          hideHeader={true} 
          address={data.address}
          phone={data.phone}
          email={data.email}
          location={data.location}
          embedUrl={embedUrl}
          restaurantName={data.name}
          restaurantSlug={slug}
        />
      </main>

      <Footer restaurantName={data.name || slug} restaurantSlug={slug} />

    </div>
  )
}
