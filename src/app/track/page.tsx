"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock,
  Copy,
  CreditCard,
  FileText,
  Loader2,
  Search,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { StoredApplication } from "@/types/application";

function TrackContent() {
  const searchParams = useSearchParams();
  const urlRef = searchParams.get("ref") || "";
  const [searchRef, setSearchRef] = useState(urlRef);
  const [application, setApplication] = useState<StoredApplication | null>(null);
  const [searched, setSearched] = useState(Boolean(urlRef));
  const [loading, setLoading] = useState(Boolean(urlRef));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadFromUrl() {
      if (!urlRef) return;

      try {
        const res = await fetch(`/api/applications?ref=${encodeURIComponent(urlRef)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Application not found");

        // Check localStorage for status overrides + admin notes (set by admin)
        const stored = localStorage.getItem(`visaApp_${urlRef}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.localStatus || parsed.status) {
              data.status = parsed.localStatus || parsed.status;
            }
            if (parsed.adminNotes) {
              data.adminNotes = parsed.adminNotes;
            }
          } catch { /* ignore */ }
        }

        setApplication(data);
      } catch {
        setApplication(null);
      } finally {
        setLoading(false);
      }
    }

    void loadFromUrl();
  }, [urlRef]);

  async function handleSearch(refToUse?: string) {
    const ref = (refToUse || searchRef).trim().toUpperCase();
    setSearched(true);
    setLoading(true);
    setApplication(null);

    if (!ref) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/applications?ref=${encodeURIComponent(ref)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Application not found");

      // Check localStorage for status overrides + admin notes (set by admin)
      const stored = localStorage.getItem(`visaApp_${ref}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.localStatus || parsed.status) {
            data.status = parsed.localStatus || parsed.status;
          }
          if (parsed.adminNotes) {
            data.adminNotes = parsed.adminNotes;
          }
        } catch { /* ignore */ }
      }

      setApplication(data);
    } catch {
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }

  function copyRef() {
    if (!application?.referenceId) return;
    navigator.clipboard.writeText(application.referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function statusBadge(status: string) {
    if (status === "progress") {
      return (
        <Badge variant="warning" size="lg" className="gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Progress
        </Badge>
      );
    }
    if (status === "paid") {
      return (
        <Badge variant="success" size="lg" className="gap-1.5">
          <CreditCard className="h-3.5 w-3.5" />
          Paid
        </Badge>
      );
    }
    if (status === "under_review") {
      return (
        <Badge variant="default" size="lg" className="gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          Under Review
        </Badge>
      );
    }
    return <Badge variant="outline">{status.replace("_", " ")}</Badge>;
  }

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
          Enter your receipt ID. No login required.
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        <Input
          placeholder="VH-XXXX-XXXX"
          value={searchRef}
          onChange={(e) => setSearchRef(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="h-12 text-sm font-mono text-center uppercase tracking-widest"
        />
        <Button onClick={() => handleSearch()} disabled={loading} size="lg">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {searched && !loading && !application && searchRef && (
        <div className="rounded-2xl border border-amber-100 bg-white p-8 text-center shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-7 w-7 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Application Not Found
          </h3>
          <p className="text-sm text-foreground-muted max-w-sm mx-auto">
            No application found with receipt ID &quot;{searchRef}&quot;.
          </p>
        </div>
      )}

      {application && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-green-100 bg-white p-6 flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {application.visaType}
                </h3>
                {statusBadge(application.status)}
              </div>
              <p className="text-xs text-foreground-muted">
                Applicant: {application.basicInfo.fullName}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground-muted">Receipt</span>
                <span className="text-sm font-mono font-bold text-foreground">
                  {application.referenceId}
                </span>
                <button
                  onClick={copyRef}
                  className="p-1 rounded-md hover:bg-slate-100 transition-colors"
                  aria-label="Copy receipt ID"
                >
                  <Copy className="h-3 w-3 text-foreground-muted" />
                </button>
              </div>
              {copied && <span className="text-xs text-green-600">Copied</span>}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Visa Type" value={application.visaType} />
              <Detail label="Amount Paid" value={`$${application.amount.toLocaleString()}.00`} strong />
              <Detail
                label="Date"
                value={new Date(application.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                icon={<CalendarDays className="h-3 w-3" />}
              />
              <Detail label="Payment" value={application.paidAt ? "Paid" : "Pending"} />
              <Detail label="Email" value={application.basicInfo.email} />
              <Detail
                label="Phone"
                value={`${application.basicInfo.phoneCountryCode} ${application.basicInfo.phoneNumber}`}
              />
            </div>

            {application.status !== "completed" && application.status !== "payment_pending" && (
              <Link href={`/apply/details?ref=${application.referenceId}`}>
                <Button className="w-full mt-6">
                  <FileText className="mr-2 h-4 w-4" />
                  {application.submittedAt ? "Edit Visa Form" : "Complete Detailed Visa Form"}
                </Button>
              </Link>
            )}
          </div>

          {/* Admin Notes — only show when unresolved (not completed) */}
          {application.adminNotes && application.status !== "completed" && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-amber-200/60 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  Important Update from Our Team
                </h4>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {application.adminNotes}
              </p>
              <p className="text-xs text-foreground-muted mt-3">
                Please review the note above. Contact us if you have any questions.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Application Timeline
            </h4>
            <TimelineItem done title="Basic Information Submitted" date={application.createdAt} />
            <TimelineItem done={!!application.paidAt} title="Payment Confirmed" date={application.paidAt} />
            <TimelineItem done={!!application.submittedAt} title="Detailed Visa Form Submitted" date={application.submittedAt} />
            <TimelineItem done={application.status === "under_review" || application.status === "completed"} title="Team Review" date={undefined} />
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  strong,
  icon,
}: {
  label: string;
  value: string;
  strong?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <span className="text-foreground-muted text-xs flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <p className={strong ? "text-foreground font-bold mt-0.5" : "text-foreground mt-0.5"}>
        {value}
      </p>
    </div>
  );
}

function TimelineItem({
  done,
  title,
  date,
}: {
  done: boolean;
  title: string;
  date?: string;
}) {
  return (
    <div className="flex gap-3 pb-4 last:pb-0">
      <div className="pt-1">
        {done ? (
          <BadgeCheck className="h-4 w-4 text-green-600" />
        ) : (
          <div className="h-4 w-4 rounded-full border border-slate-300" />
        )}
      </div>
      <div>
        <p className={done ? "text-sm font-medium text-foreground" : "text-sm font-medium text-foreground-muted"}>
          {title}
        </p>
        <p className="text-xs text-foreground-muted">
          {date
            ? new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Pending"}
        </p>
      </div>
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
