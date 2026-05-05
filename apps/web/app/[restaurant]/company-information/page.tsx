import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { getTranslations } from "@/lib/i18n"
import { Navbar } from "@workspace/ui/components/navbar"
import { Footer } from "@/components/footer"
import { cn } from "@workspace/ui/lib/utils"
import { JsonLd } from "@/components/json-ld"
import { generateCompanyMetadata, generateOrganizationSchema } from "@/lib/seo"

interface CompanyInformationPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({ params }: CompanyInformationPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)
  if (!restaurant) return {}
  return generateCompanyMetadata(restaurant.data, slug)
}

export default async function CompanyInformationPage({ params }: CompanyInformationPageProps) {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)

  if (!restaurant || !restaurant.data.companyInfo) {
    notFound()
  }

  const { data } = restaurant
  const info = data.companyInfo
  const translations = getTranslations(data.app?.language)

  const details = [
    { label: translations.companyInformation.table.companyName, value: info?.name },
    { label: translations.companyInformation.table.corporateNumber, value: info?.registrationNumber },
    { label: translations.companyInformation.table.headquartersAddress, value: info?.address },
    { label: translations.companyInformation.table.phone, value: info?.phone },
    { label: translations.companyInformation.table.establishedDate, value: info?.establishedDate },
    { label: translations.companyInformation.table.capital, value: info?.capital },
    { label: translations.companyInformation.table.fiscalYearEnd, value: info?.fiscalYearEnd },
  ]

  return (
    <div className="flex flex-col min-h-svh">
      <JsonLd data={generateOrganizationSchema(data)} />
      <Navbar restaurant={{ ...data, name: data.name || slug }} translations={translations} />

      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h4 className="font-bold mb-4 text-primary uppercase tracking-widest text-xs">{translations.companyInformation.subtitle}</h4>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {translations.companyInformation.title}
            </h1>
            <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
          </div>

          <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
            <div className="divide-y">
              {details.map((detail, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-3 gap-4 p-6 md:p-8 hover:bg-accent/5 transition-colors",
                    index % 2 === 0 ? "bg-background" : "bg-muted/30"
                  )}
                >
                  <div className="font-semibold text-muted-foreground">
                    {detail.label}
                  </div>
                  <div className="md:col-span-2 text-foreground font-medium leading-relaxed">
                    {detail.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>{translations.companyInformation.inquiry.replace('{phone}', info?.phone || '')}</p>
          </div>
        </div>
      </main>

      <Footer restaurantName={data.name || slug} restaurantSlug={slug} translations={translations} />
    </div>
  )
}
