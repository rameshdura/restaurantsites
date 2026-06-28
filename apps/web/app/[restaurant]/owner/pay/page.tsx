import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { PayPageWrapper } from "./PayPageWrapper"
import { Suspense } from "react"

interface OwnerPayPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: OwnerPayPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}

  return {
    title: `Pay | ${restaurant.data.name || "Restaurant"}`,
    description: `Scan customer receipts and finalize payments.`,
  }
}

export default async function OwnerPayPage({ params }: OwnerPayPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const menuItems = restaurant.menu || []

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-zinc-500">
          Loading payment screen...
        </div>
      }
    >
      <PayPageWrapper
        restaurantSlug={decodedSlug}
        currency={restaurant.data.app?.currency || "USD"}
        menu={menuItems}
        menuCategories={restaurant.data.menuCategories || []}
      />
    </Suspense>
  )
}
