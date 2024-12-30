/**
 * Generates a unique ID with a given prefix
 * @param prefix Optional prefix for the ID
 * @returns A unique ID string
 */
export function generateId(prefix?: string): string {
  const uniquePart = Math.random().toString(36).substring(2, 15);
  return prefix ? `${prefix}-${uniquePart}` : uniquePart;
} 