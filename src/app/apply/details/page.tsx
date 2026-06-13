"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, CheckCircle2, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StoredApplication } from "@/types/application";

interface FormFieldOption {
  id: string;
  form_attribute_id: string;
  name: string;
  value: string | null;
}

interface FormField {
  label_id: string;
  label_name: string;
  field_type: string;
  list_value?: FormFieldOption[];
}

interface FormResponse {
  status: boolean;
  visaname?: { name: string };
  formdata?: Record<string, FormField[]>;
  countrylist?: { id: string; name: string }[];
}

function FormFieldRenderer({
  field,
  value,
  onChange,
  countryList,
}: {
  field: FormField;
  value: string;
  onChange: (val: string) => void;
  countryList: { id: string; name: string }[];
}) {
  const fieldClass =
    "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10";

  switch (field.field_type) {
    case "textarea":
      return (
        <textarea
          className="min-h-28 flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          placeholder={field.label_name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "date":
      return <Input type="date" value={value} onChange={(e) => onChange(e.target.value)} />;
    case "radio":
      return (
        <div className="flex flex-wrap gap-4">
          {field.list_value?.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={field.label_id}
                value={opt.name}
                checked={value === opt.name}
                onChange={(e) => onChange(e.target.value)}
                className="h-4 w-4 accent-primary"
              />
              {opt.name}
            </label>
          ))}
        </div>
      );
    case "checkbox": {
      const selected = value ? value.split(",").filter(Boolean) : [];
      return (
        <div className="flex flex-wrap gap-4">
          {field.list_value?.map((opt) => {
            const checked = selected.includes(opt.name);
            return (
              <label key={opt.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? selected.filter((item) => item !== opt.name)
                      : [...selected, opt.name];
                    onChange(next.join(","));
                  }}
                  className="h-4 w-4 accent-primary"
                />
                {opt.name}
              </label>
            );
          })}
        </div>
      );
    }
    case "dropdown":
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
          <option value="">Select...</option>
          {field.list_value?.map((opt) => (
            <option key={opt.id} value={opt.name}>
              {opt.name}
            </option>
          ))}
        </select>
      );
    case "country":
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
          <option value="">Select country...</option>
          {countryList.map((country) => (
            <option key={country.id} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
      );
    default:
      return (
        <Input
          type="text"
          placeholder={field.label_name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

function DetailsContent() {
  const searchParams = useSearchParams();
  const referenceId = searchParams.get("ref") || "";
  const [application, setApplication] = useState<StoredApplication | null>(null);
  const [formResponse, setFormResponse] = useState<FormResponse | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (!referenceId) throw new Error("Receipt ID is required");

        const appRes = await fetch(`/api/applications?ref=${encodeURIComponent(referenceId)}`);
        if (!appRes.ok) {
          const errBody = await appRes.json().catch(() => ({ error: "Failed to load application" }));
          throw new Error(errBody.error || "Application not found");
        }
        const appData = await appRes.json();
        if (appData.status === "payment_pending") {
          throw new Error("Payment must be completed before the detailed visa form.");
        }
        setApplication(appData);

        const formRes = await fetch("/api/get-form-visa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gid: "1",
            visatype: appData.visaTypeId || "1",
            visaid: appData.visaId || "1",
            origincountry: appData.originCountry,
            destinationcountry: appData.destinationCountry,
          }),
        });
        const formData: FormResponse = await formRes.json();
        if (!formRes.ok) throw new Error("Failed to load visa form");
        setFormResponse(formData);

        const initial: Record<string, string> = {};
        if (formData.formdata) {
          Object.values(formData.formdata).forEach((section) => {
            section.forEach((field) => {
              initial[field.label_id] = "";
            });
          });
        }
        setFormValues(initial);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load form");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [referenceId]);

  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/submit-visa-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId, formData: formValues }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit form");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-foreground-muted">Loading detailed visa form...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Thank You</h1>
        <p className="text-sm text-foreground-muted mb-6">
          Our team will review your application and get back to you within 24 hours.
          You can track your application status using receipt ID {referenceId}.
        </p>
        <Link href={`/track?ref=${referenceId}`}>
          <Button>Track Application</Button>
        </Link>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Form Unavailable</h1>
        <p className="text-sm text-foreground-muted mb-6">{error}</p>
        <Link href="/">
          <Button variant="outline">Back Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/track?ref=${referenceId}`}
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tracking
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-foreground-muted">Step 3 of 3</p>
          <h1 className="text-2xl font-bold text-foreground">
            {formResponse?.visaname?.name || application.visaType}
          </h1>
          <p className="text-sm text-foreground-muted">
            Receipt ID {referenceId}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-3 mb-5 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {formResponse?.formdata ? (
        <form onSubmit={submitForm} className="space-y-6">
          {Object.entries(formResponse.formdata).map(([sectionName, fields]) => (
            <section
              key={sectionName}
              className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6 pb-3 border-b border-slate-100">
                {sectionName}
              </h2>
              <div className="space-y-5">
                {fields.map((field) => (
                  <div key={field.label_id}>
                    <label className="block text-sm font-medium text-foreground mb-2 capitalize">
                      {field.label_name}
                    </label>
                    <FormFieldRenderer
                      field={field}
                      value={formValues[field.label_id] ?? ""}
                      onChange={(val) =>
                        setFormValues((prev) => ({
                          ...prev,
                          [field.label_id]: val,
                        }))
                      }
                      countryList={formResponse.countrylist ?? []}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting
              </>
            ) : (
              "Submit Visa Form"
            )}
          </Button>
        </form>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-foreground-muted">
            No detailed form fields were returned for this visa.
          </p>
        </div>
      )}
    </div>
  );
}

export default function DetailsPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <Suspense fallback={null}>
        <DetailsContent />
      </Suspense>
    </div>
  );
}
