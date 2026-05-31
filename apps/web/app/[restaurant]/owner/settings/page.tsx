import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { TableQRCode } from "@/components/table-qr-card"
import { Settings } from "lucide-react"

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
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mx-auto mb-8 max-w-7xl">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Settings className="h-5 w-5 text-primary" />
          Restaurant Settings
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Download QR codes for your tables. Guests can scan these to start an order.
        </p>
      </div>

      <main className="mx-auto max-w-7xl">
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
      </main>
    </div>
  )
}
