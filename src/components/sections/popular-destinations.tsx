"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ChevronsUp,
  Globe2,
  Loader2,
  MapPinned,
  Plane,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCountries } from "@/hooks/useCountries";
import { FadeUp } from "@/components/animations/fade-up";

const INITIAL_COUNT = 18;
const LOAD_MORE_COUNT = 12;

export function PopularDestinations() {
  const { data: countries, isLoading } = useCountries();
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  function handleLoadMore() {
    setVisibleCount((count) => count + LOAD_MORE_COUNT);
  }

  function handleShowLess() {
    setVisibleCount(INITIAL_COUNT);
  }

  if (isLoading) {
    return (
      <section id="destinations" className="section-padding relative bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
              Choose your next destination
            </h2>
            <p className="mt-3 text-foreground-muted">Loading countries...</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  const allCountries = countries || [];
  const visible = allCountries.slice(0, visibleCount);
  const hasMore = visibleCount < allCountries.length;
  const isAll = visibleCount >= allCountries.length;

  return (
    <section
      id="destinations"
      className="section-padding relative overflow-hidden bg-gradient-to-b from-white via-violet-50/40 to-white"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-semibold text-violet-700 shadow-sm">
              <MapPinned className="h-4 w-4" />
              {allCountries.length}+ destinations ready
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
              Choose your next destination
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-foreground-muted sm:text-lg">
              Explore visa options across the world with clean, fast country selection.
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {visible.map((country, index) => (
            <motion.div
              key={country.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: Math.min(index % LOAD_MORE_COUNT, LOAD_MORE_COUNT) * 0.015,
              }}
            >
              <div className="group relative h-full overflow-hidden rounded-lg border border-violet-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/10">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-80" />
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-50 text-3xl ring-1 ring-violet-100 transition-transform duration-300 group-hover:scale-105">
                    {country.flag || <Globe2 className="h-6 w-6 text-violet-500" />}
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-violet-500 transition-all duration-300 group-hover:bg-violet-600 group-hover:text-white">
                    <Plane className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="mb-3 min-h-10 text-sm font-bold leading-5 text-foreground transition-colors group-hover:text-violet-700">
                  {country.name}
                </h3>

                <Link href="/" className="block w-full">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Select Route
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <FadeUp delay={0.2}>
          <div className="mt-8 text-center">
            {hasMore && (
              <div className="inline-flex rounded-full bg-white p-1.5 shadow-xl shadow-violet-500/10 ring-1 ring-violet-100">
                <Button size="lg" onClick={handleLoadMore} className="px-7">
                  Load More Countries
                  <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                    {allCountries.length - visibleCount}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {isAll && allCountries.length > INITIAL_COUNT && (
              <Button variant="secondary" size="lg" onClick={handleShowLess}>
                Show Less
                <ChevronsUp className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
