import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { getTranslations } from "@/lib/i18n"
import { Navbar } from "@workspace/ui/components/navbar"
import { Footer } from "@/components/footer"
import { ContactSection } from "@workspace/ui/components/contact-section"
import { FloatingActions } from "@/components/floating-actions"
import { cn } from "@workspace/ui/lib/utils"
import { JsonLd } from "@/components/json-ld"
import { generateCompanyMetadata, generateOrganizationSchema } from "@/lib/seo"

interface CompanyInformationPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: CompanyInformationPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)
  if (!restaurant) return {}
  return generateCompanyMetadata(restaurant.data, slug)
}

export default async function CompanyInformationPage({
  params,
}: CompanyInformationPageProps) {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)

  if (!restaurant || !restaurant.data.companyInfo) {
    notFound()
  }

  const { data } = restaurant
  const info = data.companyInfo
  const translations = getTranslations(data.app?.language)
  const onlineBookingUrl =
    data.reservation?.onlineBookingUrl ||
    data.operations?.services?.onlineBookingUrl

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

      <main className="flex-1 px-6 pt-32 pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h4 className="mb-4 text-xs font-bold tracking-widest text-primary uppercase">
              {translations.companyInformation.subtitle}
            </h4>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              {translations.companyInformation.title}
            </h1>
            <div className="mx-auto h-1.5 w-20 rounded-full bg-primary" />
          </div>

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