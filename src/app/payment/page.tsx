"use client";

import { CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <CreditCard className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Payment Starts After Basic Info
        </h1>
        <p className="text-sm text-foreground-muted mb-6">
          Select a visa, enter applicant basic information, then Stripe Checkout
          will open automatically.
        </p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Start Application
          </Button>
        </Link>
      </div>
    </div>
  );
}
