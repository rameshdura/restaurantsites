import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { TableQRCode } from "@/components/table-qr-card"

interface OwnerSettingsPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: OwnerSettingsPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}

  return {
    title: `Settings | ${restaurant.data.name || "Restaurant"}`,
    description: `Manage your restaurant settings and download QR codes.`,
  }
}

export default async function OwnerSettingsPage({
  params,
}: OwnerSettingsPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const tables = restaurant.data.tables || []
  const restaurantName = restaurant.data.name || decodedSlug

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Restaurant Settings
        </h2>
        <p className="mt-2 text-muted-foreground">
          Download QR codes for your tables. Guests can scan these to start an order.
        </p>
      </div>

      {tables.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No tables configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table: { id: string | number; label?: string }) => (
            <TableQRCode
              key={table.id}
              restaurantName={restaurantName}
              restaurantSlug={decodedSlug}
              tableId={table.id}
              tableLabel={table.label || `Table ${table.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
