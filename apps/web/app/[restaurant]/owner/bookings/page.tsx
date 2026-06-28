import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { OwnerBookingsClient } from "./OwnerBookingsClient"

interface OwnerBookingsPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: OwnerBookingsPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}

  return {
    title: `Bookings | ${restaurant.data.name || "Restaurant"}`,
    description: `View and manage table bookings from the online assistant.`,
  }
}

export default async function OwnerBookingsPage({
  params,
}: OwnerBookingsPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  return (
    <OwnerBookingsClient
      restaurantSlug={decodedSlug}
      restaurantName={restaurant.data.name || decodedSlug}
    />
  )
}
