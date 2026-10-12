function isDroppedOrExpelled(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toUpperCase().replace(/[^A-Z]/g, '');
  return normalized === 'DROPPED' || normalized === 'EXPELLED';
}

export function isFollowUpAvailable(childStatus: unknown, disciplinaryType: unknown): boolean {
  return !isDroppedOrExpelled(childStatus) && !isDroppedOrExpelled(disciplinaryType);
}
