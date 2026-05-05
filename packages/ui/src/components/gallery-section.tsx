"use client"

import Image from "next/image"
import { cn } from "../lib/utils"
import { motion } from "framer-motion"
import { useState } from "react"
import { SectionHeader } from "./section-header"
import { Lightbox } from "./lightbox"

const defaultGalleryItems = [
  {
    src: "/images/gallery/cocktail.png",
    alt: "Craft cocktail",
  },
  {
    src: "/images/gallery/dish.png",
    alt: "Gourmet dish",
  },
  {
    src: "/images/gallery/terrace.png",
    alt: "Restaurant terrace",
  },
  {
    src: "/images/gallery/chef.png",
    alt: "Chef at work",
  },
  {
    src: "/images/gallery/dessert.png",
    alt: "Artisan dessert",
  },
]

interface GallerySectionProps {
  images?: Array<{
    src: string
    alt: string
  }>
  translations?: {
    common?: {
      gallery?: {
        subtitle?: string
        title?: string
        backgroundTitle?: string
      }
    }
  }
  restaurantName?: string
}

export function GallerySection({ images, translations, restaurantName }: GallerySectionProps) {
  const items = images || defaultGalleryItems
  const [isPaused, setIsPaused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const t = translations?.common?.gallery || {}
  const title = restaurantName 
    ? (t.title ? t.title.replace('{restaurantName}', restaurantName) : `Moments at ${restaurantName}`)
    : (t.title || "Moments")

  return (
    <section className="py-20 bg-background overflow-hidden border-t border-border/40">
      <div className="px-6 max-w-7xl mx-auto mb-12">
        <SectionHeader 
          subtitle={t.subtitle || "Gallery"}
          title={title}
          backgroundTitle={t.backgroundTitle || "Moments"}
          align="center"
        />
      </div>

      <div className="relative w-full overflow-hidden">
        <motion.div
          className="flex w-fit cursor-pointer"
          animate={{ x: isPaused ? 0 : "-50%" }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear",
          }}
          onHoverStart={() => setIsPaused(true)}
          onHoverEnd={() => setIsPaused(false)}
        >
          {/* We need two sets for seamless looping */}
          <div className="flex shrink-0">
            {items.map((item, index) => (
              <div
                key={`item-1-${index}`}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "group relative h-[40vh] md:h-[60vh] lg:h-[70vh] w-[80vw] md:w-[400px] lg:w-[500px] shrink-0 overflow-hidden border-r border-border/10"
                )}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover grayscale transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:grayscale-0"
                  sizes="(max-width: 768px) 80vw, 500px"
                />
                <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-transparent" />
                <div className="pointer-events-none absolute inset-0 border-0 border-white/5 transition-all duration-500 group-hover:border-12" />
              </div>
            ))}
          </div>
          <div className="flex shrink-0">
            {items.map((item, index) => (
              <div
                key={`item-2-${index}`}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "group relative h-[40vh] md:h-[60vh] lg:h-[70vh] w-[80vw] md:w-[400px] lg:w-[500px] shrink-0 overflow-hidden border-r border-border/10"
                )}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover grayscale transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:grayscale-0"
                  sizes="(max-width: 768px) 80vw, 500px"
                />
                <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-transparent" />
                <div className="pointer-events-none absolute inset-0 border-0 border-white/5 transition-all duration-500 group-hover:border-12" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <Lightbox 
        images={items}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        onNavigate={(index) => setSelectedIndex(index)}
      />
    </section>
  )
}
