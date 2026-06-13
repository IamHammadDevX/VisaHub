"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { StoredApplication } from "@/types/application";

type AdminApp = StoredApplication & { localStatus?: string };

export default function AdminDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<AdminApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not logged in
    const authed = sessionStorage.getItem("vh_admin");
    if (!authed) {
      router.replace("/admin");
      return;
    }
    fetchApplications();
  }, [router]);

  async function fetchApplications() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/applications");
      if (!res.ok) throw new Error("Failed to load applications");
      const data: StoredApplication[] = await res.json();

      // Merge with localStorage overrides
      const merged: AdminApp[] = data.map((app) => {
        const stored = localStorage.getItem(`visaApp_${app.referenceId}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            return { ...app, localStatus: parsed.status || parsed.localStatus };
          } catch {
            return app;
          }
        }
        return app;
      });

      setApplications(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("vh_admin");
    router.push("/admin");
  }

  function effectiveStatus(app: AdminApp): string {
    return app.localStatus || app.status;
  }

  function statusBadge(status: string) {
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" size="sm" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "under_review":
        return (
          <Badge variant="default" size="sm" className="gap-1">
            <Shield className="h-3 w-3" />
            Under Review
          </Badge>
        );
      case "progress":
        return (
          <Badge variant="warning" size="sm" className="gap-1">
            <Clock className="h-3 w-3" />
            Progress
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="success" size="sm" className="gap-1">
            Paid
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" size="sm">
            {status.replace("_", " ")}
          </Badge>
        );
    }
  }

  async function updateStatus(refId: string, newStatus: string) {
    setUpdating(refId);
    try {
      // Save to localStorage
      const key = `visaApp_${refId}`;
      const existing = localStorage.getItem(key);
      const data = existing ? JSON.parse(existing) : {};
      data.status = newStatus;
      data.localStatus = newStatus;
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(data));

      // Also call API to update Stripe metadata
      await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId: refId, status: newStatus }),
      }).catch(() => {
        // Ignore API errors — localStorage is the source of truth
      });

      // Refresh
      await fetchApplications();
    } finally {
      setUpdating(null);
    }
  }

  // Compute finance overview
  const totalApps = applications.length;
  const completedApps = applications.filter(
    (a) => effectiveStatus(a) === "completed"
  ).length;
  const underReviewApps = applications.filter(
    (a) => effectiveStatus(a) === "under_review"
  ).length;
  const progressApps = applications.filter(
    (a) => effectiveStatus(a) === "progress"
  ).length;
  const totalRevenue = applications.reduce((sum, a) => sum + (a.amount || 0), 0);

  const filtered = applications.filter((app) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      app.referenceId.toLowerCase().includes(q) ||
      app.visaType.toLowerCase().includes(q) ||
      app.originCountry.toLowerCase().includes(q) ||
      app.destinationCountry.toLowerCase().includes(q) ||
      app.basicInfo.fullName.toLowerCase().includes(q) ||
      app.basicInfo.email.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-foreground-muted mt-1">
              Manage visa applications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchApplications}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>

        {/* Finance Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalApps}</p>
            <p className="text-xs text-foreground-muted">Total Applications</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{completedApps}</p>
            <p className="text-xs text-foreground-muted">Completed</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{progressApps + underReviewApps}</p>
            <p className="text-xs text-foreground-muted">In Progress</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Banknote className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-foreground-muted">Total Revenue</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search by name, email, ref ID, visa type, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-10"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 mb-6">
            {error}
          </div>
        )}

        {/* Applications Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wider">Ref ID</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wider">Applicant</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wider">Visa</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wider">Route</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-foreground-muted">
                      {search ? "No applications match your search." : "No applications yet."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => {
                    const status = effectiveStatus(app);
                    return (
                      <tr key={app.referenceId} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-medium text-foreground">
                            {app.referenceId}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {app.basicInfo.fullName || "—"}
                            </p>
                            <p className="text-xs text-foreground-muted">
                              {app.basicInfo.email || "—"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-foreground-muted" />
                            <span className="text-sm text-foreground">{app.visaType}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-foreground-muted" />
                            <span className="text-xs text-foreground">
                              {app.originCountry} → {app.destinationCountry}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">
                            ${app.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {statusBadge(status)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {status !== "completed" && (
                              <>
                                {status !== "under_review" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={updating === app.referenceId}
                                    onClick={() => updateStatus(app.referenceId, "under_review")}
                                    className="text-xs h-8"
                                  >
                                    {updating === app.referenceId ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Review"
                                    )}
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={updating === app.referenceId}
                                  onClick={() => updateStatus(app.referenceId, "completed")}
                                  className="text-xs h-8 text-green-600 hover:text-green-700"
                                >
                                  {updating === app.referenceId ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    "Complete"
                                  )}
                                </Button>
                              </>
                            )}
                            {status === "completed" && (
                              <span className="text-xs text-foreground-muted">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
