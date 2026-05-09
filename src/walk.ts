export interface WalkEntry {
  path: string;
  value: unknown;
}

export function flatten(value: unknown, basePath = "$", entries: WalkEntry[] = []): WalkEntry[] {
  entries.push({ path: basePath, value });
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${basePath}[${index}]`, entries));
    return entries;
  }
  if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) flatten(child, `${basePath}.${escapeKey(key)}`, entries);
  }
  return entries;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function stringifyValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null || value === undefined) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function escapeKey(key: string): string {
  return /^[A-Za-z0-9_-]+$/.test(key) ? key : JSON.stringify(key);
}
