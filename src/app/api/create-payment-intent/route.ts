import { NextRequest, NextResponse } from "next/server";
import {
  generateReferenceId,
  getStripe,
} from "@/lib/stripe-applications";

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
    const stripe = getStripe();

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
        fullName: String(basicInfo.fullName || ""),
        email: String(basicInfo.email || ""),
        phoneCountryCode: String(basicInfo.phoneCountryCode || ""),
        phoneNumber: String(basicInfo.phoneNumber || ""),
        nationality: String(basicInfo.nationality || ""),
        dateOfBirth: String(basicInfo.dateOfBirth || ""),
        passportNumber: String(basicInfo.passportNumber || ""),
        travelDate: String(basicInfo.travelDate || ""),
        notes: String(basicInfo.notes || ""),
        formSubmitted: "false",
        receiptSent: "false",
      },
      customer_email: String(basicInfo.email || ""),
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}&ref=${referenceId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/cancel`,
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
