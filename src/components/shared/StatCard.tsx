import { CardContent } from "@/components/ui/card";
import { GlassCard } from "@/components/shared/CustomCards";
import { cn } from "@/lib/utils";
import React from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  borderLeftColorClass?: string;
  valueColorClass?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  borderLeftColorClass = "border-l-[var(--brand-primary)]",
  valueColorClass = "text-[var(--brand-primary)]",
  className,
}: StatCardProps) {
  return (
    <GlassCard
      className={cn(
        "w-full shadow-sm border-l-4 hover:shadow-md hover:-translate-y-0.5 duration-300",
        borderLeftColorClass,
        className
      )}
    >
      <CardContent className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-gray-500 text-sm truncate">{title}</p>
            <h3 className={cn("text-xl font-bold mt-0.5", valueColorClass)}>
              {value}
            </h3>
          </div>
          {Icon && (
            <div
              className="p-2.5 rounded-full shrink-0 ml-3"
              style={{ backgroundColor: iconBg || "rgba(15, 30, 54, 0.08)" }}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  valueColorClass || "text-[var(--brand-primary)]"
                )}
              />
            </div>
          )}
        </div>
      </CardContent>
    </GlassCard>
  );
}
