"use client";

import { Button } from "@/components/ui/button";
import { GlassCard, AccentCard } from "@/components/shared/CustomCards";

interface DashboardSidebarProps {
  totalCheckIns: number;
  totalCheckOuts: number;
  totalParticipants: number;
}

export function DashboardSidebar({
  totalCheckIns,
  totalCheckOuts,
  totalParticipants,
}: DashboardSidebarProps) {
  return (
    <div className="space-y-5">
      <AccentCard className="p-6">
        <h3 className="text-base font-bold mb-1">Unduh Laporan</h3>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
          Rekapitulasi kehadiran harian untuk semua event yang berjalan.
        </p>
        <Button
          variant="outline"
          className="mt-4 w-full"
          style={{
            backgroundColor: "rgba(255,255,255,0.12)",
            borderColor: "rgba(255,255,255,0.2)",
            color: "#fff",
          }}
        >
          Download CSV
        </Button>
      </AccentCard>

      <GlassCard className="p-5">
        <h3
          className="text-sm font-bold mb-3"
          style={{ color: "var(--brand-primary)" }}
        >
          Ringkasan Hari Ini
        </h3>
        <div className="space-y-3">
          {[
            {
              label: "Check-In",
              value: String(totalCheckIns),
              pct: totalParticipants > 0
                ? Math.min(Math.round((totalCheckIns / totalParticipants) * 100), 100)
                : 0,
            },
            {
              label: "Check-Out",
              value: String(totalCheckOuts),
              pct: totalParticipants > 0
                ? Math.min(Math.round((totalCheckOuts / totalParticipants) * 100), 100)
                : 0,
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 font-medium">{item.label}</span>
                <span className="font-bold" style={{ color: "var(--brand-primary)" }}>
                  {item.value}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${item.pct}%`, backgroundColor: "var(--brand-primary)" }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
