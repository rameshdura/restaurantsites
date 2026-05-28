import { OwnerSessionDetailClient } from "./OwnerSessionDetailClient"
import { getRestaurant, groupMenuByCategory } from "@/lib/restaurant"
import { notFound } from "next/navigation"

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ restaurant: string; sessionId: string }>
}) {
  const resolvedParams = await params
  const decodedSlug = decodeURIComponent(resolvedParams.restaurant)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const { data, menu } = restaurant
  const categories = groupMenuByCategory(menu, decodedSlug)

  return (
    <OwnerSessionDetailClient
      sessionId={resolvedParams.sessionId}
      currency={data.app?.currency || "USD"}
      categories={categories}
    />
  )
}
