"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

interface BookingFormClientProps {
  restaurantSlug: string
  minPartySize: number
  maxPartySize: number
  openingHours: any[]
}

export default function BookingFormClient({
  restaurantSlug,
  minPartySize,
  maxPartySize,
  openingHours,
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
  const [availability, setAvailability] = React.useState<{ available: boolean; message: string } | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [successBooking, setSuccessBooking] = React.useState<any>(null)
  const [errorMsg, setErrorMsg] = React.useState("")

  // Auto availability check when date, time, or partySize changes
  React.useEffect(() => {
    if (!date || !time) {
      setAvailability(null)
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
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  if (successBooking) {
    return (
      <div className="text-center py-8 px-4 space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-500/10">
          ✓
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-neutral-100">Reservation Confirmed!</h2>
          <p className="text-neutral-400 text-sm">
            Thank you, {successBooking.customerName}. Your reservation details are below:
          </p>
        </div>
        
        <div className="bg-neutral-950/40 border border-neutral-800/80 rounded-2xl p-6 text-left space-y-3 max-w-md mx-auto">
          <div className="flex justify-between border-b border-neutral-900 pb-2">
            <span className="text-neutral-400 text-xs">Confirmation Code:</span>
            <span className="text-indigo-400 font-mono font-bold text-xs">{successBooking.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400 text-xs">Date:</span>
            <span className="text-neutral-200 text-xs font-semibold">{successBooking.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400 text-xs">Time:</span>
            <span className="text-neutral-200 text-xs font-semibold">{successBooking.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400 text-xs">Party Size:</span>
            <span className="text-neutral-200 text-xs font-semibold">{successBooking.partySize} Guests</span>
          </div>
        </div>

        <button
          onClick={() => router.push(`/${restaurantSlug}`)}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-neutral-100 font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-neutral-950/40 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-hidden focus:border-indigo-500/80 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Time</label>
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-neutral-950/40 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-hidden focus:border-indigo-500/80 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Guests</label>
          <select
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className="w-full bg-neutral-950/40 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-hidden focus:border-indigo-500/80 transition-all duration-200"
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
        <div className="text-neutral-400 text-xs flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
          Checking real-time slot availability...
        </div>
      )}

      {availability && (
        <div
          className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
            availability.available
              ? "bg-emerald-950/10 border-emerald-800/30 text-emerald-400"
              : "bg-rose-950/15 border-rose-800/20 text-rose-400"
          }`}
        >
          <span>{availability.available ? "✓" : "✗"}</span>
          <span>{availability.message}</span>
        </div>
      )}

      {/* Contact Details Section */}
      <div className="space-y-4 pt-4 border-t border-neutral-800/50">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-neutral-400">Full Name</label>
            <input
              type="text"
              required
              placeholder="Alice Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950/40 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-hidden focus:border-indigo-500/80 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-neutral-400">Email Address</label>
            <input
              type="email"
              required
              placeholder="alice@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-950/40 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-hidden focus:border-indigo-500/80 transition-all duration-200"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[11px] font-semibold text-neutral-400">Phone Number</label>
            <input
              type="tel"
              required
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-neutral-950/40 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-hidden focus:border-indigo-500/80 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-950/15 border border-rose-800/20 text-rose-400 p-3.5 rounded-xl text-xs">
          {errorMsg}
        </div>
      )}

      {/* Booking Actions */}
      <button
        type="submit"
        disabled={!availability?.available || submitting}
        className={`w-full py-3 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
          availability?.available
            ? "bg-emerald-600 hover:bg-emerald-500 text-neutral-100 shadow-lg shadow-emerald-600/20"
            : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
        }`}
      >
        {submitting ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-neutral-100 border-t-transparent rounded-full animate-spin"></span>
            Confirming Reservation...
          </>
        ) : (
          "Book Table Now"
        )}
      </button>
    </form>
  )
}
