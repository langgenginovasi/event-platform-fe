"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/utils";
import { GET_EVENT_GROUP_DETAIL } from "@/lib/api-endpoints";

export function useWorkspaceOverviewActions(eventGroupId: string) {
  const { data: eventGroupRes, isLoading, mutate } = useSWR(GET_EVENT_GROUP_DETAIL(eventGroupId));
  const eventGroup = eventGroupRes?.data;

  const totalSubEvents = eventGroup?.events?.length ?? 0;
  const totalRegistrations = eventGroup?._count?.registrations ?? 0;
  const totalAttendances =
    eventGroup?.events?.reduce(
      (total: number, event: any) => total + (event._count?.attendances ?? 0),
      0,
    ) ?? 0;

  const chartData =
    eventGroup?.events?.map((e: any) => ({
      name: e.name,
      Registrasi: totalRegistrations,
      Kehadiran: e._count?.attendances || 0,
    })) || [];

  // ── Email State ─────────────────────────────────────────────────
  const [emailSubject, setEmailSubject] = useState("Tiket Anda untuk {{event_group_name}}");
  const [emailBody, setEmailBody] = useState(
    "Terima kasih telah mendaftar untuk event {{event_name}} dalam {{event_group_name}}. Berikut adalah detail event yang akan Anda ikuti:",
  );
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testTemplate, setTestTemplate] = useState<"test" | "ticket">("test");
  const [selectedEventId, setSelectedEventId] = useState("");

  // Initialize email settings from event group data
  useEffect(() => {
    if (eventGroup) {
      setEmailSubject(eventGroup.email_subject || "Tiket Anda untuk {{event_group_name}}");
      setEmailBody(eventGroup.email_body || "Terima kasih telah mendaftar untuk event {{event_name}} dalam {{event_group_name}}. Berikut adalah detail event yang akan Anda ikuti:");
    }
  }, [eventGroup]);

  const selectedEventName = (() => {
    const ev = eventGroup?.events?.find((e: any) => e.id === selectedEventId);
    return ev?.name || eventGroup?.name || "Nama Event Group";
  })();

  const handleSaveEmailSettings = async () => {
    setIsSavingEmail(true);
    try {
      await api.put(`/event-groups/${eventGroupId}`, {
        email_subject: emailSubject || null,
        email_body: emailBody || null,
      });
      await mutate();
      toast.success("Pengaturan email berhasil disimpan");
    } catch (error: any) {
      const message = extractApiError(error, "Gagal menyimpan pengaturan email");
      toast.error(message);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.warning("Masukkan alamat email untuk test.");
      return;
    }

    setIsSendingTest(true);
    try {
      await api.post("/test/email", {
        to: testEmail,
        subject: testTemplate === "ticket" ? `Tiket Anda untuk ${selectedEventName}` : `[Test] ${emailSubject}`,
        template: testTemplate,
        event_name: selectedEventName,
        participant_name: "Peserta Demo",
        body: testTemplate === "ticket" ? emailBody : undefined,
      });
      // Email masuk antrean, worker akan mengirimnya di background
      toast.success(`Email test berhasil dimasukkan ke antrean. Cek kotak masuk ${testEmail} dalam beberapa detik.`);
      setTestEmail("");
    } catch (error: any) {
      const message = extractApiError(error, "Gagal mengirim email test.");
      toast.error(message);
    } finally {
      setIsSendingTest(false);
    }
  };

  return {
    eventGroup,
    isLoading,
    totalSubEvents,
    totalRegistrations,
    totalAttendances,
    chartData,

    // Email
    emailSubject,
    setEmailSubject,
    emailBody,
    setEmailBody,
    isSavingEmail,
    handleSaveEmailSettings,
    testEmail,
    setTestEmail,
    isSendingTest,
    testTemplate,
    setTestTemplate,
    selectedEventId,
    setSelectedEventId,
    selectedEventName,
    handleTestEmail,
  };
}
