import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Shield, Eye, Lock, RefreshCw, Database } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy | RestaurantSite Platform",
  description:
    "Learn how the RestaurantSite platform collects, uses, and protects your information.",
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "Last updated: June 29, 2026"

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content:
        "We collect information you provide directly to us when creating an account, building a restaurant site, or communicating with us. This includes your name, email address, password, billing information, and any restaurant data (such as business cards, logos, menus, images, and maps coordinates) that you upload to create your restaurant website.",
    },
    {
      icon: Database,
      title: "How We Use Your Data",
      content:
        "We use the collected data to build, host, and maintain your restaurant website, process payments, verify your business for third-party integrations (like Google Maps or social logins), optimize website performance, improve our platform capabilities, and communicate platform updates or support requests to you.",
    },
    {
      icon: Lock,
      title: "Data Security & Sharing",
      content:
        "We implement industry-standard encryption and security measures to protect your information and credentials. We do not sell your personal data. We only share data with essential sub-processors (such as cloud hosting providers, database services, and payment processors) or when required by law to protect our rights.",
    },
    {
      icon: RefreshCw,
      title: "Your Choices & Updates",
      content:
        "You can update, correct, or delete your account information and restaurant data at any time through our site builder platform. We update this privacy policy periodically to reflect changes in our services or legal obligations. Significant updates will be notified via our platform dashboard.",
    },
  ]

  return (
    <div className="min-h-svh bg-linear-to-b from-background to-muted/20 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Platform
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto mt-12 max-w-4xl px-6">
        <div className="overflow-hidden rounded-3xl border bg-card/60 p-8 shadow-xl backdrop-blur-md md:p-12">
          {/* Header section in card */}
          <div className="mb-8 flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase">
              <Shield className="h-3.5 w-3.5" />
              Privacy & Trust
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Privacy Policy
            </h1>
            <p className="text-sm font-semibold text-muted-foreground/80">
              {lastUpdated}
            </p>
          </div>

          <div className="mb-8 h-px bg-border/60" />

          {/* Intro paragraph */}
          <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
            At RestaurantSite, we take your privacy and the privacy of your
            restaurant&apos;s customers seriously. This Privacy Policy describes
            how we collect, use, protect, and share personal information in
            connection with the RestaurantSite website building and hosting
            platform.
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

          {/* Detailed Text Block */}
          <div className="mt-12 space-y-6 text-sm leading-relaxed text-muted-foreground">
            <h2 className="text-lg font-bold text-foreground">
              1. Google API Services & OAuth Verification
            </h2>
            <p>
              RestaurantSite integrates with Google API services to allow you to
              log in via Google OAuth and display Google Maps and reviews on
              your generated restaurant website. The data we retrieve via these
              APIs is strictly limited to the authentication context and public
              business information (e.g. Google Places data) necessary to
              configure and publish your restaurant website.
            </p>
            <h2 className="text-lg font-bold text-foreground">
              2. Cookies and Analytics
            </h2>
            <p>
              We use functional and analytical cookies to improve platform
              stability, keep you logged into your account, and analyze platform
              traffic. You can disable cookies in your browser settings, though
              some platform functions may no longer perform properly.
            </p>
          </div>

          <div className="mt-12 border-t pt-8 text-center text-xs leading-relaxed text-muted-foreground/75">
            <p>
              If you have any questions or concerns regarding our Privacy Policy
              or data handling practices, please contact us at
              support@restaurantsites.vercel.app.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
