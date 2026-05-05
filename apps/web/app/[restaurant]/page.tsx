import Image from "next/image"
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


interface RestaurantPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({ params }: RestaurantPageProps): Promise<Metadata> {
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

  // Group menu items by category
  const categories = groupMenuByCategory(menu)
  const translations = getTranslations(data.app?.language)

  return (
    <div className="flex flex-col min-h-svh">
      <JsonLd data={generateRestaurantSchema(data, slug)} />
      <Navbar restaurant={{ ...data, name: data.name || slug }} translations={translations} />

      <main className="flex-1">
        {data.hero && <Hero slides={data.hero.slides} />}

        <div className="pb-12 px-6 max-w-7xl mx-auto">
          {/* About Section */}
          <section id="about" className={cn("py-20", !data.hero && "pt-32")}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div>
                  <SectionHeader
                    subtitle={translations.home?.about?.subtitle || "Our Story"}
                    title={data.about?.title || translations.home?.about?.title || translations.aboutPage?.title || `About ${data.name}`}
                    backgroundTitle={translations.home?.about?.backgroundTitle || "Heritage"}
                  />
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                  {data.about?.content || data.description}
                </p>
                

              </div>
              
              {data.about?.images ? (
                <ImageSlider images={data.about.images} />
              ) : data.about?.image && (
                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  <Image 
                    src={data.about.image} 
                    alt={data.about.title || "About image"} 
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              )}
            </div>
          </section>
        </div>

         {categories.length > 0 && (
           <section className="bg-accent/5 py-12 border-t border-border/40 paper-noise">
             <FoodMenu categories={categories} menuLink={data.menuLink} translations={translations} />
           </section>
         )}
        
        <GallerySection 
          images={
            data.images?.gallery?.map(img => ({ src: img.url, alt: img.alt })) || 
            data.about?.images?.map(url => ({ src: url, alt: data.name }))
          } 
          translations={translations}
          restaurantName={data.name}
        />
        
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

      <Footer restaurantName={data.name || slug} restaurantSlug={slug} translations={translations} />

    </div>
  )
}
