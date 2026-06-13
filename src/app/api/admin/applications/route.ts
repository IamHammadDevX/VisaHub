import { NextRequest, NextResponse } from "next/server";
import { getStripe, sessionToApplication } from "@/lib/stripe-applications";
import type { StoredApplication } from "@/types/application";

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
    const { referenceId, status } = await req.json();

    if (!referenceId || !status) {
      return NextResponse.json(
        { error: "referenceId and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["payment_pending", "paid", "progress", "under_review", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const results = await stripe.checkout.sessions.list({ limit: 100 });
    const session = results.data.find(
      (s) => s.metadata?.referenceId === referenceId
    );

    if (!session) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const updated = await stripe.checkout.sessions.update(session.id, {
      metadata: {
        ...(session.metadata || {}),
        status,
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json(sessionToApplication(updated));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
