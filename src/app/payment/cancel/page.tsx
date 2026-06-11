"use client";

import { Suspense } from "react";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function CancelContent() {
  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 text-center">
        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
          <XCircle className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Payment Cancelled
        </h1>
        <p className="text-sm text-foreground-muted mb-8">
          Your payment was not processed. You can try again whenever you&apos;re ready.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <div className="min-h-screen pt-20">
      <Suspense fallback={null}>
        <CancelContent />
      </Suspense>
    </div>
  );
}
