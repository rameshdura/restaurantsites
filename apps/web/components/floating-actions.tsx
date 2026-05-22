"use client"

import Link from "next/link"
import { cn } from "@workspace/ui/lib/utils"

import { useRestaurantLink } from "@workspace/ui/hooks/use-restaurant-link"

interface FloatingActionsProps {
  restaurantSlug: string
  onlineBookingUrl?: string
  translations?: {
    contact?: {
      requestReservation?: string
    }
  }
}

export function FloatingActions({
  onlineBookingUrl,
  translations,
}: Omit<FloatingActionsProps, "restaurantSlug">) {
  const { getLink } = useRestaurantLink()
  // Use onlineBookingUrl if provided, otherwise link to the contact/reservation form section
  const reservationLink = onlineBookingUrl || getLink("/contact")
  const isExternal =
    !!onlineBookingUrl &&
    (onlineBookingUrl.startsWith("http://") ||
      onlineBookingUrl.startsWith("https://"))

  const label = translations?.contact?.requestReservation || "Reservation"

  return (
    <div
      className="pointer-events-none fixed top-1/2 right-0 z-50 hidden -translate-y-1/2 flex-col items-end gap-4 md:flex"
      aria-label="Floating Actions"
    >
      <div className="pointer-events-auto flex flex-col items-end gap-4">
        <Link
          href={reservationLink}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          style={{ writingMode: "vertical-rl" }}
          className={cn(
            "flex cursor-pointer items-center justify-center bg-transparent text-xl font-bold tracking-[7px] text-primary/80 uppercase transition-all duration-300 ease-in-out select-none",
            "rounded-l-2xl border border-r-0 border-transparent px-3.5 py-5",
            "hover:border-white/15 hover:bg-primary hover:text-white",
            "hover:shadow-2xl hover:shadow-primary/30"
          )}
        >
          {label}
        </Link>
      </div>
    </div>
  )
}
