"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Download, Loader2, FileSpreadsheet, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { extractApiError, formatDateTime } from "@/lib/utils";
import { api } from "@/lib/api";
import { GET_EVENTS, GET_ATTENDANCES } from "@/lib/api-endpoints";
import { ATTENDANCE_EXPORT_COLUMNS, toAttendanceExportRow } from "@/lib/attendance-export";

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
  const selectedEvent = events.find((e: any) => e.id === selectedEventId) as any;

  const { data: previewRes, isLoading: previewLoading } = useSWR(
    selectedEventId ? GET_ATTENDANCES(selectedEventId, undefined, undefined, 1, 5) : null,
    { revalidateOnFocus: false }
  );
  const previewRows = previewRes?.data || [];
  const previewTotal = previewRes?.meta?.total ?? previewRows.length;

  const handleExport = async () => {
    if (!selectedEventId) return;
    setIsLoading(true);

    try {
      const response: any = await api.get("/attendances", {
        event_id: selectedEventId,
        export: "true",
        limit: "0",
      });

      const attendances: any[] = response?.data || [];

      if (attendances.length === 0) {
        toast.warning("Tidak ada data absensi untuk diekspor.");
        return;
      }

      const exportData = attendances.map(toAttendanceExportRow);

      const eventName = selectedEvent?.name || "Event";
      const eventGroupName = selectedEvent?.event_group?.name || "Event Group";

      const sheetData = [
        ["Grup Event", eventGroupName],
        ["Event", eventName],
        ["Waktu Export", formatDateTime(new Date())],
        [],
        ATTENDANCE_EXPORT_COLUMNS.map((c) => c.header),
        ...exportData.map((row) => ATTENDANCE_EXPORT_COLUMNS.map((c) => row[c.header])),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Absensi");

      worksheet["!cols"] = ATTENDANCE_EXPORT_COLUMNS.map((c) => ({ wch: c.width }));

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
          Ekspor Excel
        </Button>
      </div>

      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <FileSpreadsheet className="w-8 h-8 text-green-600" />
        <div>
          <p className="text-sm font-medium text-gray-700">Format Ekspor: Excel (.xlsx)</p>
          <p className="text-xs text-gray-500">Laporan per event: nama grup &amp; event di header, dilengkapi nama peserta, tipe kepesertaan, dan tipe check-in/out.</p>
        </div>
      </div>

      {selectedEventId && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-800">Pratinjau Laporan</h3>
            </div>
            {!previewLoading && previewTotal > 0 && (
              <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                {previewTotal} data akan diekspor
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Berikut contoh isi file Excel (.xlsx) — kolom yang sama akan muncul di laporan final.
          </p>

          {selectedEvent && (
            <div className="flex flex-wrap gap-x-8 gap-y-1 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div>
                <p className="text-[11px] font-medium text-blue-500 uppercase tracking-wide">Grup Event</p>
                <p className="text-sm font-semibold text-gray-800">{selectedEvent.event_group?.name || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-blue-500 uppercase tracking-wide">Event</p>
                <p className="text-sm font-semibold text-gray-800">{selectedEvent.name}</p>
              </div>
            </div>
          )}

          {previewLoading ? (
            <div className="flex items-center justify-center gap-2 p-8 border rounded-xl bg-gray-50">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-xs text-gray-500">Memuat pratinjau...</span>
            </div>
          ) : previewRows.length === 0 ? (
            <div className="flex items-center gap-3 p-6 border rounded-xl bg-gray-50">
              <FileText className="w-6 h-6 text-gray-400" />
              <p className="text-sm text-gray-500">
                Belum ada data absensi pada event ini. Pratinjau masih kosong.
              </p>
            </div>
          ) : (
            <>
              <div className="border rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 sticky top-0">
                      <TableRow>
                        <TableHead className="w-10">No</TableHead>
                        {ATTENDANCE_EXPORT_COLUMNS.map((c) => (
                          <TableHead key={c.header} className="whitespace-nowrap">{c.header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.map((att: any, idx: number) => {
                        const row = toAttendanceExportRow(att);
                        return (
                          <TableRow key={att.id ?? idx}>
                            <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                            {ATTENDANCE_EXPORT_COLUMNS.map((c) => (
                              <TableCell key={c.header} className="whitespace-nowrap">{row[c.header]}</TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {previewTotal > previewRows.length && (
                <p className="text-xs text-gray-500">
                  Menampilkan {previewRows.length} dari {previewTotal} data. Export akan memuat seluruh data absensi.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
