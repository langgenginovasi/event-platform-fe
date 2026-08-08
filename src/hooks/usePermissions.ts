"use client";

import { useSession } from "next-auth/react";

export type PermissionAction =
  | "participantManage"       // Manajemen peserta (master data)
  | "eventGroupManage"        // CRUD Grup Event
  | "eventManage"             // CRUD Event & Sesi
  | "registrationManage"      // Kelola Registrasi (lihat, daftarkan, hapus)
  | "participationTypeManage" // Kelola Tipe Partisipasi
  | "emailManage"             // Pengaturan email, kirim email broadcast
  | "reportExport"            // Ekspor laporan / cetak QR
  | "attendanceScan"          // Scan QR masuk/keluar
  | "attendanceManual"        // Check-in/out manual (OPERATOR untuk antisipasi kendala lapangan)
  | "userManage"              // Manajemen Pengguna (SUPER_ADMIN only)
  | "settingsManage";         // Pengaturan Aplikasi (SUPER_ADMIN only)

const SUPER_ADMIN_PERMISSIONS: PermissionAction[] = [
  "participantManage",
  "eventGroupManage",
  "eventManage",
  "registrationManage",
  "participationTypeManage",
  "emailManage",
  "reportExport",
  "attendanceScan",
  "attendanceManual",
  "userManage",
  "settingsManage",
];

const EVENT_ADMIN_PERMISSIONS: PermissionAction[] = [
  // EVENT_ADMIN bisa kelola event tapi tidak bisa manajemen peserta master,
  // pengaturan aplikasi, atau manajemen pengguna
  "eventGroupManage",
  "eventManage",
  "registrationManage",
  "participationTypeManage",
  "emailManage",
  "reportExport",
  "attendanceScan",
  "attendanceManual",
];

const OPERATOR_PERMISSIONS: PermissionAction[] = [
  // OPERATOR hanya bisa scan, laporan, dan check-in/out manual
  "attendanceScan",
  "attendanceManual",
  "reportExport",
];

export function usePermissions() {
  const { data: session } = useSession();
  const role = (session?.user?.role as string) || "GUEST";

  const permissions: PermissionAction[] =
    role === "SUPER_ADMIN"
      ? SUPER_ADMIN_PERMISSIONS
      : role === "EVENT_ADMIN"
      ? EVENT_ADMIN_PERMISSIONS
      : role === "OPERATOR"
      ? OPERATOR_PERMISSIONS
      : [];

  const can = (action: PermissionAction): boolean => {
    return permissions.includes(action);
  };

  return { can, role, permissions };
}

