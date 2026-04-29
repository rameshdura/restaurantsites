"use client";

import { cn } from "@workspace/ui/lib/utils";

interface CategoryNavProps {
  categories: { id: string; title: string }[];
  activeId: string;
  onTabChange: (id: string) => void;
  children?: React.ReactNode;
}

export function CategoryNav({ categories, activeId, onTabChange, children }: CategoryNavProps) {
  return (
    <nav className="sticky top-[72px] z-30 bg-background/80 backdrop-blur-md border-b border-border/40 py-2 -mx-4 px-4 mb-8">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        <div className="flex-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 w-max">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onTabChange(category.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
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
        {children && (
          <div className="shrink-0">
            {children}
          </div>
        )}
      </div>
    </nav>
  );
}
