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
    <nav className="sticky top-[72px] z-30 -mx-4 mb-8 border-b border-border/40 bg-background/80 px-4 py-2 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <div className="no-scrollbar flex-1 overflow-x-auto">
          <div className="flex w-max items-center gap-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onTabChange(category.id)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all",
                  activeId === category.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </nav>
  )
}
