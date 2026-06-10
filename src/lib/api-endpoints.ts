// ─── API endpoint builders for SWR keys ─────────────────────────────────────
// These functions build the URL paths that SWR uses as cache keys AND fetch URLs.
// The global SWRProvider's fetcher will prefix these with NEXT_PUBLIC_API_URL.

// ─── Event Groups ───────────────────────────────────────────────────────────
export const GET_EVENT_GROUPS = () => `/event-groups`;

// ─── Events ─────────────────────────────────────────────────────────────────
export const GET_EVENTS = () => `/events`;

// ─── Registrations (Participants) ───────────────────────────────────────────
export const GET_REGISTRATIONS = (eventId?: number) =>
  eventId ? `/registrations?event_id=${eventId}` : `/registrations`;

// ─── Attendances ────────────────────────────────────────────────────────────
export const GET_ATTENDANCES = (sessionId?: number) =>
  sessionId ? `/attendances?session_id=${sessionId}` : `/attendances`;

// ─── Sessions ───────────────────────────────────────────────────────────────
export const GET_SESSIONS = (eventId?: number) =>
  eventId ? `/sessions?event_id=${eventId}` : `/sessions`;

// ─── Users ──────────────────────────────────────────────────────────────────
export const GET_USERS = () => `/users`;
