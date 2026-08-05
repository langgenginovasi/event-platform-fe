"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { GET_EVENT_GROUPS } from "@/lib/api-endpoints";
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
      setErrors({ name: "", start_date: "", end_date: "", api: error?.message || "Terjadi kesalahan" });
      toast.error("Terjadi kesalahan sistem.");
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

    // Delete
    ...deleteConfirmation,
  };
}
