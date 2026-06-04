"use client"

import { cn } from "@workspace/ui/lib/utils"

interface CategoryNavProps {
  categories: { id: string; title: string }[]
  activeId: string
  onTabChange: (id: string) => void
  children?: React.ReactNode
}

export function CategoryNav({
  categories,
  activeId,
  onTabChange,
  children,
}: CategoryNavProps) {
  return (
    <nav className="sticky top-[72px] z-30 mb-8 border-b border-border/40 bg-background/95 py-4 backdrop-blur-md">
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
