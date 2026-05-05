"use client"

import * as React from "react"
import { useTheme } from "next-themes"

interface MapEmbedProps {
  embedUrl?: string | null
}

export function MapEmbed({ embedUrl }: MapEmbedProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  if (!embedUrl) return null

  return (
    <div className="mt-20 h-[450px] w-full overflow-hidden border-y border-border bg-background lg:h-[600px]">
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
          className={`h-full w-full focus:outline-none ${isDark ? "dark-map-filter" : ""}`}
      />
    </div>
  )
}
