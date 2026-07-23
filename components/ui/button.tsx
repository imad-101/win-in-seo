import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#249fd0] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        default: "bg-[#14201c] text-white shadow-[0_4px_12px_rgba(20,32,28,0.16)] hover:bg-[#20332c] hover:shadow-[0_6px_16px_rgba(20,32,28,0.2)]",
        secondary: "bg-[#80ed99] text-[#173a20] hover:bg-[#9af2ad]",
        outline: "border border-[#dfe4df] bg-white text-[#14201c] shadow-sm hover:border-[#cbd4cd] hover:bg-[#f8faf8]",
        ghost: "text-[#66716c] hover:bg-[#eef2ee] hover:text-[#14201c]",
        danger: "bg-[#ff9770] text-[#4b2114] hover:bg-[#ffa98b]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
