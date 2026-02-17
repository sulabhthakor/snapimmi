import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary-teal-500 text-white hover:bg-primary-teal-600 shadow-md hover:shadow-[0_8px_16px_0_rgba(44,129,141,0.2)] hover:-translate-y-0.5 active:translate-y-0",
                gradient: "bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 text-white shadow-[0_8px_16px_0_rgba(44,129,141,0.2)] hover:shadow-[0_8px_24px_0_rgba(44,129,141,0.3)] hover:-translate-y-0.5 active:translate-y-0",
                glass: "bg-white/70 backdrop-blur-xl border border-white/30 text-gray-900 hover:shadow-[0_8px_32px_0_rgba(44,129,141,0.2)] hover:-translate-y-0.5 active:translate-y-0",
                destructive:
                    "bg-red-500 text-gray-50 hover:bg-red-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
                outline:
                    "border-2 border-primary-teal-500 bg-white text-primary-teal-600 hover:bg-primary-teal-50 hover:-translate-y-0.5 active:translate-y-0",
                secondary:
                    "bg-gray-100 text-gray-900 hover:bg-gray-200 hover:-translate-y-0.5 active:translate-y-0",
                ghost: "hover:bg-primary-teal-50 hover:text-primary-teal-600 active:bg-primary-teal-100",
                link: "text-primary-teal-600 underline-offset-4 hover:underline hover:text-primary-teal-700",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-lg px-3 text-xs",
                lg: "h-12 rounded-xl px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
