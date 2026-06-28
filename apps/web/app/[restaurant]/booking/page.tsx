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
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-4 text-neutral-100 md:p-8">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/50 shadow-2xl backdrop-blur-md md:flex-row">
        {/* Left Column - Restaurant Info & Gradient Branding */}
        <div className="flex w-full flex-col justify-between border-b border-neutral-800 bg-linear-to-br from-indigo-900 via-neutral-900 to-emerald-950 p-6 md:w-5/12 md:border-r md:border-b-0 md:p-10">
          <div>
            <h1 className="bg-linear-to-r from-indigo-400 to-emerald-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              {data.name}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              {data.description ||
                "Experience exquisite dining at our restaurant. Book your table online in seconds."}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {data.address && (
              <div className="flex items-start gap-3">
                <span className="mt-1 text-emerald-400">📍</span>
                <span className="text-xs leading-relaxed text-neutral-300">
                  {data.address}
                </span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-3">
                <span className="text-indigo-400">📞</span>
                <span className="text-xs text-neutral-300">{data.phone}</span>
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-3">
                <span className="text-indigo-400">✉️</span>
                <span className="text-xs text-neutral-300">{data.email}</span>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-neutral-800/60 pt-6">
            <h3 className="text-sm font-semibold text-neutral-200">
              Reservation Policies
            </h3>
            <p className="mt-2 text-[11px] leading-relaxed text-neutral-400">
              * Party sizes from {data.reservation?.minimumPartySize || 1} to{" "}
              {data.reservation?.maximumPartySize || 20} guests.
              <br />* Online availability is checked instantly. Confirmations
              are generated in real-time.
            </p>
          </div>
        </div>

        {/* Right Column - Booking Form Client */}
        <div className="flex w-full flex-col justify-center p-6 md:w-7/12 md:p-10">
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
