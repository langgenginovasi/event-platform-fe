"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/utils";
import { pollEmailJobs } from "@/lib/emailJobPolling";
import { useBulkSelection } from "./useBulkSelection";
import {
  GET_REGISTRATIONS,
  GET_REGISTRATION_DETAIL,
  GET_PARTICIPANTS,
  GET_EVENTS,
  GET_EVENT_GROUP_PARTICIPATION_TYPES,
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

  // ── Tambah Peserta (checklist/bulk) ────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addParticipantSearch, setAddParticipantSearch] = useState("");
  const [addSelectedIds, setAddSelectedIds] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [addParticipationTypeId, setAddParticipationTypeId] = useState<string>("");

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
  const { selectedIds, setSelectedIds, handleSelectAll, handleSelectOne, clearSelection } =
    useBulkSelection({ deps: [currentPage, keyword] });

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
  }>(GET_REGISTRATIONS(eventGroupId, currentPage, 10, keyword, sortField, sortOrder));

  // Fetch total events in this event group
  const { data: eventsData } = useSWR<{ data: any[] }>(GET_EVENTS(eventGroupId, 1, 100));
  const totalEvents = eventsData?.data?.length ?? 0;

  // Fetch participation types for this event group
  const { data: participationTypesRes } = useSWR<{ data: any[] }>(
    isAddModalOpen ? GET_EVENT_GROUP_PARTICIPATION_TYPES(eventGroupId) : null
  );
  const participationTypes = participationTypesRes?.data || [];

  // Fetch unregistered participants for checklist
  const { data: unregisteredData, mutate: mutateUnregistered } = useSWR<{ data: any[]; meta: any }>(
    isAddModalOpen ? GET_PARTICIPANTS(1, 100, addParticipantSearch, eventGroupId) : null
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
        participation_type_id: addParticipationTypeId || undefined,
      });
      toast.success(`${addSelectedIds.length} peserta berhasil didaftarkan`);
      setIsAddModalOpen(false);
      setAddSelectedIds([]);
      setAddParticipationTypeId("");
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
      const res = await api.post<{ data: { queued: number; job_ids: string[] } }>("/registrations/bulk-send-email", {
        registration_ids: emailTargetIds,
        type,
        event_id: eventId,
      });
      const jobIds = res?.data?.job_ids ?? [];
      setEmailTargetIds([]);
      setIsEmailModalOpen(false);
      setSelectedEmailEventId("");
      setEmailType("group");

      if (jobIds.length > 0) {
        toast.info(`${jobIds.length} email masuk antrean, pengiriman berlangsung di latar belakang...`);
        const result = await pollEmailJobs(jobIds);
        if (result.timedOut) {
          toast.warning(
            `Pengiriman masih berlangsung (${result.sent} terkirim, ${result.failed} gagal). Periksa status di menu Email Jobs.`
          );
        } else if (result.failed > 0) {
          toast.error(
            `${result.sent} email terkirim, ${result.failed} gagal. ${result.failures[0]?.error || ""}`.trim()
          );
        } else {
          toast.success(`${result.sent} email berhasil terkirim`);
        }
      }
    } catch (err: any) {
      toast.error(extractApiError(err, "Gagal mengirim email"));
    } finally {
      setIsSendingEmail(false);
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
    selectedIds,
    isAddModalOpen,
    setIsAddModalOpen,
    addParticipantSearch,
    setAddParticipantSearch,
    addSelectedIds,
    isRegistering,
    addParticipationTypeId,
    setAddParticipationTypeId,
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
    isEmailModalOpen,
    setIsEmailModalOpen,
    selectedEmailEventId,
    setSelectedEmailEventId,
    isSendingEmail,
    emailTargetIds,
    emailType,
    setEmailType,

    // Data
    data,
    isLoading,
    mutate,
    totalEvents,
    participationTypes,
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
    handleBulkSendEmail,
    handleSingleSendEmail,
    handleConfirmSendEmail,
  };
}
