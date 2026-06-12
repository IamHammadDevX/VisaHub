"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCountries } from "@/hooks/useCountries";
import { FadeUp } from "@/components/animations/fade-up";
import { StaggerContainer, staggerItemVariants } from "@/components/animations/stagger-container";
import Link from "next/link";

const INITIAL_COUNT = 18;
const LOAD_MORE_COUNT = 12;

export function PopularDestinations() {
  const { data: countries, isLoading } = useCountries();
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  function handleLoadMore() {
    setVisibleCount((c) => c + LOAD_MORE_COUNT);
  }

  function handleShowLess() {
    setVisibleCount(INITIAL_COUNT);
  }

  if (isLoading) {
    return (
      <section id="destinations" className="section-padding relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Popular Destinations
            </h2>
            <p className="text-foreground-muted mt-2">
              Loading countries...
            </p>
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
    <section id="destinations" className="section-padding relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Popular Destinations
            </h2>
            <p className="text-foreground-muted mt-2 max-w-xl mx-auto">
              Apply for visas to {allCountries.length}+ countries worldwide
            </p>
          </div>
        </FadeUp>

        <StaggerContainer staggerDelay={0.03}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {visible.map((country) => (
              <motion.div key={country.id} variants={staggerItemVariants}>
                <div className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300">
                  <div className="text-3xl mb-3 text-center">
                    {country.flag || "🌍"}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground text-center mb-3 group-hover:text-primary transition-colors line-clamp-1">
                    {country.name}
                  </h3>
                  <Link
                    href={`/visa-results?origin=${country.id}&destination=${country.id}`}
                    className="block w-full"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs rounded-full border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-200"
                    >
                      Apply Visa
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </StaggerContainer>

        {/* Load More / Show Less */}
        <FadeUp delay={0.2}>
          <div className="text-center mt-8">
            {hasMore && (
              <Button
                variant="secondary"
                size="lg"
                onClick={handleLoadMore}
              >
                Load More Countries ({allCountries.length - visibleCount} remaining)
              </Button>
            )}

            {isAll && allCountries.length > INITIAL_COUNT && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleShowLess}
              >
                Show Less
                <ArrowRight className="ml-2 h-4 w-4 rotate-[-90deg]" />
              </Button>
            )}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
