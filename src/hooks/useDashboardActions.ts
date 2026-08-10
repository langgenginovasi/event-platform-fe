"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/error";
import { GET_EVENT_GROUPS, GET_EVENTS, GET_REGISTRATIONS, GET_ATTENDANCES } from "@/lib/api-endpoints";

export function useDashboardActions() {
  const { data: eventGroupsRes, isLoading: isLoadingEventGroups } = useSWR(GET_EVENT_GROUPS());
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

  const totalCheckIns = attendances.filter((item: any) => item.type === "checkin").length;
  const totalCheckOuts = attendances.filter((item: any) => item.type === "checkout").length;

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

  // ── Create Event Group State ─────────────────────────────────────
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "" });
  const [loadingCreate, setLoadingCreate] = useState(false);
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
      setForm({ name: "", start_date: "", end_date: "" });
      setErrors({ name: "", start_date: "", end_date: "", api: "" });
      setOpenCreateModal(false);
    } catch (error: any) {
      setErrors({ name: "", start_date: "", end_date: "", api: extractApiError(error, "Terjadi kesalahan") });
    } finally {
      setLoadingCreate(false);
    }
  };

  return {
    // Data
    eventGroups,
    events,
    registrations,
    attendances,
    totalEventGroups,
    totalEvents,
    totalParticipants,
    totalCheckIns,
    totalCheckOuts,
    recentEventGroups,
    isLoadingEventGroups,

    // Create modal
    openCreateModal,
    setOpenCreateModal,
    form,
    setForm,
    loadingCreate,
    errors,
    setErrors,
    handleCreateEventGroup,
  };
}
