import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { OwnerChatsClient } from "./OwnerChatsClient"

interface OwnerChatsPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: OwnerChatsPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}

  return {
    title: `Chat History | ${restaurant.data.name || "Restaurant"}`,
    description: `View saved AI chatbot conversation sessions.`,
  }
}

export default async function OwnerChatsPage({ params }: OwnerChatsPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  return (
    <OwnerChatsClient
      restaurantSlug={decodedSlug}
      restaurantName={restaurant.data.name || decodedSlug}
    />
  )
}
