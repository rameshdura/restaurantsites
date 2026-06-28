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
} from "lucide-react"
import { usePathname } from "next/navigation"

interface Message {
  id: string
  role: "user" | "bot"
  content: string
}

interface FloatingChatProps {
  restaurantSlug: string
}

export function FloatingChat({ restaurantSlug }: FloatingChatProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Hide on owner dashboard routes
  if (pathname.includes("/owner")) {
    return null
  }
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  // Persist messages in localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`chat_${restaurantSlug}`)
    if (saved) {
      try {
        setMessages(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse saved chat history", e)
      }
    } else {
      // Default greeting
      setMessages([
        {
          id: "greet",
          role: "bot",
          content:
            "Hello! Welcome! I am your AI Assistant. How can I help you today? You can ask me about the menu, check table availability, or book a reservation.",
        },
      ])
    }
  }, [restaurantSlug])

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
      id: Math.random().toString(36).substr(2, 9),
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
          id: Math.random().toString(36).substr(2, 9),
          role: "bot",
          content: data.reply,
        },
      ])
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          role: "bot",
          content: `Sorry, I encountered an error: ${error.message || "Failed to connect to the server."}`,
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
    }
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
