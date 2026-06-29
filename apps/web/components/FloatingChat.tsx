"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Loader2,
  Calendar,
  ClipboardList,
  Clock,
  Phone,
} from "lucide-react"

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436 0 9.851-4.415 9.854-9.855.002-2.634-1.02-5.112-2.88-6.973C16.38 1.916 13.9.894 11.273.894c-5.437 0-9.854 4.415-9.857 9.858 0 1.547.411 3.056 1.192 4.407L1.658 20.73l5.882-1.541l.107-.035z" />
    <path d="M17.472 14.382c-.302-.151-1.787-.882-2.063-.982-.276-.1-.478-.151-.678.15-.2.3-.778.982-.953 1.183-.176.2-.352.226-.654.076-.301-.15-1.273-.47-2.424-1.5-1.15-.98-1.928-2.19-2.154-2.593-.226-.4-.024-.616.126-.765.135-.134.3-.352.45-.527.15-.176.2-.3.3-.5.1-.2.05-.375-.025-.526-.075-.151-.678-1.634-.93-2.242-.244-.587-.492-.507-.678-.517-.172-.01-.37-.012-.569-.012-.2 0-.526.075-.801.376-.275.301-1.05 1.027-1.05 2.507 0 1.48 1.075 2.907 1.225 3.109.15.2 2.112 3.224 5.116 4.523.714.309 1.272.494 1.706.633.718.228 1.37.196 1.885.118.574-.088 1.787-.732 2.037-1.44.25-.707.25-1.314.175-1.44-.075-.127-.275-.201-.577-.352z" />
  </svg>
)

const MessengerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.302 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.293 14.146L10.5 11.25l-5.143 5.643 5.643-5.993 2.793 2.896 5.143-5.643-5.643 5.993z" />
  </svg>
)

const LineIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.843 10.06 9.588.39.084.922.258 1.058.59.121.294.08.756.039 1.054-.04.298-.184 1.194-.225 1.516-.062.484-.29 1.892 1.252.922 1.543-.97 8.327-4.896 11.353-8.384 2.246-2.584 3.516-5.48 3.516-8.304zm-16.733 3.19h-1.921c-.347 0-.63-.283-.63-.63V8.136c0-.347.283-.63.63-.63h.314c.347 0 .63.283.63.63v4.062h.977c.347 0 .63.283.63.63v.056c0 .347-.283.63-.63.63zm3.766 0h-.314c-.347 0-.63-.283-.63-.63V8.136c0-.347.283-.63.63-.63h.314c.347 0 .63.283.63.63v.756c0 .347-.283.63-.63.63zm5.666 0h-.385c-.212 0-.41-.107-.525-.286l-2.072-3.223v2.879c0 .347-.283.63-.63.63h-.314c-.347 0-.63-.283-.63-.63V8.136c0-.347.283-.63.63-.63h.385c.212 0 .41.107.525.286l2.072 3.223V8.136c0-.347.283-.63.63-.63h.314c.347 0 .63.283.63.63v5.008c0 .347-.283.63-.63.63zm5.405-2.06c0 .347-.283.63-.63.63h-1.607v1.43h1.607c.347 0 .63.283.63.63v.056c0 .347-.283.63-.63.63h-2.551c-.347 0-.63-.283-.63-.63V8.136c0-.347.283-.63.63-.63h2.551c.347 0 .63.283.63.63v.056c0 .347-.283.63-.63.63h-1.607v1.314h1.607c.347 0 .63.283.63.63v.058z" />
  </svg>
)
import { usePathname } from "next/navigation"

interface Message {
  id: string
  role: "user" | "bot"
  content: string
  showContactButtons?: boolean
  contactLinks?: {
    whatsapp?: string | null
    messenger?: string | null
    line?: string | null
    phone?: string | null
  } | null
}

interface FloatingChatProps {
  restaurantSlug: string
}

function generateId() {
  return Math.random().toString(36).substring(2, 11)
}

function generateSessionId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

function getStoredMessages(restaurantSlug: string): Message[] {
  if (typeof window === "undefined") return []
  try {
    const saved = localStorage.getItem(`chat_${restaurantSlug}`)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error("Failed to parse saved chat history", e)
  }
  return [
    {
      id: "greet",
      role: "bot",
      content:
        "Hello! Welcome! I am your AI Assistant. How can I help you today? You can ask me about the menu, check table availability, or book a reservation.",
    },
  ]
}

function getOrCreateSessionId(restaurantSlug: string): string {
  if (typeof window === "undefined") return ""
  let sid = localStorage.getItem(`chat_session_id_${restaurantSlug}`)
  if (!sid) {
    sid = generateSessionId()
    localStorage.setItem(`chat_session_id_${restaurantSlug}`, sid)
  }
  return sid
}

export function FloatingChat({ restaurantSlug }: FloatingChatProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Hide on owner dashboard routes
  const isOwnerRoute = pathname.includes("/owner")
  const [messages, setMessages] = useState<Message[]>(() =>
    getStoredMessages(restaurantSlug)
  )
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sessionId, setSessionId] = useState<string>(() =>
    getOrCreateSessionId(restaurantSlug)
  )

  // Quick action suggestions
  const suggestions = [
    {
      label: "Book a Table",
      icon: Calendar,
      text: "I'd like to check table availability to book a table.",
    },
    {
      label: "View Menu",
      icon: ClipboardList,
      text: "Can you show me the menu categories and dishes?",
    },
    {
      label: "Opening Hours",
      icon: Clock,
      text: "What are your opening hours and address?",
    },
  ]

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_${restaurantSlug}`, JSON.stringify(messages))
    }
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, restaurantSlug])

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: text,
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug,
          sessionId,
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch response")
      }

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "bot",
          content: data.reply,
          showContactButtons: data.showContactButtons,
          contactLinks: data.contactLinks,
        },
      ])
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to connect to the server."
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "bot",
          content: `Sorry, I encountered an error: ${errMsg}`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputValue)
    }
  }

  const clearHistory = () => {
    if (confirm("Would you like to clear your chat history?")) {
      const defaultGreet: Message[] = [
        {
          id: "greet",
          role: "bot",
          content:
            "Hello! Welcome! I am your AI Assistant. How can I help you today? You can ask me about the menu, check table availability, or book a reservation.",
        },
      ]
      setMessages(defaultGreet)
      localStorage.setItem(
        `chat_${restaurantSlug}`,
        JSON.stringify(defaultGreet)
      )
      const newSid = generateSessionId()
      setSessionId(newSid)
      localStorage.setItem(`chat_session_id_${restaurantSlug}`, newSid)
    }
  }

  if (isOwnerRoute) {
    return null
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end font-sans">
      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[360px] max-w-[calc(100vw-32px)] animate-in flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-950 text-zinc-100 shadow-2xl backdrop-blur-md transition-all duration-300 slide-in-from-bottom-5 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-100">
                <Sparkles className="h-4.5 w-4.5 text-zinc-300" />
              </div>
              <div>
                <h4 className="text-sm font-semibold tracking-tight text-zinc-200">
                  Assistant
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Online
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearHistory}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                title="Clear Chat History"
              >
                Reset
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                aria-label="Close Chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex max-w-[85%] flex-col ${
                  m.role === "user"
                    ? "ml-auto items-end"
                    : "mr-auto items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "rounded-br-sm bg-zinc-100 text-zinc-950"
                      : "rounded-bl-sm border border-zinc-800/80 bg-zinc-900 text-zinc-200"
                  }`}
                >
                  {m.content}
                </div>
                {m.role === "bot" && m.showContactButtons && m.contactLinks && (
                  <div className="mt-2.5 flex animate-in flex-wrap gap-2 duration-300 fade-in slide-in-from-bottom-2">
                    {m.contactLinks.whatsapp && (
                      <a
                        href={m.contactLinks.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600/90 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-emerald-500 active:scale-95"
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                        WhatsApp
                      </a>
                    )}
                    {m.contactLinks.messenger && (
                      <a
                        href={m.contactLinks.messenger}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600/90 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-blue-500 active:scale-95"
                      >
                        <MessengerIcon className="h-4 w-4" />
                        Messenger
                      </a>
                    )}
                    {m.contactLinks.line && (
                      <a
                        href={m.contactLinks.line}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:bg-green-450 flex h-9 items-center gap-1.5 rounded-xl bg-green-500/90 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-all active:scale-95"
                      >
                        <LineIcon className="h-4 w-4" />
                        LINE
                      </a>
                    )}
                    {m.contactLinks.phone && (
                      <a
                        href={m.contactLinks.phone}
                        className="border-zinc-750 flex h-9 items-center gap-1.5 rounded-xl border bg-zinc-800/90 px-3.5 py-2 text-xs font-semibold text-zinc-200 shadow-md transition-all hover:bg-zinc-700 active:scale-95"
                      >
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                        Call Shop
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto flex max-w-[85%] items-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-zinc-800/80 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-400">
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-zinc-500" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (only show when not loading and input is empty) */}
          {messages.length === 1 && !isLoading && !inputValue && (
            <div className="border-t border-zinc-900 bg-zinc-950/40 px-4 py-2">
              <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                Suggested Actions
              </span>
              <div className="mt-1.5 flex flex-col gap-1.5">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s.text)}
                    className="border-zinc-850 flex items-center gap-2 rounded-xl border bg-zinc-900/40 px-3 py-2 text-xs text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800"
                  >
                    <s.icon className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="border-t border-zinc-900 bg-zinc-950 p-3">
            <div className="border-zinc-850 flex items-center gap-2 rounded-xl border bg-zinc-900/50 px-3 py-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me something..."
                rows={1}
                disabled={isLoading}
                className="flex-1 resize-none bg-transparent py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-100"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-950 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-zinc-200 active:scale-95"
        aria-label="Toggle Assistant Chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </button>
    </div>
  )
}
