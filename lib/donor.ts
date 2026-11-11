// Pretty, shareable donor registration code derived from the Clerk user id.
// e.g. user_3LwJa3d4SXBs847kVpDgxDcaEmr -> DOA-3LWJ-A3D4
export function donorCode(clerkId: string): string {
  const base = clerkId.replace(/^user_/i, "").toUpperCase().slice(0, 8);
  return `DOA-${base.slice(0, 4)}-${base.slice(4)}`;
}

// Canonical alphanumeric form of any donor identifier (clerk id or DOA- code).
export function normalizeDonorId(value: string): string {
  return value
    .toUpperCase()
    .replace(/^(USER_|DOA-)/, "")
    .replace(/[^A-Z0-9]/g, "");
}

// SQL expression normalizing a stored donor id column the same way.
export function donorIdNormSql(column: string): string {
  return `regexp_replace(regexp_replace(upper(${column}), '^(USER_|DOA-)', ''), '[^A-Z0-9]', '', 'g')`;
}
