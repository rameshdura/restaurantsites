"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
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

export function GallerySection({
  images,
  translations,
  restaurantName,
}: GallerySectionProps) {
  const items = images || defaultGalleryItems
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const t = translations?.common?.gallery || {}
  const title = restaurantName
    ? t.title
      ? t.title.replace("{restaurantName}", restaurantName)
      : `Moments at ${restaurantName}`
    : t.title || "Moments"

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const keyframes = `
      @keyframes galleryScroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-33.333%); }
      }
    `
    const styleSheet = document.createElement("style")
    styleSheet.textContent = keyframes
    document.head.appendChild(styleSheet)

    const duration = items.length * 10
    track.style.animation = `galleryScroll ${duration}s linear infinite`

    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [items.length])

  return (
    <section className="overflow-hidden overflow-x-hidden border-t border-border/40 bg-background py-20">
      <div className="mx-auto mb-12 max-w-7xl px-6">
        <SectionHeader
          subtitle={t.subtitle || "Gallery"}
          title={title}
          backgroundTitle={t.backgroundTitle || "Moments"}
          align="center"
        />
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Three identical copies for seamless infinite looping */}
        <div ref={trackRef} className="flex w-fit cursor-pointer">
          {Array.from({ length: 3 }).map((_, setIndex) => (
            <div
              key={`set-${setIndex}`}
              className="flex shrink-0 gap-3 px-3 md:gap-5 md:px-5"
            >
              {items.map((item, index) => (
                <div
                  key={`item-${setIndex}-${index}`}
                  onClick={() => setSelectedIndex(index)}
                  className="group relative h-[40vh] w-[80vw] shrink-0 overflow-hidden rounded-xl border border-border/20 md:h-[60vh] md:w-[400px] lg:h-[70vh] lg:w-[500px]"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    sizes="(max-width: 768px) 80vw, 500px"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
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
