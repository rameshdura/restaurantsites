"use client"

import React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  stepTitles?: string[]
}

export function StepIndicator({
  currentStep,
  totalSteps,
  stepTitles,
}: StepIndicatorProps) {
  const titles = stepTitles || [
    "Basic Info",
    "SEO",
    "Images",
    "Hours",
    "Menu",
    "Social",
  ]

  return (
    <div className="scrollbar-hide mb-8 flex items-center justify-between overflow-x-auto px-4 pb-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className="mx-2 flex min-w-[60px] flex-none flex-col items-center first:ml-0 last:mr-0"
        >
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
              i < currentStep
                ? "border-primary bg-primary text-white"
                : i === currentStep
                  ? "border-primary bg-background text-primary ring-2 ring-primary/20"
                  : "border-border bg-background text-muted"
            )}
          >
            {i < currentStep ? (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <span className="text-xs font-medium">{i + 1}</span>
            )}
          </div>
          <span
            className={cn(
              "mt-2 text-[10px] font-medium whitespace-nowrap transition-colors",
              i <= currentStep ? "text-foreground" : "text-muted"
            )}
          >
            {titles[i] || `Step ${i + 1}`}
          </span>
        </div>
      ))}
    </div>
  )
}
