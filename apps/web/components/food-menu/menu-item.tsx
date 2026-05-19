import Image from "next/image"
import { MenuItem } from "./types"

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const {
    name,
    secondaryName,
    description,
    price,
    image,
    isVegetarian,
    isSpicy,
    isPopular,
  } = item

  return (
    <div className="group -mx-2 flex flex-row gap-4 border-b border-border/40 px-2 py-4 transition-colors last:border-0 hover:bg-accent/5">
      {image && (
        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg shadow-sm transition-shadow group-hover:shadow-md">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}

      <div className="flex min-w-0 flex-grow flex-col justify-center">
        <div className="mb-0.5 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate text-base font-semibold tracking-tight text-foreground">
              {name}
            </h4>
            {secondaryName && (
              <span className="-mt-1 block text-[10px] font-medium tracking-widest text-muted-foreground/70 uppercase">
                {secondaryName}
              </span>
            )}
          </div>

          {price !== undefined && (
            <span className="text-base font-medium whitespace-nowrap text-foreground">
              {typeof price === "number" ? `$${price}` : price}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-0.5 mb-1 line-clamp-2 max-w-[95%] text-xs text-muted-foreground">
            {description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-1.5">
          {isPopular && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0 text-[9px] font-bold tracking-tighter text-primary uppercase">
              Popular
            </span>
          )}
          {isVegetarian && (
            <span className="inline-flex items-center rounded-full bg-green-500/10 px-1.5 py-0 text-[9px] font-bold tracking-tighter text-green-600 uppercase">
              Veg
            </span>
          )}
          {isSpicy && (
            <span className="inline-flex items-center rounded-full bg-red-500/10 px-1.5 py-0 text-[9px] font-bold tracking-tighter text-red-600 uppercase">
              Spicy
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
