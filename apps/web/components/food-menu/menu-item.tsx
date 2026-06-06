import { useState } from "react"
import Image from "next/image"
import { MenuItem } from "./types"
import { Plus, Minus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"

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

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [noteInput, setNoteInput] = useState("")
  const [localQty, setLocalQty] = useState(1)

  const handleAddToCart = () => {
    onUpdateQty?.(currentQty + localQty, noteInput)
    setIsDialogOpen(false)
    setNoteInput("")
    setLocalQty(1)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="group -mx-2 flex flex-row gap-4 border-b border-border/40 px-2 py-4 transition-colors last:border-0 hover:bg-accent/5">
        {/* Image Container with Plus Button */}
        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm transition-shadow group-hover:shadow-md">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="112px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/50">
              <Plus className="h-6 w-6 text-muted-foreground/20" />
            </div>
          )}
          {tableMode && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsDialogOpen(true)
              }}
              className="absolute right-1.5 bottom-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
              aria-label="Add to cart"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content Container */}
        <div
          className={`flex min-w-0 flex-grow flex-col ${tableMode ? "cursor-pointer" : ""}`}
          onClick={() => tableMode && setIsDialogOpen(true)}
        >
          <div className="mb-1">
            <h4 className="text-base leading-tight font-semibold text-foreground">
              {name}
            </h4>
            {secondaryName && (
              <span className="mt-0.5 block text-[10px] font-medium tracking-widest text-muted-foreground/70 uppercase">
                {secondaryName}
              </span>
            )}
          </div>

          {hasPrice && (
            <div className="mb-1 text-base font-bold text-primary">
              {symbol}
              {price}
            </div>
          )}

          {description && (
            <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
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

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold">Quantity</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  setLocalQty(Math.max(1, localQty - 1))
                }}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center text-lg font-bold">
                {localQty}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  setLocalQty(localQty + 1)
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes" className="text-sm font-semibold">
              Special Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="E.g. No onions, extra spicy..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleAddToCart}
            className="w-full rounded-full py-6 text-base font-bold"
          >
            Add {localQty} to Cart • {symbol}
            {(Number(price) * localQty).toLocaleString()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
