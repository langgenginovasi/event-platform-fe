// ─── API endpoint builders for SWR keys ─────────────────────────────────────
// These functions build the URL paths that SWR uses as cache keys AND fetch URLs.
// The global SWRProvider's fetcher will prefix these with NEXT_PUBLIC_API_URL.

// ─── Event Groups ───────────────────────────────────────────────────────────
export const GET_EVENT_GROUPS = () => `/event-groups`;
export const GET_EVENT_GROUP_DETAIL = (id: string) => `/event-groups/${id}`;

// ─── Events ─────────────────────────────────────────────────────────────────
// export const GET_EVENTS = () => `/events`;
// ─── Events ─────────────────────────────────────────────────────────────────
export const GET_EVENTS_ALL = (eventGroupId?: string) =>
  `/events?event_group_id=${eventGroupId}`;

export const POST_EVENTS = () => `events`;
export const GET_EVENTS = () => `events`;

export const MUTATE_EVENT = () => `/events`;
export const MUTATE_EVENT_DETAIL = (id: string | number) => `/events/${id}`;

// ─── Registrations (Participants) ───────────────────────────────────────────
// ─── Registrations (Participants) ───────────────────────────────────────────
export const GET_REGISTRATIONS = (eventId?: number) =>
  eventId ? `/registrations?event_id=${eventId}` : `/registrations`;

// Endpoint untuk mengambil semua registrasi berdasarkan Event Group ID
export const GET_REGISTRATIONS_BY_GROUP = (eventGroupId: string) =>
  `/registrations?event_group_id=${eventGroupId}`;

// Endpoint untuk mengambil semua registrasi berdasarkan Event ID biasa
export const GET_REGISTRATIONS_BY_EVENT = (eventId: string | number) =>
  `/registrations?event_id=${eventId}`;

// 1. Endpoint khusus untuk membuat (POST) Registrasi Baru
export const POST_REGISTRATION = () => `/registrations`;

// 2. (Opsional) Jika nanti butuh Mutasi/Detail per ID registrasi (PUT/DELETE)
export const MUTATE_REGISTRATION_DETAIL = (id: string | number) =>
  `/registrations/${id}`;

export const GET_REGISTRATION_DETAIL_BY_PARTICIPANT = (participantId: string) =>
  `/registrations?participant_id=${participantId}`;

// ─── Attendances ────────────────────────────────────────────────────────────
export const GET_ATTENDANCES = (sessionId?: number) =>
  sessionId ? `/attendances?session_id=${sessionId}` : `/attendances`;

// ─── Sessions ───────────────────────────────────────────────────────────────
export const GET_SESSIONS = (eventId?: number) =>
  eventId ? `/sessions?event_id=${eventId}` : `/sessions`;

// ─── Users ──────────────────────────────────────────────────────────────────
export const GET_USERS = () => `/users`;

// ─── Participant ──────────────────────────────────────────────────────────────────s
export const GET_PARTICIPANTS = () => `/participants`;
export const GET_PARTICIPANT_DETAIL = (id: string) => `/participants/${id}`;
