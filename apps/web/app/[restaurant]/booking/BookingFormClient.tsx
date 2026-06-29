"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

interface SuccessBooking {
  id: string
  customerName: string
  date: string
  time: string
  partySize: number
}

interface BookingFormClientProps {
  restaurantSlug: string
  minPartySize: number
  maxPartySize: number
  openingHours: unknown[]
}

export default function BookingFormClient({
  restaurantSlug,
  minPartySize,
  maxPartySize,
}: BookingFormClientProps) {
  const router = useRouter()

  // Form states
  const [date, setDate] = React.useState("")
  const [time, setTime] = React.useState("")
  const [partySize, setPartySize] = React.useState(2)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")

  // Status states
  const [checkingAvailability, setCheckingAvailability] = React.useState(false)
  const [availability, setAvailability] = React.useState<{
    available: boolean
    message: string
  } | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [successBooking, setSuccessBooking] = React.useState<SuccessBooking | null>(null)
  const [errorMsg, setErrorMsg] = React.useState("")

  // Auto availability check when date, time, or partySize changes
  React.useEffect(() => {
    if (!date || !time) {
      return
    }

    const checkAvail = async () => {
      setCheckingAvailability(true)
      setErrorMsg("")
      setAvailability(null)

      try {
        const res = await fetch(
          `/api/bookings?restaurantSlug=${restaurantSlug}&checkAvailability=true&date=${date}&time=${time}&partySize=${partySize}`
        )
        const data = await res.json()
        setAvailability(data)
      } catch (err) {
        console.error("Failed to check availability:", err)
        setErrorMsg("Failed to connect to availability check service.")
      } finally {
        setCheckingAvailability(false)
      }
    }

    const debounce = setTimeout(checkAvail, 500)
    return () => clearTimeout(debounce)
  }, [date, time, partySize, restaurantSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!availability || !availability.available) return

    setSubmitting(true)
    setErrorMsg("")

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug,
          date,
          time,
          partySize,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm reservation.")
      }

      setSuccessBooking(data.booking)
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred."
      setErrorMsg(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  if (successBooking) {
    return (
      <div className="animate-fade-in space-y-6 px-4 py-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-3xl text-emerald-400 shadow-lg shadow-emerald-500/10">
          ✓
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-neutral-100">
            Reservation Confirmed!
          </h2>
          <p className="text-sm text-neutral-400">
            Thank you, {successBooking.customerName}. Your reservation details
            are below:
          </p>
        </div>

        <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-neutral-800/80 bg-neutral-950/40 p-6 text-left">
          <div className="flex justify-between border-b border-neutral-900 pb-2">
            <span className="text-xs text-neutral-400">Confirmation Code:</span>
            <span className="font-mono text-xs font-bold text-indigo-400">
              {successBooking.id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-neutral-400">Date:</span>
            <span className="text-xs font-semibold text-neutral-200">
              {successBooking.date}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-neutral-400">Time:</span>
            <span className="text-xs font-semibold text-neutral-200">
              {successBooking.time}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-neutral-400">Party Size:</span>
            <span className="text-xs font-semibold text-neutral-200">
              {successBooking.partySize} Guests
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push(`/${restaurantSlug}`)}
          className="transform cursor-pointer rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-neutral-100 shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-500"
        >
          Return to Home
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-neutral-200">Reserve a Table</h2>

      {/* Date, Time, and Party Size Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            Date
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              if (!e.target.value) setAvailability(null)
            }}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2.5 text-xs text-neutral-200 transition-all duration-200 focus:border-indigo-500/80 focus:outline-hidden"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            Time
          </label>
          <input
            type="time"
            required
            value={time}
            onChange={(e) => {
              setTime(e.target.value)
              if (!e.target.value) setAvailability(null)
            }}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2.5 text-xs text-neutral-200 transition-all duration-200 focus:border-indigo-500/80 focus:outline-hidden"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            Guests
          </label>
          <select
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2.5 text-xs text-neutral-200 transition-all duration-200 focus:border-indigo-500/80 focus:outline-hidden"
          >
            {Array.from({ length: maxPartySize - minPartySize + 1 }, (_, i) => {
              const size = minPartySize + i
              return (
                <option key={size} value={size}>
                  {size} {size === 1 ? "Guest" : "Guests"}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Availability Status Indicators */}
      {checkingAvailability && (
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></span>
          Checking real-time slot availability...
        </div>
      )}

      {availability && (
        <div
          className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs leading-relaxed ${
            availability.available
              ? "border-emerald-800/30 bg-emerald-950/10 text-emerald-400"
              : "border-rose-800/20 bg-rose-950/15 text-rose-400"
          }`}
        >
          <span>{availability.available ? "✓" : "✗"}</span>
          <span>{availability.message}</span>
        </div>
      )}

      {/* Contact Details Section */}
      <div className="space-y-4 border-t border-neutral-800/50 pt-4">
        <h3 className="text-xs font-semibold tracking-wider text-neutral-300 uppercase">
          Contact Information
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-neutral-400">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="Alice Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2.5 text-xs text-neutral-200 transition-all duration-200 focus:border-indigo-500/80 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-neutral-400">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="alice@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2.5 text-xs text-neutral-200 transition-all duration-200 focus:border-indigo-500/80 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[11px] font-semibold text-neutral-400">
              Phone Number
            </label>
            <input
              type="tel"
              required
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2.5 text-xs text-neutral-200 transition-all duration-200 focus:border-indigo-500/80 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-800/20 bg-rose-950/15 p-3.5 text-xs text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Booking Actions */}
      <button
        type="submit"
        disabled={!availability?.available || submitting}
        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all duration-300 ${
          availability?.available
            ? "bg-emerald-600 text-neutral-100 shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
            : "cursor-not-allowed bg-neutral-800 text-neutral-500"
        }`}
      >
        {submitting ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-100 border-t-transparent"></span>
            Confirming Reservation...
          </>
        ) : (
          "Book Table Now"
        )}
      </button>
    </form>
  )
}
