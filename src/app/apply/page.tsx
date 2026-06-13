"use client";

import countries from "world-countries";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ArrowLeft, AlertTriangle, Loader2, UserRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
            {visaType} application, payment due ${amount.toLocaleString()}.00
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
            <select
              value={basicInfo.phoneCountryCode}
              onChange={(e) => updateField("phoneCountryCode", e.target.value)}
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              required
            >
              {phoneCountries.map((country) => (
                <option key={`${country.name}-${country.code}`} value={country.code}>
                  {country.flag} {country.name} ({country.code})
                </option>
              ))}
            </select>
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
