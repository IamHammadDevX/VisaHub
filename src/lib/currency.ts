import countries from "world-countries";

export interface CurrencyInfo {
  code: string;   // lowercase ISO 4217, e.g. "inr", "usd", "pkr"
  symbol: string; // e.g. "₹", "$", "₨"
}

/**
 * Get currency info for a country by its common name.
 * Uses world-countries package for lookup.
 */
export function getCurrencyByCountryName(
  countryName: string
): CurrencyInfo | null {
  const country = countries.find(
    (c) =>
      c.name.common.toLowerCase() === countryName.toLowerCase()
  );
  if (!country?.currencies) return null;

  const codes = Object.keys(country.currencies);
  if (codes.length === 0) return null;

  const code = codes[0].toLowerCase();
  const symbol =
    country.currencies[codes[0]].symbol || code.toUpperCase();

  return { code, symbol };
}

/**
 * Get currency info for a country by Vughy API country ID.
 * Requires country name lookup first.
 */
export function getCurrencyByCountryId(
  countryId: number | string,
  countryIdMap: Map<string, string>
): CurrencyInfo | null {
  const name = countryIdMap.get(String(countryId));
  if (!name) return null;
  return getCurrencyByCountryName(name);
}

/** Fallback currency */
export const DEFAULT_CURRENCY: CurrencyInfo = {
  code: "usd",
  symbol: "$",
};

/** Format price with currency symbol */
export function formatCurrency(
  amount: number,
  currency: CurrencyInfo | null
): string {
  const c = currency ?? DEFAULT_CURRENCY;
  return `${c.symbol}${amount.toLocaleString()}`;
}

/** Lookup symbol from currency code using world-countries */
export function getCurrencySymbol(code: string): string {
  const upper = code.toUpperCase();
  for (const country of countries) {
    if (country.currencies?.[upper]) {
      return country.currencies[upper].symbol || upper;
    }
  }
  const fallbacks: Record<string, string> = {
    usd: "$", inr: "₹", pkr: "₨", gbp: "£", eur: "€",
    aud: "A$", cad: "C$", aed: "د.إ", sar: "﷼",
    ngn: "₦", kes: "KSh", zar: "R", cny: "¥",
    jpy: "¥", krw: "₩", myr: "RM", sgd: "S$",
  };
  return fallbacks[code.toLowerCase()] || code.toUpperCase();
}

/** Format price with currency code string */
export function formatCurrencyByCode(
  amount: number,
  code: string
): string {
  return `${getCurrencySymbol(code)}${amount.toLocaleString()}`;
}
