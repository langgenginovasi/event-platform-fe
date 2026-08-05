"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/utils";
import { GET_EVENT_GROUP_DETAIL } from "@/lib/api-endpoints";

export function useWorkspaceOverviewActions(eventGroupId: string) {
  const { data: eventGroupRes, isLoading } = useSWR(GET_EVENT_GROUP_DETAIL(eventGroupId));
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
  const [emailSubject, setEmailSubject] = useState("Tiket Acara Anda");
  const [emailBody, setEmailBody] = useState(
    "Terima kasih telah mendaftar. Berikut adalah tiket Anda untuk akses masuk ke acara.",
  );
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testTemplate, setTestTemplate] = useState<"test" | "ticket">("test");
  const [selectedEventId, setSelectedEventId] = useState("");

  const selectedEventName = (() => {
    const ev = eventGroup?.events?.find((e: any) => e.id === selectedEventId);
    return ev?.name || eventGroup?.name || "Nama Event Group";
  })();

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
      toast.success(`Email test (${testTemplate}) berhasil dikirim ke ${testEmail}`);
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
