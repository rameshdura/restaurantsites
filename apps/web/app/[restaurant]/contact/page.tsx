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

  // Lightweight: directly convert Google Maps URL to embed URL
  // Avoids heavy dynamic import of google-maps-embed-scraper package
  let embedUrl: string | null = null
  if (data.location?.mapsUrl) {
    try {
      const mapsUrl = data.location.mapsUrl
      // Handle Google Maps URLs (including short goo.gl links)
      if (mapsUrl.includes("goo.gl") || mapsUrl.includes("google.com/maps")) {
        let embedUrlStr = mapsUrl

        if (mapsUrl.includes("/place/")) {
          embedUrlStr = mapsUrl.replace("/place/", "/embed/").replace(/\/data=!.*$/, "")
        } else if (mapsUrl.includes("@")) {
          const match = mapsUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),(\d+[a-z]?)/)
          if (match && match[3]) {
            const zoom = match[3]
            const cleanZoom = zoom.replace(/[a-z]/, "")
            embedUrlStr = `https://www.google.com/maps/embed/v1/place?q=${match[1]},${match[2]}&zoom=${cleanZoom}`
          }
        }

        if (embedUrlStr === mapsUrl || !embedUrlStr.includes("embed")) {
          // For short goo.gl / maps.app.goo.gl links, build embed URL from lat/lng
          if ((mapsUrl.includes("goo.gl") || mapsUrl.includes("maps.app.goo.gl")) && data.location?.lat && data.location?.lng) {
            embedUrlStr = `https://www.google.com/maps/embed/v1/place?key=&q=${data.location.lat},${data.location.lng}&zoom=17`
          } else {
            embedUrlStr = mapsUrl.includes("?") ? mapsUrl + "&output=embed" : mapsUrl + "?output=embed"
          }
        }

        embedUrl = embedUrlStr
      }
    } catch (error) {
      console.error("Failed to generate map embed URL:", error)
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
