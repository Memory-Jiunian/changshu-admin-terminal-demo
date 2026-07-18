import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,border-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:pointer-events-none disabled:border-[var(--border-default)] disabled:bg-[var(--bg-subtle)] disabled:text-[var(--text-disabled)] disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary-600)] text-white shadow-sm hover:bg-[var(--primary-500)]",
        destructive:
          "bg-[var(--danger-600)] text-white shadow-sm hover:bg-[var(--danger-500)]",
        outline:
          "border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm hover:border-[var(--primary-200)] hover:bg-[var(--primary-50)] hover:text-[var(--primary-600)]",
        secondary:
          "border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)] shadow-sm hover:border-[var(--primary-200)] hover:bg-[var(--primary-50)]",
        ghost: "text-[var(--text-secondary)] hover:bg-[var(--primary-50)] hover:text-[var(--primary-600)]",
        link: "text-[var(--primary-600)] underline-offset-4 hover:text-[var(--primary-500)] hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
