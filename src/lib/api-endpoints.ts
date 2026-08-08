// ─── API endpoint builders for SWR keys ─────────────────────────────────────
// These functions build the URL paths that SWR uses as cache keys AND fetch URLs.
// The global SWRProvider's fetcher will prefix these with NEXT_PUBLIC_API_URL.

// ─── Event Groups ───────────────────────────────────────────────────────────
export const GET_EVENT_GROUPS = (page = 1, limit = 10, search = "") => {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (search) params.append("search", search);
  return `/event-groups?${params.toString()}`;
};
export const GET_EVENT_GROUP_DETAIL = (id: string) => `/event-groups/${id}`;

// ─── Events ─────────────────────────────────────────────────────────────────
export const GET_EVENTS = (eventGroupId?: string, page = 1, limit = 10, search = "") => {
  const params = new URLSearchParams();
  if (eventGroupId) params.append("event_group_id", eventGroupId);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (search) params.append("search", search);
  return `/events?${params.toString()}`;
};

export const MUTATE_EVENT = () => `/events`;
export const MUTATE_EVENT_DETAIL = (id: string | number) => `/events/${id}`;

// ─── Registrations (Participants) ───────────────────────────────────────────
// ─── Registrations (Participants) ───────────────────────────────────────────
export const GET_REGISTRATIONS = (eventGroupId?: string, page = 1, limit = 10, search = "", sort?: string, order?: string) => {
  const params = new URLSearchParams();
  if (eventGroupId) params.append("event_group_id", eventGroupId);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (search) params.append("search", search);
  if (sort) params.append("sort", sort);
  if (order) params.append("order", order);
  return `/registrations?${params.toString()}`;
};
export const GET_REGISTRATION_DETAIL = (id: string) => `/registrations/${id}`;

export const GET_REGISTRATIONS_BY_GROUP = (eventGroupId: string) =>
  `/registrations?event_group_id=${eventGroupId}`;

export const GET_REGISTRATIONS_BY_EVENT = (eventId: string | number) =>
  `/registrations?event_id=${eventId}`;

// 1. Endpoint khusus untuk membuat (POST) Registrasi Baru
export const POST_REGISTRATION = () => `/registrations`;

export const MUTATE_REGISTRATION_DETAIL = (id: string | number) =>
  `/registrations/${id}`;

export const UPDATE_REGISTRATION = (id: string) => `/registrations/${id}`;

export const GET_REGISTRATION_DETAIL_BY_PARTICIPANT = (participantId: string) =>
  `/registrations?participant_id=${participantId}`;

// ─── Attendances ────────────────────────────────────────────────────────────
export const GET_ATTENDANCES = (eventId?: string, eventGroupId?: string, registrationId?: string, page = 1, limit = 10) => {
  const params = new URLSearchParams();
  if (eventId) params.append("event_id", eventId);
  if (eventGroupId) params.append("event_group_id", eventGroupId);
  if (registrationId) params.append("registration_id", registrationId);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  return `/attendances?${params.toString()}`;
};

// ─── Sessions ───────────────────────────────────────────────────────────────
export const GET_SESSIONS = (eventId?: string, page = 1, limit = 10, search = "") => {
  const params = new URLSearchParams();
  if (eventId) params.append("event_id", eventId);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (search) params.append("search", search);
  return `/sessions?${params.toString()}`;
};

// ─── Users ──────────────────────────────────────────────────────────────────
export const GET_USERS = () => `/users`;

// ─── Participant ──────────────────────────────────────────────────────────────────
export const GET_PARTICIPANTS = (page = 1, limit = 10, search = "", not_in_event_group?: string, sort?: string, order?: string) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (search) params.append("search", search);
  if (not_in_event_group) params.append("not_in_event_group", not_in_event_group);
  if (sort) params.append("sort", sort);
  if (order) params.append("order", order);
  return `/participants?${params.toString()}`;
};
export const GET_PARTICIPANT_DETAIL = (id: string) => `/participants/${id}`;
export const GET_PARTICIPANT_HISTORY = (id: string) => `/participants/${id}/history`;
export const UPDATE_PARTICIPANT = (id: string) => `/participants/${id}`;

// ─── Membership Types ────────────────────────────────────────────────────────
export const GET_MEMBERSHIP_TYPES = () => `/membership-types`;

// ─── Participation Types ─────────────────────────────────────────────────────
export const GET_PARTICIPATION_TYPES = () => `/participation-types`;

// ─── Event Group Participation Types ─────────────────────────────────────────
export const GET_EVENT_GROUP_PARTICIPATION_TYPES = (eventGroupId: string) => `/event-groups/${eventGroupId}/participation-types`;

