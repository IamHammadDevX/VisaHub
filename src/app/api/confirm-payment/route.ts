import { NextRequest, NextResponse } from "next/server";
import { buildReceiptEmail } from "@/lib/email-template";
import { getApplication, updateApplication } from "@/lib/application-store";

async function sendReceiptEmail(referenceId: string) {
  const application = await getApplication(referenceId);
  if (!application || application.receiptSent) return application;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const trackLink = `${baseUrl}/track?ref=${application.referenceId}`;
  const formLink = `${baseUrl}/apply/details?ref=${application.referenceId}`;
  const phone = `${application.basicInfo.phoneCountryCode} ${application.basicInfo.phoneNumber}`;

  const html = buildReceiptEmail({
    referenceId: application.referenceId,
    visaType: application.visaType,
    amount: application.amount,
    date: application.paidAt || new Date().toISOString(),
    trackLink,
    formLink,
    originCountry: application.originCountry,
    destinationCountry: application.destinationCountry,
    applicantName: application.basicInfo.fullName,
    phone,
  });

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "visahub@resend.dev",
      to: application.basicInfo.email,
      subject: `VisaHub receipt ${application.referenceId}`,
      html,
    });
  } catch {
    console.log(`[DEV] Would send receipt to ${application.basicInfo.email}`);
    console.log(`[DEV] Track link: ${trackLink}`);
    console.log(`[DEV] Detailed form link: ${formLink}`);
  }

  return updateApplication(referenceId, { receiptSent: true });
}

export async function POST(req: NextRequest) {
  try {
    const { referenceId, sessionId } = await req.json();

    if (!referenceId || !sessionId) {
      return NextResponse.json(
        { error: "referenceId and sessionId are required" },
        { status: 400 }
      );
    }

    const application = await getApplication(referenceId);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    let paid = false;

    if (String(sessionId).startsWith("cs_dev_")) {
      paid = process.env.NODE_ENV !== "production";
    } else {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
          { error: "Stripe is not configured" },
          { status: 500 }
        );
      }

      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(String(sessionId));
      paid =
        session.payment_status === "paid" &&
        session.metadata?.referenceId === referenceId;
    }

    if (!paid) {
      return NextResponse.json(
        { error: "Payment is not confirmed" },
        { status: 402 }
      );
    }

    await updateApplication(referenceId, {
      sessionId: String(sessionId),
      status: application.status === "payment_pending" ? "paid" : application.status,
      paidAt: application.paidAt || new Date().toISOString(),
    });

    const updated = await sendReceiptEmail(referenceId);
    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to confirm payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
