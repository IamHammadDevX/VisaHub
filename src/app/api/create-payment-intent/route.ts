import { NextRequest, NextResponse } from "next/server";

function generateRefId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VH-${id.slice(0, 4)}-${id.slice(4)}`;
}

export async function POST(req: NextRequest) {
  try {
    const { amount, visaType, visaId, originCountry, destinationCountry, formData } =
      await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const referenceId = generateRefId();

    // Lazy-load Stripe
    let stripe;
    try {
      const Stripe = require("stripe");
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    } catch {
      const mockId = "cs_dev_" + Date.now();
      return NextResponse.json({
        id: mockId,
        url: `/payment/success?session_id=${mockId}&ref=${referenceId}&amount=${amount}&visaType=${encodeURIComponent(visaType || "")}&visaId=${visaId}`,
        referenceId,
        mock: true,
      });
    }

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
        originCountry: String(originCountry || ""),
        destinationCountry: String(destinationCountry || ""),
        visaType: String(visaType || ""),
        formData: JSON.stringify(formData || {}),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}&ref=${referenceId}&amount=${amount}&visaType=${encodeURIComponent(visaType || "")}&visaId=${visaId}`,
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
