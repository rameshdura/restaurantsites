import Image from "next/image";
import { MenuCategory } from "./types";
import { MenuItemCard } from "./menu-item";

interface MenuSectionProps {
  category: MenuCategory;
}

export function MenuSection({ category }: MenuSectionProps) {
  const { title, description, coverImage, items, id } = category;

  return (
    <section id={id} className="mb-12 last:mb-0">
      <div className="relative mb-6">
        {coverImage && (
          <div className="relative h-48 md:h-56 w-full overflow-hidden rounded-xl mb-6 group">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-md">
                {title}
              </h2>
            </div>
          </div>
        )}
        
        {!coverImage && (
          <div className="flex flex-col mb-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              {title}
            </h2>
            <div className="h-1 w-12 bg-primary rounded-full" />
          </div>
        )}

        {description && !coverImage && (
          <p className="text-muted-foreground max-w-2xl mb-6 text-sm">
            {description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
