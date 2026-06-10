import { NextResponse } from "next/server";
import vughyClient from "@/lib/vughy-client";
import { enrichWithFlag } from "@/lib/country-flags";

export async function GET() {
  try {
    const { data } = await vughyClient.get("/visacountry");
    const countries: unknown[] = data.message ?? data;
    const enriched = countries.map((c: unknown) =>
      enrichWithFlag(c as { name?: string; [key: string]: unknown })
    );
    return NextResponse.json(enriched);
  } catch (error: unknown) {
    const status =
      error && typeof error === "object" && "response" in error
        ? (error as { response: { status: number } }).response.status
        : 500;
    const message = status === 401
      ? "Invalid API key"
      : status === 403
        ? "Access denied"
        : "Failed to fetch countries";
    return NextResponse.json({ error: message }, { status });
  }
}
