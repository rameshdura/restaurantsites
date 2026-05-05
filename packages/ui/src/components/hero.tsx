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
}

export function Hero({ slides }: HeroProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0)
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
            "absolute inset-0 transition-all duration-1000 ease-in-out",
            index === currentSlide
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-110 opacity-0"
          )}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
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
                      "h-14 rounded-full px-10 text-lg font-bold shadow-2xl transition-all hover:scale-105 active:scale-95"
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
