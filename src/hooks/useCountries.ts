"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCountries } from "@/services/country.service";
import type { Country } from "@/types/country";

export function useCountries() {
  return useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });
}
