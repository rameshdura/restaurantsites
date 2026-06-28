import { Metadata } from "next"
import { getRestaurant, groupMenuByCategory } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { OwnerTablesManagementPage } from "./OwnerTablesManagementPage"
import { Suspense } from "react"

interface OwnerTablesPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: OwnerTablesPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}

  return {
    title: `Tables | ${restaurant.data.name || "Restaurant"}`,
    description: `Manage your restaurant tables in real-time.`,
  }
}

export default async function OwnerTablesPage({
  params,
}: OwnerTablesPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const { data, menu } = restaurant
  const tables = data.tables || []
  const categories = groupMenuByCategory(menu, decodedSlug)

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-zinc-500">
          Loading tables...
        </div>
      }
    >
      <OwnerTablesManagementPage
        restaurantSlug={decodedSlug}
        tables={tables}
        categories={categories}
        currency={data.app?.currency || "USD"}
      />
    </Suspense>
  )
}
