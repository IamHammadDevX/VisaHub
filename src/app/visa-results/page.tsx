"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Globe, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useVisaSearch } from "@/hooks/useVisaSearch";
import { useCountries } from "@/hooks/useCountries";
import { VisaCard } from "@/components/visa/visa-card";
import { VisaCardSkeletonGrid } from "@/components/visa/visa-card-skeleton";
import { ErrorState } from "@/components/visa/error-state";
import { EmptyState } from "@/components/visa/empty-state";
import { getCurrencyByCountryName } from "@/lib/currency";
import type { VisaCard as VisaCardType } from "@/types/visa";
import { useMemo } from "react";

function VisaResultsContent() {
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");

  const { data: countries } = useCountries();

  const params =
    origin && destination
      ? {
          originCountry: Number(origin),
          destinationCountry: Number(destination),
        }
      : null;

  const { data: visas, isLoading, isError, error, refetch } = useVisaSearch(params);

  const originName = countries?.find((c) => c.id === Number(origin))?.name;
  const destName = countries?.find((c) => c.id === Number(destination))?.name;
  const originFlag = countries?.find((c) => c.id === Number(origin))?.flag;
  const destFlag = countries?.find((c) => c.id === Number(destination))?.flag;

  // Enrich visas with currency from origin country
  const enrichedVisas = useMemo<VisaCardType[] | undefined>(() => {
    if (!visas || !originName) return visas;
    const currencyInfo = getCurrencyByCountryName(originName);
    const currencyCode = currencyInfo?.code ?? "usd";
    return visas.map((v) => ({ ...v, currency: currencyCode }));
  }, [visas, originName]);

  // No params provided
  if (!params) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <Globe className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Select Countries to Search
        </h3>
        <p className="text-sm text-foreground-muted max-w-sm mb-6">
          Choose your origin and destination to find available visa options.
        </p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Search
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-lg">{originFlag}</span>
              <span className="text-foreground font-medium">{originName || `Country #${origin}`}</span>
            </div>
            <MapPin className="h-4 w-4 text-primary/60" />
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-lg">{destFlag}</span>
              <span className="text-foreground font-medium">{destName || `Country #${destination}`}</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isLoading
              ? "Searching visa options..."
              : enrichedVisas && enrichedVisas.length > 0
                ? `${enrichedVisas.length} Visa Option${enrichedVisas.length > 1 ? "s" : ""} Found`
                : "Visa Options"}
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            {originName && destName
              ? `Available visas from ${originName} to ${destName}`
              : "Showing available visas for the selected route"}
          </p>
        </div>
        <Link href="/">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            New Search
          </Button>
        </Link>
      </div>

      {/* Loading */}
      {isLoading && <VisaCardSkeletonGrid />}

      {/* Error */}
      {isError && (
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "Failed to load visa options. Please try again."
          }
          onRetry={() => refetch()}
        />
      )}

      {/* Empty */}
      {!isLoading && !isError && enrichedVisas?.length === 0 && <EmptyState />}

      {/* Results */}
      {!isLoading && !isError && enrichedVisas && enrichedVisas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrichedVisas.map((visa, i) => (
            <VisaCard key={visa.visaTypeId} visa={visa} index={i} originCountry={Number(origin)} destinationCountry={Number(destination)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function VisaResultsPage() {
  return (
    <div className="min-h-screen pt-20">
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <VisaCardSkeletonGrid />
          </div>
        }
      >
        <VisaResultsContent />
      </Suspense>
    </div>
  );
}
