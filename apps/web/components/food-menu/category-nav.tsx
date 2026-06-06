"use client"

import { cn } from "@workspace/ui/lib/utils"

interface CategoryNavProps {
  categories: { id: string; title: string }[]
  activeId: string
  onTabChange: (id: string) => void
  children?: React.ReactNode
  isTableMode?: boolean
}

export function CategoryNav({
  categories,
  activeId,
  onTabChange,
  children,
  isTableMode = false,
}: CategoryNavProps) {
  return (
    <nav
      className={cn(
        "sticky z-30 mb-8 border-b border-border/40 bg-background/95 py-4 backdrop-blur-md transition-all",
        isTableMode ? "top-0" : "top-[65px]"
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex w-full flex-wrap items-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onTabChange(category.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                activeId === category.id
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border/50 bg-muted/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {category.title}
            </button>
          ))}
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </nav>
  )
}
