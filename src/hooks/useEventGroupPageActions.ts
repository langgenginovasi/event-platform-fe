"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/error";
import { GET_EVENT_GROUPS, GET_REGISTRATIONS } from "@/lib/api-endpoints";
import { pollEmailBatch } from "@/lib/emailJobPolling";
import { useDeleteConfirmation } from "./useDeleteConfirmation";

export function useEventGroupPageActions() {
  const [keyword, setKeyword] = useState("");

  const { data: eventGroupsRes, isLoading } = useSWR(GET_EVENT_GROUPS());
  const eventGroups = eventGroupsRes?.data ?? [];
  const totalEventGroups = eventGroups.length;

  // ── Create Modal State ──────────────────────────────────────────
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "" });
  const [errors, setErrors] = useState({ name: "", start_date: "", end_date: "", api: "" });

  const handleCreateEventGroup = async () => {
    const newErrors = { name: "", start_date: "", end_date: "", api: "" };
    if (!form.name.trim()) newErrors.name = "Nama event wajib diisi";
    if (!form.start_date) newErrors.start_date = "Tanggal mulai wajib diisi";
    if (!form.end_date) newErrors.end_date = "Tanggal selesai wajib diisi";

    setErrors(newErrors);
    if (newErrors.name || newErrors.start_date || newErrors.end_date) return;

    try {
      setLoadingCreate(true);
      await api.post("/event-groups", {
        name: form.name,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
      });
      await mutate(GET_EVENT_GROUPS());
      toast.success("Grup event berhasil dibuat!");
      setForm({ name: "", start_date: "", end_date: "" });
      setErrors({ name: "", start_date: "", end_date: "", api: "" });
      setOpenCreateModal(false);
    } catch (error: any) {
      setErrors({ name: "", start_date: "", end_date: "", api: extractApiError(error, "Terjadi kesalahan") });
      toast.error(extractApiError(error, "Terjadi kesalahan sistem."));
    } finally {
      setLoadingCreate(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────
  const deleteConfirmation = useDeleteConfirmation({
    onDelete: async (id) => {
      await api.delete(`/event-groups/${id}`);
      await mutate(GET_EVENT_GROUPS());
    },
    successMessage: "Grup event berhasil dihapus.",
    errorMessage: "Terjadi masalah saat menghubungi server.",
  });

  // ── Email ke Semua Peserta ──────────────────────────────────────
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTargetEventGroupId, setEmailTargetEventGroupId] = useState<string | null>(null);
  const [emailTargetCount, setEmailTargetCount] = useState(0);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleOpenEmail = (eventGroupId: string, targetCount: number) => {
    setEmailTargetEventGroupId(eventGroupId);
    setEmailTargetCount(targetCount);
    setIsEmailModalOpen(true);
  };

  const handleConfirmSendEmail = async (type: "group" | "event" = "group", eventId?: string) => {
    if (!emailTargetEventGroupId) return;
    if (type === "event" && !eventId) {
      toast.error("Pilih event terlebih dahulu");
      return;
    }

    setIsSendingEmail(true);
    try {
      const regsRes = await api.get<{ data: { id: string }[] }>(
        GET_REGISTRATIONS(emailTargetEventGroupId, 1, -1, "")
      );
      const registrationIds = (regsRes as any)?.data?.map((r: any) => r.id) || [];

      if (registrationIds.length === 0) {
        toast.warning("Tidak ada peserta terdaftar di event group ini.");
        return;
      }

      const res = await api.post<{ data: { queued: number; batch_id: string | null } }>(
        "/registrations/bulk-send-email",
        {
          registration_ids: registrationIds,
          type,
          event_id: eventId,
        }
      );

      const batchId = res?.data?.batch_id;
      const queued = res?.data?.queued ?? 0;

      setIsEmailModalOpen(false);
      setEmailTargetEventGroupId(null);
      setEmailTargetCount(0);

      if (!batchId || queued === 0) {
        toast.warning("Tidak ada email yang masuk ke antrean.");
        return;
      }

      const toastId = toast.loading(`⏳ ${queued} email masuk antrean, mengirim...`);
      const result = await pollEmailBatch(batchId, queued, (done, total) => {
        toast.loading(`⏳ Mengirim email... ${done}/${total}`, { id: toastId });
      });
      toast.dismiss(toastId);

      if (result.timedOut) {
        toast.warning("Waktu tunggu habis. Cek halaman Email Log untuk status pengiriman.", { duration: 6000 });
      } else if (result.failed === 0) {
        toast.success(`✅ ${result.sent} email berhasil dikirim!`, { duration: 6000 });
      } else {
        toast.warning(`⚠️ ${result.sent} berhasil, ${result.failed} gagal. Cek Email Log untuk detail.`, { duration: 8000 });
      }
    } catch (err: any) {
      toast.error(extractApiError(err, "Gagal mengirim email"));
    } finally {
      setIsSendingEmail(false);
    }
  };

  return {
    // Data
    eventGroups,
    totalEventGroups,
    isLoading,
    keyword,
    setKeyword,

    // Create
    openCreateModal,
    setOpenCreateModal,
    loadingCreate,
    form,
    setForm,
    errors,
    setErrors,
    handleCreateEventGroup,

    // Email
    isEmailModalOpen,
    setIsEmailModalOpen,
    emailTargetEventGroupId,
    emailTargetCount,
    isSendingEmail,
    handleOpenEmail,
    handleConfirmSendEmail,

    // Delete
    ...deleteConfirmation,
  };
}
