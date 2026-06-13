import { NextRequest, NextResponse } from "next/server";
import { findApplicationByReference } from "@/lib/stripe-applications";

export async function GET(req: NextRequest) {
  try {
    const ref = req.nextUrl.searchParams.get("ref");

    if (!ref) {
      return NextResponse.json({ error: "Receipt ID is required" }, { status: 400 });
    }

    const application = await findApplicationByReference(ref);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
