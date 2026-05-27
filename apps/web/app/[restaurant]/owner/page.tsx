import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { OwnerDashboardClient } from "./OwnerDashboardClient"

interface OwnerPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: OwnerPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}

  return {
    title: `Owner Dashboard | ${restaurant.data.name || "Restaurant"}`,
    description: `Track orders, manage tables, and check analytics in real-time.`,
  }
}

export default async function OwnerPage({ params }: OwnerPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  // Combine flat menu and menu categories to get a comprehensive menu list for details lookup
  const menuItems = restaurant.menu || []

  return (
    <OwnerDashboardClient
      restaurantSlug={decodedSlug}
      restaurantName={restaurant.data.name || decodedSlug}
      currency={restaurant.data.app?.currency || "USD"}
      menu={menuItems}
      menuCategories={restaurant.data.menuCategories || []}
    />
  )
}
