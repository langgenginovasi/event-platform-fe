"use client";

import { useSession } from "next-auth/react";
import { Calendar, Users, ScanLine, TrendingUp, Plus, ChevronRight } from "lucide-react";

type StatCard = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconClass: string;
};

const stats: StatCard[] = [
  {
    label: "Total Grup Event",
    value: "2",
    icon: Calendar,
    iconBg: "#dbeafe",
    iconClass: "text-blue-900",
  },
  {
    label: "Total Event",
    value: "5",
    icon: TrendingUp,
    iconBg: "#d1fae5",
    iconClass: "text-emerald-800",
  },
  {
    label: "Total Peserta",
    value: "128",
    icon: Users,
    iconBg: "#fef3c7",
    iconClass: "text-amber-800",
  },
  {
    label: "Check-in Hari Ini",
    value: "45",
    icon: ScanLine,
    iconBg: "#ede9fe",
    iconClass: "text-violet-800",
  },
];

const recentEventGroups = [
  {
    id: 1,
    name: "Kongres Nasional 2026",
    dates: "1 Agus – 3 Agus 2026",
    status: "Aktif",
    participants: 80,
  },
  {
    id: 2,
    name: "Tech Summit 2026",
    dates: "10 Okt – 12 Okt 2026",
    status: "Mendatang",
    participants: 48,
  },
];

export default function EventAdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-gray-500">
            Selamat datang kembali,{" "}
            <span className="font-semibold" style={{ color: "var(--brand-primary)" }}>
              {session?.user?.name ?? "Admin"}
            </span>
            . Berikut ringkasan acara Anda.
          </p>
        </div>
        <button
          className="flex items-center px-4 py-2 text-white font-semibold text-sm rounded-md shadow-sm transition-all active:scale-[0.99]"
          style={{ backgroundColor: "var(--brand-primary)" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "var(--brand-light)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "var(--brand-primary)")
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Buat Grup Event
        </button>
      </div>

      {/* Summary Cards — same style as eventfe-platform-fe */}
      <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="card-base card-border-primary w-full p-4 md:w-1/4 lg:w-1/5"
            >
              <div
                className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3"
                style={{ backgroundColor: stat.iconBg }}
              >
                <Icon className={`h-5 w-5 ${stat.iconClass}`} />
              </div>
              <p className="font-semibold text-gray-500 md:text-sm lg:text-base">
                {stat.label}
              </p>
              <h3
                className="text-lg font-bold md:text-xl"
                style={{ color: "var(--brand-primary)" }}
              >
                {stat.value}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Event Groups Table */}
        <div className="lg:col-span-2">
          <div className="card-base overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--brand-primary)" }}
              >
                Grup Event
              </h2>
              <a
                href="/dashboard/event-group"
                className="text-sm font-semibold transition-colors"
                style={{ color: "var(--brand-light)" }}
              >
                Lihat Semua
              </a>
            </div>

            <div className="divide-y divide-gray-100">
              {recentEventGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50 group cursor-pointer"
                >
                  <div>
                    <h3
                      className="text-base font-semibold text-gray-800 group-hover:transition-colors"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {group.dates}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        group.status === "Aktif"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                      style={
                        group.status !== "Aktif"
                          ? { color: "var(--brand-primary)" }
                          : {}
                      }
                    >
                      {group.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-5">
          {/* Download card */}
          <div
            className="rounded-md p-6 text-white relative overflow-hidden"
            style={{
              backgroundColor: "var(--brand-primary)",
              boxShadow: "0 .15rem 1.75rem 0 rgba(58,59,69,.15)",
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
            <h3 className="text-base font-bold mb-1 relative z-10">
              Unduh Laporan
            </h3>
            <p className="text-sm relative z-10" style={{ color: "rgba(255,255,255,0.65)" }}>
              Rekapitulasi kehadiran harian untuk semua event yang berjalan.
            </p>
            <button
              className="mt-4 w-full py-2.5 rounded-md text-sm font-semibold transition-colors relative z-10"
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "rgba(255,255,255,0.2)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "rgba(255,255,255,0.12)")
              }
            >
              Download CSV
            </button>
          </div>

          {/* Stats mini card */}
          <div className="card-base p-5">
            <h3
              className="text-sm font-bold mb-3"
              style={{ color: "var(--brand-primary)" }}
            >
              Ringkasan Hari Ini
            </h3>
            <div className="space-y-3">
              {[
                { label: "Check-in", value: "45", pct: 35 },
                { label: "Check-out", value: "22", pct: 17 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 font-medium">{item.label}</span>
                    <span
                      className="font-bold"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      {item.value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${item.pct}%`,
                        backgroundColor: "var(--brand-primary)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
