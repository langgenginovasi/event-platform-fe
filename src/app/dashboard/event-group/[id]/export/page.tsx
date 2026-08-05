"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { extractApiError } from "@/lib/utils";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { GET_EVENTS } from "@/lib/api-endpoints";

export default function ExportPage() {
  const params = useParams();
  const eventGroupId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const { data: eventsRes, isLoading: eventsLoading } = useSWR(
    GET_EVENTS(eventGroupId, 1, 100),
    { revalidateOnFocus: false }
  );
  const events = eventsRes?.data || [];

  const handleExport = async () => {
    if (!selectedEventId) return;
    setIsLoading(true);

    try {
      const response: any = await api.get("/attendances", {
        event_id: selectedEventId,
        export: "true",
        limit: "0",
      });

      const attendances = response?.data || [];

      if (attendances.length === 0) {
        toast.warning("Tidak ada data absensi untuk diekspor.");
        return;
      }

      const exportData = attendances.map((att: any) => ({
        "Nama Peserta": att.registration?.participant?.name || "-",
        "Email": att.registration?.participant?.email || "-",
        "Perusahaan": att.registration?.participant?.company || "-",
        "Jenis Kelamin": att.registration?.participant?.gender || "-",
        "Event": att.event?.name || "-",
        "Sesi": att.session?.name || "-",
        "Tipe": att.type === "checkin" ? "Check In" : "Check Out",
        "Waktu": formatDateTime(att.scanned_at),
        "Di-scan oleh": att.scanned_by?.name || "-",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Absensi");

      worksheet["!cols"] = [
        { wch: 25 }, // Nama
        { wch: 30 }, // Email
        { wch: 20 }, // Perusahaan
        { wch: 12 }, // JK
        { wch: 20 }, // Event
        { wch: 20 }, // Sesi
        { wch: 10 }, // Tipe
        { wch: 22 }, // Waktu
        { wch: 20 }, // Scanner
      ];

      const eventName = events.find((e: any) => e.id === selectedEventId)?.name || "Event";
      const dateStr = new Date().toISOString().split("T")[0];
      XLSX.writeFile(workbook, `Absensi_${eventName}_${dateStr}.xlsx`);

      toast.success(`Berhasil export ${attendances.length} data absensi!`);
    } catch (error: any) {
      toast.error(extractApiError(error, "Terjadi kesalahan saat export data."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-7 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row items-end gap-4">
        <div className="min-w-[20rem]">
          <label className="text-xs font-medium text-gray-500 block mb-1">
            Pilih Event
          </label>
          <Select
            items={events.map((ev: any) => ({ value: ev.id, label: ev.name }))}
            value={selectedEventId}
            onValueChange={(v) => setSelectedEventId(v as string)}
            disabled={eventsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={eventsLoading ? "Memuat event..." : "Pilih Event..."} />
            </SelectTrigger>
            <SelectContent>
              {events.map((ev: any) => (
                <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleExport}
          disabled={isLoading || !selectedEventId || eventsLoading}
          className="whitespace-nowrap bg-green-700 hover:bg-green-600 text-white disabled:bg-green-700/30"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export Excel
        </Button>
      </div>

      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <FileSpreadsheet className="w-8 h-8 text-green-600" />
        <div>
          <p className="text-sm font-medium text-gray-700">Format Export: Excel (.xlsx)</p>
          <p className="text-xs text-gray-500">Data absensi akan diekspor lengkap dengan nama peserta, waktu, dan tipe check-in/out.</p>
        </div>
      </div>
    </div>
  );
}
