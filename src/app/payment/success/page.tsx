"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  ArrowLeft,
  Copy,
  ExternalLink,
  Mail,
  Clock,
  Shield,
  CalendarDays,
  CreditCard,
  Globe,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppData {
  referenceId: string;
  visaType: string;
  visaId: string;
  originCountry: string;
  destinationCountry: string;
  amount: number;
  status: string;
  date: string;
  email?: string;
  formData: Record<string, string>;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const ref = searchParams.get("ref");
  const amount = searchParams.get("amount");
  const visaType = searchParams.get("visaType");
  const visaId = searchParams.get("visaId");

  const [appData, setAppData] = useState<AppData | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (ref) {
      const stored = sessionStorage.getItem(`visaApp_${ref}`);
      if (stored) {
        const parsed: AppData = JSON.parse(stored);
        parsed.status = "confirmed";
        parsed.date = parsed.date || new Date().toISOString();
        sessionStorage.setItem(`visaApp_${ref}`, JSON.stringify(parsed));
        setAppData(parsed);

        // Send receipt email
        if (parsed.email && !emailSent) {
          setEmailSent(true);
          fetch("/api/send-receipt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              referenceId: ref,
              visaType: decodeURIComponent(visaType || parsed.visaType || "Visa"),
              amount: Number(amount || parsed.amount || 0),
              date: parsed.date,
              visaId: visaId || parsed.visaId,
              email: parsed.email,
              originCountry: parsed.originCountry,
              destinationCountry: parsed.destinationCountry,
            }),
          }).catch(() => {}); // Silently fail if Resend not configured
        }
      } else {
        // Build fallback data from URL params
        const fromStorage = sessionStorage.getItem("visaFormData");
        let formData: Record<string, string> = {};
        try {
          if (fromStorage) formData = JSON.parse(fromStorage);
        } catch {}

        setAppData({
          referenceId: ref || "N/A",
          visaType: decodeURIComponent(visaType || "Visa"),
          visaId: visaId || "0",
          originCountry: "",
          destinationCountry: "",
          amount: Number(amount || 0),
          status: "confirmed",
          date: new Date().toISOString(),
          formData,
        });
      }
    }
  }, [ref, visaType, visaId, amount]);

  function copyRef() {
    if (ref) {
      navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const total = appData?.amount || Number(amount || 0);
  const bookingDate = appData
    ? new Date(appData.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Success Header */}
      <div className="rounded-2xl border border-green-500/10 bg-green-500/[0.03] backdrop-blur-xl p-8 md:p-10 text-center">
        <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-5 animate-in zoom-in-95 duration-300">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Payment Successful!
        </h1>
        <p className="text-sm text-foreground-muted mb-6 max-w-md mx-auto">
          Your visa application has been received and payment confirmed. We will process your application and get back to you within 24 hours.
        </p>

        {/* Reference Badge */}
        <div className="inline-flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-2.5">
          <span className="text-xs text-foreground-muted">Reference ID</span>
          <span className="text-lg font-mono font-bold text-foreground tracking-wide">
            {ref || "N/A"}
          </span>
          <button
            onClick={copyRef}
            className="ml-1 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Copy className="h-3.5 w-3.5 text-foreground-muted" />
          </button>
        </div>
        {copied && (
          <p className="text-xs text-green-400 mt-2 animate-in fade-in">
            Copied to clipboard!
          </p>
        )}

        <p className="text-xs text-foreground-muted/60 mt-4">
          Save this reference ID to track your application
        </p>
      </div>

      {/* Email Preview */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
        {/* Email Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">
              V
            </div>
            <span className="text-sm font-semibold text-foreground">
              VisaHub — Application Confirmation
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <p className="text-sm text-foreground-muted">
            Dear Applicant,
          </p>
          <p className="text-sm text-foreground-muted leading-relaxed">
            Thank you for choosing VisaHub. Your visa application has been received and is being processed. We will send updates to your registered email within 24 hours.
          </p>

          {/* Application Details Card */}
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Application Summary
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-foreground-muted">Reference</span>
                <p className="text-foreground font-mono font-bold">{ref}</p>
              </div>
              <div>
                <span className="text-foreground-muted">Visa Type</span>
                <p className="text-foreground font-medium">
                  {decodeURIComponent(visaType || "Visa")}
                </p>
              </div>
              <div>
                <span className="text-foreground-muted">Amount Paid</span>
                <p className="text-foreground font-bold">${total.toLocaleString()}.00</p>
              </div>
              <div>
                <span className="text-foreground-muted">Date</span>
                <p className="text-foreground">{bookingDate}</p>
              </div>
              <div>
                <span className="text-foreground-muted">Status</span>
                <Badge variant="success" size="sm">
                  Confirmed
                </Badge>
              </div>
              <div>
                <span className="text-foreground-muted">Payment ID</span>
                <p className="text-foreground text-xs font-mono">
                  {sessionId?.slice(0, 24) || "N/A"}...
                </p>
              </div>
            </div>

            {/* Form Data Summary */}
            {appData?.formData && Object.keys(appData.formData).length > 0 && (
              <div className="border-t border-white/[0.06] pt-3 mt-3 grid grid-cols-2 gap-2 text-sm">
                {Object.entries(appData.formData).map(([key, val]) => (
                  <div key={key}>
                    <span className="text-foreground-muted capitalize text-xs">
                      {key}
                    </span>
                    <p className="text-foreground text-sm truncate">{val || "-"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-primary/[0.04] border border-primary/10 p-4 flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                What happens next?
              </p>
              <ul className="text-xs text-foreground-muted space-y-1.5">
                <li>• Our team reviews your application within 24 hours</li>
                <li>• You&apos;ll receive a confirmation email with your receipt</li>
                <li>• Track your application anytime using reference <span className="font-mono font-bold text-primary">{ref}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/track?ref=${ref}`} className="flex-1">
          <Button variant="outline" className="w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            Track Application
          </Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-foreground-muted">Loading...</p>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
