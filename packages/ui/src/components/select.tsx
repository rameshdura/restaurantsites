import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

const Select = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    onValueChange?: (value: string) => void
  }
>(
  (
    {
      className,
      value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onValueChange: _onValueChange,
      children,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [selectedValue] = React.useState(value)

    // Find the child element that matches the selected value
    const childrenArray = React.Children.toArray(children)
    const selectedChild = childrenArray
      .filter(React.isValidElement)
      .find(
        (c) =>
          (c as React.ReactElement<{ value: string }>).props.value ===
          selectedValue
      ) as React.ReactElement<{ children?: React.ReactNode }> | undefined

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <div
          className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="flex-1 truncate">
            {selectedChild?.props.children ?? "Select..."}
          </span>
          <div className="ml-2 h-4 w-4 opacity-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
        {isOpen && (
          <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
            {children}
          </div>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("flex-1 truncate text-muted-foreground", className)}
    {...props}
  >
    {children}
  </span>
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-50 min-w-[8rem] animate-in overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md fade-in-0 slide-in-from-top-2",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(
  (
    {
      className,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      value: _value,
      children,
      ...props
    },
    ref
  ) => {
    const [isSelected, setIsSelected] = React.useState(false)

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full cursor-pointer items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground",
          className
        )}
        onClick={() => setIsSelected(!isSelected)}
        {...props}
      >
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>

        <div className="flex-1 truncate">{children}</div>
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
