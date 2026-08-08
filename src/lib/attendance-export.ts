import { formatDate, formatTime, formatGender } from "@/lib/utils";

export interface AttendanceExportColumn {
  header: string;
  width: number;
}

export const ATTENDANCE_EXPORT_COLUMNS: AttendanceExportColumn[] = [
  { header: "Nama Peserta", width: 25 },
  { header: "Email", width: 30 },
  { header: "Perusahaan", width: 20 },
  { header: "Jenis Kelamin", width: 14 },
  { header: "Tipe Kepesertaan", width: 20 },
  { header: "Tipe", width: 10 },
  { header: "Tanggal", width: 14 },
  { header: "Jam", width: 12 },
  { header: "Di-scan oleh", width: 20 },
];

export function toAttendanceExportRow(att: any): Record<string, string> {
  return {
    "Nama Peserta": att.registration?.participant?.name || "-",
    "Email": att.registration?.participant?.email || "-",
    "Perusahaan": att.registration?.participant?.company || "-",
    "Jenis Kelamin": formatGender(att.registration?.participant?.gender),
    "Tipe Kepesertaan": att.registration?.participation_type?.name || "-",
    "Tipe": att.type === "checkin" ? "Masuk" : "Keluar",
    "Tanggal": formatDate(att.scanned_at),
    "Jam": formatTime(att.scanned_at),
    "Di-scan oleh": att.scanned_by?.name || "-",
  };
}
