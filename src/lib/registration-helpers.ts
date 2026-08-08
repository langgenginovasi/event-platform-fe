export function countEventsAttended(attendances: any[]): number {
  const eventIds = new Set(attendances.map((a) => a.event_id));
  return eventIds.size;
}

export function isFullyCheckedIn(attendances: any[], totalEvents: number): boolean {
  if (totalEvents === 0) return false;
  const checkinEvents = new Set(
    attendances.filter((a) => a.type === "checkin").map((a) => a.event_id)
  );
  return checkinEvents.size >= totalEvents;
}

export function isFullyCheckedOut(attendances: any[], totalEvents: number): boolean {
  if (totalEvents === 0) return false;
  const checkoutEvents = new Set(
    attendances.filter((a) => a.type === "checkout").map((a) => a.event_id)
  );
  return checkoutEvents.size >= totalEvents;
}

export function hasNotCheckedIn(attendances: any[]): boolean {
  return attendances.filter((a) => a.type === "checkin").length === 0;
}
