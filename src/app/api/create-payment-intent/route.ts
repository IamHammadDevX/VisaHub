import { NextRequest, NextResponse } from "next/server";
import {
  createApplication,
  generateReferenceId,
} from "@/lib/application-store";

export async function POST(req: NextRequest) {
  try {
    const {
      amount,
      visaType,
      visaId,
      visaTypeId,
      originCountry,
      destinationCountry,
      basicInfo,
    } =
      await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    if (!basicInfo?.fullName || !basicInfo?.email || !basicInfo?.phoneNumber) {
      return NextResponse.json(
        { error: "Basic applicant information is required" },
        { status: 400 }
      );
    }

    const referenceId = generateReferenceId();

    if (!process.env.STRIPE_SECRET_KEY) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Stripe is not configured" },
          { status: 500 }
        );
      }

      const mockId = "cs_dev_" + Date.now();
      await createApplication({
        referenceId,
        sessionId: mockId,
        visaId: String(visaId || "0"),
        visaTypeId: String(visaTypeId || ""),
        visaType: String(visaType || "Visa"),
        originCountry: String(originCountry || ""),
        destinationCountry: String(destinationCountry || ""),
        amount: Number(amount),
        basicInfo,
      });

      return NextResponse.json({
        id: mockId,
        url: `/payment/success?session_id=${mockId}&ref=${referenceId}`,
        referenceId,
        mock: true,
      });
    }

    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${visaType || "Visa"} Application`,
              description: `Ref: ${referenceId} | Visa #${visaId}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        referenceId,
        visaId: String(visaId || ""),
        visaTypeId: String(visaTypeId || ""),
        originCountry: String(originCountry || ""),
        destinationCountry: String(destinationCountry || ""),
        visaType: String(visaType || ""),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}&ref=${referenceId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/cancel`,
    });

    await createApplication({
      referenceId,
      sessionId: session.id,
      visaId: String(visaId || "0"),
      visaTypeId: String(visaTypeId || ""),
      visaType: String(visaType || "Visa"),
      originCountry: String(originCountry || ""),
      destinationCountry: String(destinationCountry || ""),
      amount: Number(amount),
      basicInfo,
    });

    return NextResponse.json({
      id: session.id,
      url: session.url,
      referenceId,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
