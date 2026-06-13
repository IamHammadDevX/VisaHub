"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle, Copy, ExternalLink, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StoredApplication } from "@/types/application";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const referenceId = searchParams.get("ref") || "";
  const [application, setApplication] = useState<StoredApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function confirmPayment() {
      try {
        if (!sessionId || !referenceId) {
          throw new Error("Payment session or receipt ID is missing");
        }

        const res = await fetch("/api/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, referenceId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Payment could not be confirmed");
        setApplication(data);

        // Save to localStorage for admin dashboard
        localStorage.setItem(`visaApp_${referenceId}`, JSON.stringify(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment could not be confirmed");
      } finally {
        setLoading(false);
      }
    }

    confirmPayment();
  }, [sessionId, referenceId]);

  function copyRef() {
    if (!referenceId) return;
    navigator.clipboard.writeText(referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-foreground-muted">
          Confirming payment and sending receipt...
        </p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Payment Check Failed</h1>
        <p className="text-sm text-foreground-muted mb-6">{error}</p>
        <Link href="/">
          <Button variant="outline">Back Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="rounded-2xl border border-green-100 bg-white p-8 md:p-10 text-center shadow-sm">
        <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <Badge variant="success" size="lg" className="mb-4">
          Payment Confirmed
        </Badge>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Receipt Sent to {application.basicInfo.email}
        </h1>
        <p className="text-sm text-foreground-muted mb-6">
          Complete the detailed visa form next. Our team will review your
          application and get back to you within 24 hours.
        </p>

        <div className="inline-flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5">
          <span className="text-xs text-foreground-muted">Receipt ID</span>
          <span className="text-lg font-mono font-bold text-foreground tracking-wide">
            {referenceId}
          </span>
          <button
            onClick={copyRef}
            className="ml-1 p-1.5 rounded-lg hover:bg-white transition-colors"
            aria-label="Copy receipt ID"
          >
            <Copy className="h-3.5 w-3.5 text-foreground-muted" />
          </button>
        </div>
        {copied && <p className="text-xs text-green-600 mt-2">Copied</p>}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground mb-1">Next Step</h2>
            <p className="text-sm text-foreground-muted">
              Fill the official detailed visa form for {application.visaType}.
              Your receipt ID works for tracking from any browser.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/apply/details?ref=${referenceId}`} className="flex-1">
          <Button className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Complete Visa Form
          </Button>
        </Link>
        <Link href={`/track?ref=${referenceId}`} className="flex-1">
          <Button variant="outline" className="w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            Track Application
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
