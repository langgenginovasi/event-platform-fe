"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/error";
import { pollEmailJobs } from "@/lib/emailJobPolling";
import { useBulkSelection } from "./useBulkSelection";
import {
  GET_REGISTRATIONS,
  GET_REGISTRATION_DETAIL,
  GET_PARTICIPANTS,
  GET_EVENTS,
  GET_EVENT_GROUP_PARTICIPATION_TYPES,
  GET_MEMBERSHIP_TYPES,
  UPDATE_REGISTRATION,
} from "@/lib/api-endpoints";

export interface RegistrationItem {
  id: string;
  status: string;
  participant: {
    id: string;
    name: string;
    email: string;
    company: string;
    gender: string;
  };
  participation_type?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  attendances: any[];
}

export function useRegistrationActions(eventGroupId: string) {
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<string | undefined>();
  const [participationTypeFilter, setParticipationTypeFilter] = useState("");
  const [membershipTypeFilter, setMembershipTypeFilter] = useState("");

  // ── Tambah Peserta (checklist/bulk) ────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addParticipantSearch, setAddParticipantSearch] = useState("");
  const [addSelectedIds, setAddSelectedIds] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [addParticipationTypeId, setAddParticipationTypeId] = useState<string>("");
  const [addMembershipTypeId, setAddMembershipTypeId] = useState("");

  // ── STATE UNTUK CHECK-IN EVENT MODAL ───────────────────────────────
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [checkInAction, setCheckInAction] = useState<{
    type: "manual" | "bulk";
    action: "checkin" | "checkout";
    registrationId?: string;
  }>({ type: "manual", action: "checkin" });
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // ── STATE UNTUK ATTENDANCE STATUS ─────────────────────────────────
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, { checkin: boolean; checkout: boolean }>>({});

  // ── STATE UNTUK DETAIL MODAL ──────────────────────────────────────
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  // ── STATE UNTUK BULK SELECTION ────────────────────────────────────
  const { selectedIds, setSelectedIds, handleSelectOne, clearSelection } =
    useBulkSelection({ deps: [currentPage] });

  const [isSelectingAll, setIsSelectingAll] = useState(false);

  const handleSelectAll = async (items: any[], checked: boolean) => {
    if (checked) {
      setIsSelectingAll(true);
      try {
        const res = await api.get(
          GET_REGISTRATIONS(eventGroupId, 1, -1, keyword, sortField, sortOrder, participationTypeFilter, membershipTypeFilter)
        );
        const allIds = (res as any).data.map((r: any) => r.id);
        setSelectedIds(allIds);
        toast.success(`Berhasil memilih ${allIds.length} registrasi`);
      } catch (error) {
        toast.error("Gagal memilih semua data");
      } finally {
        setIsSelectingAll(false);
      }
    } else {
      setSelectedIds([]);
    }
  };

  // ── STATE UNTUK EMAIL MODAL ──────────────────────────────────────
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedEmailEventId, setSelectedEmailEventId] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailTargetIds, setEmailTargetIds] = useState<string[]>([]);
  const [emailMode, setEmailMode] = useState<"single" | "bulk">("bulk");
  const [emailType, setEmailType] = useState<"group" | "event">("group");

  // ── STATE UNTUK DELETE CONFIRMATION ──────────────────────────────
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── STATE UNTUK EDIT REGISTRATION ──────────────────────────────
  const [editingRegId, setEditingRegId] = useState<string | null>(null);
  const [editParticipationValue, setEditParticipationValue] = useState<string>("");
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  // ── STATE UNTUK BULK EDIT PARTICIPATION TYPE ──────────────────
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkParticipationTypeId, setBulkParticipationTypeId] = useState("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Reset accordion when detail modal opens
  useEffect(() => {
    if (isDetailModalOpen) setExpandedEvents({});
  }, [isDetailModalOpen, selectedRegistrationId]);

  // Fetch attendance status when event modal opens
  useEffect(() => {
    if (!isEventModalOpen) {
      setAttendanceStatus({});
      return;
    }

    const regIds = checkInAction.type === "manual" && checkInAction.registrationId
      ? [checkInAction.registrationId]
      : checkInAction.type === "bulk"
        ? selectedIds
        : [];

    if (regIds.length === 0) {
      setAttendanceStatus({});
      return;
    }

    let cancelled = false;

    const fetchAttendanceStatus = async () => {
      try {
        const allAttendances: any[] = [];
        await Promise.all(
          regIds.map(async (rid) => {
            const res = await api.get("/attendances", {
              registration_id: rid,
              limit: "999",
            });
            const rows = (res as any)?.data;
            if (Array.isArray(rows)) allAttendances.push(...rows);
          })
        );
        if (cancelled) return;
        const statusMap: Record<string, { checkin: boolean; checkout: boolean }> = {};
        allAttendances.forEach((att: any) => {
          if (!statusMap[att.event_id]) {
            statusMap[att.event_id] = { checkin: false, checkout: false };
          }
          if (att.type === "checkin") statusMap[att.event_id].checkin = true;
          if (att.type === "checkout") statusMap[att.event_id].checkout = true;
        });
        setAttendanceStatus(statusMap);
      } catch {
        if (!cancelled) setAttendanceStatus({});
      }
    };
    fetchAttendanceStatus();

    return () => { cancelled = true; };
  }, [isEventModalOpen, checkInAction.type, checkInAction.registrationId, selectedIds]);

  // SWR fetch registrations
  const { data, isLoading, mutate } = useSWR<{
    data: RegistrationItem[];
    meta: any;
  }>(GET_REGISTRATIONS(eventGroupId, currentPage, 10, keyword, sortField, sortOrder, participationTypeFilter, membershipTypeFilter));

  // Fetch total events in this event group
  const { data: eventsData } = useSWR<{ data: any[] }>(GET_EVENTS(eventGroupId, 1, 100));
  const totalEvents = eventsData?.data?.length ?? 0;

  // Fetch participation types for this event group (always fetched for inline edit)
  const { data: participationTypesRes } = useSWR<{ data: any[] }>(
    GET_EVENT_GROUP_PARTICIPATION_TYPES(eventGroupId)
  );
  const participationTypes = (participationTypesRes?.data || []).map((pt: any) => ({
    id: pt.participation_type?.id || pt.id,
    name: pt.participation_type?.name || pt.name,
    slug: pt.participation_type?.slug || pt.slug,
    is_active: pt.is_active,
  }));

  // Fetch membership types (global) for filter di tabel & AddParticipantModal
  const { data: membershipTypesRes } = useSWR<{ data: any[] }>(GET_MEMBERSHIP_TYPES());
  const membershipTypes = membershipTypesRes?.data || [];

  // Fetch unregistered participants for checklist
  const { data: unregisteredData, mutate: mutateUnregistered } = useSWR<{ data: any[]; meta: any }>(
    isAddModalOpen ? GET_PARTICIPANTS(1, 100, addParticipantSearch, eventGroupId, addMembershipTypeId) : null
  );
  const unregisteredParticipants = unregisteredData?.data || [];

  // Fetch ALL registrations for stats
  const { data: allRegistrationsRes } = useSWR<{ data: RegistrationItem[]; meta: any }>(
    GET_REGISTRATIONS(eventGroupId, 1, 9999, "", undefined, undefined)
  );
  const allRegistrations = allRegistrationsRes?.data || [];

  // Fetch events for check-in modal & email modal
  const { data: checkInEventsData, isLoading: isLoadingEvents } = useSWR<{ data: any[] }>(
    isEventModalOpen || isEmailModalOpen ? GET_EVENTS(eventGroupId, 1, 100) : null
  );
  const checkInEvents = checkInEventsData?.data || [];

  // Get selected participant info for checkin/checkout modal
  const selectedParticipant = checkInAction.registrationId && data?.data
    ? data.data.find((r) => r.id === checkInAction.registrationId)?.participant
    : null;

  // Fetch registration detail
  const { data: detailRes, isLoading: isLoadingDetail } = useSWR<{ data: any }>(
    isDetailModalOpen && selectedRegistrationId
      ? GET_REGISTRATION_DETAIL(selectedRegistrationId)
      : null
  );
  const registrationDetail = detailRes?.data;

  // ── Handlers ──────────────────────────────────────────────────────

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortField(undefined);
        setSortOrder(undefined);
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleOpenAddModal = () => {
    setAddParticipantSearch("");
    setAddSelectedIds([]);
    setAddMembershipTypeId("");
    setIsAddModalOpen(true);
  };

  const handleToggleAddParticipant = (participantId: string) => {
    setAddSelectedIds((prev) =>
      prev.includes(participantId)
        ? prev.filter((i) => i !== participantId)
        : [...prev, participantId]
    );
  };

  const handleToggleAllAddParticipants = (checked: boolean) => {
    if (checked) {
      setAddSelectedIds(unregisteredParticipants.map((p: any) => p.id));
    } else {
      setAddSelectedIds([]);
    }
  };

  const handleBulkRegister = async () => {
    if (addSelectedIds.length === 0) {
      toast.warning("Pilih peserta terlebih dahulu");
      return;
    }
    setIsRegistering(true);
    try {
      await api.post("/registrations/bulk", {
        event_group_id: eventGroupId,
        participant_ids: addSelectedIds,
        participation_type_id: addParticipationTypeId || null,
      });
      toast.success(`${addSelectedIds.length} peserta berhasil didaftarkan`);
      setIsAddModalOpen(false);
      setAddSelectedIds([]);
      setAddParticipationTypeId("");
      setAddMembershipTypeId("");
      mutate();
      mutateUnregistered();
    } catch (err: any) {
      toast.error(err.message || "Gagal mendaftarkan peserta");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDelete = async (registrationId: string) => {
    setDeleteTargetId(registrationId);
    setDeleteTargetIds([]);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteTargetId) {
        await api.delete(`/registrations/${deleteTargetId}`);
        toast.success("Registrasi berhasil dihapus");
      } else if (deleteTargetIds.length > 0) {
        await Promise.all(deleteTargetIds.map((rid) => api.delete(`/registrations/${rid}`)));
        toast.success(`${deleteTargetIds.length} registrasi berhasil dihapus`);
        setSelectedIds([]);
      }
      mutate();
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      setDeleteTargetIds([]);
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus registrasi");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleManualCheckIn = (registrationId: string) => {
    setCheckInAction({ type: "manual", action: "checkin", registrationId });
    setSelectedEventId("");
    setIsEventModalOpen(true);
  };

  const handleManualCheckOut = (registrationId: string) => {
    setCheckInAction({ type: "manual", action: "checkout", registrationId });
    setSelectedEventId("");
    setIsEventModalOpen(true);
  };

  const handleBulkCheckIn = () => {
    setCheckInAction({ type: "bulk", action: "checkin" });
    setSelectedEventId("");
    setIsEventModalOpen(true);
  };

  const handleBulkCheckOut = () => {
    setCheckInAction({ type: "bulk", action: "checkout" });
    setSelectedEventId("");
    setIsEventModalOpen(true);
  };

  const executeCheckIn = async () => {
    if (!selectedEventId) {
      toast.error("Pilih event terlebih dahulu");
      return;
    }
    setIsCheckingIn(true);
    try {
      if (checkInAction.type === "manual") {
        await api.post("/attendances/manual", {
          registration_id: checkInAction.registrationId,
          event_id: selectedEventId,
          type: checkInAction.action,
        });
        toast.success(
          checkInAction.action === "checkin" ? "Check-in berhasil" : "Check-out berhasil"
        );
      } else {
        await api.post("/attendances/bulk", {
          registration_ids: selectedIds,
          event_id: selectedEventId,
          type: checkInAction.action,
        });
        toast.success(
          `${selectedIds.length} peserta berhasil di-${
            checkInAction.action === "checkin" ? "Check-in" : "Check-out"
          }`
        );
        setSelectedIds([]);
      }
      mutate();
      setIsEventModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan proses");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleBulkDelete = async () => {
    setDeleteTargetId(null);
    setDeleteTargetIds(selectedIds);
    setIsDeleteModalOpen(true);
  };

  const handleBulkEditParticipationType = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Pilih registrasi terlebih dahulu");
      return;
    }
    setIsBulkUpdating(true);
    try {
      await api.put("/registrations/bulk-update", {
        registration_ids: selectedIds,
        participation_type_id: bulkParticipationTypeId || null,
      });
      toast.success(`${selectedIds.length} registrasi berhasil diperbarui`);
      setIsBulkEditModalOpen(false);
      setBulkParticipationTypeId("");
      setSelectedIds([]);
      mutate();
    } catch (err: any) {
      toast.error(extractApiError(err, "Gagal memperbarui tipe kepesertaan"));
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkSendEmail = async () => {
    setEmailTargetIds(selectedIds);
    setEmailMode("bulk");
    setSelectedEmailEventId("");
    setIsEmailModalOpen(true);
  };

  const handleSingleSendEmail = (registrationId: string) => {
    setEmailTargetIds([registrationId]);
    setEmailMode("single");
    setSelectedEmailEventId("");
    setIsEmailModalOpen(true);
  };

  const handleConfirmSendEmail = async (type: "group" | "event" = "group", eventId?: string) => {
    if (type === "event" && !eventId) {
      toast.error("Pilih event terlebih dahulu");
      return;
    }

    setIsSendingEmail(true);
    try {
      const res = await api.post<{ data: { queued: number; batch_id: string | null } }>("/registrations/bulk-send-email", {
        registration_ids: emailTargetIds,
        type,
        event_id: eventId,
      });

      const batchId = res?.data?.batch_id;
      const queued = res?.data?.queued ?? 0;

      setEmailTargetIds([]);
      setIsEmailModalOpen(false);
      setSelectedEmailEventId("");
      setEmailType("group");

      if (!batchId || queued === 0) {
        toast.warning("Tidak ada email yang masuk ke antrean.");
        return;
      }

      // Toast awal: masuk antrean
      const toastId = toast.loading(`⏳ ${queued} email masuk antrean, mengirim...`);

      // Polling status batch di background
      const POLL_INTERVAL = 2000;
      const POLL_TIMEOUT = 120000; // 2 menit
      const start = Date.now();

      const pollBatch = async () => {
        if (Date.now() - start > POLL_TIMEOUT) {
          toast.dismiss(toastId);
          toast.warning(`Waktu tunggu habis. Cek halaman Email Log untuk status pengiriman.`, { duration: 6000 });
          return;
        }

        try {
          const batchRes = await api.get<{ data: { status: string; stats: { sent: number; failed: number; queued: number; sending: number }; total_jobs: number } }>(
            `/email-batches/${batchId}`
          );
          const batchData = batchRes?.data;

          if (!batchData) {
            setTimeout(pollBatch, POLL_INTERVAL);
            return;
          }

          const { status, stats, total_jobs } = batchData;
          const done = (stats.sent ?? 0) + (stats.failed ?? 0);
          const total = total_jobs ?? queued;

          // Update progress toast
          if (status !== "completed") {
            toast.loading(`⏳ Mengirim email... ${done}/${total}`, { id: toastId });
            setTimeout(pollBatch, POLL_INTERVAL);
          } else {
            // Selesai
            toast.dismiss(toastId);
            if ((stats.failed ?? 0) === 0) {
              toast.success(`✅ ${stats.sent} email berhasil dikirim!`, { duration: 6000 });
            } else {
              toast.warning(
                `⚠️ ${stats.sent} berhasil, ${stats.failed} gagal. Cek Email Log untuk detail.`,
                { duration: 8000 }
              );
            }
          }
        } catch {
          // Error transien, coba lagi
          setTimeout(pollBatch, POLL_INTERVAL);
        }
      };

      // Mulai polling setelah 2 detik
      setTimeout(pollBatch, 2000);

    } catch (err: any) {
      toast.error(extractApiError(err, "Gagal mengirim email"));
    } finally {
      setIsSendingEmail(false);
    }
  };


  // ── EDIT REGISTRATION HANDLERS ─────────────────────────────────
  const handleStartInlineEdit = (registration: RegistrationItem) => {
    setEditingRegId(registration.id);
    setEditParticipationValue(
      registration.participation_type?.id != null
        ? String(registration.participation_type.id)
        : ""
    );
  };

  const handleCancelInlineEdit = () => {
    setEditingRegId(null);
    setEditParticipationValue("");
  };

  const handleSaveInlineParticipationType = async (registrationId: string) => {
    setLoadingEditId(registrationId);
    try {
      await api.put(`/registrations/${registrationId}`, {
        participation_type_id: editParticipationValue || null,
      });
      toast.success("Tipe kepesertaan berhasil diperbarui");
      setEditingRegId(null);
      setEditParticipationValue("");
      mutate();
    } catch (err: any) {
      toast.error(err?.message || "Gagal memperbarui tipe kepesertaan");
    } finally {
      setLoadingEditId(null);
    }
  };

  return {
    // State
    keyword,
    setKeyword,
    currentPage,
    setCurrentPage,
    sortField,
    sortOrder,
    participationTypeFilter,
    setParticipationTypeFilter,
    membershipTypeFilter,
    setMembershipTypeFilter,
    selectedIds,
    isAddModalOpen,
    setIsAddModalOpen,
    addParticipantSearch,
    setAddParticipantSearch,
    addSelectedIds,
    isRegistering,
    addParticipationTypeId,
    setAddParticipationTypeId,
    addMembershipTypeId,
    setAddMembershipTypeId,
    isEventModalOpen,
    setIsEventModalOpen,
    selectedEventId,
    setSelectedEventId,
    checkInAction,
    isCheckingIn,
    attendanceStatus,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedRegistrationId,
    setSelectedRegistrationId,
    expandedEvents,
    setExpandedEvents,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    deleteTargetId,
    deleteTargetIds,
    isDeleting,
    isSelectingAll,
    isEmailModalOpen,
    setIsEmailModalOpen,
    selectedEmailEventId,
    setSelectedEmailEventId,
    isSendingEmail,
    emailTargetIds,
    emailType,
    setEmailType,
    clearSelection,
    editingRegId,
    editParticipationValue,
    setEditParticipationValue,
    loadingEditId,
    isBulkEditModalOpen,
    setIsBulkEditModalOpen,
    bulkParticipationTypeId,
    setBulkParticipationTypeId,
    isBulkUpdating,

    // Data
    data,
    isLoading,
    mutate,
    totalEvents,
    participationTypes,
    membershipTypes,
    unregisteredParticipants,
    allRegistrations,
    allRegistrationsRes,
    checkInEvents,
    isLoadingEvents,
    selectedParticipant,
    registrationDetail,
    isLoadingDetail,

    // Handlers
    handleSort,
    handleSelectAll,
    handleSelectOne,
    handleOpenAddModal,
    handleToggleAddParticipant,
    handleToggleAllAddParticipants,
    handleBulkRegister,
    handleDelete,
    handleConfirmDelete,
    handleManualCheckIn,
    handleManualCheckOut,
    handleBulkCheckIn,
    handleBulkCheckOut,
    executeCheckIn,
    handleBulkDelete,
    handleBulkEditParticipationType,
    handleBulkSendEmail,
    handleSingleSendEmail,
    handleConfirmSendEmail,
    handleStartInlineEdit,
    handleCancelInlineEdit,
    handleSaveInlineParticipationType,
  };
}
