import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'teal' | 'navy';
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-transparent",
    teal: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
    navy: "bg-slate-900 text-white border-transparent",
    success: "bg-emerald-100 text-emerald-800 border-emerald-300 font-medium",
    warning: "bg-amber-100 text-amber-800 border-amber-300 font-medium",
    danger: "bg-rose-100 text-rose-800 border-rose-300 font-medium",
    outline: "border-slate-200 text-slate-600 bg-white",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
