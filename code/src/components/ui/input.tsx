import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-semibold placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-teal-500 focus-visible:ring-offset-0 focus-visible:border-primary-teal-500 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
