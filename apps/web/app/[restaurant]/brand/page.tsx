import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { getTranslations } from "@/lib/i18n"
import { Navbar } from "@workspace/ui/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@workspace/ui/components/button"
import { CreditCard } from "lucide-react"
import { DownloadPdfButton } from "@/components/download-pdf-button"
import { JsonLd } from "@/components/json-ld"
import { generateBrandMetadata, generateBrandSchema } from "@/lib/seo"

interface BrandPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)
  if (!restaurant) return {}
  return generateBrandMetadata(restaurant.data, slug)
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)

  if (!restaurant) {
    notFound()
  }

  const { data } = restaurant
  const translations = getTranslations(data.app?.language)

  return (
    <div className="flex min-h-svh flex-col bg-slate-50/50">
      <JsonLd data={generateBrandSchema(data, slug)} />
      <Navbar
        restaurant={{ ...data, name: data.name || slug }}
        translations={translations}
        defaultLanguage={data.app?.language}
      />

      <main className="flex-1 px-6 pt-32 pb-20">
        <div className="mx-auto max-w-5xl">
          <header className="mb-16 text-center">
            <h4 className="mb-4 text-xs font-bold tracking-widest text-primary uppercase">
              {translations.brandPage?.subtitle || "Brand Assets"}
            </h4>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
              {translations.brandPage?.title || "Marketing Materials"}
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {translations.brandPage?.description?.replace(
                "{restaurantName}",
                data.name
              ) ||
                `Download and print professional marketing assets for ${data.name}. All designs are pre-populated with your restaurant's information.`}
            </p>
          </header>

          <div className="space-y-24">
            {/* Visiting Card Section */}
            <section>
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold">
                    {translations.brandPage?.visitingCards || "Visiting Cards"}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                {/* Front Side */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full">
                    <p className="mb-2 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                      {translations.brandPage?.frontSide || "Front Side"}
                    </p>
                    <div
                      id="card-front"
                      className="relative flex items-center justify-center overflow-hidden border border-[#e2e8f0] bg-[#ffffff] p-8 shadow-xl"
                      style={{ width: "91mm", height: "55mm" }}
                    >
                      <div className="absolute top-0 left-0 h-full w-2 bg-[#f46d1b]" />
                      <div className="text-center">
                        <h3 className="mb-1 text-2xl font-bold text-[#0f172a]">
                          {data.name}
                        </h3>
                        <p className="mb-4 text-sm font-medium tracking-widest text-[#f46d1b] uppercase">
                          Restaurant & Dining
                        </p>
                        <div className="mx-auto h-1 w-12 bg-[#e2e8f0]" />
                      </div>
                    </div>
                  </div>
                  <DownloadPdfButton
                    elementId="card-front"
                    filename={`${slug}-business-card-front`}
                    widthMm={91}
                    heightMm={55}
                  />
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="w-full">
                    <p className="mb-2 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                      {translations.brandPage?.backSideDark ||
                        "Back Side - Dark"}
                    </p>
                    <div
                      id="card-back-dark"
                      className="relative flex flex-col justify-between overflow-hidden bg-[#0f172a] p-8 text-[#ffffff] shadow-xl"
                      style={{ width: "91mm", height: "55mm" }}
                    >
                      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-[#f46d1b] opacity-10 blur-3xl" />
                      <div>
                        <h3 className="mb-1 text-lg font-bold">{data.name}</h3>
                        <p className="text-xs text-[#94a3b8] italic">
                          {data.description?.substring(0, 60)}...
                        </p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2 text-[#cbd5e1]">
                          <span className="w-4 text-[#f46d1b]">📍</span>{" "}
                          {data.address}
                        </p>
                        <p className="flex items-center gap-2 text-[#cbd5e1]">
                          <span className="w-4 text-[#f46d1b]">📞</span>{" "}
                          {data.phone}
                        </p>
                        <p className="flex items-center gap-2 text-[#cbd5e1]">
                          <span className="w-4 text-[#f46d1b]">✉️</span>{" "}
                          {data.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DownloadPdfButton
                    elementId="card-back-dark"
                    filename={`${slug}-business-card-back-dark`}
                    widthMm={91}
                    heightMm={55}
                  />
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="w-full">
                    <p className="mb-2 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                      {translations.brandPage?.backSideLight ||
                        "Back Side - Light"}
                    </p>
                    <div
                      id="card-back-light"
                      className="relative flex flex-col justify-between overflow-hidden border border-[#e2e8f0] bg-[#ffffff] p-8 text-[#0f172a] shadow-xl"
                      style={{ width: "91mm", height: "55mm" }}
                    >
                      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-[#f46d1b] opacity-5 blur-3xl" />
                      <div>
                        <h3 className="mb-1 text-lg font-bold">{data.name}</h3>
                        <p className="text-xs text-[#64748b] italic">
                          {data.description?.substring(0, 60)}...
                        </p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2 text-[#334155]">
                          <span className="w-4 text-[#f46d1b]">📍</span>{" "}
                          {data.address}
                        </p>
                        <p className="flex items-center gap-2 text-[#334155]">
                          <span className="w-4 text-[#f46d1b]">📞</span>{" "}
                          {data.phone}
                        </p>
                        <p className="flex items-center gap-2 text-[#334155]">
                          <span className="w-4 text-[#f46d1b]">✉️</span>{" "}
                          {data.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DownloadPdfButton
                    elementId="card-back-light"
                    filename={`${slug}-business-card-back-light`}
                    widthMm={91}
                    heightMm={55}
                  />
                </div>
              </div>
            </section>

            {/* Flyer Section */}
            <section>
              <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
                <div
                  id="marketing-flyer"
                  className="flex flex-col overflow-hidden border border-[#e2e8f0] bg-[#ffffff] p-12 shadow-2xl"
                  style={{ width: "148mm", height: "210mm" }}
                >
                  {/* Flyer Header */}
                  <div className="mb-12 text-center">
                    <h1 className="mb-4 text-5xl font-black tracking-tighter text-[#0f172a] uppercase">
                      {data.name}
                    </h1>
                    <div className="mx-auto mb-6 h-1.5 w-24 bg-[#f46d1b]" />
                    <p className="text-2xl font-medium text-[#475569] italic">
                      Experience Fine Dining at its Best
                    </p>
                  </div>

                  {/* Flyer Content */}
                  <div className="flex flex-1 flex-col items-center justify-center space-y-8 text-center">
                    <div className="flex h-64 w-full items-center justify-center border-2 border-dashed border-[#cbd5e1] bg-[#f1f5f9]">
                      <p className="font-medium text-[#94a3b8]">
                        Place your best dish image here
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold text-[#1e293b] underline decoration-[#f46d1b] decoration-4 underline-offset-8">
                        {translations.brandPage?.flyerHeading ||
                          "Visit Us Today!"}
                      </h2>
                      <p className="max-w-md text-lg text-[#475569]">
                        {translations.brandPage?.flyerDescription?.replace(
                          "{restaurantName}",
                          data.name
                        ) ||
                          `Discover the flavors of ${data.name}. We serve authentic dishes prepared with fresh, local ingredients.`}
                      </p>
                    </div>
                  </div>

                  {/* Flyer Footer */}
                  <div className="mt-12 grid grid-cols-2 gap-4 border-t border-[#f1f5f9] pt-8 text-sm">
                    <div className="space-y-1">
                      <p className="font-bold tracking-tighter text-[#0f172a] uppercase">
                        {translations.brandPage?.flyerLocation || "Location"}
                      </p>
                      <p className="text-[#475569]">{data.address}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="font-bold tracking-tighter text-[#0f172a] uppercase">
                        {translations.brandPage?.flyerContact || "Contact"}
                      </p>
                      <p className="text-[#475569]">{data.phone}</p>
                      <p className="text-[#475569]">{data.email}</p>
                    </div>
                  </div>
                </div>

                <DownloadPdfButton
                  elementId="marketing-flyer"
                  filename={`${slug}-flyer-a5`}
                  widthMm={148}
                  heightMm={210}
                />
              </div>
            </section>
          </div>

          <div className="mt-20 border border-primary/10 bg-primary/5 p-8 text-center">
            <h3 className="mb-2 text-xl font-bold">
              {translations.brandPage?.ctaTitle || "Need Custom Designs?"}
            </h3>
            <p className="mb-6 text-muted-foreground">
              {translations.brandPage?.ctaDescription ||
                "Contact our support team for personalized marketing materials and branding consultations."}
            </p>
            <Button asChild>
              <a href={`/${slug}/contact`}>
                {translations.brandPage?.contactButton || "Contact Us"}
              </a>
            </Button>
          </div>
        </div>
      </main>

      <Footer
        restaurantName={data.name || slug}
        restaurantSlug={slug}
        translations={translations}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          nav, footer, .no-print, button {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .max-w-5xl {
            max-width: none !important;
          }
          section {
            page-break-after: always;
          }
        }
      `,
        }}
      />
    </div>
  )
}
