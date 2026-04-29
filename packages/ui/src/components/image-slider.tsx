"use client"

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@workspace/ui/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

interface ImageSliderProps {
  images: string[]
  autoPlay?: boolean
  interval?: number
  className?: string
  aspectRatio?: string
}

export function ImageSlider({
  images,
  autoPlay = true,
  interval = 5000,
  className,
  aspectRatio = "aspect-square",
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [direction, setDirection] = React.useState(0)

  const nextSlide = React.useCallback(() => {
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }, [images.length])

  const prevSlide = React.useCallback(() => {
    setDirection(-1)
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    )
  }, [images.length])

  React.useEffect(() => {
    if (!autoPlay || images.length <= 1) return

    const timer = setInterval(nextSlide, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, images.length, nextSlide])

  if (!images || images.length === 0) return null

  const variants = {
    enter: (direction: number) => ({
      x: direction === 0 ? 0 : (direction > 0 ? "100%" : "-100%"),
      opacity: direction === 0 ? 1 : 0,
      scale: direction === 0 ? 1 : 1.1,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.9,
    }),
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-muted shadow-2xl",
        aspectRatio,
        className
      )}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
            scale: { duration: 0.7 },
          }}
          className="absolute inset-0"
        >
          {images[currentIndex] && (
            <Image
              src={images[currentIndex]}
              alt={`Slide ${currentIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={currentIndex === 0}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-all lg:opacity-0 lg:group-hover:opacity-100 hover:bg-black/40"
            aria-label="Previous slide"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-all lg:opacity-0 lg:group-hover:opacity-100 hover:bg-black/40"
            aria-label="Next slide"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={24} />
          </button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                index === currentIndex
                  ? "w-8 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
