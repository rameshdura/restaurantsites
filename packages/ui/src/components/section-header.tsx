"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "../lib/utils"

interface SectionHeaderProps {
  title: React.ReactNode
  subtitle?: string
  description?: React.ReactNode
  backgroundTitle?: string
  className?: string
  align?: "left" | "center"
}

export function SectionHeader({
  title,
  subtitle,
  description,
  backgroundTitle,
  className,
  align = "left",
}: SectionHeaderProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // Background title scroll animation
  const x = useTransform(scrollYProgress, [0, 1], [-50, 50])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  // Write-on effect for the signature font
  const clipWidth = useTransform(scrollYProgress, [0.1, 0.4], ["0%", "100%"])
  const clipPath = useTransform(
    clipWidth,
    (w) => `inset(0 ${100 - parseFloat(w)}% 0 0)`
  )

  const isCenter = align === "center"

  return (
    <div
      ref={ref}
      className={cn(
        "relative mb-12 lg:mb-16",
        isCenter ? "text-center" : "text-left",
        className
      )}
    >
      {/* Background Signature Title */}
      {backgroundTitle && (
        <div
          className={cn(
            "pointer-events-none absolute -top-12 overflow-hidden px-4 pt-8 whitespace-nowrap select-none",
            isCenter ? "left-1/2 -translate-x-1/2" : "-left-4 lg:-left-12"
          )}
        >
          <motion.span
            style={{
              x,
              opacity,
              clipPath,
            }}
            className="inline-block font-signature text-7xl text-primary/10 italic sm:text-8xl lg:text-9xl"
          >
            {backgroundTitle}
          </motion.span>
        </div>
      )}

      {/* Main Title */}
      <div className="relative z-10">
        {subtitle && (
          <motion.h4
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-xs font-bold tracking-[0.2em] text-primary uppercase"
          >
            {subtitle}
          </motion.h4>
        )}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"
        >
          {title}
        </motion.h2>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "mt-6 text-lg leading-relaxed text-muted-foreground",
              isCenter ? "mx-auto max-w-2xl" : "max-w-xl"
            )}
          >
            {description}
          </motion.p>
        )}
      </div>
    </div>
  )
}
