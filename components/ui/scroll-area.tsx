import * as React from "react"
import { cn } from "../../lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative overflow-auto", className)}
      {...props}
    >
      {children}
    </div>
  )
)
ScrollArea.displayName = "ScrollArea"

const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex touch-none select-none transition-colors",
      "h-full w-2.5 border-l border-l-transparent p-[1px]",
      className
    )}
    {...props}
  />
))
ScrollBar.displayName = "ScrollBar"

const ScrollAreaViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-full w-full rounded-[inherit]", className)}
    {...props}
  >
    {children}
  </div>
))
ScrollAreaViewport.displayName = "ScrollAreaViewport"

export { ScrollArea, ScrollBar, ScrollAreaViewport }


