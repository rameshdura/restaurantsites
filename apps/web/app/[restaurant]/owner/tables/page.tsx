import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { OwnerTablesClient } from "./OwnerTablesClient"

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

  const tables = restaurant.data.tables || []

  return <OwnerTablesClient restaurantSlug={decodedSlug} tables={tables} />
}
