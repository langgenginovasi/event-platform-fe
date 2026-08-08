import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * GlassCard
 * Base card dengan estetika glassmorphism — background putih semi-transparan.
 */
export function GlassCard({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <Card
      className={cn(
        "bg-white/70 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl transition-all",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

/**
 * TableCard
 * Untuk tabel — overflow hidden + aksen border atas.
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

/**
 * ContentCard
 * Card generik untuk konten statis (email settings, chart, dll).
 * Tidak ada aksen border — murni content wrapper.
 */
export function ContentCard({ className, children, ...props }: React.ComponentProps<"div">) {
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

/**
 * ContentCardHeader
 * Header bar untuk ContentCard — biasanya berisi judul + icon.
 */
export function ContentCardHeader({
  className,
  icon: Icon,
  title,
  children,
  ...props
}: {
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  children?: React.ReactNode;
} & Omit<React.ComponentProps<"div">, "title">) {
  return (
    <div
      className={cn(
        "p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 text-gray-500" />}
      <h2 className="text-lg font-bold" style={{ color: "var(--brand-primary)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

/**
 * ContentCardBody
 * Body padding untuk ContentCard.
 */
export function ContentCardBody({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * PageHeader
 * Wrapper untuk page-level header dengan konten di dalamnya.
 */
export function PageHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-3 md:space-x-4 md:flex-row md:space-y-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * AccentCard
 * Card dengan background gelap (brand-primary) — untuk CTA, unduh laporan, dll.
 * Berbasis GlassCard dengan dark overlay.
 */
export function AccentCard({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <GlassCard
      className={cn(
        "relative overflow-hidden text-white border-0",
        className
      )}
      style={{ backgroundColor: "var(--brand-primary)" }}
      {...props}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
      <div className="relative z-10">
        {children}
      </div>
    </GlassCard>
  );
}

/**
 * StatGrid
 * Responsive grid untuk stat cards — otomatis 1 kolom di mobile, auto-fill di desktop.
 */
export function StatGrid({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
