import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { defaultValue?: string }>(
  ({ className, defaultValue, children, ...props }, ref) => {
    const [value, setValue] = React.useState(defaultValue)
    
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as any, { value, onValueChange: setValue })
          }
          return child
        })}
      </div>
    )
  }
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1", className)} {...props} />
  )
)
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; activeValue?: string }
>(({ className, value, activeValue, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      value === activeValue ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; activeValue?: string }
>(({ className, value, activeValue, ...props }, ref) => {
  if (value !== activeValue) return null
  
  return (
    <div ref={ref} className={cn("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2", className)} {...props} />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
