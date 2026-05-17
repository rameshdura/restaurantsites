"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Send,
  Clock,
  Mail,
  Loader2,
  XCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { useToast } from "@workspace/ui/hooks/use-toast"
import {
  SiteBuilderData,
  getSites,
  saveSites,
  addSendHistory,
  getSendHistory,
  deleteSendHistoryEntry,
} from "@/lib/storage"
import { mapBuilderToDataJson } from "@/lib/site-mapper"
import { ImportJsonDialog } from "./ImportJsonDialog"

// ── Types ────────────────────────────────────────────────────────────
interface SiteListProps {
  onSelectSite: (site: SiteBuilderData) => void
  onCreateNew: () => void
}

interface SendHistoryEntry {
  id: string
  siteSlug: string
  siteName: string
  to: string[]
  subject: string
  sentAt: number
  status: "success" | "failed"
  errorMessage?: string
}

// ── Helpers ──────────────────────────────────────────────────────────
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// ══════════════════════════════════════════════════════════════════════
// SiteList
// ══════════════════════════════════════════════════════════════════════
export function SiteList({ onSelectSite, onCreateNew }: SiteListProps) {
  const { toast } = useToast()

  // ── Site list ──
  const [sites, setSites] = useState<SiteBuilderData[]>([])

  // ── Delete dialog ──
  const [deleteSiteId, setDeleteSiteId] = useState<string | null>(null)
  const [deleteSiteName, setDeleteSiteName] = useState<string>("")

  // ── Import dialog ──
  const [importOpen, setImportOpen] = useState(false)

  // ── Send dialog ──
  const [sendOpen, setSendOpen] = useState(false)
  const [siteToSend, setSiteToSend] = useState<SiteBuilderData | null>(null)
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sentSuccessfully, setSentSuccessfully] = useState(false)

  // ── History dialog ──
  const [historyOpen, setHistoryOpen] = useState(false)
  const [sendHistory, setSendHistory] = useState<SendHistoryEntry[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)

  // ── Load sites on mount ──
  useEffect(() => {
    const loadSites = async () => {
      const storedSites = await getSites()
      setSites(storedSites)
    }
    loadSites()
  }, [])

  // ── Load send history when history dialog opens ──
  const loadSendHistory = useCallback(async () => {
    try {
      setIsHistoryLoading(true)
      const history = await getSendHistory()
      setSendHistory(history)
    } catch {
      toast({
        title: "Error",
        description: "Failed to load send history",
        variant: "destructive",
      })
    } finally {
      setIsHistoryLoading(false)
    }
  }, [toast])

  // ── Handlers ──
  const handleDelete = async () => {
    if (deleteSiteId) {
      const updatedSites = sites.filter((s) => s.siteSlug !== deleteSiteId)
      setSites(updatedSites)
      await saveSites(updatedSites)
      setDeleteSiteId(null)
      setDeleteSiteName("")
      toast({
        title: "Site deleted",
        description: "The site has been removed.",
      })
    }
  }

  const handleEdit = (site: SiteBuilderData) => {
    onSelectSite(site)
  }

  const handleExportAll = () => {
    if (sites.length === 0) {
      toast({
        title: "No sites",
        description: "Create some sites first before exporting.",
        variant: "destructive",
      })
      return
    }
    const exportData = sites.map((site) => ({ [site.siteSlug]: site }))
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "restaurant-sites-export.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast({
      title: "Export successful",
      description: `Downloaded ${sites.length} sites.`,
    })
  }

  const EMAIL_RECIPIENT = "kals.future@gmail.com"

  const openSendDialog = (site: SiteBuilderData) => {
    setSiteToSend(site)
    setMessage("")
    setSendError(null)
    setSentSuccessfully(false)
    setSendOpen(true)
  }

  const handleSendEmail = async () => {
    if (!siteToSend) return

    const now = new Date()
    const formattedDateTime = now.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    const body = {
      siteName: siteToSend.siteName,
      siteSlug: siteToSend.siteSlug,
      siteData: mapBuilderToDataJson(siteToSend),
      message: `${message ? `Site data exported on ${formattedDateTime}\n\n${message}` : `Site data exported on ${formattedDateTime}`}`,
    }

    try {
      setIsSending(true)
      setSendError(null)

      const res = await fetch("/api/site/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const result = await res.json()

      if (!res.ok) {
        setSendError(result.error || "Failed to send email")
        await addSendHistory({
          id: `${Date.now()}-${siteToSend.siteSlug}`,
          siteSlug: siteToSend.siteSlug,
          siteName: siteToSend.siteName,
          to: [EMAIL_RECIPIENT],
          subject: `${siteToSend.siteName} — Restaurant Site Data`,
          sentAt: Date.now(),
          status: "failed",
          errorMessage: result.error || "Unknown error",
        })
        setIsSending(false)
        return
      }

      setSentSuccessfully(true)
      await addSendHistory({
        id: `${Date.now()}-${siteToSend.siteSlug}`,
        siteSlug: siteToSend.siteSlug,
        siteName: siteToSend.siteName,
        to: [EMAIL_RECIPIENT],
        subject: `${siteToSend.siteName} — Restaurant Site Data`,
        sentAt: Date.now(),
        status: "success",
      })

      toast({
        title: "Email sent!",
        description: "Site data has been sent successfully.",
      })

      setMessage("")
      setSendOpen(false)
    } catch (e: unknown) {
      setSendError(`Failed to send: ${(e as Error).message}`)
      await addSendHistory({
        id: `${Date.now()}-${siteToSend.siteSlug}`,
        siteSlug: siteToSend.siteSlug,
        siteName: siteToSend.siteName,
        to: [EMAIL_RECIPIENT],
        subject: `${siteToSend.siteName} — Restaurant Site Data`,
        sentAt: Date.now(),
        status: "failed",
        errorMessage: (e as Error).message,
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteHistoryEntry = async (id: string) => {
    await deleteSendHistoryEntry(id)
    setSendHistory((prev) => prev.filter((h) => h.id !== id))
    toast({ title: "Deleted", description: "History entry removed." })
  }

  const handleClearHistory = async () => {
    await deleteSendHistoryEntry("*")
    setSendHistory([])
    toast({ title: "Cleared", description: "All send history cleared." })
  }

  // ── Computed ──
  const totalSuccess = sendHistory.filter((h) => h.status === "success").length
  const totalFailed = sendHistory.filter((h) => h.status === "failed").length

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Header Toolbar ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Sites</h2>
          <p className="text-muted-foreground">
            Manage and edit your previously created restaurant sites
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setHistoryOpen(true)
              loadSendHistory()
            }}
          >
            <Clock className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button variant="outline" onClick={handleExportAll}>
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Site
          </Button>
        </div>
      </div>

      {/* ── Empty State ── */}
      {sites.length === 0 ? (
        <Card className="border-2 border-dashed py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No sites yet</h3>
          <p className="mx-auto mb-6 max-w-sm text-muted-foreground">
            You haven&apos;t created any restaurant sites yet. Start building
            your first site!
          </p>
          <Button onClick={onCreateNew}>Create Your First Site</Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Card
              key={site.siteSlug}
              className="flex flex-col overflow-hidden transition-all hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="max-w-[200px] truncate">
                    {site.siteName}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                    {site.siteSlug}
                  </span>
                </CardTitle>
                <CardDescription>
                  {site.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-20">Address:</span>
                    <span className="flex-1 truncate">{site.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-20">Phone:</span>
                    <span className="flex-1 truncate">{site.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-20">Email:</span>
                    <span className="flex-1 truncate">{site.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-20">Cuisine:</span>
                    <span className="flex-1 truncate">
                      {site.cuisineTypes.join(", ") || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 bg-muted/30">
                <Button
                  variant="outline"
                  className="flex-1"
                  size="sm"
                  onClick={() => handleEdit(site)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openSendDialog(site)}
                  className="text-primary"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  size="sm"
                  onClick={() => {
                    setDeleteSiteId(site.siteSlug)
                    setDeleteSiteName(site.siteName)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  SEND EMAIL DIALOG                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="flex max-h-[80vh] max-w-lg flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Send Site Data via Email
            </DialogTitle>
            <DialogDescription>
              Export &quot;{siteToSend?.siteName}&quot; as JSON and send it to
              the configured recipient.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto py-4">
            {/* Message */}
            <div className="space-y-2">
              <Label>Message (optional)</Label>
              <Textarea
                className="min-h-[80px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal note…"
              />
            </div>

            {/* Error */}
            {sendError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                <XCircle className="h-4 w-4" />
                <span>{sendError}</span>
              </div>
            )}

            {/* Success banner */}
            {sentSuccessfully && (
              <div className="flex items-center gap-2 rounded-md bg-green-100 p-2 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span>Sent successfully!</span>
              </div>
            )}

            {/* Preview */}
            <div className="space-y-1 text-sm text-muted-foreground">
              <Label>Preview</Label>
              <div className="max-h-[100px] overflow-y-auto rounded-md bg-muted/50 p-2 font-mono text-[10px] break-all">
                <div>
                  <span className="font-semibold text-foreground">File:</span>{" "}
                  {siteToSend?.siteSlug}-data.json
                </div>
                <div>
                  <span className="font-semibold text-foreground">Site:</span>{" "}
                  {siteToSend?.siteName}
                </div>
                <div>
                  <span className="font-semibold text-foreground">Size:</span> ~
                  {siteToSend
                    ? Math.round(
                        JSON.stringify(mapBuilderToDataJson(siteToSend))
                          .length / 1024
                      )
                    : 0}{" "}
                  KB
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSendOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSending}
              className="bg-primary hover:bg-primary/90"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  SEND HISTORY DIALOG                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Send History
            </DialogTitle>
            <DialogDescription>
              All past email sends for your restaurant site data.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto py-4">
            {isHistoryLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary" />
              </div>
            ) : sendHistory.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Mail className="mx-auto mb-4 h-12 w-12 opacity-30" />
                <h3 className="mb-2 text-lg font-semibold">No send history</h3>
                <p>Send your first site data via email to see it here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary bar */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {sendHistory.length} entr
                    {sendHistory.length === 1 ? "y" : "ies"} —{" "}
                    <span className="text-green-600">
                      {totalSuccess} delivered
                    </span>
                    {totalFailed > 0 && (
                      <span className="ml-1 text-destructive">
                        , {totalFailed} failed
                      </span>
                    )}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearHistory}
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Clear All
                  </Button>
                </div>

                <div className="space-y-3">
                  {sendHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <h4 className="truncate font-semibold">
                              {entry.siteName}
                            </h4>
                            <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                              {entry.siteSlug}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(entry.sentAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              {entry.status === "success" ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <XCircle className="h-3 w-3 text-destructive" />
                              )}
                              <span
                                className={
                                  entry.status === "success"
                                    ? "font-medium text-green-600"
                                    : "font-medium text-destructive"
                                }
                              >
                                {entry.status === "success"
                                  ? "Delivered"
                                  : "Failed"}
                              </span>
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1">
                            {entry.to.map((email, i) => (
                              <span
                                key={i}
                                className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary"
                              >
                                {email}
                              </span>
                            ))}
                          </div>

                          {entry.errorMessage && (
                            <p className="mt-2 text-xs text-destructive italic">
                              Error: {entry.errorMessage}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteHistoryEntry(entry.id)}
                          className="flex-shrink-0 p-1 text-muted-foreground transition-colors hover:text-destructive"
                          title="Delete entry"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog
        open={!!deleteSiteId}
        onOpenChange={(open) => !open && setDeleteSiteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Site</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteSiteName}&rdquo;?
              This action cannot be undone and all site data will be permanently
              removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteSiteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Import Dialog ── */}
      <ImportJsonDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportSuccess={(site) => {
          handleEdit(site)
        }}
      />
    </div>
  )
}
