/**
 * Returns today's date as YYYY-MM-DD in the DEVICE'S LOCAL timezone.
 * Deliberately NOT using Date.toISOString(), which converts to UTC —
 * that caused a real bug where late-evening local times rolled over to
 * "tomorrow" from the backend's perspective, producing a 404.
 */
export function todayLocalIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
