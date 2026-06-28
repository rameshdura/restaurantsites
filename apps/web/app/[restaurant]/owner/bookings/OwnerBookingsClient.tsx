"use client"

import { useEffect, useState } from "react"
import type { Reservation, ReservationStatus } from "@/lib/supabase-types"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Label } from "@workspace/ui/components/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { useToast } from "@workspace/ui/hooks/use-toast"
import {
  Calendar,
  Users,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarCheck,
  RefreshCw,
  Trash2,
} from "lucide-react"

interface OwnerBookingsClientProps {
  restaurantSlug: string
  restaurantName: string
}

export function OwnerBookingsClient({
  restaurantSlug,
  restaurantName,
}: OwnerBookingsClientProps) {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [syncingId, setSyncingId] = useState<string | null>(null)

  // Add booking modal state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newGuestName, setNewGuestName] = useState("")
  const [newGuestEmail, setNewGuestEmail] = useState("")
  const [newGuestPhone, setNewGuestPhone] = useState("")
  const [newPartySize, setNewPartySize] = useState("2")
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  // Filters state
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState("")

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/bookings?restaurantSlug=${restaurantSlug}`)
      if (!res.ok) throw new Error("Failed to fetch bookings")
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch (err: any) {
      toast({
        title: "Error fetching bookings",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [restaurantSlug])

  const updateBookingStatus = async (id: string, newStatus: ReservationStatus) => {
    try {
      setUpdatingId(id)
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Status updated",
          description: `Booking is now ${newStatus}.`,
        })
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        )
      }
    } catch (err: any) {
      toast({
        title: "Failed to update",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsAdding(true)
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug,
          date: newDate,
          time: newTime + ":00",
          partySize: Number(newPartySize),
          customerName: newGuestName,
          customerEmail: newGuestEmail,
          customerPhone: newGuestPhone,
          notes: newNotes || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create booking")

      toast({
        title: "Booking Created",
        description: "The booking has been successfully created.",
      })

      setNewGuestName("")
      setNewGuestEmail("")
      setNewGuestPhone("")
      setNewPartySize("2")
      setNewDate("")
      setNewTime("")
      setNewNotes("")
      setIsAddOpen(false)

      fetchBookings()
    } catch (err: any) {
      toast({
        title: "Failed to create booking",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const syncToGoogleCalendar = async (id: string) => {
    try {
      setSyncingId(id)
      const res = await fetch(`/api/bookings/${id}/sync`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to sync to Google Calendar")

      toast({
        title: "Synced successfully",
        description: "Booking has been synced to Google Calendar.",
      })

      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, calendar_provider: "google", calendar_event_id: data.google_event_id }
            : b
        )
      )
    } catch (err: any) {
      toast({
        title: "Sync failed",
        description: err.message || "An error occurred during sync",
        variant: "destructive",
      })
    } finally {
      setSyncingId(null)
    }
  }

  const deleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return
    try {
      setUpdatingId(id)
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete booking")
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Booking deleted",
          description: "The booking has been successfully removed.",
        })
        setBookings((prev) => prev.filter((b) => b.id !== id))
      }
    } catch (err: any) {
      toast({
        title: "Failed to delete",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  // Calculate statistics
  const totalCount = bookings.length
  const pendingCount = bookings.filter((b) => b.status === "pending").length
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length
  const completedCount = bookings.filter((b) => b.status === "completed").length

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.customer_email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.customer_phone || "").includes(searchQuery)

    const matchesStatus =
      statusFilter === "all" ? true : booking.status === statusFilter

    const matchesDate = dateFilter ? booking.reservation_date === dateFilter : true

    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 gap-1"><AlertCircle className="h-3.5 w-3.5" /> Pending</Badge>
      case "confirmed":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Confirmed</Badge>
      case "completed":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Completed</Badge>
      case "cancelled":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1"><XCircle className="h-3.5 w-3.5" /> Cancelled</Badge>
      case "no_show":
        return <Badge variant="outline" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 gap-1"><XCircle className="h-3.5 w-3.5" /> No Show</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-4 sm:p-8">
      {/* Header section */}
      <div className="mx-auto mb-8 flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <CalendarCheck className="h-6 w-6 text-primary" />
            Bookings Dashboard
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage table reservations for {restaurantName} generated from the online assistant.
          </p>
        </div>
        <div className="flex gap-2 self-start">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Users className="h-4 w-4" />
                Add Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAddBooking}>
                <DialogHeader>
                  <DialogTitle>Add Manual Booking</DialogTitle>
                  <DialogDescription>
                    Create a new table reservation manually for this restaurant.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Guest Name</Label>
                    <Input
                      id="name"
                      required
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={newGuestEmail}
                        onChange={(e) => setNewGuestEmail(e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        required
                        value={newGuestPhone}
                        onChange={(e) => setNewGuestPhone(e.target.value)}
                        placeholder="+81..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="partySize">Party Size</Label>
                      <Input
                        id="partySize"
                        type="number"
                        min="1"
                        required
                        value={newPartySize}
                        onChange={(e) => setNewPartySize(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2 col-span-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Optional notes or requests"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAdding}>
                    {isAdding ? "Creating..." : "Create Booking"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            onClick={fetchBookings}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase">Total Bookings</CardDescription>
              <CardTitle className="text-2xl font-bold">{loading ? "..." : totalCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase text-yellow-500">Pending</CardDescription>
              <CardTitle className="text-2xl font-bold text-yellow-500">{loading ? "..." : pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase text-blue-500">Confirmed</CardDescription>
              <CardTitle className="text-2xl font-bold text-blue-500">{loading ? "..." : confirmedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase text-green-500">Completed</CardDescription>
              <CardTitle className="text-2xl font-bold text-green-500">{loading ? "..." : completedCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/60">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search guest name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Status:</span>
              </div>
              <div className="flex gap-1.5 bg-muted p-1 rounded-lg">
                {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 text-xs font-medium capitalize rounded-md transition-colors ${
                      statusFilter === status
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div className="relative min-w-[150px]">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-9 py-1 text-xs"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading reservations...</p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-lg font-medium text-foreground">No bookings found</p>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Try adjusting your search query, status filters, or date filter to see other reservations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden border-border/80 transition-shadow hover:shadow-md">
                <CardHeader className="bg-muted/40 p-4 border-b border-border/40 flex flex-row items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base leading-none text-foreground">
                      {booking.customer_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{booking.party_size} {booking.party_size === 1 ? "guest" : "guests"}</span>
                    </div>
                  </div>
                  <div>{getStatusBadge(booking.status)}</div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Reservation Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-foreground">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{booking.reservation_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{booking.reservation_time.slice(0, 5)}</span>
                    </div>
                    {booking.customer_email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0 animate-pulse-none" />
                        <a href={`mailto:${booking.customer_email}`} className="hover:underline hover:text-foreground truncate">
                          {booking.customer_email}
                        </a>
                      </div>
                    )}
                    {booking.customer_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a href={`tel:${booking.customer_phone}`} className="hover:underline hover:text-foreground">
                          {booking.customer_phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Customer Notes */}
                  {booking.notes && (
                    <div className="bg-accent/50 p-3 rounded-lg flex gap-2 items-start text-xs border border-border/30">
                      <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-muted-foreground leading-normal italic">
                        &ldquo;{booking.notes}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Google Calendar Sync Status */}
                  <div className="flex items-center justify-between text-xs border-t border-border/20 pt-2 mt-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarCheck className="h-3.5 w-3.5" />
                      <span>Google Calendar:</span>
                    </div>
                    {booking.calendar_event_id ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-normal py-0.5 px-1.5">
                        Synced
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-normal py-0.5 px-1.5">
                          Not Synced
                        </Badge>
                        <Button
                          onClick={() => syncToGoogleCalendar(booking.id)}
                          disabled={syncingId === booking.id}
                          size="sm"
                          variant="ghost"
                          className="h-6 px-1.5 text-[10px] text-primary hover:text-primary-foreground hover:bg-primary"
                        >
                          {syncingId === booking.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            "Sync Now"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                    <div className="flex flex-wrap gap-2">
                      {booking.status === "pending" && (
                        <Button
                          onClick={() => updateBookingStatus(booking.id, "confirmed")}
                          disabled={updatingId === booking.id}
                          size="sm"
                          className="flex-1 text-xs"
                        >
                          Confirm
                        </Button>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          onClick={() => updateBookingStatus(booking.id, "completed")}
                          disabled={updatingId === booking.id}
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                        >
                          Complete
                        </Button>
                      )}
                      {booking.status !== "cancelled" && booking.status !== "completed" && (
                        <Button
                          onClick={() => updateBookingStatus(booking.id, "cancelled")}
                          disabled={updatingId === booking.id}
                          size="sm"
                          variant="ghost"
                          className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          onClick={() => updateBookingStatus(booking.id, "no_show")}
                          disabled={updatingId === booking.id}
                          size="sm"
                          variant="ghost"
                          className="text-xs text-zinc-500 hover:text-zinc-600 hover:bg-zinc-50"
                        >
                          No Show
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteBooking(booking.id)}
                        disabled={updatingId === booking.id}
                        size="sm"
                        variant="ghost"
                        className="text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50 ml-auto"
                        title="Delete Reservation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
