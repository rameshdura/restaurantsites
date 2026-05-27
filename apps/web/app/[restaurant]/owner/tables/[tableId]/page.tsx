import { OwnerTableDetailClient } from "./OwnerTableDetailClient"

export default async function TableDetailPage({
  params,
}: {
  params: Promise<{ restaurant: string; tableId: string }>
}) {
  const resolvedParams = await params
  return (
    <OwnerTableDetailClient
      restaurantSlug={resolvedParams.restaurant}
      tableId={resolvedParams.tableId}
    />
  )
}
