import { NextRequest, NextResponse } from "next/server";
import { getStripe, sessionToApplication } from "@/lib/stripe-applications";
import { buildNoteEmail } from "@/lib/email-template";
import type { AdminNote, StoredApplication } from "@/types/application";

export async function GET() {
  try {
    const stripe = getStripe();
    const results = await stripe.checkout.sessions.list({ limit: 100 });
    const applications: StoredApplication[] = results.data.map(sessionToApplication);
    return NextResponse.json(applications);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch applications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { referenceId, status, adminNotes } = await req.json();

    if (!referenceId) {
      return NextResponse.json(
        { error: "referenceId is required" },
        { status: 400 }
      );
    }

    if (!status && adminNotes === undefined) {
      return NextResponse.json(
        { error: "status or adminNotes is required" },
        { status: 400 }
      );
    }

    if (status) {
      const validStatuses = ["payment_pending", "paid", "progress", "under_review", "completed"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const stripe = getStripe();
    const results = await stripe.checkout.sessions.list({ limit: 100 });
    const session = results.data.find(
      (s) => s.metadata?.referenceId === referenceId
    );

    if (!session) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const metadataUpdate: Record<string, string> = {
      ...(session.metadata || {}),
      updatedAt: new Date().toISOString(),
    };

    if (status) {
      metadataUpdate.status = status;
    }

    if (adminNotes !== undefined) {
      // Append new note to existing notes array
      const existingRaw = (session.metadata || {}).adminNotes || "";
      let notes: AdminNote[] = [];
      try {
        const parsed = JSON.parse(existingRaw);
        if (Array.isArray(parsed)) {
          notes = parsed as AdminNote[];
        } else {
          // Legacy plain string — wrap as single old note
          notes = [{ text: existingRaw, timestamp: "" }];
        }
      } catch {
        if (existingRaw) {
          notes = [{ text: existingRaw, timestamp: "" }];
        }
      }
      notes.push({ text: String(adminNotes), timestamp: new Date().toISOString() });
      metadataUpdate.adminNotes = JSON.stringify(notes);
    }

    const updated = await stripe.checkout.sessions.update(session.id, {
      metadata: metadataUpdate,
    });

    // Send email to customer when admin adds a note
    if (adminNotes !== undefined) {
      const app = sessionToApplication(updated);
      const customerEmail = app.basicInfo.email;
      if (customerEmail) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const trackLink = `${baseUrl}/track?ref=${referenceId}`;
        const noteHtml = buildNoteEmail({
          referenceId,
          visaType: app.visaType,
          applicantName: app.basicInfo.fullName,
          noteText: String(adminNotes),
          trackLink,
        });
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "visahub@resend.dev",
            to: customerEmail,
            subject: `VisaHub Update — ${referenceId}`,
            html: noteHtml,
          });
          console.log(`[VisaHub] Note email sent to ${customerEmail} for ${referenceId}`);
        } catch (emailErr) {
          console.error(`[VisaHub] Failed to send note email for ${referenceId}:`, emailErr);
        }
      }
    }

    return NextResponse.json(sessionToApplication(updated));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
