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

  const xRef = useRef(0)
  const isDraggingRef = useRef(false)
  const wasDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startTranslateXRef = useRef(0)
  const widthRef = useRef(0)
  const velocityRef = useRef(0)
  const lastTimeRef = useRef(0)
  const lastXRef = useRef(0)
  const inertiaActiveRef = useRef(false)
  const inertiaVelocityRef = useRef(0)

  const t = translations?.common?.gallery || {}
  const title = restaurantName
    ? t.title
      ? t.title.replace("{restaurantName}", restaurantName)
      : `Moments at ${restaurantName}`
    : t.title || "Moments"

  const updateWidth = () => {
    const track = trackRef.current
    if (track && track.children.length > 0) {
      const firstChild = track.children[0]
      if (firstChild) {
        widthRef.current = firstChild.getBoundingClientRect().width
      }
    }
  }

  useEffect(() => {
    updateWidth()
    xRef.current = -widthRef.current

    let animationFrameId: number

    const tick = () => {
      const track = trackRef.current
      if (!track) return

      if (widthRef.current === 0) {
        updateWidth()
        xRef.current = -widthRef.current
      }

      const W = widthRef.current
      if (W > 0) {
        if (isDraggingRef.current) {
          // Dragging is updated synchronously in handlers
        } else if (inertiaActiveRef.current) {
          xRef.current += inertiaVelocityRef.current * 16 // step based on ~16ms frame
          inertiaVelocityRef.current *= 0.95 // Friction

          // Wrap-around
          if (xRef.current < -2 * W) {
            xRef.current += W
          } else if (xRef.current > -W) {
            xRef.current -= W
          }

          if (Math.abs(inertiaVelocityRef.current) < 0.05) {
            inertiaActiveRef.current = false
          }
          track.style.transform = `translateX(${xRef.current}px)`
        } else {
          // Auto-scroll
          const speed = 0.5 // px per frame
          xRef.current -= speed

          // Wrap-around
          if (xRef.current < -2 * W) {
            xRef.current += W
          } else if (xRef.current > -W) {
            xRef.current -= W
          }
          track.style.transform = `translateX(${xRef.current}px)`
        }
      }

      animationFrameId = requestAnimationFrame(tick)
    }

    animationFrameId = requestAnimationFrame(tick)

    const handleResize = () => {
      updateWidth()
    }

    window.addEventListener("resize", handleResize)
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
    }
  }, [items.length])

  const handleStart = (clientX: number) => {
    isDraggingRef.current = true
    wasDraggingRef.current = false
    inertiaActiveRef.current = false
    startXRef.current = clientX
    startTranslateXRef.current = xRef.current
    lastXRef.current = clientX
    lastTimeRef.current = performance.now()
    velocityRef.current = 0
  }

  const handleMove = (clientX: number) => {
    if (!isDraggingRef.current) return
    const track = trackRef.current
    if (!track) return

    const now = performance.now()
    const dt = now - lastTimeRef.current
    const dx = clientX - startXRef.current
    const moveDx = clientX - lastXRef.current

    if (Math.abs(dx) > 5) {
      wasDraggingRef.current = true
    }

    if (dt > 0) {
      velocityRef.current = moveDx / dt
    }

    lastXRef.current = clientX
    lastTimeRef.current = now

    const W = widthRef.current
    let targetX = startTranslateXRef.current + dx

    if (W > 0) {
      if (targetX < -2 * W) {
        startTranslateXRef.current += W
        targetX += W
      } else if (targetX > -W) {
        startTranslateXRef.current -= W
        targetX -= W
      }
    }

    xRef.current = targetX
    track.style.transform = `translateX(${xRef.current}px)`
  }

  const handleEnd = () => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false

    if (Math.abs(velocityRef.current) > 0.1) {
      inertiaVelocityRef.current = velocityRef.current
      inertiaActiveRef.current = true
    }

    setTimeout(() => {
      wasDraggingRef.current = false
    }, 50)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only drag with left click
    handleStart(e.clientX)
    e.preventDefault()
  }

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX)
  }

  const onMouseUp = () => {
    handleEnd()
  }

  const onMouseLeave = () => {
    handleEnd()
  }

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (touch) {
      handleStart(touch.clientX)
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (touch) {
      handleMove(touch.clientX)
    }
  }

  const onTouchEnd = () => {
    handleEnd()
  }

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
        <div
          ref={trackRef}
          className="flex w-fit cursor-grab select-none active:cursor-grabbing"
          style={{ touchAction: "pan-y" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {Array.from({ length: 3 }).map((_, setIndex) => (
            <div
              key={`set-${setIndex}`}
              className="flex shrink-0 gap-3 px-3 md:gap-5 md:px-5"
            >
              {items.map((item, index) => (
                <div
                  key={`item-${setIndex}-${index}`}
                  onClick={(e) => {
                    if (wasDraggingRef.current) {
                      e.preventDefault()
                      e.stopPropagation()
                      return
                    }
                    setSelectedIndex(index)
                  }}
                  className="group relative h-[40vh] w-[80vw] shrink-0 overflow-hidden rounded-xl border border-border/20 md:h-[60vh] md:w-[400px] lg:h-[70vh] lg:w-[500px]"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="pointer-events-none object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    sizes="(max-width: 768px) 80vw, 500px"
                    draggable={false}
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
