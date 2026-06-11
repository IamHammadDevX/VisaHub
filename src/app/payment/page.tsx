"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, Loader2, AlertTriangle, CreditCard, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const amount = searchParams.get("amount");
  const visaType = searchParams.get("visaType");
  const visaId = searchParams.get("visaId");
  const originCountry = searchParams.get("originCountry");
  const destinationCountry = searchParams.get("destinationCountry");
  const userEmail = searchParams.get("email") || sessionStorage.getItem("visaUserEmail") || "";

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Retrieve saved form data from sessionStorage
  const [formData, setFormData] = useState<Record<string, string>>({});
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("visaFormData");
      if (saved) setFormData(JSON.parse(saved));
    } catch {}
  }, []);

  async function handlePay() {
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount || 0),
          visaType: visaType || "Visa",
          visaId: visaId || "0",
          originCountry: originCountry || "",
          destinationCountry: destinationCountry || "",
          formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Payment failed");

      // Save visa application data with reference ID for tracking
      if (data.referenceId) {
        const applicationData = {
          referenceId: data.referenceId,
          visaType: visaType || "Visa",
          visaId: visaId || "0",
          originCountry: originCountry || "",
          destinationCountry: destinationCountry || "",
          amount: Number(amount || 0),
          email: decodeURIComponent(userEmail || ""),
          status: "pending",
          date: new Date().toISOString(),
          formData,
        };
        sessionStorage.setItem(
          `visaApp_${data.referenceId}`,
          JSON.stringify(applicationData)
        );
        sessionStorage.setItem("last_ref", data.referenceId);
      }

      if (data.mock) {
        // Dev mode — no Stripe keys configured
        router.push(data.url);
      } else if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setProcessing(false);
    }
  }

  if (!amount) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <CreditCard className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Payment Required</h3>
        <p className="text-sm text-foreground-muted max-w-sm mb-6">
          No payment amount was specified.
        </p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </Link>
      </div>
    );
  }

  const total = Number(amount);

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Complete Payment</h1>
          <p className="text-sm text-foreground-muted">
            Secure payment for your visa application
          </p>
        </div>

        {/* Order summary */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-foreground-muted">Visa Type</span>
            <span className="text-foreground font-medium">{visaType || "Visa"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground-muted">Visa Fee</span>
            <span className="text-foreground font-medium">${total.toLocaleString()}</span>
          </div>
          <div className="border-t border-white/[0.06] pt-3 flex justify-between">
            <span className="text-foreground font-semibold">Total</span>
            <span className="text-primary font-bold text-lg">
              ${total.toLocaleString()}.00
            </span>
          </div>
        </div>

        {/* Payment info */}
        <div className="flex items-center gap-2 mb-6 text-xs text-foreground-muted/60 justify-center">
          <Lock className="h-3.5 w-3.5" />
          <span>Secured by Stripe · 256-bit encrypted</span>
        </div>

        {/* Pay button */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button
          onClick={handlePay}
          disabled={processing}
          size="xl"
          className="w-full"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Pay ${total.toLocaleString()}.00
            </>
          )}
        </Button>

        <p className="text-xs text-foreground-muted/50 text-center mt-4">
          Your card will be charged once the payment is confirmed.
        </p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen pt-20">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-foreground-muted">Loading...</p>
          </div>
        }
      >
        <PaymentContent />
      </Suspense>
    </div>
  );
}
