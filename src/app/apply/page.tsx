"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, Loader2, AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  switch (field.field_type) {
    case "text":
      return (
        <Input
          type="text"
          placeholder={field.label_name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "textarea":
      return (
        <textarea
          className="flex w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted/50 transition-all focus:border-primary/40 focus:ring-1 focus:ring-primary/15 hover:border-white/20 min-h-[100px] resize-y"
          placeholder={field.label_name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "radio":
      return (
        <div className="flex flex-wrap gap-4">
          {field.list_value?.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name={field.label_id}
                value={opt.name}
                checked={value === opt.name}
                onChange={(e) => onChange(e.target.value)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors capitalize">
                {opt.name}
              </span>
            </label>
          ))}
        </div>
      );

    case "checkbox":
      const selected = value ? value.split(",").filter(Boolean) : [];
      return (
        <div className="flex flex-wrap gap-4">
          {field.list_value?.map((opt) => {
            const checked = selected.includes(opt.name);
            return (
              <label
                key={opt.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={opt.name}
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? selected.filter((s) => s !== opt.name)
                      : [...selected, opt.name];
                    onChange(next.join(","));
                  }}
                  className="h-4 w-4 rounded accent-primary"
                />
                <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors capitalize">
                  {opt.name}
                </span>
              </label>
            );
          })}
        </div>
      );

    case "dropdown":
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-foreground transition-all focus:border-primary/40 focus:ring-1 focus:ring-primary/15 hover:border-white/20"
        >
          <option value="" className="bg-background">
            Select...
          </option>
          {field.list_value?.map((opt) => (
            <option key={opt.id} value={opt.name} className="bg-background">
              {opt.name}
            </option>
          ))}
        </select>
      );

    case "country":
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-foreground transition-all focus:border-primary/40 focus:ring-1 focus:ring-primary/15 hover:border-white/20"
        >
          <option value="" className="bg-background">
            Select country...
          </option>
          {countryList.map((c) => (
            <option key={c.id} value={c.name} className="bg-background">
              {c.name}
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

function ApplyContent() {
  const searchParams = useSearchParams();
  const visaId = searchParams.get("visaId");
  const originCountry = searchParams.get("originCountry");
  const destinationCountry = searchParams.get("destinationCountry");
  const visaTypeId = searchParams.get("visaTypeId");

  const [formResponse, setFormResponse] = useState<FormResponse | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchForm() {
      try {
        const res = await fetch("/api/get-form-visa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gid: "1",
            visatype: visaTypeId || "1",
            visaid: visaId || "1",
            origincountry: originCountry || "",
            destinationcountry: destinationCountry || "",
          }),
        });
        if (!res.ok) throw new Error("Failed to load form");
        const data: FormResponse = await res.json();
        setFormResponse(data);

        // Init form values
        const initial: Record<string, string> = {};
        if (data.formdata) {
          for (const section of Object.values(data.formdata)) {
            for (const field of section) {
              initial[field.label_id] = "";
            }
          }
        }
        setFormValues(initial);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load form");
      } finally {
        setLoading(false);
      }
    }
    if (visaId) fetchForm();
  }, [visaId, visaTypeId, originCountry, destinationCountry]);

  if (!visaId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <FileText className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Visa Selected</h3>
        <p className="text-sm text-foreground-muted max-w-sm mb-6">
          Please select a visa from the search results to apply.
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
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {loading ? "Loading application..." : "Visa Application"}
          </h1>
          <p className="text-sm text-foreground-muted">
            {formResponse?.visaname?.name
              ? `${formResponse.visaname.name} · Complete all required fields`
              : `Visa #${visaId} · Complete the form below`}
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-foreground-muted">Loading application form...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-5">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Form Unavailable</h3>
          <p className="text-sm text-foreground-muted max-w-sm mb-6">{error}</p>
          <Link
            href={`/visa-results?origin=${originCountry}&destination=${destinationCountry}`}
          >
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to visa options
            </Button>
          </Link>
        </div>
      )}

      {!loading && !error && formResponse?.formdata && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Inject email into form values
            const allValues = { ...formValues, _email: userEmail };
            // Save form data to sessionStorage for payment page
            sessionStorage.setItem("visaFormData", JSON.stringify(allValues));
            sessionStorage.setItem("visaUserEmail", userEmail);
            // Redirect to payment
            const params = new URLSearchParams({
              amount: searchParams.get("totalFee") || "0",
              visaType: formResponse.visaname?.name || "Visa",
              visaId: visaId || "0",
              originCountry: originCountry || "",
              destinationCountry: destinationCountry || "",
              email: encodeURIComponent(userEmail),
            });
            window.location.href = `/payment?${params.toString()}`;
          }}
          className="space-y-8"
        >
          {/* Email Field */}
          <div className="rounded-2xl border border-primary/10 bg-primary/[0.02] p-5">
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Email Address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
              className="border-primary/20 focus:border-primary"
            />
            <p className="text-xs text-foreground-muted/60 mt-2">
              We&apos;ll send your receipt and application updates to this email.
            </p>
          </div>

          {Object.entries(formResponse.formdata).map(([sectionName, fields]) => (
            <div
              key={sectionName}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 md:p-8"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6 pb-3 border-b border-white/[0.06]">
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
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2 pb-12">
            <Link
              href={`/visa-results?origin=${originCountry}&destination=${destinationCountry}`}
            >
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" size="lg">
              Submit Application
            </Button>
          </div>
        </form>
      )}

      {!loading && !error && !formResponse?.formdata && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Form Data Unavailable
          </h2>
          <p className="text-sm text-foreground-muted max-w-md mx-auto">
            No form fields returned for this visa type.
          </p>
        </div>
      )}
    </div>
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
