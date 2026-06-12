"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  ScanLine,
  TrendingUp,
  Plus,
  ChevronRight,
} from "lucide-react";

import {
  GET_EVENT_GROUPS,
  GET_EVENTS,
  GET_REGISTRATIONS,
  GET_ATTENDANCES,
} from "@/lib/api-endpoints";

type StatCard = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconClass: string;
};

export default function EventAdminDashboard() {
  const { data: eventGroupsRes } = useSWR(GET_EVENT_GROUPS());
  const { data: eventsRes } = useSWR(GET_EVENTS());
  const { data: registrationsRes } = useSWR(GET_REGISTRATIONS());
  const { data: attendancesRes } = useSWR(GET_ATTENDANCES());

  const eventGroups = eventGroupsRes?.data ?? [];
  const events = eventsRes?.data ?? [];
  const registrations = registrationsRes?.data ?? [];
  const attendances = attendancesRes?.data ?? [];

  const totalEventGroups = eventGroups.length;
  const totalEvents = events.length;
  const totalParticipants = registrations.length;

  const { data: session } = useSession();
  const router = useRouter();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });

  const [loadingCreate, setLoadingCreate] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    start_date: "",
    end_date: "",
    api: "",
  });

  const handleCreateEventGroup = async () => {
    const newErrors = {
      name: "",
      start_date: "",
      end_date: "",
      api: "",
    };

    if (!form.name.trim()) {
      newErrors.name = "Nama event wajib diisi";
    }

    if (!form.start_date) {
      newErrors.start_date = "Tanggal mulai wajib diisi";
    }

    if (!form.end_date) {
      newErrors.end_date = "Tanggal selesai wajib diisi";
    }

    setErrors(newErrors);

    if (newErrors.name || newErrors.start_date || newErrors.end_date) {
      return;
    }

    try {
      setLoadingCreate(true);

      const payload = {
        name: form.name,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/event-groups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const response = await res.json();

      if (!res.ok) {
        setErrors({
          name: "",
          start_date: "",
          end_date: "",
          api:
            response?.error || response?.message || "Gagal membuat event group",
        });

        return;
      }

      await mutate(GET_EVENT_GROUPS());

      setForm({
        name: "",
        start_date: "",
        end_date: "",
      });

      setErrors({
        name: "",
        start_date: "",
        end_date: "",
        api: "",
      });

      setOpenCreateModal(false);
    } catch (error: any) {
      setErrors({
        name: "",
        start_date: "",
        end_date: "",
        api: error?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoadingCreate(false);
    }
  };

  const totalCheckIns = attendances.filter(
    (item: any) => item.type === "checkin",
  ).length;

  const totalCheckOuts = attendances.filter(
    (item: any) => item.type === "checkout",
  ).length;

  // const recentEventGroups = eventGroups;
  const today = new Date();

  const recentEventGroups = [...eventGroups]
    .filter((group: any) => {
      // hanya tampilkan event yang belum selesai
      return new Date(group.end_date) >= today;
    })
    .sort((a: any, b: any) => {
      const aStart = new Date(a.start_date);
      const aEnd = new Date(a.end_date);

      const bStart = new Date(b.start_date);
      const bEnd = new Date(b.end_date);

      const aActive = aStart <= today && aEnd >= today;
      const bActive = bStart <= today && bEnd >= today;

      // event aktif selalu di atas
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      // setelah itu urut berdasarkan tanggal mulai terdekat
      return aStart.getTime() - bStart.getTime();
    })
    .slice(0, 5);

  useEffect(() => {
    console.log("========== DASHBOARD DEBUG ==========");

    console.log("EVENT GROUPS");
    console.table(eventGroups);

    console.log("EVENTS");
    console.table(events);

    console.log("REGISTRATIONS");
    console.table(registrations);

    console.log("ATTENDANCES");
    console.table(attendances);

    console.log("SUMMARY");
    console.log("Total Event Groups:", totalEventGroups);
    console.log("Total Events:", totalEvents);
    console.log("Total Participants:", totalParticipants);
    console.log("Total Checkins:", totalCheckIns);
    console.log("Total Checkouts:", totalCheckOuts);

    console.log("====================================");
  }, [
    eventGroups,
    events,
    registrations,
    attendances,
    totalEventGroups,
    totalEvents,
    totalParticipants,
    totalCheckIns,
    totalCheckOuts,
  ]);

  const stats: StatCard[] = [
    {
      label: "Total Grup Event",
      value: String(totalEventGroups),
      icon: Calendar,
      iconBg: "#dbeafe",
      iconClass: "text-blue-900",
    },
    {
      label: "Total Event",
      value: String(totalEvents),
      icon: TrendingUp,
      iconBg: "#d1fae5",
      iconClass: "text-emerald-800",
    },
    {
      label: "Total Peserta",
      value: String(totalParticipants),
      icon: Users,
      iconBg: "#fef3c7",
      iconClass: "text-amber-800",
    },
    {
      label: "Check-in",
      value: String(totalCheckIns),
      icon: ScanLine,
      iconBg: "#ede9fe",
      iconClass: "text-violet-800",
    },
  ];

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-gray-500">
            Selamat datang kembali,{" "}
            <span
              className="font-semibold"
              style={{ color: "var(--brand-primary)" }}
            >
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
          onClick={() => setOpenCreateModal(true)}
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
              {recentEventGroups.map((group: any) => {
                const today = new Date();

                const status =
                  new Date(group.start_date) <= today &&
                  new Date(group.end_date) >= today
                    ? "Aktif"
                    : "Mendatang";

                return (
                  <div
                    key={group.id}
                    onClick={() =>
                      router.push(`/dashboard/event-group/${group.id}`)
                    }
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50 group cursor-pointer"
                  >
                    <div>
                      <h3
                        className="text-base font-semibold text-gray-800 group-hover:transition-colors"
                        style={{ color: "var(--brand-primary)" }}
                      >
                        {group.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {group._count?.registrations ?? 0} peserta
                      </p>

                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {/* {group.dates} */}

                        {new Date(group.start_date).toLocaleDateString("id-ID")}
                        {" - "}
                        {new Date(group.end_date).toLocaleDateString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          status === "Aktif"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-blue-50 border-blue-200"
                        }`}
                        style={
                          status !== "Aktif"
                            ? { color: "var(--brand-primary)" }
                            : {}
                        }
                      >
                        {status}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </div>
                );
              })}
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
            <p
              className="text-sm relative z-10"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
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
                {
                  label: "Check-In",
                  value: String(totalCheckIns),
                  pct:
                    totalParticipants > 0
                      ? Math.min(
                          Math.round((totalCheckIns / totalParticipants) * 100),
                          100,
                        )
                      : 0,
                },
                {
                  label: "Check-Out",
                  value: String(totalCheckOuts),
                  pct:
                    totalParticipants > 0
                      ? Math.min(
                          Math.round(
                            (totalCheckOuts / totalParticipants) * 100,
                          ),
                          100,
                        )
                      : 0,
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 font-medium">
                      {item.label}
                    </span>
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

      {openCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Buat Grup Event</h2>

            <div className="space-y-4">
              {errors.api && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {errors.api}
                </div>
              )}

              <div>
                <input
                  type="text"
                  placeholder="Nama Event"
                  value={form.name}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      name: e.target.value,
                    });

                    setErrors({
                      ...errors,
                      name: "",
                    });
                  }}
                  className={`w-full rounded px-3 py-2 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />

                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <input
                  type="datetime-local"
                  value={form.start_date}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      start_date: e.target.value,
                    });

                    setErrors({
                      ...errors,
                      start_date: "",
                    });
                  }}
                  className={`w-full rounded px-3 py-2 border ${
                    errors.start_date ? "border-red-500" : "border-gray-300"
                  }`}
                />

                {errors.start_date && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.start_date}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      end_date: e.target.value,
                    });

                    setErrors({
                      ...errors,
                      end_date: "",
                    });
                  }}
                  className={`w-full rounded px-3 py-2 border ${
                    errors.end_date ? "border-red-500" : "border-gray-300"
                  }`}
                />

                {errors.end_date && (
                  <p className="mt-1 text-xs text-red-500">{errors.end_date}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setOpenCreateModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Batal
              </button>

              <button
                onClick={handleCreateEventGroup}
                disabled={loadingCreate}
                className="px-4 py-2 text-white rounded-md"
                style={{
                  backgroundColor: "var(--brand-primary)",
                }}
              >
                {loadingCreate ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
