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
          "bg-white/5 text-foreground border border-white/10",
        accent:
          "bg-[#40c79a]/10 text-[#40c79a] border border-[#40c79a]/20",
        success:
          "bg-[#40c79a]/10 text-[#40c79a] border border-[#40c79a]/20",
        warning:
          "bg-[#c7aa00]/10 text-[#c7aa00] border border-[#c7aa00]/20",
        danger:
          "bg-red-500/10 text-red-400 border border-red-500/20",
        outline:
          "text-foreground-muted border border-white/10",
        glass:
          "bg-white/5 backdrop-blur-xl text-foreground border border-white/10",
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
