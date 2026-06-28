import { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft,
  UserCheck,
  Activity,
  Key,
  ShieldAlert,
  HeartHandshake,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service | RestaurantSite Platform",
  description: "Read the Terms of Service for the RestaurantSite platform.",
}

export default function TermsOfServicePage() {
  const lastUpdated = "Last updated: June 29, 2026"

  const sections = [
    {
      icon: UserCheck,
      title: "Account Registration & Security",
      content:
        "To use the RestaurantSite platform, you must create an account providing accurate and complete information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
    },
    {
      icon: Key,
      title: "Intellectual Property Rights",
      content:
        "You retain all ownership rights to the content, logos, images, and text you upload. RestaurantSite retains all ownership, copyright, and IP rights to the platform design templates, layouts, source code, and custom styling systems provided for building your site.",
    },
    {
      icon: Activity,
      title: "Acceptable Use & Conduct",
      content:
        "You agree not to use the platform for any unlawful purpose, or to upload content that is defamatory, offensive, or infringes on any third-party intellectual property or privacy rights. We reserve the right to suspend accounts violating these terms.",
    },
    {
      icon: ShieldAlert,
      title: "Service Disclaimers & Hosting",
      content:
        "We aim for high platform availability, but we do not guarantee uninterrupted or error-free hosting services. The platform is provided 'as is' without warranties of any kind. We are not liable for any business disruptions or data loss.",
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
              <HeartHandshake className="h-3.5 w-3.5" />
              Terms & Agreement
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Terms of Service
            </h1>
            <p className="text-sm font-semibold text-muted-foreground/80">
              {lastUpdated}
            </p>
          </div>

          <div className="mb-8 h-px bg-border/60" />

          {/* Intro paragraph */}
          <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
            Welcome to RestaurantSite. By accessing or using our website
            building and hosting platform, you agree to comply with and be bound
            by these Terms of Service. Please read them carefully.
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
              1. Platform Services
            </h2>
            <p>
              RestaurantSite provides a site builder interface that allows
              restaurant owners to create and customize restaurant-specific
              landing pages and menus using raw data input, image uploads, and
              Google Maps integrations. We host the generated websites under
              subdomains or connected domains depending on subscription models.
            </p>
            <h2 className="text-lg font-bold text-foreground">
              2. Payment and Subscriptions
            </h2>
            <p>
              Certain advanced builder features and hosting options may require
              payment or subscriptions. All fees are billing cycles and
              non-refundable unless specified. We use third-party payment
              processors to ensure secure handling of transaction data.
            </p>
            <h2 className="text-lg font-bold text-foreground">
              3. Termination of Use
            </h2>
            <p>
              We reserve the right to suspend or terminate your account and take
              down hosted websites if you violate these Terms of Service or
              engage in activities that damage or disrupt the platform&apos;s
              operation.
            </p>
          </div>

          <div className="mt-12 border-t pt-8 text-center text-xs leading-relaxed text-muted-foreground/75">
            <p>
              If you have any questions or feedback regarding these Terms of
              Service, please contact us at support@restaurantsites.vercel.app.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
