import { Metadata } from "next"
import { getRestaurant, groupMenuByCategory } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { Navbar } from "@workspace/ui/components/navbar"
import { FoodMenu } from "@/components/food-menu/food-menu"
import { Footer } from "@/components/footer"
import { Button } from "@workspace/ui/components/button"
import { Download } from "lucide-react"
import { JsonLd } from "@/components/json-ld"
import { generateMenuMetadata, generateMenuSchema } from "@/lib/seo"


interface MenuPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)
  if (!restaurant) return {}
  return generateMenuMetadata(restaurant.data, slug)
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)

  if (!restaurant) {
    notFound()
  }

  const { data, menu } = restaurant
  const categories = groupMenuByCategory(menu)

  return (
    <div className="flex flex-col min-h-svh">
      <JsonLd data={generateMenuSchema(data, slug)} />
      <Navbar restaurant={{ ...data, name: data.name || slug }} />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <h4 className="font-bold mb-4 text-primary uppercase tracking-widest text-xs">Exquisite Selection</h4>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Our Menu</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our curated selection of dishes, prepared with the finest ingredients and culinary passion.
          </p>
          {data.menuLink && (
            <div className="mt-8 flex justify-center">
              <Button size="lg" asChild className="rounded-full px-8">
                <a href={data.menuLink} target="_blank" rel="noopener noreferrer">
                  <Download className="w-5 h-5 mr-2" />
                  Download Menu PDF
                </a>
              </Button>
            </div>
          )}
        </div>
        
        <section className="bg-accent/5 py-12 border-y border-border/40">
          {categories.length > 0 ? (
            <FoodMenu categories={categories} hideHeader={true} />
          ) : (
            <div className="max-w-7xl mx-auto px-6">
              <div className="p-20 text-center border-2 border-dashed rounded-3xl bg-background">
                <p className="text-xl text-muted-foreground">
                  Our menu is currently being reimagined. Please check back soon!
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer restaurantName={data.name || slug} restaurantSlug={slug} />

    </div>
  )
}
