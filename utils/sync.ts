/**
 * A record is synced if its ID is a numeric string (server-assigned).
 * Local-only records have alphanumeric IDs from generateId().
 */
export function isSynced(id: string): boolean {
  const n = parseInt(id, 10);
  return !isNaN(n) && String(n) === id;
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
