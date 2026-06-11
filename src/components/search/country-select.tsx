"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCountries } from "@/hooks/useCountries";
import type { Country } from "@/types/country";

interface CountrySelectProps {
  value: number | null;
  onChange: (value: number | null) => void;
  label: string;
  excludeCountryId?: number | null;
}

export function CountrySelect({
  value,
  onChange,
  label,
  excludeCountryId,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { data: countries, isLoading, isError, refetch } = useCountries();

  const selected = countries?.find((c) => c.id === value);

  const filtered = React.useMemo(() => {
    if (!countries) return [];
    return countries.filter(
      (c) =>
        c.id !== excludeCountryId &&
        c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [countries, search, excludeCountryId]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  function handleSelect(country: Country) {
    onChange(country.id);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        type="button"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full justify-between h-13 rounded-xl text-sm border bg-white/[0.06] hover:bg-white/[0.1] border-white/[0.1] hover:border-white/[0.2] text-foreground",
          !value && "text-foreground-muted/50 font-normal"
        )}
      >
        {value && selected ? (
          <span className="flex items-center gap-2.5 truncate">
            {selected.flag && <span className="text-xl shrink-0">{selected.flag}</span>}
            <span className="font-medium truncate">{selected.name}</span>
          </span>
        ) : (
          <span className="truncate">{label}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-foreground-muted/60" />
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/[0.08] bg-background-alt shadow-2xl">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
            <Search className="h-4 w-4 text-foreground-muted shrink-0" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted/50"
            />
          </div>

          {/* Content - virtualize for 258 countries */}
          <div className="max-h-56 overflow-y-auto p-1 overflow-x-hidden" style={{ willChange: "transform" }}>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-foreground-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading countries...
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center gap-2 py-6 text-sm text-foreground-muted">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span>Failed to load countries</span>
                <Button variant="ghost" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="py-6 text-center text-sm text-foreground-muted">
                {search ? "No countries match your search" : "No countries available"}
              </div>
            )}

            {!isLoading &&
              !isError &&
              filtered.map((country) => (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-all duration-150",
                    "hover:bg-white/10 hover:scale-[1.01] hover:translate-x-0.5",
                    value === country.id && "bg-primary/10 text-primary font-medium"
                  )}
                >
                  {country.flag ? (
                    <span className="text-lg shrink-0">{country.flag}</span>
                  ) : (
                    <span className="h-5 w-5 rounded-full bg-primary/20 shrink-0" />
                  )}
                  <span className="flex-1 truncate">{country.name}</span>
                  {value === country.id && (
                    <Check className="h-4 w-4 shrink-0" />
                  )}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
