"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@workspace/ui/lib/utils"
import { buttonVariants } from "./button"
import { useRestaurantLink } from "../hooks/use-restaurant-link"

interface HeroSlide {
  image: string
  title: string
  subtitle: string
  ctaText?: string
  ctaLink?: string
}

interface HeroProps {
  slides: HeroSlide[]
  phone?: string
}

export function Hero({ slides, phone }: HeroProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [brokenSlides, setBrokenSlides] = React.useState<Set<number>>(new Set())
  const { getLink } = useRestaurantLink()

  React.useEffect(() => {
    if (slides.length <= 1) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [slides.length])

  if (!slides || slides.length === 0) return null

  return (
    <section className="relative h-[90svh] w-full overflow-hidden bg-background">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-all duration-[3000ms] ease-in-out",
            index === currentSlide
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-110 opacity-0"
          )}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {slide.image && !brokenSlides.has(index) ? (
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className={cn(
                  "object-cover transition-transform duration-[6000ms] ease-in-out",
                  index === currentSlide && "scale-110"
                )}
                sizes="100vw"
                onError={() => {
                  setBrokenSlides((prev) => new Set(prev).add(index))
                }}
              />
            ) : (
              /* Grey placeholder shown when image is broken or missing */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                aria-label="No image available"
              >
                <rect width="100%" height="100%" fill="#4b5563" />
                <text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize="24"
                  fontFamily="sans-serif"
                >
                  No Image
                </text>
              </svg>
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
            <div className="max-w-4xl space-y-6">
              <h1
                className={cn(
                  "text-5xl font-black tracking-tighter transition-all delay-300 duration-700 sm:text-7xl lg:text-8xl",
                  index === currentSlide
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                )}
              >
                {slide.title}
              </h1>
              <p
                className={cn(
                  "mx-auto max-w-2xl text-lg font-medium text-white/90 transition-all delay-500 duration-700 sm:text-xl lg:text-2xl",
                  index === currentSlide
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                )}
              >
                {slide.subtitle}
              </p>

              {slide.ctaText && slide.ctaLink && (
                <div
                  className={cn(
                    "flex justify-center transition-all delay-700 duration-700",
                    index === currentSlide
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  )}
                >
                  <Link
                    href={
                      slide.ctaLink === "#menu"
                        ? getLink("/menu")
                        : slide.ctaLink?.startsWith("#")
                          ? getLink(slide.ctaLink)
                          : slide.ctaLink || "#"
                    }
                    className={cn(
                      buttonVariants({ variant: "default", size: "lg" }),
                      "h-14 rounded-full px-10 text-2xl font-bold tracking-[7px] shadow-2xl transition-all hover:scale-105 active:scale-95"
                    )}
                  >
                    {slide.ctaText}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Static Vertical Phone Number - overlaid on slider */}
      {phone && (
        <div
          className="absolute top-1/2 left-6 z-20 hidden -translate-y-1/2 md:block"
          style={{ writingMode: "sideways-lr" }}
        >
          <Link
            href={`tel:${phone}`}
            className="text-2xl font-bold tracking-[7px] text-white transition-colors hover:text-white/80"
            aria-label="Call restaurant"
          >
            {phone}
          </Link>
        </div>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                index === currentSlide
                  ? "w-10 bg-white"
                  : "w-1.5 bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
