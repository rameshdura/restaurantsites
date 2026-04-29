import Image from "next/image"
import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { Navbar } from "@workspace/ui/components/navbar"
import { Footer } from "@/components/footer"
import { TeamSection } from "@workspace/ui/components/team-section"
import { JsonLd } from "@/components/json-ld"
import { generateAboutMetadata, generateAboutPageSchema } from "@/lib/seo"


interface AboutPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
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

  return (
    <div className="flex flex-col min-h-svh">
      <JsonLd data={generateAboutPageSchema(data, slug)} />
      <Navbar restaurant={{ ...data, name: data.name || slug }} />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h4 className="font-bold mb-4 text-primary uppercase tracking-widest text-xs">Our Story</h4>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
                {data.about?.title || `About ${data.name}`}
              </h1>
              <div className="space-y-6">
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {data.about?.content || data.description}
                </p>
                {data.about?.additionalContent?.map((paragraph: string, index: number) => (
                  <p key={index} className="text-lg text-muted-foreground/80 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            
             {data.about?.image && (
               <div className="relative aspect-square lg:aspect-4/5 rounded-3xl overflow-hidden shadow-2xl">
                <Image 
                  src={data.about.image} 
                  alt={data.about.title || "About image"} 
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            )}
          </div>
          
          {/* Mission/Vision or additional sections could go here */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 border-t pt-24 border-border/40">
            <div>
              <h3 className="text-2xl font-bold mb-4">Our Philosophy</h3>
              <p className="text-muted-foreground">
                We believe in sourcing the freshest local ingredients to create authentic, 
                memorable dining experiences for every guest.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Culinary Excellence</h3>
              <p className="text-muted-foreground">
                Our chefs bring years of tradition and innovation to the kitchen, 
                ensuring every dish is a masterpiece of flavor and presentation.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Community Focused</h3>
              <p className="text-muted-foreground">
                More than just a restaurant, we are a gathering place for friends and family, 
                dedicated to enriching our local neighborhood.
              </p>
            </div>
          </div>

          {data.about?.team && <TeamSection team={data.about.team} />}
        </div>
      </main>

      <Footer restaurantName={data.name || slug} restaurantSlug={slug} />

    </div>
  )
}
