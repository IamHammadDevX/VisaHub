import type {
  VisaCard,
  VisaDocumentGroup,
  VisaDocumentParams,
  VisaSearchParams,
} from "@/types/visa";

interface VughyVisaDetail {
  id?: string;
  type_of_visa?: string;
  visa_type_name?: string;
  visa_type?: string;
  price?: string;
  service_charge?: string;
  visa_fee?: string;
  service_fee?: string;
  total_fee?: string;
  visa_validity?: string;
  length_of_stay?: string;
  stay_duration?: string;
  time_to_get_visa?: string;
  processing_time?: string;
  entry_type?: string;
  visa_type_id?: string;
  description?: string;
  visa_fee_seprate?: string;
}

function parsePrice(val: string | undefined): number {
  if (!val || val === "-" || val === "") return 0;
  return Number(parseFloat(val.replace(/[^0-9.]/g, "")).toFixed(2));
}

function normalizeVisa(raw: VughyVisaDetail): VisaCard {
  const visaFee = parsePrice(raw.price ?? raw.visa_fee);
  const serviceFee = parsePrice(raw.service_charge ?? raw.service_fee);
  const feeSeparate = raw.visa_fee_seprate === "1";

  return {
    id: Number(raw.id ?? 0),
    visaTypeId: Number(raw.visa_type_id ?? 0),
    visaType: raw.type_of_visa ?? raw.visa_type_name ?? raw.visa_type ?? "Unknown",
    visaFee: feeSeparate ? 0 : visaFee,
    serviceFee,
    totalFee: feeSeparate ? serviceFee : visaFee + serviceFee,
    visaFeeSeparate: feeSeparate,
    processingTime: raw.time_to_get_visa ?? raw.processing_time ?? "N/A",
    validity: raw.visa_validity ?? "N/A",
    stayDuration: raw.length_of_stay ?? raw.stay_duration ?? "N/A",
    entryType: raw.entry_type ?? "N/A",
    description: raw.description,
  };
}

export async function searchVisas(
  params: VisaSearchParams
): Promise<VisaCard[]> {
  const res = await fetch(`/api/search-visas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Search failed: ${res.status}`);
  }

  const data: VughyVisaDetail[] = await res.json();
  return data.map(normalizeVisa);
}

export async function fetchVisaDocuments(
  params: VisaDocumentParams
): Promise<VisaDocumentGroup[]> {
  const res = await fetch("/api/visa-documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Documents failed: ${res.status}`);
  }

  return res.json();
}
