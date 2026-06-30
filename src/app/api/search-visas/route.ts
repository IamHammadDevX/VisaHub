import { NextRequest, NextResponse } from "next/server";
import { postForm } from "@/lib/vughy-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { originCountry, destinationCountry } = body;

    if (!originCountry || !destinationCountry) {
      return NextResponse.json(
        { error: "originCountry and destinationCountry are required" },
        { status: 400 }
      );
    }

    // POST /visacountry with from_country/to_country returns ALL visas for route
    const data = await postForm("/visacountry", {
      from_country: String(originCountry),
      to_country: String(destinationCountry),
    });

    // API returns { status: true, message: [visa1, visa2, ...] }
    const visas = (data as { message?: Record<string, unknown>[] }).message ?? [];

    // For each visa, fetch service fee details (visa_fee_seprate flag)
    const enrichedVisas = await Promise.all(
      visas.map(async (visa) => {
        try {
          const visaId = String(visa.visa_type_id ?? visa.id ?? "0");
          const feesData = await postForm("/Getvisaservicefees", {
            visaid: visaId,
            intersted_country: String(destinationCountry),
          });
          // Response may be { message: [{...}] } or direct array
          const feeRows: Record<string, unknown>[] =
            (feesData as { message?: Record<string, unknown>[] }).message ??
            (Array.isArray(feesData) ? (feesData as Record<string, unknown>[]) : []);
          const feeRow = feeRows[0] ?? {};

          return {
            ...visa,
            // Override pricing from Getvisaservicefees (authoritative)
            visa_fee: feeRow.amount ?? visa.visa_fee,
            service_fee: feeRow.service_amount ?? visa.service_fee,
            visa_fee_seprate: feeRow.visa_fee_seprate ?? "0",
          };
        } catch {
          // If service fee lookup fails, fall back with default flag
          return { ...visa, visa_fee_seprate: "0" };
        }
      })
    );

    return NextResponse.json(enrichedVisas);
  } catch (error: unknown) {
    const status =
      error && typeof error === "object" && "response" in error
        ? (error as { response: { status: number } }).response.status
        : 500;

    if (status === 500) {
      return NextResponse.json([]);
    }

    const message =
      status === 401
        ? "Unauthorized. Check API key."
        : status === 403
          ? "Access denied."
          : status === 429
            ? "Too many requests. Please try again later."
            : "An unexpected error occurred.";

    return NextResponse.json({ error: message }, { status });
  }
}
