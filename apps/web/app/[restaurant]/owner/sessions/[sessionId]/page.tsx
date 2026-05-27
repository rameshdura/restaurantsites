import { OwnerSessionDetailClient } from "./OwnerSessionDetailClient"

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ restaurant: string; sessionId: string }>
}) {
  const resolvedParams = await params
  return (
    <OwnerSessionDetailClient
      restaurantSlug={resolvedParams.restaurant}
      sessionId={resolvedParams.sessionId}
    />
  )
}
