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

    const data = await postForm("/getvisadetail", {
      value: "1",
      origin_country: String(originCountry),
      destination_country: String(destinationCountry),
    });

    // API returns { status: true, country_visa: [...] }
    const result = (data as { country_visa?: unknown[] }).country_visa ?? [];
    return NextResponse.json(result);
  } catch (error: unknown) {
    const status =
      error && typeof error === "object" && "response" in error
        ? (error as { response: { status: number } }).response.status
        : 500;

    if (status === 500) {
      // Gracefully return empty for internal API errors (PHP errors, no data)
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
