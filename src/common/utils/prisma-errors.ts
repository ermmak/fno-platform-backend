import { Prisma } from '@prisma/client';

/**
 * Extracts the field name(s) that caused a unique constraint violation.
 * Handles both array format and string format of meta.target.
 *
 * Note: The regex for index name parsing assumes single-field indexes with
 * pattern "tablename_fieldname_key". For composite indexes or fields with
 * underscores, consider using case-insensitive `includes()` matching instead.
 */
export function getUniqueConstraintField(
  error: Prisma.PrismaClientKnownRequestError,
): string[] {
  const target = error.meta?.target;

  if (Array.isArray(target)) {
    return target.filter((t): t is string => typeof t === 'string');
  }

  if (typeof target === 'string') {
    // Sometimes Prisma returns the index name, try to extract field
    // e.g., "users_email_key" -> "email"
    const match = target.match(/_([^_]+)_key$/);
    if (match) {
      return [match[1]];
    }
    return [target];
  }

  return [];
}

/**
 * Checks if a unique constraint violation includes a specific field.
 */
export function isUniqueConstraintOn(
  error: Prisma.PrismaClientKnownRequestError,
  field: string,
): boolean {
  const fields = getUniqueConstraintField(error);
  return fields.some((f) => f.toLowerCase().includes(field.toLowerCase()));
}
