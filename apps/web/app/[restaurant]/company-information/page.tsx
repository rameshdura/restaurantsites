import { Metadata } from "next"
import { getRestaurant, getImageSrc } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { getTranslations } from "@/lib/i18n"
import { Navbar } from "@workspace/ui/components/navbar"
import { Footer } from "@/components/footer"
import { ContactSection } from "@workspace/ui/components/contact-section"
import { cn } from "@workspace/ui/lib/utils"
import { JsonLd } from "@/components/json-ld"
import { generateCompanyMetadata, generateOrganizationSchema } from "@/lib/seo"
import { CoverSection } from "@workspace/ui/components/cover-section"

interface CompanyInformationPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: CompanyInformationPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}
  return generateCompanyMetadata(restaurant.data, slug)
}

export default async function CompanyInformationPage({
  params,
}: CompanyInformationPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant || !restaurant.data.companyInfo) {
    notFound()
  }

  const { data } = restaurant
  const info = data.companyInfo
  const translations = getTranslations(data.app?.language)

  const coverImage = getImageSrc(
    slug,
    data.pages?.company?.coverImage || data.hero?.slides?.[0]?.image
  )

  const details = [
    {
      label: translations.companyInformation.table.companyName,
      value: info?.name,
    },
    {
      label: translations.companyInformation.table.corporateNumber,
      value: info?.registrationNumber,
    },
    {
      label: translations.companyInformation.table.headquartersAddress,
      value: info?.address,
    },
    { label: translations.companyInformation.table.phone, value: info?.phone },
    {
      label: translations.companyInformation.table.establishedDate,
      value: info?.establishedDate,
    },
    {
      label: translations.companyInformation.table.capital,
      value: info?.capital,
    },
    {
      label: translations.companyInformation.table.fiscalYearEnd,
      value: info?.fiscalYearEnd,
    },
  ]

  return (
    <div className="flex min-h-svh flex-col">
      <JsonLd data={generateOrganizationSchema(data)} />
      <Navbar
        restaurant={{ ...data, name: data.name || slug }}
        translations={translations}
        defaultLanguage={data.app?.language}
      />

      {coverImage && (
        <CoverSection
          image={coverImage}
          title={translations.companyInformation.title}
          subtitle={translations.companyInformation.subtitle}
        />
      )}

      <main className={cn("flex-1", !coverImage ? "pt-32" : "pt-16", "pb-20")}>
        <div className="mx-auto max-w-4xl px-6">
          <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
            <div className="divide-y">
              {details.map((detail, index) => (
                <div
                  key={index}
                  className={cn(
                    "grid grid-cols-1 gap-4 p-6 transition-colors hover:bg-accent/5 md:grid-cols-3 md:p-8",
                    index % 2 === 0 ? "bg-background" : "bg-muted/30"
                  )}
                >
                  <div className="font-semibold text-muted-foreground">
                    {detail.label}
                  </div>
                  <div className="leading-relaxed font-medium text-foreground md:col-span-2">
                    {detail.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>
              {translations.companyInformation.inquiry.replace(
                "{phone}",
                info?.phone || ""
              )}
            </p>
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
