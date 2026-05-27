import { Metadata } from "next"
import { getRestaurant, groupMenuByCategory } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { TableLandingClient } from "./TableLandingClient"

interface TablePageProps {
  params: Promise<{ restaurant: string; tableId: string }>
}

export async function generateMetadata({
  params,
}: TablePageProps): Promise<Metadata> {
  const { restaurant: slug, tableId } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}

  const tables = restaurant.data.tables || []
  const table = tables.find(
    (t: { id: string | number }) => String(t.id) === String(tableId)
  )
  const tableLabel = table?.label || `Table ${tableId}`

  return {
    title: `Order from ${tableLabel} | ${restaurant.data.name || "Restaurant"}`,
    description: `Welcome to ${restaurant.data.name}! Start ordering directly from ${tableLabel} using our online table service.`,
  }
}

export default async function TablePage({ params }: TablePageProps) {
  const { restaurant: slug, tableId } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const { data, menu } = restaurant
  const tables = data.tables || []
  const table = tables.find(
    (t: { id: string | number }) => String(t.id) === String(tableId)
  )
  const tableLabel = table?.label || `Table ${tableId}`
  const categories = groupMenuByCategory(menu, decodedSlug)

  return (
    <TableLandingClient
      restaurantName={data.name || decodedSlug}
      restaurantSlug={decodedSlug}
      logoUrl={data.images?.logo?.url || null}
      tableId={tableId}
      tableLabel={tableLabel}
      currency={data.app?.currency || "USD"}
      categories={categories}
    />
  )
}
