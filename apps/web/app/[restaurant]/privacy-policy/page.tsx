import { notFound } from "next/navigation"
import { getRestaurant } from "@/lib/restaurant"

interface PrivacyPageProps {
  params: Promise<{ restaurant: string }>
}

export default async function PrivacyPolicyPage({ params }: PrivacyPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const { data } = restaurant

  return (
    <main className="container mx-auto py-24 px-6 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy for {data.name}</h1>
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>Last updated: May 19, 2026</p>
        <p>At {data.name}, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information.</p>
        
        <h2 className="text-2xl font-bold text-foreground mt-8">Information We Collect</h2>
        <p>When you contact us through our website, we may collect information such as your name, email address, and phone number to better serve your reservation requests or inquiries.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8">How We Use Your Information</h2>
        <p>We use the information provided solely for the purpose of communicating with you regarding your restaurant experience, such as confirming reservations or responding to feedback.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8">Data Security</h2>
        <p>We implement industry-standard security measures to ensure your data is kept safe and is not shared with unauthorized third parties.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8">Changes to This Policy</h2>
        <p>We may update this policy periodically. Please check this page for any changes.</p>
      </div>
    </main>
  )
}
