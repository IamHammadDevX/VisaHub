import { NextRequest, NextResponse } from "next/server";
import {
  findApplicationByReference,
  getStripe,
} from "@/lib/stripe-applications";

function buildDetailedFormEmail({
  referenceId,
  formData,
}: {
  referenceId: string;
  formData: Record<string, string>;
}) {
  const rows = Object.entries(formData)
    .map(
      ([key, value]) =>
        `<tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">${key}</td><td style="padding:8px;border:1px solid #e2e8f0">${value || "-"}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;color:#0f172a">
  <h2>Detailed Visa Form Submitted</h2>
  <p><strong>Receipt ID:</strong> ${referenceId}</p>
  <table style="border-collapse:collapse;width:100%;max-width:720px">${rows}</table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { referenceId, formData } = await req.json();

    if (!referenceId || !formData) {
      return NextResponse.json(
        { error: "referenceId and formData are required" },
        { status: 400 }
      );
    }

    const existing = await findApplicationByReference(referenceId);
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (existing.status === "payment_pending") {
      return NextResponse.json(
        { error: "Payment must be completed before submitting the visa form" },
        { status: 402 }
      );
    }

    const html = buildDetailedFormEmail({ referenceId, formData });
    const recipients = [
      existing.basicInfo.email,
      process.env.APPLICATION_ADMIN_EMAIL,
    ].filter(Boolean) as string[];

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "visahub@resend.dev",
        to: recipients,
        subject: `Detailed visa form submitted ${referenceId}`,
        html,
      });
    } catch {
      console.log(`[DEV] Would email detailed form for ${referenceId}`);
      console.log(formData);
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(existing.sessionId || "");
    const updated = await stripe.checkout.sessions.update(existing.sessionId || "", {
      metadata: {
        ...(session.metadata || {}),
        formSubmitted: "true",
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      ...existing,
      status: "progress",
      submittedAt: updated.metadata?.submittedAt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit visa form";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
