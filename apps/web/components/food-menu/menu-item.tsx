import Image from "next/image";
import { MenuItem } from "./types";

interface MenuItemCardProps {
  item: MenuItem;
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
  } = item;

  return (
    <div className="group flex flex-row gap-3 py-3 border-b border-border/40 last:border-0 hover:bg-accent/5 transition-colors px-2 -mx-2">
      {image && (
        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
      
      <div className="flex-grow flex flex-col justify-center min-w-0">
        <div className="flex justify-between items-start gap-2 mb-0.5">
          <div className="min-w-0">
            <h4 className="text-base font-semibold tracking-tight text-foreground truncate">
              {name}
            </h4>
            {secondaryName && (
              <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest block -mt-1">
                {secondaryName}
              </span>
            )}
          </div>
          
          {price !== undefined && (
            <span className="text-base font-medium text-foreground whitespace-nowrap">
              {typeof price === "number" ? `$${price}` : price}
            </span>
          )}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 mb-1 max-w-[95%]">
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {isPopular && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0 text-[9px] font-bold text-primary uppercase tracking-tighter">
              Popular
            </span>
          )}
          {isVegetarian && (
            <span className="inline-flex items-center rounded-full bg-green-500/10 px-1.5 py-0 text-[9px] font-bold text-green-600 uppercase tracking-tighter">
              Veg
            </span>
          )}
          {isSpicy && (
            <span className="inline-flex items-center rounded-full bg-red-500/10 px-1.5 py-0 text-[9px] font-bold text-red-600 uppercase tracking-tighter">
              Spicy
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
