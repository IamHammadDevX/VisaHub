"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Globe,
  Loader2,
  LogOut,
  Phone,
  Play,
  RefreshCw,
  Search,
  Shield,
  StickyNote,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getCurrencySymbol } from "@/lib/currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminNote, StoredApplication } from "@/types/application";
import type { Country } from "@/types/country";

type AdminApp = StoredApplication & { localStatus?: string };

export default function AdminDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<AdminApp[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [fromCountryFilter, setFromCountryFilter] = useState("");
  const [toCountryFilter, setToCountryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<AdminApp | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteRefId, setNoteRefId] = useState("");
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const itemsPerPage = 10;

  // Build country ID → name map
  const countryMap = useMemo(() => {
    const map: Record<string, string> = {};
    countries.forEach((c) => {
      map[String(c.id)] = c.name;
    });
    return map;
  }, [countries]);

  function resolveCountry(idOrName: string): string {
    return countryMap[idOrName] || idOrName || "-";
  }

  useEffect(() => {
    const authed = sessionStorage.getItem("vh_admin");
    if (!authed) {
      router.replace("/admin");
      return;
    }
    fetchCountries();
    fetchApplications();
  }, [router]);

  async function fetchCountries() {
    try {
      const res = await fetch("/api/countries");
      if (res.ok) {
        const data: Country[] = await res.json();
        setCountries(data);
      }
    } catch {
      // non-critical
    }
  }

  async function fetchApplications() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/applications");
      if (!res.ok) throw new Error("Failed to load applications");
      const data: StoredApplication[] = await res.json();

      const merged: AdminApp[] = data.map((app) => {
        const stored = localStorage.getItem(`visaApp_${app.referenceId}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            return {
              ...app,
              localStatus: parsed.status || parsed.localStatus,
              adminNotes: Array.isArray(parsed.adminNotes)
                ? parsed.adminNotes
                : app.adminNotes,
              detailedForm: parsed.detailedForm || app.detailedForm,
              formLabels: parsed.formLabels || app.formLabels,
            };
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
      const key = `visaApp_${refId}`;
      const existing = localStorage.getItem(key);
      const data = existing ? JSON.parse(existing) : {};
      data.status = newStatus;
      data.localStatus = newStatus;
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(data));

      await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId: refId, status: newStatus }),
      }).catch(() => {});

      await fetchApplications();
    } finally {
      setUpdating(null);
    }
  }

  function captureApp(refId: string) {
    updateStatus(refId, "progress");
  }

  function openNoteModal(refId: string) {
    setNoteRefId(refId);
    setNoteText("");
    setNoteModalOpen(true);
  }

  async function submitNote() {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const key = `visaApp_${noteRefId}`;
      const existing = localStorage.getItem(key);
      const data = existing ? JSON.parse(existing) : {};
      // Append to notes array
      const prevNotes: AdminNote[] = Array.isArray(data.adminNotes) ? data.adminNotes : [];
      const newNote: AdminNote = { text: noteText.trim(), timestamp: new Date().toISOString() };
      data.adminNotes = [...prevNotes, newNote];
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(data));

      await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId: noteRefId, adminNotes: noteText.trim() }),
      }).catch(() => {});

      setNoteText("");
      await fetchApplications();
    } finally {
      setSavingNote(false);
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

  // Filtered list
  const filtered = useMemo(() => {
    return applications.filter((app) => {
      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const originName = resolveCountry(app.originCountry).toLowerCase();
        const destName = resolveCountry(app.destinationCountry).toLowerCase();
        const phone = `${app.basicInfo.phoneCountryCode || ""}${app.basicInfo.phoneNumber || ""}`;
        const match =
          app.referenceId.toLowerCase().includes(q) ||
          app.visaType.toLowerCase().includes(q) ||
          originName.includes(q) ||
          destName.includes(q) ||
          (app.basicInfo.fullName || "").toLowerCase().includes(q) ||
          (app.basicInfo.email || "").toLowerCase().includes(q) ||
          (app.basicInfo.phoneNumber || "").includes(q) ||
          phone.includes(q) ||
          (app.basicInfo.passportNumber || "").includes(q);
        if (!match) return false;
      }

      // Date range
      const created = new Date(app.createdAt);
      if (dateFrom && created < new Date(dateFrom)) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (created > end) return false;
      }

      // Country filter — from
      if (fromCountryFilter) {
        const originName = resolveCountry(app.originCountry);
        const filterName = countryMap[fromCountryFilter] || fromCountryFilter;
        if (originName !== filterName) return false;
      }

      // Country filter — to
      if (toCountryFilter) {
        const destName = resolveCountry(app.destinationCountry);
        const filterName = countryMap[toCountryFilter] || toCountryFilter;
        if (destName !== filterName) return false;
      }

      // Status filter
      if (statusFilter) {
        if (effectiveStatus(app) !== statusFilter) return false;
      }

      return true;
    });
  }, [applications, search, dateFrom, dateTo, fromCountryFilter, toCountryFilter, statusFilter, countryMap]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFrom, dateTo, fromCountryFilter, toCountryFilter, statusFilter]);

  function formatDate(dateStr?: string) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatDateFull(dateStr?: string) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function clearFilters() {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setFromCountryFilter("");
    setToCountryFilter("");
    setStatusFilter("");
  }

  const hasFilters = search || dateFrom || dateTo || fromCountryFilter || toCountryFilter || statusFilter;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
              <Input
                placeholder="Search name, email, phone, passport..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-9 text-sm"
              />
            </div>

            {/* From Country */}
            <div className="relative">
              <select
                value={fromCountryFilter}
                onChange={(e) => setFromCountryFilter(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 pr-8 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 appearance-none"
              >
                <option value="">From Country</option>
                {countries.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
            </div>

            {/* To Country */}
            <div className="relative">
              <select
                value={toCountryFilter}
                onChange={(e) => setToCountryFilter(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 pr-8 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 appearance-none"
              >
                <option value="">To Country</option>
                {countries.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
            </div>

            {/* Status */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 pr-8 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="paid">Paid</option>
                <option value="progress">Progress</option>
                <option value="under_review">Under Review</option>
                <option value="completed">Completed</option>
              </select>
              <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
            </div>

            {/* Date From */}
            <div>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            {/* Date To */}
            <div>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Clear filters */}
          {hasFilters && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-foreground-muted">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={clearFilters}
                className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 mb-6">
            {error}
          </div>
        )}

        {/* Applications — Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {paginatedItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-foreground-muted">
                {hasFilters
                  ? "No applications match your filters."
                  : "No applications yet."}
              </p>
            </div>
          ) : (
            paginatedItems.map((app) => {
              const status = effectiveStatus(app);
              const phone = `${app.basicInfo.phoneCountryCode || ""} ${app.basicInfo.phoneNumber || ""}`.trim();
              return (
                <div
                  key={app.referenceId}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50/60 border-b border-slate-100">
                    <span className="font-mono text-xs font-bold text-foreground tracking-wide">
                      {app.referenceId}
                    </span>
                    {statusBadge(status)}
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[11px] text-foreground-muted uppercase tracking-wider mb-0.5">Applicant</p>
                        <p className="font-semibold text-foreground">{app.basicInfo.fullName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-foreground-muted uppercase tracking-wider mb-0.5">Phone</p>
                        <p className="font-medium text-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3 text-foreground-muted shrink-0" />
                          {phone || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-foreground-muted uppercase tracking-wider mb-0.5">Email</p>
                        <p className="text-xs text-foreground truncate">{app.basicInfo.email || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-foreground-muted uppercase tracking-wider mb-0.5">Visa</p>
                        <p className="font-medium text-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3 text-foreground-muted shrink-0" />
                          {app.visaType}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-foreground-muted uppercase tracking-wider mb-0.5">Route</p>
                        <p className="text-xs text-foreground flex items-center gap-1">
                          <Globe className="h-3 w-3 text-foreground-muted shrink-0" />
                          {resolveCountry(app.originCountry)} → {resolveCountry(app.destinationCountry)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-foreground-muted uppercase tracking-wider mb-0.5">Amount</p>
                        <p className="font-bold text-foreground">{getCurrencySymbol(app.currency || "usd")}{app.amount.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 text-xs"
                        onClick={() => setSelectedApp(app)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                      {status === "paid" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updating === app.referenceId}
                          onClick={() => captureApp(app.referenceId)}
                          className="flex-1 h-9 text-xs"
                        >
                          {updating === app.referenceId ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <><Play className="h-3.5 w-3.5 mr-1" />Capture</>
                          )}
                        </Button>
                      )}
                      {(status === "progress" || status === "under_review") && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openNoteModal(app.referenceId)}
                            className="flex-1 h-9 text-xs"
                          >
                            <StickyNote className="h-3.5 w-3.5 mr-1" />
                            Note
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updating === app.referenceId}
                            onClick={() => updateStatus(app.referenceId, "completed")}
                            className="flex-1 h-9 text-xs text-green-600 border-green-200 hover:bg-green-50"
                          >
                            {updating === app.referenceId ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Complete"
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Applications — Desktop Table */}
        <div className="hidden lg:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-3 py-3 font-semibold text-foreground-muted text-[11px] uppercase tracking-wider w-[8%]">Ref ID</th>
                <th className="text-left px-3 py-3 font-semibold text-foreground-muted text-[11px] uppercase tracking-wider w-[15%]">Applicant</th>
                <th className="text-left px-3 py-3 font-semibold text-foreground-muted text-[11px] uppercase tracking-wider w-[12%]">Phone</th>
                <th className="text-left px-3 py-3 font-semibold text-foreground-muted text-[11px] uppercase tracking-wider w-[12%]">Visa</th>
                <th className="text-left px-3 py-3 font-semibold text-foreground-muted text-[11px] uppercase tracking-wider w-[18%]">Route</th>
                <th className="text-left px-3 py-3 font-semibold text-foreground-muted text-[11px] uppercase tracking-wider w-[9%]">Amount</th>
                <th className="text-left px-3 py-3 font-semibold text-foreground-muted text-[11px] uppercase tracking-wider w-[10%]">Status</th>
                <th className="text-center px-2 py-3 font-semibold text-foreground-muted text-[11px] uppercase tracking-wider w-[6%]">View</th>
                <th className="text-right px-3 py-3 font-semibold text-foreground-muted text-[11px] uppercase tracking-wider w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-sm text-foreground-muted">
                    <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    {hasFilters
                      ? "No applications match your filters."
                      : "No applications yet."}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((app) => {
                  const status = effectiveStatus(app);
                  const phone = `${app.basicInfo.phoneCountryCode || ""} ${app.basicInfo.phoneNumber || ""}`.trim();
                  return (
                    <tr key={app.referenceId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-3 py-3">
                        <span className="font-mono text-xs font-semibold text-foreground tracking-wide truncate block">
                          {app.referenceId}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">
                            {app.basicInfo.fullName || "—"}
                          </p>
                          <p className="text-xs text-foreground-muted mt-0.5 truncate">
                            {app.basicInfo.email || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 min-w-0">
                          <Phone className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                          <span className="text-sm text-foreground font-medium truncate">
                            {phone || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 min-w-0">
                          <FileText className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                          <span className="text-sm text-foreground truncate">{app.visaType}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 min-w-0">
                          <Globe className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                          <span className="text-xs text-foreground truncate">
                            {resolveCountry(app.originCountry)} → {resolveCountry(app.destinationCountry)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-semibold text-foreground whitespace-nowrap">
                          {getCurrencySymbol(app.currency || "usd")}{app.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {statusBadge(status)}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-foreground-muted hover:text-primary hover:bg-primary/5 transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {status === "paid" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={updating === app.referenceId}
                              onClick={() => captureApp(app.referenceId)}
                              className="text-xs h-7 px-2 rounded-lg"
                            >
                              {updating === app.referenceId ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <><Play className="h-3 w-3 mr-1" />Capture</>
                              )}
                            </Button>
                          )}
                          {(status === "progress" || status === "under_review") && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openNoteModal(app.referenceId)}
                                className="text-xs h-7 px-2 rounded-lg"
                              >
                                <StickyNote className="h-3 w-3 mr-1" />
                                Note
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={updating === app.referenceId}
                                onClick={() => updateStatus(app.referenceId, "completed")}
                                className="text-xs h-7 px-2 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50"
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

          {/* Pagination */}
          {filtered.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
              <p className="text-xs text-foreground-muted">
                Showing {(currentPage - 1) * itemsPerPage + 1}–
                {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-foreground-muted hover:text-foreground hover:bg-slate-200/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-primary text-white shadow-sm"
                          : "text-foreground-muted hover:text-foreground hover:bg-slate-200/50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-foreground-muted hover:text-foreground hover:bg-slate-200/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Note Modal */}
      <Dialog open={noteModalOpen} onOpenChange={(open) => !open && setNoteModalOpen(false)}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-primary" />
              Admin Note
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
              <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Reference</p>
              <p className="font-mono text-sm font-bold text-foreground tracking-wide">{noteRefId}</p>
            </div>

            {/* New note input */}
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Passport number incorrect — called customer, awaiting correct passport…"
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setNoteModalOpen(false)}>
                Close
              </Button>
              <Button size="sm" onClick={submitNote} disabled={savingNote || !noteText.trim()}>
                {savingNote ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Save Note
              </Button>
            </div>

            {/* Note history */}
            {(() => {
              const app = applications.find((a) => a.referenceId === noteRefId);
              const notes = app?.adminNotes;
              if (!notes || notes.length === 0) return null;
              return (
                <div>
                  <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Note History ({notes.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {[...notes].reverse().map((n, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
                      >
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                          {n.text}
                        </p>
                        {n.timestamp && (
                          <p className="text-[11px] text-foreground-muted mt-1.5">
                            {new Date(n.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Application Details
            </DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-5">
              {/* Reference */}
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-center">
                <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Reference ID</p>
                <p className="font-mono text-lg font-bold text-primary tracking-wide">
                  {selectedApp.referenceId}
                </p>
              </div>

              {/* Personal Info */}
              <div>
                <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Personal Information
                </h4>
                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                  <Row label="Full Name" value={selectedApp.basicInfo.fullName} />
                  <Row label="Email" value={selectedApp.basicInfo.email} />
                  <Row label="Phone" value={`${selectedApp.basicInfo.phoneCountryCode || ""} ${selectedApp.basicInfo.phoneNumber || ""}`.trim() || "-"} />
                  <Row label="Nationality" value={selectedApp.basicInfo.nationality} />
                  <Row label="Date of Birth" value={formatDateFull(selectedApp.basicInfo.dateOfBirth)} />
                  <Row label="Passport No." value={selectedApp.basicInfo.passportNumber} />
                  <Row label="Travel Date" value={formatDateFull(selectedApp.basicInfo.travelDate)} />
                </div>
              </div>

              {/* Visa Info */}
              <div>
                <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Visa Information
                </h4>
                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                  <Row label="Visa Type" value={selectedApp.visaType} highlight />
                  <Row label="Origin" value={resolveCountry(selectedApp.originCountry)} />
                  <Row label="Destination" value={resolveCountry(selectedApp.destinationCountry)} highlight />
                  <Row label="Amount" value={`${getCurrencySymbol(selectedApp.currency || "usd")}${selectedApp.amount.toLocaleString()}.00`} highlight />
                  <Row label="Status" value={selectedApp.status.replace("_", " ")} />
                </div>
              </div>

              {/* Detailed Visa Form (Step 3) */}
              {selectedApp.detailedForm &&
                Object.keys(selectedApp.detailedForm).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Detailed Visa Form
                    </h4>
                    <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                      {Object.entries(selectedApp.detailedForm)
                        .filter(([, val]) => val && val.trim())
                        .map(([key, value]) => {
                          const label = selectedApp.formLabels?.[key] || key;
                          return <Row key={key} label={label} value={value} />;
                        })}
                    </div>
                  </div>
                )}

              {/* Admin Notes */}
              {selectedApp.adminNotes && selectedApp.adminNotes.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Admin Notes ({selectedApp.adminNotes.length})
                  </h4>
                  <div className="space-y-2">
                    {[...selectedApp.adminNotes].reverse().map((n, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-amber-100 bg-amber-50/50 p-3"
                      >
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                          {n.text}
                        </p>
                        {n.timestamp && (
                          <p className="text-[11px] text-foreground-muted mt-1.5">
                            {new Date(n.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Timeline
                </h4>
                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                  <Row label="Created" value={formatDateFull(selectedApp.createdAt)} />
                  <Row label="Paid At" value={formatDateFull(selectedApp.paidAt)} />
                  <Row label="Submitted" value={formatDateFull(selectedApp.submittedAt)} />
                  <Row label="Receipt Sent" value={selectedApp.receiptSent ? "Yes" : "No"} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-foreground-muted">{label}</span>
      <span
        className={`text-sm text-right max-w-[60%] truncate ${
          highlight
            ? "font-semibold text-foreground"
            : "text-foreground"
        }`}
      >
        {value || "-"}
      </span>
    </div>
  );
}
