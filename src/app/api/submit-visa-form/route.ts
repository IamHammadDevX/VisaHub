import { NextRequest, NextResponse } from "next/server";
import {
  findApplicationByReference,
  getStripe,
} from "@/lib/stripe-applications";
import { buildDetailedFormEmail } from "@/lib/email-template";

export async function POST(req: NextRequest) {
  try {
    const { referenceId, formData, formLabels } = await req.json();

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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const trackLink = `${baseUrl}/track?ref=${referenceId}`;
    const phone = `${existing.basicInfo.phoneCountryCode || ""} ${existing.basicInfo.phoneNumber || ""}`.trim();

    const html = buildDetailedFormEmail({
      referenceId,
      visaType: existing.visaType,
      amount: existing.amount,
      originCountry: existing.originCountry,
      destinationCountry: existing.destinationCountry,
      applicantName: existing.basicInfo.fullName,
      nationality: existing.basicInfo.nationality,
      passportNumber: existing.basicInfo.passportNumber,
      travelDate: existing.basicInfo.travelDate,
      dateOfBirth: existing.basicInfo.dateOfBirth,
      phone: phone || undefined,
      email: existing.basicInfo.email,
      formData,
      trackLink,
    });

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "visahub@resend.dev",
        to: existing.basicInfo.email,
        cc: process.env.APPLICATION_ADMIN_EMAIL || "sanjai.sonatech@gmail.com",
        subject: `Detailed visa form submitted ${referenceId}`,
        html,
      });
      console.log(`[VisaHub] Detailed form email sent to ${recipients.join(", ")}`);
    } catch (emailErr) {
      console.error(`[VisaHub] Failed to send detailed form email for ${referenceId}:`, emailErr);
      // Non-blocking — form submission succeeds even if email fails
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(existing.sessionId || "");
    const metadataUpdate: Record<string, string> = {
      ...(session.metadata || {}),
      formSubmitted: "true",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store form data in metadata (JSON stringified)
    try {
      const formJson = JSON.stringify(formData);
      if (formJson.length <= 500) {
        metadataUpdate.detailedForm = formJson;
      } else {
        // Split across multiple keys if too large
        const chunks = formJson.match(/.{1,500}/g) || [];
        chunks.forEach((chunk, i) => {
          metadataUpdate[`df${i}`] = chunk;
        });
        metadataUpdate.dfChunks = String(chunks.length);
      }
    } catch {
      // If JSON fails, skip storing form data in metadata
    }

    // Store form labels in metadata
    if (formLabels) {
      try {
        metadataUpdate.formLabels = JSON.stringify(formLabels);
      } catch {
        // skip if serialization fails
      }
    }

    const updated = await stripe.checkout.sessions.update(existing.sessionId || "", {
      metadata: metadataUpdate,
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
