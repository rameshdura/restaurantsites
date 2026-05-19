"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface CoverSectionProps {
  image: string
  title?: string
  subtitle?: string
  className?: string
}

export function CoverSection({
  image,
  title,
  subtitle,
  className,
}: CoverSectionProps) {
  const [scrollY, setScrollY] = React.useState(0)

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!image) return null

  return (
    <section
      className={cn("relative h-[400px] w-full overflow-hidden lg:h-[500px]", className)}
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${image})`,
            transform: `translateY(${scrollY * 0.5}px)`,
            willChange: "transform",
          }}
        />
        <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      </div>
      {(title || subtitle) && (
        <div className="relative z-10 flex h-full items-end pb-12">
          <div className="mx-auto max-w-7xl px-6">
            {subtitle && (
              <p className="text-sm font-bold tracking-widest text-white/80 uppercase">
                {subtitle}
              </p>
            )}
            {title && (
              <h1 className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {title}
              </h1>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
