"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import type { ConversationSession, ChatMessage } from "@/lib/supabase-types"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { useToast } from "@workspace/ui/hooks/use-toast"
import {
  MessageSquare,
  Search,
  RefreshCw,
  Copy,
  Check,
  Loader2,
  Calendar,
  User,
  ArrowLeft,
  Sparkles,
  AlertCircle,
} from "lucide-react"

interface OwnerChatsClientProps {
  restaurantSlug: string
  restaurantName: string
}

export function OwnerChatsClient({
  restaurantSlug,
  restaurantName,
}: OwnerChatsClientProps) {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<ConversationSession[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  // Pagination State
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const LIMIT = 20

  // Selected session and message history details
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  )
  const [selectedSession, setSelectedSession] =
    useState<ConversationSession | null>(null)
  const [sessionDetailLoading, setSessionDetailLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const observerTargetRef = useRef<HTMLDivElement>(null)

  // Debounce search input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 400)

    return () => clearTimeout(handler)
  }, [searchQuery])

  const fetchSessions = useCallback(
    async (currentOffset: number, search: string, isReset = false) => {
      try {
        if (isReset) {
          if (!refreshing) setLoading(true)
        } else {
          setLoadingMore(true)
        }

        const res = await fetch(
          `/api/chat-sessions?restaurantSlug=${restaurantSlug}&limit=${LIMIT}&offset=${currentOffset}&search=${encodeURIComponent(
            search
          )}`
        )
        if (!res.ok) throw new Error("Failed to fetch chat sessions")

        const data = await res.json()
        const newSessions = data.sessions || []

        if (isReset) {
          setSessions(newSessions)
        } else {
          setSessions((prev) => {
            // Avoid key duplicates
            const existingIds = new Set(prev.map((s) => s.session_id))
            const filteredNew = newSessions.filter(
              (s: ConversationSession) => !existingIds.has(s.session_id)
            )
            return [...prev, ...filteredNew]
          })
        }

        if (newSessions.length < LIMIT) {
          setHasMore(false)
        } else {
          setHasMore(true)
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "An error occurred"
        toast({
          title: "Error fetching sessions",
          description: errMsg,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setLoadingMore(false)
        setRefreshing(false)
      }
    },
    [restaurantSlug, refreshing, toast]
  )

  // Reload lists when search query changes
  useEffect(() => {
    const handle = setTimeout(() => {
      setOffset(0)
      setHasMore(true)
      fetchSessions(0, debouncedSearchQuery, true)
    }, 0)
    return () => clearTimeout(handle)
  }, [debouncedSearchQuery, fetchSessions])

  // Setup infinite scroll intersection observer
  useEffect(() => {
    const observerTarget = observerTargetRef.current
    if (!observerTarget || !hasMore || loading || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]
        if (firstEntry && firstEntry.isIntersecting) {
          const nextOffset = offset + LIMIT
          setOffset(nextOffset)
          fetchSessions(nextOffset, debouncedSearchQuery, false)
        }
      },
      { threshold: 0.5, rootMargin: "100px" }
    )

    observer.observe(observerTarget)

    return () => {
      if (observerTarget) {
        observer.unobserve(observerTarget)
      }
    }
  }, [
    hasMore,
    loading,
    loadingMore,
    offset,
    debouncedSearchQuery,
    fetchSessions,
  ])

  // Fetch detailed session messages when selected
  useEffect(() => {
    if (!selectedSessionId) {
      const handle = setTimeout(() => {
        setSelectedSession(null)
      }, 0)
      return () => clearTimeout(handle)
    }

    const fetchSessionDetail = async () => {
      try {
        setSessionDetailLoading(true)
        const res = await fetch(
          `/api/chat-sessions?restaurantSlug=${restaurantSlug}&sessionId=${selectedSessionId}`
        )
        if (!res.ok) throw new Error("Failed to load session details")
        const data = await res.json()
        setSelectedSession(data.session)
      } catch (err: unknown) {
        const errMsg =
          err instanceof Error ? err.message : "Could not retrieve messages."
        toast({
          title: "Failed to load chat detail",
          description: errMsg,
          variant: "destructive",
        })
      } finally {
        setSessionDetailLoading(false)
      }
    }

    fetchSessionDetail()
  }, [selectedSessionId, restaurantSlug, toast])

  // Scroll to bottom of message panel when messages load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedSession?.messages, sessionDetailLoading])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: "Copied",
      description: "Conversation ID copied to clipboard.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRefresh = () => {
    setOffset(0)
    setHasMore(true)
    setRefreshing(true)
    fetchSessions(0, debouncedSearchQuery, true)
  }

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
            Active
          </Badge>
        )
      case "completed":
        return (
          <Badge className="border border-blue-500/20 bg-blue-500/10 text-blue-500">
            Completed
          </Badge>
        )
      case "abandoned":
        return (
          <Badge className="border border-zinc-500/20 bg-zinc-500/10 text-zinc-500">
            Abandoned
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-7xl flex-col p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <MessageSquare className="h-6 w-6 text-primary" />
            AI Chat History
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review conversations held between guests and the AI Assistant for{" "}
            {restaurantName}.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading || refreshing || loadingMore}
            title="Refresh Sessions List"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Main Work Area */}
      <div className="flex flex-1 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
        {/* Sidebar Panel */}
        <div
          className={`${
            selectedSessionId ? "hidden md:flex" : "flex"
          } w-full flex-col border-r md:w-80 lg:w-96`}
        >
          {/* Sidebar Header / Search */}
          <div className="space-y-3 border-b bg-muted/30 p-4">
            <div className="relative">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background pl-9"
              />
            </div>
            {debouncedSearchQuery && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Displaying results</span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-primary hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Chat Sessions List */}
          <div className="flex-1 divide-y divide-border overflow-y-auto">
            {loading ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading chat history...
                </p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm">No sessions found</p>
                {searchQuery && (
                  <p className="mt-1 text-xs">
                    Try searching with a different keyword
                  </p>
                )}
              </div>
            ) : (
              <>
                {sessions.map((session) => {
                  const isActive = selectedSessionId === session.session_id
                  return (
                    <div
                      key={session.session_id}
                      onClick={() => setSelectedSessionId(session.session_id)}
                      className={`flex cursor-pointer flex-col items-start gap-1.5 p-4 text-left transition-colors hover:bg-accent/40 ${
                        isActive ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="max-w-[70%] truncate text-sm font-semibold">
                          {session.customer_name || "Anonymous Guest"}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatDate(session.last_message_at)}
                        </span>
                      </div>

                      <div className="flex w-full items-center justify-between text-xs">
                        <span
                          className="max-w-[60%] truncate font-mono text-muted-foreground"
                          title={session.session_id}
                        >
                          {session.session_id}
                        </span>
                        {getStatusBadge(session.status)}
                      </div>
                    </div>
                  )
                })}

                {/* Infinite Scroll trigger target */}
                {hasMore && (
                  <div
                    ref={observerTargetRef}
                    className="flex justify-center border-t bg-muted/10 p-4"
                  >
                    {loadingMore ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Scroll down to load older sessions
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Message Thread Detail Panel */}
        <div
          className={`${
            selectedSessionId ? "flex" : "hidden md:flex"
          } flex-1 flex-col overflow-hidden bg-background`}
        >
          {selectedSessionId ? (
            <>
              {/* Detail Header */}
              <div className="flex h-16 items-center justify-between border-b bg-muted/20 px-6">
                <div className="flex min-w-0 items-center gap-3">
                  {/* Mobile Back Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedSessionId(null)}
                    className="shrink-0 md:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-sm font-semibold">
                        {selectedSession?.customer_name || "Anonymous Guest"}
                      </h4>
                      {selectedSession &&
                        getStatusBadge(selectedSession.status)}
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                      <span className="truncate">ID: {selectedSessionId}</span>
                      <button
                        onClick={() => copyToClipboard(selectedSessionId)}
                        className="shrink-0 hover:text-foreground"
                        title="Copy Conversation ID"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {selectedSession && (
                  <div className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Started {formatDate(selectedSession.created_at)}
                    </span>
                  </div>
                )}
              </div>

              {/* Message History Scroller */}
              <div className="flex-1 space-y-4 overflow-y-auto bg-muted/5 p-6">
                {sessionDetailLoading ? (
                  <div className="flex h-full flex-col items-center justify-center p-12 text-muted-foreground">
                    <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm">Fetching conversation logs...</p>
                  </div>
                ) : !selectedSession?.messages ||
                  selectedSession.messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center p-12 text-center text-muted-foreground">
                    <MessageSquare className="mb-2 h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm">No messages in this chat session</p>
                    <p className="mt-1 text-xs">
                      This session was created but no messages were exchanged.
                    </p>
                  </div>
                ) : (
                  selectedSession.messages.map(
                    (message: ChatMessage, index: number) => {
                      const isBot =
                        message.role === "bot" ||
                        message.role === "model" ||
                        message.role === "assistant"
                      return (
                        <div
                          key={index}
                          className={`flex max-w-[85%] flex-col ${
                            isBot ? "mr-auto items-start" : "ml-auto items-end"
                          }`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                              isBot
                                ? "rounded-bl-none border bg-muted text-foreground"
                                : "rounded-br-none bg-primary text-primary-foreground"
                            }`}
                          >
                            {message.content}
                          </div>
                          {/* Optional Escalation Link Indicator */}
                          {isBot && message.showContactButtons && (
                            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>AI offered escalation channels</span>
                            </div>
                          )}
                        </div>
                      )
                    }
                  )
                )}
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            /* Selected Session Empty State */
            <div className="flex flex-1 flex-col items-center justify-center bg-muted/5 p-8 text-center text-muted-foreground">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-foreground">
                No Conversation Selected
              </h3>
              <p className="max-w-sm text-sm">
                Select a conversation session from the sidebar to review the
                full dialogue log and details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
