import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date/Time Formatting Utilities ─────────────────────────────────────────

/**
 * Format tanggal: "27 Jul 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/**
 * Format waktu: "09:00 WIB"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return (
    d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  )
}

/**
 * Format tanggal panjang: "27 Juli 2026"
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Format tanggal + waktu: "27 Jul 2026, 09:00 WIB"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return (
    d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    ", " +
    d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) +
    " WIB"
  )
}

/**
 * Format rentang waktu: "27 Jul 2026, 09:00 WIB - 17:00 WIB"
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate
  const end = typeof endDate === "string" ? new Date(endDate) : endDate
  
  const startStr = start.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  
  const startTime = start.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
  
  const endTime = end.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
  
  return `${startStr}, ${startTime} WIB - ${endTime} WIB`
}

// ─── String Utilities ───────────────────────────────────────────────────────

export function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

// ─── Display Formatting Utilities ───────────────────────────────────────────

/**
 * Format jenis kelamin: "L" => "Laki-laki", "P" => "Perempuan".
 */
export function formatGender(gender?: string | null): string {
  return gender === "P" ? "Perempuan" : "Laki-laki"
}

// ─── Error Utilities ────────────────────────────────────────────────────────

export function extractApiError(error: any, fallback = "Terjadi kesalahan"): string {
  return error?.response?.data?.error || error?.message || fallback
}
