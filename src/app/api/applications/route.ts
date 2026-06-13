import { NextRequest, NextResponse } from "next/server";
import { getApplication } from "@/lib/application-store";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");

  if (!ref) {
    return NextResponse.json({ error: "Receipt ID is required" }, { status: 400 });
  }

  const application = await getApplication(ref);
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json(application);
}
