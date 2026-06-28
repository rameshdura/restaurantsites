import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import BookingFormClient from "./BookingFormClient"

interface BookingPageProps {
  params: Promise<{ restaurant: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const { data } = restaurant

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Left Column - Restaurant Info & Gradient Branding */}
        <div className="w-full md:w-5/12 bg-linear-to-br from-indigo-900 via-neutral-900 to-emerald-950 p-6 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-emerald-400">
              {data.name}
            </h1>
            <p className="mt-4 text-neutral-400 text-sm leading-relaxed">
              {data.description || "Experience exquisite dining at our restaurant. Book your table online in seconds."}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {data.address && (
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">📍</span>
                <span className="text-neutral-300 text-xs leading-relaxed">{data.address}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-3">
                <span className="text-indigo-400">📞</span>
                <span className="text-neutral-300 text-xs">{data.phone}</span>
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-3">
                <span className="text-indigo-400">✉️</span>
                <span className="text-neutral-300 text-xs">{data.email}</span>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-800/60">
            <h3 className="text-sm font-semibold text-neutral-200">Reservation Policies</h3>
            <p className="mt-2 text-neutral-400 text-[11px] leading-relaxed">
              * Party sizes from {data.reservation?.minimumPartySize || 1} to {data.reservation?.maximumPartySize || 20} guests.<br/>
              * Online availability is checked instantly. Confirmations are generated in real-time.
            </p>
          </div>
        </div>

        {/* Right Column - Booking Form Client */}
        <div className="w-full md:w-7/12 p-6 md:p-10 flex flex-col justify-center">
          <BookingFormClient
            restaurantSlug={decodedSlug}
            minPartySize={data.reservation?.minimumPartySize || 1}
            maxPartySize={data.reservation?.maximumPartySize || 20}
            openingHours={data.openingHours || []}
          />
        </div>

      </div>
    </div>
  )
}
