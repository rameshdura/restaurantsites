import { Metadata } from "next"
import { getRestaurant, getImageSrc } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { getTranslations } from "@/lib/i18n"
import { Navbar } from "@workspace/ui/components/navbar"
import { ContactSection } from "@workspace/ui/components/contact-section"
import { Footer } from "@/components/footer"
import { SectionHeader } from "@workspace/ui/components/section-header"
import { CoverSection } from "@workspace/ui/components/cover-section"
import Image from "next/image"
import { Location01Icon, Call02Icon, GlobalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@workspace/ui/lib/utils"

export const revalidate = 60

interface StoresPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: StoresPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant || !restaurant.data.showStores) return {}

  return {
    title: `Our Stores | ${restaurant.data.name}`,
    description: `Find ${restaurant.data.name} locations near you.`,
  }
}

export default async function StoresPage({ params }: StoresPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant || !restaurant.data.showStores || !restaurant.data.stores) {
    notFound()
  }

  const { data } = restaurant
  const translations = getTranslations(data.app?.language)
  const stores = data.stores || []

  const coverImage = getImageSrc(
    slug,
    data.pages?.about?.coverImage || data.hero?.slides?.[0]?.image
  )

  const restaurantName = data.name || slug
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = (translations as any)?.common?.stores || {}
  const title = t.title || "Our Stores"

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar
        restaurant={{ ...data, name: restaurantName }}
        translations={translations}
        defaultLanguage={data.app?.language}
      />
      {coverImage && (
        <CoverSection
          image={coverImage}
          title={title}
          subtitle={t.subtitle || "Find a location near you"}
        />
      )}
      <main className={cn("flex-1 pb-24", !coverImage ? "pt-24" : "pt-8")}>
        <div className="container mx-auto px-4 md:px-8">
          {!coverImage && (
            <SectionHeader 
              title={title} 
              subtitle={t.subtitle || "Find a location near you"} 
              align="center" 
            />
          )}

          <div className={cn("flex flex-col gap-8", !coverImage ? "mt-16" : "")}>
            {stores.map((store) => (
              <div 
                key={store.id} 
                className="flex flex-col md:flex-row overflow-hidden rounded-2xl border bg-background shadow-sm"
              >
                <div className="relative h-64 md:h-auto md:w-1/3 bg-muted shrink-0">
                  <Image
                    src={store.image}
                    alt={store.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col p-6 md:p-8 justify-center flex-1">
                  <h2 className="text-2xl font-bold tracking-tight mb-4">
                    {store.name}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <div className="flex items-start">
                      <HugeiconsIcon icon={Location01Icon} className="mr-3 h-5 w-5 shrink-0 text-primary mt-0.5" />
                      <div>
                        <span className="block font-medium text-foreground">{store.shortLocation}</span>
                        <span>{store.address}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <HugeiconsIcon icon={Call02Icon} className="mr-3 h-5 w-5 shrink-0 text-primary" />
                      <a href={`tel:${store.phone}`} className="hover:text-primary transition-colors">
                        {store.phone}
                      </a>
                    </div>

                    {store.website && (
                      <div className="flex items-center">
                        <HugeiconsIcon icon={GlobalIcon} className="mr-3 h-5 w-5 shrink-0 text-primary" />
                        <a 
                          href={store.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-primary transition-colors underline underline-offset-4"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
        paymentMethods={data.operations?.paymentMethods}
        deliveryPlatforms={data.operations?.services?.deliveryPlatforms}
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
