import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border border-primary/20",
        secondary:
          "bg-slate-100 text-foreground border border-slate-200",
        accent:
          "bg-emerald-100 text-emerald-700 border border-emerald-200",
        success:
          "bg-green-100 text-green-700 border border-green-200",
        warning:
          "bg-amber-100 text-amber-700 border border-amber-200",
        danger:
          "bg-red-100 text-red-600 border border-red-200",
        outline:
          "text-foreground-muted border border-slate-200",
        glass:
          "bg-white/80 backdrop-blur-xl text-foreground border border-slate-200 shadow-sm",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
