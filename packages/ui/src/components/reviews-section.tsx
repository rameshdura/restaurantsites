"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "./button"
import { ReviewCard } from "./review-card"
import { ChevronRight, Star } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { SectionHeader } from "./section-header"

interface Review {
  author: string
  rating: number
  date: string
  comment: string
  source?: string
}

interface Translations {
  common?: {
    reviews?: {
      subtitle?: string
      title?: string
      backgroundTitle?: string
      viewAllButton?: string
    }
  }
}

interface ReviewsSectionProps {
  reviews?: Review[]
  googleMapsUrl?: string
  className?: string
  translations?: Translations
}

export function ReviewsSection({
  reviews,
  googleMapsUrl,
  className,
  translations,
}: ReviewsSectionProps) {
  const t = translations?.common?.reviews || {}
  
  const validReviews = reviews && Array.isArray(reviews) ? reviews : []
  const averageRating = validReviews.length > 0 
    ? validReviews.reduce((sum, r) => sum + r.rating, 0) / validReviews.length 
    : 0
  const displayedReviews = validReviews.slice(0, 3)

  if (validReviews.length === 0) {
    return null
  }

  return (
    <section className={cn("py-16 sm:py-20", className)}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <SectionHeader
            subtitle={t.subtitle || "What Our Customers Say"}
            title={t.title || "Reviews"}
            backgroundTitle={t.backgroundTitle || "Reviews"}
            align="center"
          />
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted"
                  )}
                />
              ))}
            </div>
            <span className="font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({validReviews.length} reviews)</span>
          </div>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedReviews.map((review, index) => (
            <ReviewCard key={index} review={review} />
          ))}
        </div>

        {googleMapsUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 text-center"
          >
            <Button asChild variant="outline">
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                {t.viewAllButton || "View All Reviews"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
}