import { NextRequest, NextResponse } from "next/server";
import { getApplication, updateApplication } from "@/lib/application-store";

export async function POST(req: NextRequest) {
  try {
    const { referenceId, formData } = await req.json();

    if (!referenceId || !formData) {
      return NextResponse.json(
        { error: "referenceId and formData are required" },
        { status: 400 }
      );
    }

    const existing = await getApplication(referenceId);
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (existing.status === "payment_pending") {
      return NextResponse.json(
        { error: "Payment must be completed before submitting the visa form" },
        { status: 402 }
      );
    }

    const application = await updateApplication(referenceId, {
      detailedForm: formData,
      status: "progress",
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json(application);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit visa form";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
