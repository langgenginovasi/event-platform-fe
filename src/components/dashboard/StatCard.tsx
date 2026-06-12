import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  borderLeftColorClass?: string;
  valueColorClass?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  borderLeftColorClass = "border-l-[var(--brand-primary)]",
  valueColorClass = "text-[var(--brand-primary)]",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("w-full shadow-sm border-l-4", borderLeftColorClass, className)}>
      <CardContent className="p-4 sm:p-5">
        <p className="font-semibold text-gray-500 text-sm">{title}</p>
        <h3 className={cn("text-xl sm:text-2xl font-bold mt-1", valueColorClass)}>
          {value}
        </h3>
      </CardContent>
    </Card>
  );
}
