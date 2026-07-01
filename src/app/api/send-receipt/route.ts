import { NextRequest, NextResponse } from "next/server";
import { buildReceiptEmail } from "@/lib/email-template";

export async function POST(req: NextRequest) {
  try {
    const {
      referenceId,
      visaType,
      amount,
      date,
      email,
      originCountry,
      destinationCountry,
      applicantName,
      phone,
    } =
      await req.json();

    if (!email || !referenceId) {
      return NextResponse.json(
        { error: "Email and referenceId are required" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const trackLink = `${baseUrl}/track?ref=${referenceId}`;

    const html = buildReceiptEmail({
      referenceId,
      visaType: visaType || "Visa",
      amount: Number(amount || 0),
      date: date || new Date().toISOString(),
      trackLink,
      originCountry: String(originCountry || ""),
      destinationCountry: String(destinationCountry || ""),
      applicantName,
      phone,
    });

    // Try Resend, fall back gracefully if not configured
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "visahub@resend.dev",
        to: email,
        cc: process.env.APPLICATION_ADMIN_EMAIL || "sanjai.sonatech@gmail.com",
        subject: `Visa Application Confirmed — ${referenceId}`,
        html,
      });
      console.log(`Receipt sent to ${email} for ${referenceId}`);
    } catch {
      // Resend not configured — log in dev, will work when key is added
      console.log(`[DEV] Would send receipt to ${email} for ${referenceId}`);
      console.log(`[DEV] Track link: ${trackLink}`);
    }

    return NextResponse.json({ success: true, referenceId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
