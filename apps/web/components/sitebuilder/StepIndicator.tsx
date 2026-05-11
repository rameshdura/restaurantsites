'use client'

import React from 'react'
import { cn } from '@workspace/ui/lib/utils'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  stepTitles?: string[]
}

export function StepIndicator({ currentStep, totalSteps, stepTitles }: StepIndicatorProps) {
  const titles = stepTitles || ['Basic Info', 'SEO', 'Images', 'Hours', 'Menu', 'Social']
  
  return (
    <div className="mb-8 flex items-center justify-between px-4 overflow-x-auto pb-2 scrollbar-hide">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex flex-none flex-col items-center mx-2 first:ml-0 last:mr-0 min-w-[60px]">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
              i < currentStep
                ? 'border-primary bg-primary text-white'
                : i === currentStep
                  ? 'border-primary bg-background text-primary ring-2 ring-primary/20'
                  : 'border-border bg-background text-muted'
            )}
          >
            {i < currentStep ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-xs font-medium">{i + 1}</span>
            )}
          </div>
          <span
            className={cn(
              'mt-2 text-[10px] font-medium transition-colors whitespace-nowrap',
              i <= currentStep ? 'text-foreground' : 'text-muted'
            )}
          >
            {titles[i] || `Step ${i + 1}`}
          </span>
        </div>
      ))}
    </div>
  )
}

