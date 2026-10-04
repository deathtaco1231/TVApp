export function hasKickoff(date: number): boolean {
  return Number.isFinite(date) && date > 0;
}

export function isSameLocalDay(date: number, now: number = Date.now()): boolean {
  if (!hasKickoff(date) || !hasKickoff(now)) {
    return false;
  }
  const a = new Date(date);
  const b = new Date(now);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
