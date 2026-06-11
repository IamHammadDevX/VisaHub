"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Loader2,
  Shield,
  CreditCard,
  Clock,
  CalendarDays,
  BadgeCheck,
  AlertTriangle,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  formData: Record<string, string>;
}

function TrackContent() {
  const searchParams = useSearchParams();
  const urlRef = searchParams.get("ref");

  const [searchRef, setSearchRef] = useState(urlRef || "");
  const [appData, setAppData] = useState<AppData | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (urlRef) {
      handleSearch(urlRef);
    }
  }, [urlRef]);

  function handleSearch(refToUse?: string) {
    const ref = (refToUse || searchRef).trim().toUpperCase();
    setSearched(true);
    setLoading(true);

    if (!ref) {
      setAppData(null);
      setLoading(false);
      return;
    }

    // Check sessionStorage for the application
    const stored = sessionStorage.getItem(`visaApp_${ref}`);
    if (stored) {
      setAppData(JSON.parse(stored));
    } else {
      setAppData(null);
    }
    setLoading(false);
  }

  function copyRef() {
    if (appData?.referenceId) {
      navigator.clipboard.writeText(appData.referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="success" size="lg" className="gap-1.5">
            <BadgeCheck className="h-3.5 w-3.5" />
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" size="lg" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="text-center mb-8">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Search className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Track Your Application
        </h1>
        <p className="text-sm text-foreground-muted max-w-md mx-auto">
          Enter your reference ID to check the status of your visa application. No login required.
        </p>
      </div>

      {/* Search Box */}
      <div className="flex gap-2 mb-8">
        <Input
          placeholder="Enter reference ID (e.g. VH-XXXX-XXXX)"
          value={searchRef}
          onChange={(e) => setSearchRef(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="h-12 text-sm font-mono text-center uppercase tracking-widest"
        />
        <Button onClick={() => handleSearch()} disabled={loading} size="lg">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Not Found */}
      {searched && !loading && !appData && searchRef && (
        <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.03] p-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-7 w-7 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Application Not Found
          </h3>
          <p className="text-sm text-foreground-muted max-w-sm mx-auto">
            No application found with reference ID &ldquo;{searchRef}&rdquo;. Please check and try again.
          </p>
        </div>
      )}

      {/* Empty Search */}
      {searched && !loading && !searchRef && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-foreground-muted">
            Enter a reference ID above to track your application.
          </p>
        </div>
      )}

      {/* Application Found */}
      {appData && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Status Header */}
          <div className="rounded-2xl border border-green-500/10 bg-green-500/[0.03] p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <Shield className="h-6 w-6 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {appData.visaType}
                </h3>
                {getStatusBadge(appData.status)}
              </div>
              <p className="text-xs text-foreground-muted">
                Application is being processed. You&apos;ll receive email updates.
              </p>
            </div>
          </div>

          {/* Details Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground-muted">Reference</span>
                <span className="text-sm font-mono font-bold text-foreground">
                  {appData.referenceId}
                </span>
                <button
                  onClick={copyRef}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors"
                >
                  <Copy className="h-3 w-3 text-foreground-muted" />
                </button>
              </div>
              {copied && (
                <span className="text-xs text-green-400 animate-in fade-in">
                  Copied!
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-foreground-muted text-xs">Visa Type</span>
                <p className="text-foreground font-medium mt-0.5">
                  {appData.visaType}
                </p>
              </div>
              <div>
                <span className="text-foreground-muted text-xs">Amount Paid</span>
                <p className="text-foreground font-bold mt-0.5">
                  ${appData.amount.toLocaleString()}.00
                </p>
              </div>
              <div>
                <span className="text-foreground-muted text-xs flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3" />
                  Date
                </span>
                <p className="text-foreground mt-0.5">
                  {new Date(appData.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <span className="text-foreground-muted text-xs flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3" />
                  Payment
                </span>
                <p className="text-foreground mt-0.5">Paid</p>
              </div>
            </div>

            {/* Form Data Summary */}
            {appData.formData && Object.keys(appData.formData).length > 0 && (
              <div className="border-t border-white/[0.06] mt-4 pt-4">
                <span className="text-xs text-foreground-muted mb-2 block">
                  Application Details
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(appData.formData).map(([key, val]) => (
                    <div key={key}>
                      <span className="text-foreground-muted capitalize">
                        {key}
                      </span>
                      <p className="text-foreground">{val || "-"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Application Timeline
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="w-0.5 flex-1 bg-white/[0.08]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Application Submitted
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {new Date(appData.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-primary/30" />
                  <div className="w-0.5 flex-1 bg-white/[0.08]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground-muted">
                    Payment Confirmed
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {new Date(appData.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-white/[0.12]" />
                  <div className="w-0.5 flex-1 bg-white/[0.04]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground-muted">
                    Under Review
                  </p>
                  <p className="text-xs text-foreground-muted">Pending</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-white/[0.06]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground-muted">
                    Decision Made
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Within 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <Suspense fallback={null}>
        <TrackContent />
      </Suspense>
    </div>
  );
}
