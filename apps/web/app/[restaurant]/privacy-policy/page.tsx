import { Metadata } from "next"
import { getRestaurant, getImageSrc } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { getTranslations } from "@/lib/i18n"
import { Navbar } from "@workspace/ui/components/navbar"
import { Footer } from "@/components/footer"
import { ContactSection } from "@workspace/ui/components/contact-section"
import { cn } from "@workspace/ui/lib/utils"
import { CoverSection } from "@workspace/ui/components/cover-section"
import { Shield, Eye, Lock, RefreshCw, FileText } from "lucide-react"

interface PrivacyPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}

  const title = `Privacy Policy | ${restaurant.data.name || slug}`
  const description = `Privacy Policy for ${restaurant.data.name || slug}. Learn how we collect, use, and protect your personal information.`

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default async function PrivacyPolicyPage({ params }: PrivacyPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const { data } = restaurant
  const translations = getTranslations(data.app?.language)

  const coverImage = getImageSrc(
    slug,
    data.pages?.privacy?.coverImage || data.hero?.slides?.[0]?.image
  )

  const isJa = data.app?.language === "JA"
  const policyTitle = translations.contact?.privacyPolicy || "Privacy Policy"
  const policySubtitle = isJa
    ? "個人情報保護方針"
    : "How we protect and manage your data"
  const lastUpdated = isJa
    ? "最終更新日: 2026年5月19日"
    : "Last updated: May 19, 2026"

  const introText = isJa
    ? `${data.name}では、お客様のプライバシーを重視しています。本プライバシーポリシーは、当レストランがお客様の個人情報をどのように収集、使用、および保護するかについて説明するものです。`
    : `At ${data.name}, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information.`

  const sections = [
    {
      icon: Eye,
      title: isJa ? "収集する情報" : "Information We Collect",
      content: isJa
        ? "当ウェブサイトを通じてお問い合わせいただく際、ご予約のご要望やお問い合わせに適切に対応するため、お名前、メールアドレス、電話番号などの情報を収集することがあります。"
        : "When you contact us through our website, we may collect information such as your name, email address, and phone number to better serve your reservation requests or inquiries.",
    },
    {
      icon: FileText,
      title: isJa ? "情報の利用目的" : "How We Use Your Information",
      content: isJa
        ? "ご提供いただいた情報は、ご予約の確認やフィードバックへの対応など、当レストランでの体験に関するお客様との連絡のみを目的として使用いたします。"
        : "We use the information provided solely for the purpose of communicating with you regarding your restaurant experience, such as confirming reservations or responding to feedback.",
    },
    {
      icon: Lock,
      title: isJa ? "データセキュリティ" : "Data Security",
      content: isJa
        ? "当社は、お客様のデータが安全に保管され、不正な第三者と共有されないよう、業界標準のセキュリティ対策を実施しています。"
        : "We implement industry-standard security measures to ensure your data is kept safe and is not shared with unauthorized third parties.",
    },
    {
      icon: RefreshCw,
      title: isJa ? "ポリシーの改定" : "Changes to This Policy",
      content: isJa
        ? "本ポリシーは定期的に更新されることがあります。変更内容については、このページでご確認ください。"
        : "We may update this policy periodically. Please check this page for any changes.",
    },
  ]

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar
        restaurant={{ ...data, name: data.name || slug }}
        translations={translations}
        defaultLanguage={data.app?.language}
      />

      {coverImage && (
        <CoverSection
          image={coverImage}
          title={policyTitle}
          subtitle={policySubtitle}
        />
      )}

      <main
        className={cn(
          "flex-1",
          !coverImage ? "pt-32" : "pt-16",
          "bg-muted/20 pb-20"
        )}
      >
        <div className="mx-auto max-w-4xl px-6">
          <div className="overflow-hidden rounded-3xl border bg-card/60 p-8 shadow-xl backdrop-blur-md md:p-12">
            {/* Header section in card */}
            <div className="mb-8 flex flex-col items-start gap-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase">
                <Shield className="h-3.5 w-3.5" />
                {isJa ? "プライバシー保護" : "Privacy & Trust"}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {policyTitle}
              </h1>
              <p className="text-sm font-semibold text-muted-foreground/80">
                {lastUpdated}
              </p>
            </div>

            <div className="mb-8 h-px bg-border/60" />

            {/* Intro paragraph */}
            <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
              {introText}
            </p>

            {/* Structured policy sections */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {sections.map((section, index) => {
                const IconComponent = section.icon
                return (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-2xl border bg-background/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-background hover:shadow-lg md:p-8"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="space-y-3">
                        <h2 className="text-xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                          {section.title}
                        </h2>
                        <p className="text-sm leading-relaxed font-medium text-muted-foreground/90">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-12 text-center text-xs leading-relaxed text-muted-foreground/75">
              <p>
                {isJa
                  ? `個人情報の取扱についてご質問がある場合は、店舗までお問い合わせください。`
                  : `If you have any questions regarding our Privacy Policy or data handling, please feel free to reach out.`}
              </p>
            </div>
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
