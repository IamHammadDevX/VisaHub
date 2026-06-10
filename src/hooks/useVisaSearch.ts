"use client";

import { useQuery } from "@tanstack/react-query";
import { searchVisas } from "@/services/visa.service";
import type { VisaCard, VisaSearchParams } from "@/types/visa";

export function useVisaSearch(params: VisaSearchParams | null) {
  return useQuery<VisaCard[]>({
    queryKey: ["visa-search", params?.originCountry, params?.destinationCountry],
    queryFn: () => searchVisas(params!),
    enabled: !!params,
    retry: 1,
    staleTime: 10 * 60 * 1000,
  });
}
