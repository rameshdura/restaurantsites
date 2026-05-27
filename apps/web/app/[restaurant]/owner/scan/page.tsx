import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { OwnerScanClient } from "./OwnerScanClient"

interface OwnerScanPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: OwnerScanPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}

  return {
    title: `Scanner | ${restaurant.data.name || "Restaurant"}`,
    description: `Scan customer receipts and finalize payments.`,
  }
}

export default async function OwnerScanPage({ params }: OwnerScanPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const menuItems = restaurant.menu || []

  return (
    <OwnerScanClient
      restaurantSlug={decodedSlug}
      currency={restaurant.data.app?.currency || "USD"}
      menu={menuItems}
      menuCategories={restaurant.data.menuCategories || []}
    />
  )
}
