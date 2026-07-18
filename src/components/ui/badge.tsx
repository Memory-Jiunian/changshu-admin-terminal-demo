import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-[3px] focus:ring-primary/20",
  {
    variants: {
      variant: {
        default:
          "border-[var(--primary-100)] bg-[var(--primary-50)] text-[var(--primary-600)]",
        secondary:
          "border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]",
        destructive:
          "border-[var(--danger-100)] bg-[var(--danger-50)] text-[var(--danger-600)]",
        outline: "border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
