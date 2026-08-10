// ─── Error Utilities ────────────────────────────────────────────────────────

export function extractApiError(error: any, fallback = "Terjadi kesalahan"): string {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  )
}
