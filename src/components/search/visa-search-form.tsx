"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CountrySelect } from "./country-select";

const searchSchema = z
  .object({
    origin: z.number({ message: "Select origin country" }),
    destination: z.number({ message: "Select destination country" }),
  })
  .refine((data) => data.origin !== data.destination, {
    message: "Origin and destination cannot be the same",
    path: ["destination"],
  });

type SearchFormData = z.infer<typeof searchSchema>;

interface VisaSearchFormProps {
  onSearch?: () => void;
}

export function VisaSearchForm({ onSearch }: VisaSearchFormProps) {
  const router = useRouter();
  const {
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    mode: "onChange",
  });

  const origin = watch("origin");
  const destination = watch("destination");

  function onSubmit(data: SearchFormData) {
    onSearch?.();
    router.push(
      `/visa-results?origin=${data.origin}&destination=${data.destination}`
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5 text-left">
            From
          </label>
          <CountrySelect
            value={origin ?? null}
            onChange={(v) => setValue("origin", v!, { shouldValidate: true })}
            label="Select origin country"
            excludeCountryId={destination ?? null}
          />
          {errors.origin && (
            <p className="flex items-center gap-1 mt-1.5 text-xs text-red-400">
              <AlertCircle className="h-3 w-3" />
              {errors.origin.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5 text-left">
            To
          </label>
          <CountrySelect
            value={destination ?? null}
            onChange={(v) =>
              setValue("destination", v!, { shouldValidate: true })
            }
            label="Select destination country"
            excludeCountryId={origin ?? null}
          />
          {errors.destination && (
            <p className="flex items-center gap-1 mt-1.5 text-xs text-red-400">
              <AlertCircle className="h-3 w-3" />
              {errors.destination.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={!isValid} className="w-full h-12 text-base">
        Search Visas
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </form>
  );
}
