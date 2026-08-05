"use client";

import { useSession } from "next-auth/react";
import { Calendar, Users, ScanLine, TrendingUp, Plus } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { StatGrid } from "@/components/shared/CustomCards";
import { Button } from "@/components/ui/button";

import { useDashboardActions } from "@/hooks/useDashboardActions";
import { CreateEventGroupModal } from "@/components/features/dashboard/CreateEventGroupModal";
import { RecentEventGroupsTable } from "@/components/features/dashboard/RecentEventGroupsTable";
import { DashboardSidebar } from "@/components/features/dashboard/DashboardSidebar";

const fieldsGrupEvent = [
  {
    name: "name",
    label: "Nama Event",
    placeholder: "Masukkan nama event",
  },
];

export default function EventAdminDashboard() {
  const { data: session } = useSession();
  const actions = useDashboardActions();

  const stats = [
    { label: "Total Grup Event", value: String(actions.totalEventGroups), icon: Calendar, iconBg: "#dbeafe", iconClass: "text-blue-900" },
    { label: "Total Event", value: String(actions.totalEvents), icon: TrendingUp, iconBg: "#d1fae5", iconClass: "text-emerald-800" },
    { label: "Total Peserta", value: String(actions.totalParticipants), icon: Users, iconBg: "#fef3c7", iconClass: "text-amber-800" },
    { label: "Check-in", value: String(actions.totalCheckIns), icon: ScanLine, iconBg: "#ede9fe", iconClass: "text-violet-800" },
  ];

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
        <Button onClick={() => actions.setOpenCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Buat Grup Event
        </Button>
      </div>

      {/* Summary Cards */}
      <StatGrid>
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconBg={stat.iconBg}
            className="flex-1 min-w-0"
          />
        ))}
      </StatGrid>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <RecentEventGroupsTable groups={actions.recentEventGroups} />
        </div>
        <DashboardSidebar
          totalCheckIns={actions.totalCheckIns}
          totalCheckOuts={actions.totalCheckOuts}
          totalParticipants={actions.totalParticipants}
        />
      </div>

      <CreateEventGroupModal
        open={actions.openCreateModal}
        onOpenChange={actions.setOpenCreateModal}
        form={actions.form}
        onFormChange={actions.setForm}
        errors={actions.errors}
        onErrorsChange={actions.setErrors}
        isLoading={actions.loadingCreate}
        onSubmit={actions.handleCreateEventGroup}
      />
    </div>
  );
}
