import * as React from "react"
import { cn } from "@/lib/utils"

const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center w-full",
      "[&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none",
      "[&>*:not(:first-child):not(:last-child)]:rounded-none",
      "[&>button]:border-l-0",
      className
    )}
    {...props}
  />
))
ButtonGroup.displayName = "ButtonGroup"

export { ButtonGroup }
