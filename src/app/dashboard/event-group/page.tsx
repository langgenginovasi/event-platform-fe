"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCard } from "@/components/shared/CustomCards";
import { StatCard } from "@/components/shared/StatCard";
import { Input } from "@/components/ui/input";
import { usePermissions } from "@/hooks/usePermissions";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { PaginationFooter } from "@/components/shared/PaginationFooter";

import { useEventGroupPageActions } from "@/hooks/useEventGroupPageActions";
import { CreateEventGroupModal } from "@/components/features/dashboard/CreateEventGroupModal";
import { EventGroupTable } from "@/components/features/event-group/EventGroupTable";

export default function EventGroupPage() {
  const { can } = usePermissions();
  const actions = useEventGroupPageActions();

  const filteredItems = actions.eventGroups
    .filter((item: any) => {
      const search = actions.keyword.toLowerCase();
      const eventText = `${item._count?.events ?? 0} event`.toLowerCase();
      const participantText = `${item._count?.registrations ?? 0} peserta`.toLowerCase();
      return (
        item.name?.toLowerCase().includes(search) ||
        String(item.id).toLowerCase().includes(search) ||
        new Date(item.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }).toLowerCase().includes(search) ||
        new Date(item.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }).toLowerCase().includes(search) ||
        eventText.includes(search) ||
        participantText.includes(search)
      );
    })
    .map((item: any) => ({
      id: item.id,
      name: item.name,
      description: `${item._count?.events ?? 0} Event`,
      date_start: new Date(item.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      date_end: new Date(item.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      participants: item._count?.registrations ?? 0,
    }));

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      <div className="flex flex-col space-y-3 md:space-x-4 md:flex-row md:space-y-0">
        <div className="w-full md:w-1/4 lg:w-1/5">
          <StatCard title="Total Grup Event" value={actions.totalEventGroups} />
        </div>
      </div>

      <TableCard>
        <div className="p-5 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--brand-primary)" }}>
            Daftar Grup Event
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari grup event..."
                className="pl-9 bg-slate-50 focus-visible:ring-primary h-10 w-full"
                value={actions.keyword}
                onChange={(e) => actions.setKeyword(e.target.value)}
              />
            </div>
            {can("eventGroupManage") && (
              <Button
                onClick={() => actions.setOpenCreateModal(true)}
                className="whitespace-nowrap w-full sm:w-auto text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Grup Event
              </Button>
            )}
          </div>
        </div>

        <EventGroupTable
          items={filteredItems}
          isLoading={actions.isLoading}
          onDelete={(id) => actions.openDelete(id)}
        />

        <PaginationFooter
          currentPage={1}
          totalPage={1}
          totalData={filteredItems.length}
        />
      </TableCard>

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

      <ConfirmationDialog
        open={actions.isOpen}
        onOpenChange={actions.setIsOpen}
        title="Hapus Grup Event"
        description="Apakah Anda yakin ingin menghapus grup event ini? Semua data terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        variant="danger"
        isLoading={actions.isDeleting}
        onConfirm={actions.confirmDelete}
      />
    </div>
  );
}
