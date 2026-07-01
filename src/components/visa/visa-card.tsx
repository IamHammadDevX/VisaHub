"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck2,
  Loader2,
  Plane,
  Repeat,
  Shield,
  Sparkles,
  Timer,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVisaDocuments } from "@/hooks/useVisaDocuments";
import type { ComponentType } from "react";
import type { VisaCard as VisaCardType } from "@/types/visa";
import { formatCurrencyByCode, getCurrencySymbol } from "@/lib/currency";

interface VisaCardProps {
  visa: VisaCardType;
  index: number;
  originCountry: number;
  destinationCountry: number;
  originCountryName?: string;
}

export function VisaCard({
  visa,
  index,
  originCountry,
  destinationCountry,
  originCountryName,
}: VisaCardProps) {
  const router = useRouter();
  const { data: documentGroups, isLoading: documentsLoading } = useVisaDocuments({
    visaId: visa.visaTypeId || visa.id,
    originCountry,
    destinationCountry,
  });

  const documents = documentGroups?.flatMap((group) => group.documents) ?? [];
  const uniqueDocuments = Array.from(
    new Map(documents.map((document) => [document.id, document])).values()
  );
  const visaName = visa.visaType.toLowerCase();
  const isBusiness = visaName.includes("business");
  const isTourist = visaName.includes("tour") || visaName.includes("visit");
  const HeroIcon = isBusiness ? BriefcaseBusiness : isTourist ? Plane : Shield;
  const accentClass = isBusiness
    ? "from-blue-500 to-cyan-500"
    : isTourist
      ? "from-emerald-500 to-cyan-500"
      : "from-cyan-500 to-indigo-500";

  function goToApply() {
    const params = new URLSearchParams({
      visaId: String(visa.id),
      originCountry: String(originCountry),
      destinationCountry: String(destinationCountry),
      visaTypeId: String(visa.visaTypeId),
      visaType: visa.visaType,
      totalFee: String(visa.totalFee),
      currency: visa.currency,
    });
    if (originCountryName) {
      params.set("originCountryName", originCountryName);
    }
    router.push(`/apply?${params.toString()}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className="h-full"
    >
      <article className="group relative h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-cyan-900/10">
        <div className={`h-1.5 bg-gradient-to-r ${accentClass}`} />

        <div className="flex h-full flex-col">
          <div className="p-5 pb-4">
            <div className="mb-5 flex items-start gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${accentClass} text-white shadow-lg shadow-cyan-900/10`}
              >
                <HeroIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    size="sm"
                    className="border-primary/20 bg-primary/5 text-primary"
                  >
                    Visa #{visa.id}
                  </Badge>
                  {visa.totalFee > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      <Sparkles className="h-3 w-3" />
                      Ready to apply
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
                  {visa.visaType}
                </h3>
              </div>
            </div>

            {visa.description && (
              <p className="mb-5 line-clamp-2 text-sm leading-6 text-foreground-muted">
                {visa.description}
              </p>
            )}

            <div className="mb-5 rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-foreground-muted">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
                Total application cost
              </div>
              {visa.totalFee > 0 ? (
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black tracking-tight text-foreground">
                    {formatCurrencyByCode(visa.totalFee, visa.currency)}
                  </span>
                  <span className="pb-1 text-sm text-foreground-muted uppercase">{visa.currency}</span>
                </div>
              ) : (
                <span className="text-lg font-semibold text-foreground">
                  Contact for pricing
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {visa.visaFee > 0 && (
                <VisaFact
                  icon={DollarSign}
                  label="Visa fee"
                  value={formatCurrencyByCode(visa.visaFee, visa.currency)}
                />
              )}
              {visa.serviceFee > 0 && (
                <VisaFact
                  icon={Shield}
                  label="Service fee"
                  value={formatCurrencyByCode(visa.serviceFee, visa.currency)}
                />
              )}
              {visa.validity !== "N/A" && (
                <VisaFact icon={CalendarDays} label="Validity" value={visa.validity} />
              )}
              {visa.stayDuration !== "N/A" && (
                <VisaFact icon={Timer} label="Stay" value={visa.stayDuration} />
              )}
              {visa.processingTime !== "N/A" && (
                <VisaFact icon={Clock} label="Processing" value={visa.processingTime} />
              )}
              {visa.entryType !== "N/A" && (
                <VisaFact icon={Repeat} label="Entry" value={visa.entryType} />
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 bg-slate-50/80 p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                  <FileCheck2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Required documents
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Checklist from visa API
                  </p>
                </div>
              </div>
              {uniqueDocuments.length > 0 && (
                <Badge variant="secondary" size="sm">
                  {uniqueDocuments.length}
                </Badge>
              )}
            </div>

            {documentsLoading && (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-foreground-muted">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading document checklist...
              </div>
            )}

            {!documentsLoading && uniqueDocuments.length > 0 && (
              <div className="mb-4 space-y-2">
                {uniqueDocuments.slice(0, 4).map((document) => (
                  <div
                    key={document.id}
                    className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="leading-5 capitalize">{document.name}</span>
                  </div>
                ))}
                {uniqueDocuments.length > 4 && (
                  <p className="px-1 text-xs font-medium text-primary">
                    +{uniqueDocuments.length - 4} more documents requested after selection
                  </p>
                )}
              </div>
            )}

            {!documentsLoading && uniqueDocuments.length === 0 && (
              <div className="mb-4 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-foreground-muted">
                Document checklist will be confirmed during application.
              </div>
            )}

            <Button onClick={goToApply} className="w-full group/btn" size="lg">
              Apply for {visa.visaType}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </div>
      </article>
    </motion.div>
  );
}

function VisaFact({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 transition-colors group-hover:border-slate-300">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase text-foreground-muted">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <p className="text-sm font-semibold leading-5 text-foreground">{value}</p>
    </div>
  );
}
