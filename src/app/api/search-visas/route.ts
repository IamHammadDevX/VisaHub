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
    const result = (data as { message?: unknown[] }).message ?? [];
    return NextResponse.json(result);
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
