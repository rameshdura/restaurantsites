import type React from "react"
import Image from "next/image"

interface FeaturedItem {
  id: string
  image: string
  alt: string
}

interface FeaturedSectionProps {
  title?: string
  items: FeaturedItem[]
}

export function FeaturedSection({
  title = "Featured",
  items,
}: FeaturedSectionProps) {
  return (
    <section className="pt-16 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Carefully selected highlights from our menu
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col gap-3"
            >
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/40 bg-accent/30 shadow-md backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5">
                <Image
                  src={item.image || "/images/placeholder.png"}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/placeholder.png";
                  }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent to-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </div>
              <p className="text-center text-sm font-medium text-muted-foreground group-hover:text-foreground">
                {item.alt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
