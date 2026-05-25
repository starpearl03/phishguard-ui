import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/src/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-wider [&_svg]:size-3 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-muted text-muted-foreground",
                outline: "border border-border text-foreground/80",
                success:
                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                warning:
                    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                destructive: "bg-destructive/10 text-destructive",
                info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                primary: "bg-primary/10 text-primary",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({
    className,
    variant,
    ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
    return (
        <span
            data-slot="badge"
            data-variant={variant}
            className={cn(badgeVariants({ variant, className }))}
            {...props}
        />
    )
}

export { Badge, badgeVariants }
