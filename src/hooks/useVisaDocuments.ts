"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchVisaDocuments } from "@/services/visa.service";
import type { VisaDocumentGroup, VisaDocumentParams } from "@/types/visa";

export function useVisaDocuments(params: VisaDocumentParams | null) {
  return useQuery<VisaDocumentGroup[]>({
    queryKey: [
      "visa-documents",
      params?.visaId,
      params?.originCountry,
      params?.destinationCountry,
    ],
    queryFn: () => fetchVisaDocuments(params!),
    enabled: !!params,
    retry: 1,
    staleTime: 30 * 60 * 1000,
  });
}
