"use client"

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface LightboxProps {
  images: { src: string; alt: string }[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (index: number) => void
}

export function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: LightboxProps) {
  const lightboxRef = React.useRef<HTMLDivElement>(null);
  
  // Handle keyboard events and focus trapping
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft") {
        const newIndex = (currentIndex - 1 + images.length) % images.length
        onNavigate(newIndex)
      } else if (e.key === "ArrowRight") {
        const newIndex = (currentIndex + 1) % images.length
        onNavigate(newIndex)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex, images.length, onClose, onNavigate])

  // Prevent body scroll when open and manage focus
  React.useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = "hidden"
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
      
      // Focus on close button when lightbox opens
      const closeButton = lightboxRef.current?.querySelector('button[aria-label="Close"]');
      if (closeButton) {
        (closeButton as HTMLElement).focus();
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [isOpen])

  // Focus trap: prevent tabbing out of lightbox when open
  React.useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      
      const focusableElements = lightboxRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement | null;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement | null;
      
      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          if (lastElement) {
            lastElement.focus();
          }
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          if (firstElement) {
            firstElement.focus();
          }
        }
      }
    };
    
    window.addEventListener("keydown", handleTabKey);
    return () => window.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  const nextImage = () => {
    onNavigate((currentIndex + 1) % images.length)
  }

  const prevImage = () => {
    onNavigate((currentIndex - 1 + images.length) % images.length)
  }

  return (
    <AnimatePresence>
      {isOpen && (
<motion.div
  ref={lightboxRef}
  role="dialog"
  aria-modal="true"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 z-200 flex items-center justify-center bg-background/95 backdrop-blur-md"
  onClick={onClose}
>
          {/* Controls */}
          <div className="absolute top-6 right-6 z-10 flex gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="group flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5 text-foreground transition-all hover:bg-foreground hover:text-background"
              aria-label="Close"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-6" />
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
            className="absolute left-6 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-foreground/5 text-foreground transition-all hover:bg-foreground hover:text-background md:flex"
            aria-label="Previous"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            className="absolute right-6 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-foreground/5 text-foreground transition-all hover:bg-foreground hover:text-background md:flex"
            aria-label="Next"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-6" />
          </button>

          {/* Image Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative h-[80vh] w-[90vw] md:h-[85vh] md:w-[80vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl border-4 border-foreground/10 bg-muted shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="relative h-full w-full"
                >
                  {images[currentIndex] && (
                    <Image
                      src={images[currentIndex].src}
                      alt={images[currentIndex].alt}
                      fill
                      className="object-contain"
                      priority
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        console.warn('Image failed to load:', e);
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="absolute -bottom-12 left-0 right-0 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                {currentIndex + 1} / {images.length}
                {images[currentIndex] && ` — ${images[currentIndex].alt}`}
              </p>
            </div>
          </motion.div>

          {/* Mobile Navigation (Swipe hinted) */}
          <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-8 md:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/10 text-foreground"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/10 text-foreground"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-6" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
