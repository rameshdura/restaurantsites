"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "./card"
import { cn } from "@workspace/ui/lib/utils"

interface Review {
  author: string
  rating: number
  date: string
  comment: string
  source?: string
}

interface ReviewCardProps {
  review: Review
  className?: string
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn("h-full transition-shadow hover:shadow-lg", className)}>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{review.date}</span>
          </div>
          <p className="flex-1 text-sm leading-relaxed text-foreground">
            {review.comment}
          </p>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="font-medium text-sm">{review.author}</span>
            {review.source && (
              <span className="text-xs text-muted-foreground">{review.source}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}