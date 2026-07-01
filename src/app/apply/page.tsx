"use client";

import countries from "world-countries";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, AlertTriangle, Check, ChevronsUpDown, Loader2, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrencySymbol } from "@/lib/currency";

const phoneCountries = countries
  .map((country) => {
    const suffix = country.idd.suffixes?.[0] || "";
    return {
      name: country.name.common,
      code: country.idd.root ? `${country.idd.root}${suffix}` : "",
      flag: country.flag,
    };
  })
  .filter((country) => country.code)
  .sort((a, b) => a.name.localeCompare(b.name));

const nationalityOptions = countries
  .map((country) => country.name.common)
  .sort((a, b) => a.localeCompare(b));

function ApplyContent() {
  const searchParams = useSearchParams();
  const visaId = searchParams.get("visaId") || "";
  const originCountry = searchParams.get("originCountry") || "";
  const destinationCountry = searchParams.get("destinationCountry") || "";
  const visaTypeId = searchParams.get("visaTypeId") || "";
  const visaType = searchParams.get("visaType") || "Visa";
  const amount = Number(searchParams.get("totalFee") || 0);
  const currency = searchParams.get("currency") || "usd";

  const [basicInfo, setBasicInfo] = useState({
    fullName: "",
    email: "",
    phoneCountryCode: "+1",
    phoneNumber: "",
    nationality: "",
    dateOfBirth: "",
    passportNumber: "",
    travelDate: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");
  const phoneDropdownRef = useRef<HTMLDivElement>(null);
  const phoneSearchRef = useRef<HTMLInputElement>(null);

  const filteredPhoneCountries = useMemo(() => {
    if (!phoneSearch.trim()) return phoneCountries;
    const q = phoneSearch.toLowerCase();
    return phoneCountries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.includes(phoneSearch)
    );
  }, [phoneSearch]);

  const selectedPhoneCountry = phoneCountries.find(
    (c) => c.code === basicInfo.phoneCountryCode
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(e.target as Node)) {
        setPhoneDropdownOpen(false);
        setPhoneSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (phoneDropdownOpen && phoneSearchRef.current) {
      phoneSearchRef.current.focus();
    }
  }, [phoneDropdownOpen]);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const maxDob = yesterday.toISOString().split("T")[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minTravel = tomorrow.toISOString().split("T")[0];

  const isValid = useMemo(
    () =>
      basicInfo.fullName &&
      basicInfo.email &&
      basicInfo.phoneCountryCode &&
      basicInfo.phoneNumber &&
      basicInfo.nationality &&
      basicInfo.dateOfBirth &&
      basicInfo.passportNumber &&
      basicInfo.travelDate,
    [basicInfo]
  );

  function updateField(field: keyof typeof basicInfo, value: string) {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  }

  async function submitBasicInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency,
          visaType,
          visaId,
          visaTypeId,
          originCountry,
          destinationCountry,
          basicInfo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment could not start");
      if (!data.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (!visaId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <UserRound className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Visa Selected</h3>
        <p className="text-sm text-foreground-muted max-w-sm mb-6">
          Please select a visa from search results first.
        </p>
        <Link href="/visa-results">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/visa-results?origin=${originCountry}&destination=${destinationCountry}`}
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to visa options
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <UserRound className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-foreground-muted">Step 1 of 3</p>
          <h1 className="text-2xl font-bold text-foreground">Basic Information</h1>
          <p className="text-sm text-foreground-muted">
            {visaType} application, payment due {getCurrencySymbol(currency)}{amount.toLocaleString()}.00
          </p>
        </div>
      </div>

      <form
        onSubmit={submitBasicInfo}
        className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Full Name">
            <Input
              value={basicInfo.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              placeholder="Name as on passport"
              required
            />
          </Field>

          <Field label="Email Address">
            <Input
              type="email"
              value={basicInfo.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@example.com"
              required
            />
          </Field>

          <Field label="Country Code">
            <div ref={phoneDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setPhoneDropdownOpen(!phoneDropdownOpen)}
                className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-foreground hover:border-slate-300 transition-colors"
              >
                {selectedPhoneCountry ? (
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-lg shrink-0">{selectedPhoneCountry.flag}</span>
                    <span className="font-medium truncate">
                      {selectedPhoneCountry.name} ({selectedPhoneCountry.code})
                    </span>
                  </span>
                ) : (
                  <span className="text-foreground-muted">Select country code</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-foreground-muted/60" />
              </button>

              {phoneDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
                    <Search className="h-4 w-4 text-foreground-muted shrink-0" />
                    <input
                      ref={phoneSearchRef}
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                      placeholder="Search country or code..."
                      className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted/50"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto p-1">
                    {filteredPhoneCountries.length === 0 ? (
                      <div className="py-6 text-center text-sm text-foreground-muted">
                        No countries match
                      </div>
                    ) : (
                      filteredPhoneCountries.map((c) => (
                        <button
                          key={`${c.name}-${c.code}`}
                          type="button"
                          onClick={() => {
                            updateField("phoneCountryCode", c.code);
                            setPhoneDropdownOpen(false);
                            setPhoneSearch("");
                          }}
                          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors hover:bg-slate-100 ${
                            basicInfo.phoneCountryCode === c.code
                              ? "bg-primary/10 text-primary font-medium"
                              : ""
                          }`}
                        >
                          <span className="text-lg shrink-0">{c.flag}</span>
                          <span className="flex-1 truncate">{c.name}</span>
                          <span className="text-xs text-foreground-muted font-mono shrink-0">{c.code}</span>
                          {basicInfo.phoneCountryCode === c.code && (
                            <Check className="h-4 w-4 shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </Field>

          <Field label="Phone Number">
            <Input
              type="tel"
              value={basicInfo.phoneNumber}
              onChange={(e) => updateField("phoneNumber", e.target.value)}
              placeholder="300 1234567"
              required
            />
          </Field>

          <Field label="Nationality">
            <select
              value={basicInfo.nationality}
              onChange={(e) => updateField("nationality", e.target.value)}
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              required
            >
              <option value="">Select country</option>
              {nationalityOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date of Birth">
            <Input
              type="date"
              value={basicInfo.dateOfBirth}
              onChange={(e) => updateField("dateOfBirth", e.target.value)}
              max={maxDob}
              required
            />
          </Field>

          <Field label="Passport Number">
            <Input
              value={basicInfo.passportNumber}
              onChange={(e) => updateField("passportNumber", e.target.value)}
              placeholder="Passport number"
              required
            />
          </Field>

          <Field label="Expected Travel Date">
            <Input
              type="date"
              value={basicInfo.travelDate}
              onChange={(e) => updateField("travelDate", e.target.value)}
              min={minTravel}
              required
            />
          </Field>
        </div>

        <Field label="Additional Notes">
          <textarea
            value={basicInfo.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Anything our team should know"
            className="min-h-28 flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          />
        </Field>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={!isValid || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Opening Payment
            </>
          ) : (
            "Continue to Payment"
          )}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-foreground mb-2">{label}</span>
      {children}
    </label>
  );
}

export default function ApplyPage() {
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
        <ApplyContent />
      </Suspense>
    </div>
  );
}
