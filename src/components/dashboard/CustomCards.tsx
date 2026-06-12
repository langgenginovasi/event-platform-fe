import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Base GlassCard
 * Mengembalikan estetika glassmorphism bawaan tanpa menggunakan globals.css
 */
export function GlassCard({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <Card 
      className={cn(
        "bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl transition-all",
        className
      )} 
      {...props}
    >
      {children}
    </Card>
  );
}

/**
 * AnalyticCard
 * Khusus untuk statistik/analytic dengan aksen border kiri
 */
export function AnalyticCard({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <GlassCard 
      className={cn(
        "border-l-4 border-l-[var(--brand-primary)] hover:shadow-md hover:-translate-y-1 duration-300",
        className
      )} 
      {...props}
    >
      {children}
    </GlassCard>
  );
}

/**
 * TableCard
 * Khusus untuk tabel dengan overflow hidden dan aksen border atas
 */
export function TableCard({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <GlassCard 
      className={cn(
        "overflow-hidden border-t-4 border-t-[var(--brand-primary)]",
        className
      )} 
      {...props}
    >
      {children}
    </GlassCard>
  );
}
