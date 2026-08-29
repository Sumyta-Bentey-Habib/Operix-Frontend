/**
 * Utility to obfuscate raw internal database IDs (UUIDs, MongoDB ObjectIDs, numeric IDs)
 * so they are never exposed directly in frontend UI sections or DOM elements.
 */

export function obfuscateId(rawId: string | null | undefined, prefix?: string): string {
  if (!rawId || typeof rawId !== "string") {
    return "N/A";
  }

  const cleanId = rawId.trim();
  if (!cleanId) {
    return "N/A";
  }

  const pfx = prefix ? `${prefix.toUpperCase()}-` : "";

  if (cleanId.length <= 4) {
    return `${pfx}****${cleanId}`;
  }

  const lastFour = cleanId.slice(-4);
  return `${pfx}****${lastFour}`;
}

export function formatPublicHandle(
  name: string | null | undefined,
  fallbackId: string,
  prefix: string = "USER",
): string {
  if (name && name.trim().length > 0) {
    return name.trim();
  }
  return obfuscateId(fallbackId, prefix);
}
