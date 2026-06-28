"use client"

import { useState } from "react"
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plug,
  LogOut,
  Clock,
  Mail,
  Puzzle,
  MessageSquare,
  ShoppingCart,
  Zap,
} from "lucide-react"
import type { OAuthConnection } from "@/lib/supabase-types"

interface OwnerAppsClientProps {
  slug: string
  restaurantId: string | null
  restaurantName: string
  googleConnection: OAuthConnection | null
}

interface IntegrationCardProps {
  icon: React.ReactNode
  name: string
  description: string
  status: "connected" | "disconnected" | "coming_soon"
  accountEmail?: string | null
  connectedSince?: string | null
  onConnect?: () => void
  onDisconnect?: () => void
  connectLabel?: string
  comingSoonLabel?: string
}

function IntegrationCard({
  icon,
  name,
  description,
  status,
  accountEmail,
  connectedSince,
  onConnect,
  onDisconnect,
  connectLabel = "Connect",
  comingSoonLabel = "Coming Soon",
}: IntegrationCardProps) {
  const [disconnecting, setDisconnecting] = useState(false)

  const handleDisconnect = async () => {
    if (!onDisconnect) return
    setDisconnecting(true)
    try {
      await onDisconnect()
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground">
            {icon}
          </div>
          <div>
            <h3 className="text-base leading-tight font-semibold">{name}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {status === "connected" && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Connected
          </span>
        )}
        {status === "disconnected" && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5" />
            Not connected
          </span>
        )}
        {status === "coming_soon" && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="h-3.5 w-3.5" />
            {comingSoonLabel}
          </span>
        )}
      </div>

      {/* Connected info */}
      {status === "connected" && (accountEmail || connectedSince) && (
        <div className="flex flex-col gap-1 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3">
          {accountEmail && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="truncate">{accountEmail}</span>
            </div>
          )}
          {connectedSince && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              Connected{" "}
              {new Date(connectedSince).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2">
        {status === "disconnected" && onConnect && (
          <button
            onClick={onConnect}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plug className="h-4 w-4" />
            {connectLabel}
          </button>
        )}
        {status === "connected" && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Active — new bookings sync automatically
            </span>
          </div>
        )}
        {status === "connected" && onDisconnect && (
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            {disconnecting ? "Disconnecting…" : "Disconnect"}
          </button>
        )}
        {status === "coming_soon" && (
          <span className="text-sm text-muted-foreground">
            We&apos;ll notify you when this is available.
          </span>
        )}
      </div>
    </div>
  )
}

export function OwnerAppsClient({
  slug,
  restaurantId,
  restaurantName,
  googleConnection,
}: OwnerAppsClientProps) {
  const [googleConn, setGoogleConn] = useState<OAuthConnection | null>(
    googleConnection
  )

  const handleConnectGoogle = () => {
    if (!slug) return
    window.location.href = `/api/oauth/google?restaurantSlug=${slug}`
  }

  const handleDisconnectGoogle = async () => {
    if (!restaurantId) return
    try {
      const res = await fetch(`/api/oauth/google?restaurantSlug=${slug}`, {
        method: "DELETE",
      })
      if (res.ok) setGoogleConn(null)
    } catch (err) {
      console.error("Disconnect error:", err)
    }
  }

  return (
    <div className="p-4 sm:p-8">
      {/* Page Header */}
      <div className="mx-auto mb-8 max-w-3xl">
        <div className="flex items-center gap-2">
          <Puzzle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Apps &amp; Integrations</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect third-party services to{" "}
          <span className="font-medium text-foreground">{restaurantName}</span>.
          Reservations will sync automatically once connected.
        </p>
      </div>

      <main className="mx-auto max-w-3xl space-y-8">
        {/* ── Section: Calendar ── */}
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <Calendar className="h-3.5 w-3.5" />
            Calendar
          </h3>
          <div className="grid gap-4">
            <IntegrationCard
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              }
              name="Google Calendar"
              description="New reservations are automatically added to your Google Calendar with customer details and reminders."
              status={googleConn ? "connected" : "disconnected"}
              accountEmail={googleConn?.account_email}
              connectedSince={googleConn?.created_at}
              onConnect={handleConnectGoogle}
              onDisconnect={handleDisconnectGoogle}
              connectLabel="Connect Google Calendar"
            />

            <IntegrationCard
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                  <path
                    fill="#0078D4"
                    d="M21.17 1H2.83C1.82 1 1 1.82 1 2.83v18.34C1 22.18 1.82 23 2.83 23h18.34c1.01 0 1.83-.82 1.83-1.83V2.83C23 1.82 22.18 1 21.17 1z"
                  />
                  <path
                    fill="#fff"
                    d="M12 6.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm0 7c2.5 0 7.5 1.26 7.5 3.75V19h-15v-1.75C4.5 14.76 9.5 13.5 12 13.5z"
                  />
                </svg>
              }
              name="Microsoft Outlook Calendar"
              description="Sync reservations directly to your Outlook or Microsoft 365 calendar."
              status="coming_soon"
              comingSoonLabel="Coming Soon"
            />
          </div>
        </section>

        {/* ── Section: Messaging ── */}
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <MessageSquare className="h-3.5 w-3.5" />
            Messaging &amp; Notifications
          </h3>
          <div className="grid gap-4">
            <IntegrationCard
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                  <path
                    fill="#4A154B"
                    d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z"
                  />
                  <path
                    fill="#4A154B"
                    d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
                  />
                  <path
                    fill="#36C5F0"
                    d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z"
                  />
                  <path
                    fill="#36C5F0"
                    d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
                  />
                  <path
                    fill="#2EB67D"
                    d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z"
                  />
                  <path
                    fill="#2EB67D"
                    d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"
                  />
                  <path
                    fill="#ECB22E"
                    d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z"
                  />
                  <path
                    fill="#ECB22E"
                    d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
                  />
                </svg>
              }
              name="Slack"
              description="Get a Slack notification every time a new reservation is made."
              status="coming_soon"
            />

            <IntegrationCard
              icon={<MessageSquare className="h-6 w-6 text-green-500" />}
              name="WhatsApp / LINE"
              description="Send automatic booking confirmations to customers via WhatsApp or LINE."
              status="coming_soon"
            />
          </div>
        </section>

        {/* ── Section: Task Management ── */}
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <Zap className="h-3.5 w-3.5" />
            Productivity
          </h3>
          <div className="grid gap-4">
            <IntegrationCard
              icon={
                <svg
                  viewBox="0 0 228 228"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <circle cx="114" cy="114" r="114" fill="#DB4035" />
                  <path
                    fill="#fff"
                    d="M176 70H52a6 6 0 0 0-6 6v76a6 6 0 0 0 6 6h124a6 6 0 0 0 6-6V76a6 6 0 0 0-6-6zm-6 76H58V82h112v64zm-87-48H71v12h12V98zm0 24H71v12h12v-12zm24-24H95v12h12V98zm0 24H95v12h12v-12zm24-24h-12v12h12V98zm0 24h-12v12h12v-12zm24-24h-12v12h12V98z"
                  />
                </svg>
              }
              name="Todoist"
              description="Create tasks in Todoist for each reservation — useful for prep checklists."
              status="coming_soon"
            />
          </div>
        </section>

        {/* ── Section: Delivery ── */}
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <ShoppingCart className="h-3.5 w-3.5" />
            Online Ordering &amp; Delivery
          </h3>
          <div className="grid gap-4">
            <IntegrationCard
              icon={
                <svg
                  viewBox="0 0 292.4 292.4"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <circle cx="146.2" cy="146.2" r="146.2" fill="#06C167" />
                  <path
                    fill="#fff"
                    d="M146.2 60C99.3 60 61 98.3 61 145.2s38.3 85.2 85.2 85.2 85.2-38.3 85.2-85.2S193.1 60 146.2 60zm0 148.3c-34.8 0-63.1-28.3-63.1-63.1s28.3-63.1 63.1-63.1 63.1 28.3 63.1 63.1-28.3 63.1-63.1 63.1z"
                  />
                </svg>
              }
              name="Uber Eats / DoorDash"
              description="Sync your menu and receive delivery orders directly."
              status="coming_soon"
            />
          </div>
        </section>

        {/* ── Footer note ── */}
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Want an integration that&apos;s not listed here? More integrations
            are on the way. The architecture supports any OAuth provider without
            changing your reservation data.
          </p>
        </div>
      </main>
    </div>
  )
}
