import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { supabaseServer } from "@/lib/supabase"
import type { OAuthConnection, Restaurant } from "@/lib/supabase-types"
import { OwnerAppsClient } from "./OwnerAppsClient"

interface OwnerAppsPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: OwnerAppsPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}
  return {
    title: `Apps & Integrations | ${restaurant.data.name}`,
    description: `Connect Google Calendar and other services to ${restaurant.data.name}.`,
  }
}

export default async function OwnerAppsPage({ params }: OwnerAppsPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) notFound()

  // Look up the restaurant row in Supabase to get the ID
  const { data: restaurantRow } = (await supabaseServer
    .from("restaurants")
    .select("id, slug, name")
    .eq("slug", decodedSlug)
    .single()) as {
    data: Pick<Restaurant, "id" | "slug" | "name"> | null
    error: unknown
  }

  // Fetch all OAuth connections for this restaurant
  const connections: OAuthConnection[] = []
  if (restaurantRow) {
    const { data } = (await supabaseServer
      .from("oauth_connections")
      .select("*")
      .eq("restaurant_id", restaurantRow.id)) as {
      data: OAuthConnection[] | null
      error: unknown
    }
    if (data) connections.push(...data)
  }

  const googleConnection =
    connections.find((c) => c.provider === "google") ?? null
  const restaurantId = restaurantRow?.id ?? null

  return (
    <OwnerAppsClient
      slug={decodedSlug}
      restaurantId={restaurantId}
      restaurantName={restaurant.data.name ?? decodedSlug}
      googleConnection={googleConnection}
    />
  )
}
