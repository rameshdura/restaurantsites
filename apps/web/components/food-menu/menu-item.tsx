import { useState } from "react"
import Image from "next/image"
import { MenuItem } from "./types"

interface MenuItemCardProps {
  item: MenuItem
  currency?: string
  tableMode?: boolean
  currentQty?: number
  currentNotes?: string
  onUpdateQty?: (qty: number, notes: string) => void
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  JPY: "¥",
  USD: "$",
  EUR: "€",
  GBP: "£",
  KRW: "₩",
  CNY: "¥",
  INR: "₹",
}

export function MenuItemCard({
  item,
  currency,
  tableMode = false,
  currentQty = 0,
  currentNotes = "",
  onUpdateQty,
}: MenuItemCardProps) {
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

  const symbol = currency ? CURRENCY_SYMBOLS[currency] || "" : ""
  const hasPrice = price !== undefined && price !== null && price !== ""

  const [noteInput, setNoteInput] = useState(currentNotes)
  const [prevNotes, setPrevNotes] = useState(currentNotes)
  const [localQty, setLocalQty] = useState(1)

  if (currentNotes !== prevNotes) {
    setPrevNotes(currentNotes)
    setNoteInput(currentNotes)
  }

  return (
    <div className="group -mx-2 flex flex-row gap-4 border-b border-border/40 px-2 py-4 transition-colors last:border-0 hover:bg-accent/5">
      {image && (
        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg shadow-sm transition-shadow group-hover:shadow-md">
          <Image
            src={image}
            alt={name}
            fill
            sizes="112px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}

      <div className="flex min-w-0 flex-grow flex-col justify-center">
        <div className="mb-0.5 flex items-baseline gap-2">
          <h4 className="truncate text-base font-semibold tracking-tight text-foreground">
            {name}
          </h4>
          {hasPrice && (
            <div className="h-0 min-w-[12px] flex-grow self-center border-b border-dotted border-muted-foreground/30" />
          )}
          {hasPrice && (
            <span className="text-base font-medium whitespace-nowrap text-foreground">
              {symbol}
              {price}
            </span>
          )}
        </div>
        {secondaryName && (
          <span className="-mt-1 mb-1 block text-[10px] font-medium tracking-widest text-muted-foreground/70 uppercase">
            {secondaryName}
          </span>
        )}

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

        {tableMode && (
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Quantity Selector preceding Add to Cart */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLocalQty(Math.max(1, localQty - 1))}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border bg-background font-bold text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                  >
                    -
                  </button>
                  <span className="w-4 text-center text-sm font-semibold text-foreground select-none">
                    {localQty}
                  </span>
                  <button
                    onClick={() => setLocalQty(localQty + 1)}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border bg-background font-bold text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    onUpdateQty?.(currentQty + localQty, noteInput)
                    setLocalQty(1)
                  }}
                  className="cursor-pointer rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-primary/15 transition-all hover:scale-[1.03] hover:bg-primary/95"
                >
                  Add to Cart
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
