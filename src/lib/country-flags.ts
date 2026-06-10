import countries from "world-countries";

const nameToFlag = new Map<string, string>();

// Build lookup: try common name, official name, and lowercase variants
for (const c of countries) {
  nameToFlag.set(c.name.common.toLowerCase(), c.flag);
  nameToFlag.set(c.name.official.toLowerCase(), c.flag);
  // Also store by cca2 for direct code lookup
  nameToFlag.set(c.cca2.toLowerCase(), c.flag);
}

export function getFlagEmoji(name: string): string | undefined {
  return nameToFlag.get(name.trim().toLowerCase());
}

export function enrichWithFlag(
  raw: { name?: string; [key: string]: unknown }
): { name?: string; flag?: string; [key: string]: unknown } {
  const name = raw.name;
  if (!name) return raw;
  const flag = getFlagEmoji(name as string);
  return { ...raw, flag: flag ?? undefined };
}
