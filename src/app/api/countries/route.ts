import { NextResponse } from "next/server";
import vughyClient from "@/lib/vughy-client";

export async function GET() {
  try {
    const { data } = await vughyClient.get("/visacountry");
    const countries: unknown[] = data.message ?? data;

    // Enrich with flags, catch gracefully if world-countries fails
    let enriched: unknown[] = countries;
    try {
      const { enrichWithFlag } = await import("@/lib/country-flags");
      enriched = countries.map((c) =>
        enrichWithFlag(c as { name?: string; [key: string]: unknown })
      );
    } catch {
      // world-countries import failed — return countries without flags
      console.warn("world-countries not available, serving countries without flags");
    }

    return NextResponse.json(enriched);
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: unknown }; message?: string };
    console.error("Countries API error:", err.response?.status, err.message);

    if (err.response?.status === 401) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }
    if (err.response?.status === 403) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to fetch countries. Please try again later." },
      { status: 500 }
    );
  }
}
