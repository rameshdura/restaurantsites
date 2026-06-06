import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { X } from "lucide-react"
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion"

const SheetContext = React.createContext<{
  open?: boolean
  onOpenChange?: (open: boolean) => void
}>({})

const Sheet = ({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  )
}

const SheetPortal = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">{children}</div>
  )
}

const SheetOverlay = React.forwardRef<
  HTMLDivElement,
  Omit<HTMLMotionProps<"div">, "children"> & { children?: React.ReactNode }
>(({ className, ...props }, ref) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm", className)}
    {...props}
  />
))
SheetOverlay.displayName = "SheetOverlay"

const SheetContent = React.forwardRef<
  HTMLDivElement,
  Omit<HTMLMotionProps<"div">, "children"> & {
    side?: "left" | "right" | "top" | "bottom"
    children?: React.ReactNode
  }
>(({ className, children, side = "left", ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(SheetContext)

  const variants = {
    left: { x: "-100%" },
    right: { x: "100%" },
    top: { y: "-100%" },
    bottom: { y: "100%" },
  }

  return (
    <AnimatePresence>
      {open && (
        <SheetPortal>
          <SheetOverlay onClick={() => onOpenChange?.(false)} />
          <motion.div
            ref={ref}
            initial={variants[side]}
            animate={{ x: 0, y: 0 }}
            exit={variants[side]}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed z-50 overflow-y-auto bg-background p-6 shadow-2xl",
              side === "left" &&
                "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
              side === "right" &&
                "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
              side === "top" && "inset-x-0 top-0 h-auto border-b",
              side === "bottom" && "inset-x-0 bottom-0 h-auto border-t",
              className
            )}
            {...props}
          >
            {children}
            <button
              onClick={() => onOpenChange?.(false)}
              className="absolute top-4 right-4 rounded-full p-2 opacity-70 transition-opacity hover:bg-accent hover:opacity-100 focus:ring-2 focus:ring-ring focus:outline-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </motion.div>
        </SheetPortal>
      )}
    </AnimatePresence>
  )
})
SheetContent.displayName = "SheetContent"

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetTitle,
}
