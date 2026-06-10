import type { Country } from "@/types/country";

interface VughyCountry {
  id?: number;
  name?: string;
  country_id?: number;
  country_name?: string;
  country_iso_code?: string;
  flag?: string;
}

function normalizeCountry(raw: VughyCountry): Country {
  return {
    id: Number(raw.id ?? raw.country_id ?? 0),
    name: raw.name ?? raw.country_name ?? "Unknown",
    code: raw.country_iso_code,
    flag: raw.flag,
  };
}

export async function fetchCountries(): Promise<Country[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/countries`, {
    cache: "force-cache",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch countries: ${res.status}`);
  }

  const data: VughyCountry[] = await res.json();
  return data.map(normalizeCountry);
}
