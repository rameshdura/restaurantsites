import { Metadata } from "next"
import { getRestaurant, groupMenuByCategory, getImageSrc } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { getTranslations } from "@/lib/i18n"
import { Navbar } from "@workspace/ui/components/navbar"
import { FoodMenu } from "@/components/food-menu/food-menu"
import { Footer } from "@/components/footer"
import { ContactSection } from "@workspace/ui/components/contact-section"
import { FloatingActions } from "@/components/floating-actions"
import { Button } from "@workspace/ui/components/button"
import { Download } from "lucide-react"
import { JsonLd } from "@/components/json-ld"
import { generateMenuMetadata, generateMenuSchema } from "@/lib/seo"
import { CoverSection } from "@workspace/ui/components/cover-section"
import { cn } from "@workspace/ui/lib/utils"

interface MenuPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: MenuPageProps): Promise<Metadata> {
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
  const translations = getTranslations(data.app?.language)
  const onlineBookingUrl =
    data.reservation?.onlineBookingUrl ||
    data.operations?.services?.onlineBookingUrl

  // Get cover image from page data, fallback to first hero slide image
  const coverImage = getImageSrc(slug, data.pages?.menu?.coverImage || data.hero?.slides?.[0]?.image)

  return (
    <div className="flex min-h-svh flex-col">
      <JsonLd data={generateMenuSchema(data, slug)} />
      <Navbar
        restaurant={{ ...data, name: data.name || slug }}
        translations={translations}
        defaultLanguage={data.app?.language}
      />

      {coverImage && (
        <CoverSection
          image={coverImage}
          title={translations.menuPage?.title || "Our Menu"}
          subtitle={translations.menuPage?.subtitle || "Exquisite Selection"}
        />
      )}

      <main className={cn("flex-1", !coverImage ? "pt-32" : "pt-0", "pb-20")}>
        {!coverImage && (
          <div className="mx-auto mb-12 max-w-7xl px-6 text-center">
            <h4 className="mb-4 text-xs font-bold tracking-widest text-primary uppercase">
              {translations.menuPage?.subtitle || "Exquisite Selection"}
            </h4>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
              {translations.menuPage?.title || "Our Menu"}
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {translations.menuPage?.description ||
                "Discover our curated selection of dishes, prepared with the finest ingredients and culinary passion."}
            </p>
            {data.menuLink && (
              <div className="mt-8 flex justify-center">
                <Button size="lg" asChild className="rounded-full px-8">
                  <a
                    href={data.menuLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    {translations.menuPage?.downloadButton ||
                      "Download Menu PDF"}
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}

        <section
          className={cn(
            "border-y border-border/40 bg-accent/5",
            coverImage ? "pt-4 pb-12" : "py-12"
          )}
        >
          {categories.length > 0 ? (
            <FoodMenu
              categories={categories}
              hideHeader={true}
              translations={translations}
            />
          ) : (
            <div className="mx-auto max-w-7xl px-6">
              <div className="rounded-3xl border-2 border-dashed bg-background p-20 text-center">
                <p className="text-xl text-muted-foreground">
                  Our menu is currently being reimagined. Please check back
                  soon!
                </p>
              </div>
            </div>
          )}
        </section>
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
        translations={translations}
      />

      <FloatingActions
        restaurantSlug={slug}
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
