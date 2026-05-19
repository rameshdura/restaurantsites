import Image from "next/image"
import { MenuCategory } from "./types"
import { MenuItemCard } from "./menu-item"

interface MenuSectionProps {
  category: MenuCategory
}

export function MenuSection({ category }: MenuSectionProps) {
  const { title, description, coverImage, items, id } = category

  return (
    <section id={id} className="mb-12 last:mb-0">
      <div className="relative mb-6">
        {coverImage && (
          <div className="group relative mb-6 h-64 w-full overflow-hidden rounded-xl md:h-80">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute right-6 bottom-4 left-6">
              <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-md md:text-4xl">
                {title}
              </h2>
            </div>
          </div>
        )}

        {!coverImage && (
          <div className="mb-6 flex flex-col">
            <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
              {title}
            </h2>
            <div className="h-1 w-12 rounded-full bg-primary" />
          </div>
        )}

        {description && !coverImage && (
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-1 md:grid-cols-2">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
