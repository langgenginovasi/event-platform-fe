import React from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/shared/CustomCards";

/**
 * ScanCard
 * Card untuk workflow berbasis step — QR scan, form multi-step, dll.
 * GlassCard base dengan decorative blur elements.
 */
export function ScanCard({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <GlassCard
      className={cn("p-5 space-y-6 relative overflow-hidden", className)}
      {...props}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-light)] rounded-full blur-3xl opacity-30 -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100 rounded-full blur-2xl opacity-50 -ml-10 -mb-10" />
      <div className="relative z-10 space-y-6">
        {children}
      </div>
    </GlassCard>
  );
}

/**
 * ScanStep
 * Single step dalam ScanCard — numbered circle + title + content.
 */
export function ScanStep({
  step,
  title,
  active = true,
  children,
  className,
  ...props
}: {
  step: number;
  title: string;
  active?: boolean;
} & React.ComponentProps<"div">) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white transition-all shadow-md",
            active
              ? "bg-[var(--brand-primary)] shadow-[var(--brand-primary)]/20"
              : "bg-gray-300 shadow-none"
          )}
        >
          {step}
        </span>
        <h2
          className={cn(
            "font-semibold transition-colors",
            active ? "text-gray-800" : "text-gray-400"
          )}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
