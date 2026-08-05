"use client";

import { CalendarDays, Users, ScanLine } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";

interface WorkspaceSummaryCardsProps {
  totalSubEvents: number;
  totalRegistrations: number;
  totalAttendances: number;
}

export function WorkspaceSummaryCards({
  totalSubEvents,
  totalRegistrations,
  totalAttendances,
}: WorkspaceSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Total Event"
        value={totalSubEvents}
        icon={CalendarDays}
        iconBg="rgba(59, 130, 246, 0.1)"
        valueColorClass="text-[var(--brand-primary)]"
      />
      <StatCard
        title="Total Registrasi"
        value={totalRegistrations}
        icon={Users}
        borderLeftColorClass="border-l-amber-500"
        valueColorClass="text-amber-600"
        iconBg="rgba(245, 158, 11, 0.1)"
      />
      <StatCard
        title="Total Kehadiran"
        value={totalAttendances}
        icon={ScanLine}
        borderLeftColorClass="border-l-emerald-500"
        valueColorClass="text-emerald-600"
        iconBg="rgba(16, 185, 129, 0.1)"
      />
    </div>
  );
}
