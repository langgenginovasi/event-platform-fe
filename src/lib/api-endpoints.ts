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

// ─── Attendances ────────────────────────────────────────────────────────────
export const GET_ATTENDANCES = (eventId?: string, eventGroupId?: string, registrationId?: string) => {
  const params = new URLSearchParams();
  if (eventId) params.append("event_id", eventId);
  if (eventGroupId) params.append("event_group_id", eventGroupId);
  if (registrationId) params.append("registration_id", registrationId);
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

