"use client";

import { useParams } from "next/navigation";
import {
  Search,
  Eye,
  ArrowUpDown,
  UserPlus,
  Trash2,
  Mail,
  ChevronDown,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCard } from "@/components/shared/CustomCards";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { StatCard } from "@/components/shared/StatCard";
import { TableToolbar } from "@/components/shared/TableToolbar";
import { PaginationFooter } from "@/components/shared/PaginationFooter";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";

import { useRegistrationActions } from "@/hooks/useRegistrationActions";
import {
  countEventsAttended,
  isFullyCheckedIn,
  isFullyCheckedOut,
  hasNotCheckedIn,
} from "@/lib/registration-helpers";

import { BulkActionBar } from "@/components/features/workspace/Registration/BulkActionBar";
import { AddParticipantModal } from "@/components/features/workspace/Registration/AddParticipantModal";
import { CheckInEventModal } from "@/components/features/workspace/Registration/CheckInEventModal";
import { DetailRegistrationModal } from "@/components/features/workspace/Registration/DetailRegistrationModal";
import { InlineSaveCancelButtons } from "@/components/features/workspace/Registration/InlineSaveCancelButtons";
import { SendEmailModal } from "@/components/features/workspace/Registration/SendEmailModal";
import { TableBodyStates } from "@/components/shared/TableBodyStates";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

export default function RegistrationPage() {
  const { id } = useParams() as { id: string };
  const { can } = usePermissions();
  const canBulk = can("registrationManage");

  const reg = useRegistrationActions(id);

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* ── Summary Cards ──────────────────────────────────────────── */}
      <div className="flex flex-col space-y-3 sm:space-x-4 sm:flex-row sm:space-y-0">
        <div className="w-full sm:w-1/3 lg:w-1/4">
          <StatCard title="Total Registrasi" value={reg.allRegistrationsRes?.meta?.total || reg.allRegistrations.length || 0} />
        </div>
        <div className="w-full sm:w-1/3 lg:w-1/4">
          <StatCard
            title="Total Hadir"
            value={
              reg.allRegistrations.filter((p) => countEventsAttended(p.attendances) > 0).length
            }
            borderLeftColorClass="border-l-emerald-500"
            valueColorClass="text-emerald-600"
          />
        </div>
        <div className="w-full sm:w-1/3 lg:w-1/4">
          <StatCard
            title="Belum Hadir"
            value={
              reg.allRegistrations.filter((p) => countEventsAttended(p.attendances) === 0).length
            }
            borderLeftColorClass="border-l-rose-500"
            valueColorClass="text-rose-600"
          />
        </div>
      </div>

      {/* ── Data Table ─────────────────────────────────────────────── */}
      <TableCard>
        <TableToolbar
          title="Registrasi Peserta"
          keyword={reg.keyword}
          setKeyword={reg.setKeyword}
          searchPlaceholder="Cari peserta (nama / email)..."
          actionButton={
            can("registrationManage") && (
              <Button
                onClick={() => reg.handleOpenAddModal()}
                className="whitespace-nowrap w-full"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Tambah Peserta
              </Button>
            )
          }
        />

        <BulkActionBar
          selectedCount={canBulk ? reg.selectedIds.length : 0}
          onSendEmail={canBulk ? reg.handleBulkSendEmail : undefined}
          onCheckIn={canBulk ? reg.handleBulkCheckIn : undefined}
          onCheckOut={canBulk ? reg.handleBulkCheckOut : undefined}
          onDelete={canBulk ? reg.handleBulkDelete : undefined}
        />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                {canBulk && (
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={
                        !!(
                          reg.data?.data &&
                          reg.data.data.length > 0 &&
                          reg.selectedIds.length === reg.data.data.length
                        )
                      }
                      onCheckedChange={(checked) => reg.handleSelectAll(reg.data?.data ?? [], checked as boolean)}
                    />
                  </TableHead>
                )}
                <TableHead
                  onClick={() => reg.handleSort("name")}
                  className="cursor-pointer group"
                >
                  <div className="flex items-center">
                    Nama Peserta{" "}
                    <ArrowUpDown
                      className={cn(
                        "ml-2 h-3.5 w-3.5 transition-opacity",
                        reg.sortField === "name" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}
                    />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => reg.handleSort("gender")}
                  className="cursor-pointer group"
                >
                  <div className="flex items-center">
                    L/P{" "}
                    <ArrowUpDown
                      className={cn(
                        "ml-2 h-3.5 w-3.5 transition-opacity",
                        reg.sortField === "gender"
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      )}
                    />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => reg.handleSort("company")}
                  className="cursor-pointer group"
                >
                  <div className="flex items-center">
                    Perusahaan{" "}
                    <ArrowUpDown
                      className={cn(
                        "ml-2 h-3.5 w-3.5 transition-opacity",
                        reg.sortField === "company"
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      )}
                    />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center text-muted-foreground">Tipe Kepesertaan</div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center text-muted-foreground">Kehadiran</div>
                </TableHead>
                <TableHead className="text-right">Opsi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableBodyStates isLoading={reg.isLoading} isEmpty={!reg.data?.data || reg.data.data.length === 0} colSpan={canBulk ? 7 : 6} emptyMessage="Tidak ada data peserta terdaftar" />

              {!reg.isLoading &&
                reg.data?.data?.map((r) => {
                  const eventsAttended = countEventsAttended(r.attendances);
                  const isSelected = reg.selectedIds.includes(r.id);
                  const checkinDone = isFullyCheckedIn(r.attendances, reg.totalEvents);
                  const checkoutDone = isFullyCheckedOut(r.attendances, reg.totalEvents);
                  const noCheckinYet = hasNotCheckedIn(r.attendances);

                  return (
                    <TableRow
                      key={r.id}
                      className={cn("group", isSelected && "bg-blue-50/50 hover:bg-blue-50/70")}
                    >
                      {canBulk && (
                        <TableCell className="text-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              reg.handleSelectOne(r.id, checked as boolean)
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">
                            {r.participant.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {r.participant.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground capitalize">
                        {r.participant.gender}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.participant.company}
                      </TableCell>
                      <TableCell>
                        {reg.editingRegId === r.id ? (
                          <div className="flex items-center gap-1">
                            <Select
                              value={reg.editParticipationValue}
                              onValueChange={(val) =>
                                reg.setEditParticipationValue(
                                  val === "__none__" ? "" : String(val)
                                )
                              }
                            >
                              <SelectTrigger className="h-8 w-[130px] text-xs">
                                <span className="truncate">
                                  {reg.editParticipationValue
                                    ? reg.participationTypes.find(
                                        (pt: any) => String(pt.id) === reg.editParticipationValue
                                      )?.name || "-"
                                    : "-- Tidak Ditentukan --"}
                                </span>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">-- Tidak Ditentukan --</SelectItem>
                                {reg.participationTypes.map((pt: any) => (
                                  <SelectItem key={pt.id} value={String(pt.id)}>
                                    {pt.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <InlineSaveCancelButtons
                              isLoading={reg.loadingEditId === r.id}
                              onSave={() => reg.handleSaveInlineParticipationType(r.id)}
                              onCancel={reg.handleCancelInlineEdit}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-sm text-foreground">
                              {r.participation_type?.name || (
                                <span className="text-muted-foreground italic">-</span>
                              )}
                            </span>
                            {can("registrationManage") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0 shrink-0 text-slate-600"
                                onClick={() => reg.handleStartInlineEdit(r)}
                                title="Ubah tipe kepesertaan"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {reg.totalEvents > 0 ? (
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                              eventsAttended > 0
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-50 text-gray-500 border border-gray-200"
                            )}
                          >
                            {eventsAttended}/{reg.totalEvents} event
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              reg.setSelectedRegistrationId(r.id);
                              reg.setIsDetailModalOpen(true);
                            }}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            Lihat
                          </Button>
                          {canBulk && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => reg.handleSingleSendEmail(r.id)}
                              title="Kirim Email Tiket"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {can("attendanceManual") && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                onClick={() => reg.handleManualCheckIn(r.id)}
                                disabled={checkinDone}
                                title={checkinDone ? "Sudah masuk di semua event" : "Masuk Manual"}
                              >
                                Masuk
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                onClick={() => reg.handleManualCheckOut(r.id)}
                                disabled={checkoutDone || noCheckinYet}
                                title={checkoutDone ? "Sudah keluar di semua event" : noCheckinYet ? "Belum masuk" : "Keluar Manual"}
                              >
                                Keluar
                              </Button>
                              {canBulk && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => reg.handleDelete(r.id)}
                                  title="Hapus Registrasi"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                  Hapus
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        <PaginationFooter
          currentPage={reg.currentPage}
          totalPage={reg.data?.meta?.total_pages || 1}
          totalData={reg.data?.meta?.total || 0}
          onPrev={() => reg.setCurrentPage((p) => Math.max(1, p - 1))}
          onNext={() =>
            reg.setCurrentPage((p) => Math.min(reg.data?.meta?.total_pages || 1, p + 1))
          }
          onPageChange={(page) => reg.setCurrentPage(page)}
        />
      </TableCard>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <AddParticipantModal
        open={reg.isAddModalOpen}
        onOpenChange={reg.setIsAddModalOpen}
        search={reg.addParticipantSearch}
        onSearchChange={reg.setAddParticipantSearch}
        participants={reg.unregisteredParticipants}
        selectedIds={reg.addSelectedIds}
        onToggleParticipant={reg.handleToggleAddParticipant}
        onToggleAll={reg.handleToggleAllAddParticipants}
        participationTypes={reg.participationTypes}
        participationTypeId={reg.addParticipationTypeId}
        onParticipationTypeChange={reg.setAddParticipationTypeId}
        isRegistering={reg.isRegistering}
        onRegister={reg.handleBulkRegister}
      />

      <CheckInEventModal
        open={reg.isEventModalOpen}
        onOpenChange={reg.setIsEventModalOpen}
        action={reg.checkInAction.action}
        selectedParticipant={reg.selectedParticipant}
        events={reg.checkInEvents}
        isLoadingEvents={reg.isLoadingEvents}
        selectedEventId={reg.selectedEventId}
        onEventChange={reg.setSelectedEventId}
        attendanceStatus={reg.attendanceStatus}
        isProcessing={reg.isCheckingIn}
        onConfirm={reg.executeCheckIn}
      />

      <DetailRegistrationModal
        open={reg.isDetailModalOpen}
        onOpenChange={reg.setIsDetailModalOpen}
        isLoading={reg.isLoadingDetail}
        detail={reg.registrationDetail}
        expandedEvents={reg.expandedEvents}
        onToggleExpand={(eventId) =>
          reg.setExpandedEvents((prev) => ({ ...prev, [eventId]: !prev[eventId] }))
        }
      />

      <SendEmailModal
        open={reg.isEmailModalOpen}
        onOpenChange={reg.setIsEmailModalOpen}
        targetCount={reg.emailTargetIds.length}
        events={reg.checkInEvents}
        selectedEventId={reg.selectedEmailEventId}
        onEventChange={reg.setSelectedEmailEventId}
        isSending={reg.isSendingEmail}
        onConfirm={reg.handleConfirmSendEmail}
      />

      <ConfirmationDialog
        open={reg.isDeleteModalOpen}
        onOpenChange={reg.setIsDeleteModalOpen}
        title="Hapus Registrasi"
        description={
          reg.deleteTargetId
            ? "Apakah Anda yakin ingin menghapus registrasi ini? Tindakan ini tidak dapat dibatalkan."
            : `Apakah Anda yakin ingin menghapus ${reg.deleteTargetIds.length} registrasi yang dipilih? Tindakan ini tidak dapat dibatalkan.`
        }
        confirmText="Hapus"
        variant="danger"
        isLoading={reg.isDeleting}
        onConfirm={reg.handleConfirmDelete}
      />
    </div>
  );
}
