"use client";

import { Search, Plus, Import, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCard } from "@/components/shared/CustomCards";
import { StatCard } from "@/components/shared/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn, formatGender } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { PaginationFooter } from "@/components/shared/PaginationFooter";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { InlineSaveCancelButtons } from "@/components/features/workspace/Registration/InlineSaveCancelButtons";

import { useParticipantActions } from "@/hooks/useParticipantActions";
import { ParticipantBulkActionBar } from "@/components/features/participant/ParticipantBulkActionBar";
import { CreateParticipantModal } from "@/components/features/participant/CreateParticipantModal";
import { EditParticipantModal } from "@/components/features/participant/EditParticipantModal";
import { ImportExcelModal } from "@/components/features/participant/ImportExcelModal";
import { AddToEventGroupModal } from "@/components/features/participant/AddToEventGroupModal";
import { DetailParticipantModal } from "@/components/features/participant/DetailParticipantModal";
import { TableBodyStates } from "@/components/shared/TableBodyStates";

const fieldsParticipantManual = [
  {
    name: "name",
    label: "Nama Lengkap",
    placeholder: "Masukkan nama lengkap",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Masukkan email",
    type: "email" as const,
  },
  {
    name: "gender",
    label: "Jenis Kelamin",
    type: "select" as const,
    options: [
      {
        label: "Laki-laki",
        value: "L",
      },
      {
        label: "Perempuan",
        value: "P",
      },
    ],
  },
  {
    name: "company",
    label: "Perusahaan",
    placeholder: "Masukkan nama perusahaan",
  },
];

export default function ParticipantPage() {
  const { can } = usePermissions();
  const actions = useParticipantActions();

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* ── Summary Cards ─────────────────────────────────────────── */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-3 sm:space-x-4 sm:flex-row sm:space-y-0">
          <StatCard
            title="Total Peserta Master"
            value={actions.meta?.total || 0}
            className="w-full sm:w-1/3 lg:w-1/4"
          />
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <TableCard>
        <div className="p-5 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--brand-primary)" }}
          >
            Daftar Peserta
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari peserta..."
                className="pl-9 bg-slate-50 focus-visible:ring-primary h-10 w-full"
                value={actions.keyword}
                onChange={(e) => actions.setKeyword(e.target.value)}
              />
            </div>

            {can("participantManage") && (
              <Button
                onClick={() => actions.setOpenCreateModal(true)}
                className="whitespace-nowrap w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Peserta
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => actions.setOpenImportModal(true)}
              className="whitespace-nowrap w-full sm:w-auto text-green-700 border-green-300 hover:bg-green-50"
            >
              <Import className="w-4 h-4 mr-1" />
              Import Excel
            </Button>
          </div>
        </div>

        <ParticipantBulkActionBar
          selectedCount={actions.selectedIds.length}
          onAddToGroup={() => actions.setOpenEventGroupModal(true)}
        />

        {/* Data Table */}
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={!!(actions.participant.length > 0 && actions.selectedIds.length === actions.participant.length)}
                    onCheckedChange={(checked) => actions.handleSelectAll(actions.participant, checked as boolean)}
                  />
                </TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>Perusahaan</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Keanggotaan</TableHead>
                <TableHead className="text-right">Opsi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableBodyStates isLoading={actions.isLoading} isEmpty={actions.participant.length === 0} colSpan={7} emptyMessage="Tidak ada data peserta" />

              {!actions.isLoading && actions.participant.map((p) => {
                const isSelected = actions.selectedIds.includes(p.id);
                return (
                  <TableRow
                    key={p.id}
                    className={cn(isSelected && "bg-blue-50/50 hover:bg-blue-50/70")}
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => actions.handleSelectOne(p.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold" style={{ color: "var(--brand-primary)" }}>
                      {p.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatGender(p.gender)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.company}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {actions.editingParticipantIdInline === p.id ? (
                        <div className="flex items-center gap-1">
                          <Select
                            value={actions.editMembershipValue}
                            onValueChange={(val) =>
                              actions.setEditMembershipValue(
                                val === "__none__" ? "" : String(val)
                              )
                            }
                          >
                            <SelectTrigger className="h-8 w-[140px] text-xs">
                              <span className="truncate">
                                {actions.editMembershipValue
                                  ? actions.membershipTypes.find(
                                      (mt: any) => String(mt.id) === actions.editMembershipValue
                                    )?.name || "-"
                                  : "-- Tidak Ditentukan --"}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">-- Tidak Ditentukan --</SelectItem>
                              {actions.membershipTypes.map((mt: any) => (
                                <SelectItem key={mt.id} value={String(mt.id)}>
                                  {mt.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <InlineSaveCancelButtons
                            isLoading={actions.loadingEditMembershipId === p.id}
                            onSave={() => actions.handleSaveInlineMembershipType(p.id)}
                            onCancel={actions.handleCancelInlineEdit}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-sm text-foreground">
                            {p.membership_type?.name || (
                              <span className="text-muted-foreground italic">-</span>
                            )}
                          </span>
                          {can("participantManage") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 shrink-0 text-slate-600"
                              onClick={() => actions.handleStartInlineEdit(p)}
                              title="Ubah tipe keanggotaan"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {can("participantManage") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => actions.handleOpenEditModal(p)}
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Ubah
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            actions.setSelectedParticipantId(p.id);
                            actions.setIsDetailModalOpen(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Lihat
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <PaginationFooter
          currentPage={actions.currentPage}
          totalPage={actions.meta?.total_pages || 1}
          totalData={actions.meta?.total || 0}
          onPrev={() => actions.setCurrentPage((p) => Math.max(1, p - 1))}
          onNext={() => actions.setCurrentPage((p) => Math.min(actions.meta?.total_pages || 1, p + 1))}
          onPageChange={(p) => actions.setCurrentPage(p)}
        />
      </TableCard>

      {/* ── Modals ────────────────────────────────────────────────── */}
      <ImportExcelModal
        open={actions.openImportModal}
        onOpenChange={actions.setOpenImportModal}
        excelData={actions.excelData}
        onExcelDataChange={actions.setExcelData}
        fileName={actions.fileName}
        onFileNameChange={actions.setFileName}
        fileInputRef={actions.fileInputRef}
        onFileChange={actions.handleFileChange}
        isLoading={actions.loadingImport}
        onImport={actions.handleSaveImportedData}
        onClose={actions.handleCloseImportModal}
      />

      <CreateParticipantModal
        open={actions.openCreateModal}
        onOpenChange={actions.setOpenCreateModal}
        form={actions.form}
        onFormChange={actions.setForm}
        errors={actions.errors}
        onErrorsChange={actions.setErrors}
        membershipTypes={actions.membershipTypes}
        isLoading={actions.loadingCreate}
        onSubmit={actions.handleCreateParticipant}
      />

      <EditParticipantModal
        open={actions.openEditModal}
        onOpenChange={actions.setOpenEditModal}
        form={actions.editForm}
        onFormChange={actions.setEditForm}
        errors={actions.editErrors}
        onErrorsChange={actions.setEditErrors}
        membershipTypes={actions.membershipTypes}
        isLoading={actions.loadingEdit}
        onSubmit={actions.handleUpdateParticipant}
      />

      <AddToEventGroupModal
        open={actions.openEventGroupModal}
        onOpenChange={actions.setOpenEventGroupModal}
        selectedCount={actions.selectedIds.length}
        eventGroups={actions.eventGroups}
        selectedEventGroupId={actions.selectedEventGroupId}
        onEventGroupChange={actions.setSelectedEventGroupId}
        isLoading={actions.loadingAddToGroup}
        onSubmit={actions.handleAddToEventGroup}
      />

      <DetailParticipantModal
        open={actions.isDetailModalOpen}
        onOpenChange={actions.setIsDetailModalOpen}
        isLoading={actions.isLoadingDetail}
        detail={actions.participantDetail}
        expandedGroups={actions.expandedGroups}
        onToggleExpand={(idx) => actions.setExpandedGroups(prev => ({ ...prev, [idx]: !prev[idx] }))}
      />
    </div>
  );
}
