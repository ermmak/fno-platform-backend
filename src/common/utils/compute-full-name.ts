/**
 * Computes the full name in Kazakhstan format: LastName FirstName Patronymic
 * Handles empty strings and null values gracefully.
 */
export function computeFullName(user: {
  firstName: string;
  lastName: string;
  patronymic: string | null;
}): string {
  const parts = [user.lastName.trim(), user.firstName.trim()];
  if (user.patronymic?.trim()) {
    parts.push(user.patronymic.trim());
  }
  return parts.filter(Boolean).join(' ');
}
