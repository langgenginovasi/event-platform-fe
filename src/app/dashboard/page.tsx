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

import { Button } from "@/components/ui/button";
import DynamicModal from "@/components/ui/Dynamic-Modal";

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

const fieldsGrupEvent = [
  {
    name: "name",
    label: "Nama Event",
    placeholder: "Masukkan nama event",
  },
];

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
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    start_date: "",
    end_date: "",
    api: "",
  });

  const handleCreateEventGroup = async () => {
    console.log("CLICK SIMPAN");
    const newErrors = { name: "", start_date: "", end_date: "", api: "" };

    if (!form.name.trim()) newErrors.name = "Nama event wajib diisi";
    if (!form.start_date) newErrors.start_date = "Tanggal mulai wajib diisi";
    if (!form.end_date) newErrors.end_date = "Tanggal selesai wajib diisi";

    setErrors(newErrors);
    if (newErrors.name || newErrors.start_date || newErrors.end_date) return;

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
          ...newErrors,
          api:
            response?.error || response?.message || "Gagal membuat event group",
        });
        return;
      }

      await mutate(GET_EVENT_GROUPS());
      toast.success("Grup Event berhasil dibuat!");

      setForm({ name: "", start_date: "", end_date: "" });
      setOpenCreateModal(false);
    } catch (error: any) {
      setErrors({
        ...newErrors,
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
  const today = new Date();

  const recentEventGroups = [...eventGroups]
    .filter((group: any) => new Date(group.end_date) >= today)
    .sort((a: any, b: any) => {
      const aStart = new Date(a.start_date);
      const aEnd = new Date(a.end_date);
      const bStart = new Date(b.start_date);
      const bEnd = new Date(b.end_date);

      const aActive = aStart <= today && aEnd >= today;
      const bActive = bStart <= today && bEnd >= today;

      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      return aStart.getTime() - bStart.getTime();
    })
    .slice(0, 5);

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

        {/* Tombol memicu modal menggunakan komponen Button custom */}
        <Button size="lg" onClick={() => setOpenCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Buat Grup Event
        </Button>
      </div>

      {/* Summary Cards */}
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
                        {new Date(group.start_date).toLocaleDateString(
                          "id-ID",
                        )}{" "}
                        - {new Date(group.end_date).toLocaleDateString("id-ID")}
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

        {/* Quick Actions & Mini Stats */}
        <div className="space-y-5">
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
            >
              Download CSV
            </button>
          </div>

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
                    {/* PERBAIKAN: Menggunakan kurung tunggal agar tidak dianggap objek literal oleh TypeScript */}
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

      {/* ─── IMPLEMENTASI REUSABLE DYNAMIC MODAL ─── */}
      <DynamicModal
        title="Buat Grup Event"
        confirmLabel="Simpan"
        showDates={true}
        fields={fieldsGrupEvent}
        formState={form}
        setFormState={setForm}
        errors={errors}
        isOpen={openCreateModal}
        isLoading={loadingCreate}
        onClose={() => {
          setOpenCreateModal(false);

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
        }}
        onConfirm={handleCreateEventGroup}
      />
    </div>
  );
}
