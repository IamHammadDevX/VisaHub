"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DESTINATIONS } from "@/lib/constants";
import { FadeUp } from "@/components/animations/fade-up";
import { StaggerContainer, staggerItemVariants } from "@/components/animations/stagger-container";
import { HoverScale } from "@/components/animations/hover-scale";

export function PopularDestinations() {
  return (
    <section id="destinations" className="section-padding relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Popular Destinations
              </h2>
              <p className="text-foreground-muted mt-2">
                Apply for visas to the most visited countries
              </p>
            </div>
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </FadeUp>

        <StaggerContainer staggerDelay={0.06}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DESTINATIONS.map((dest) => (
              <motion.div key={dest.name} variants={staggerItemVariants}>
                <div className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300">
                  <div className="text-3xl mb-3">{dest.flag}</div>
                  <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-[11px] text-foreground-muted mb-2">
                    {dest.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-foreground-muted">
                    <Clock className="h-3 w-3 text-primary/70" />
                    <span>{dest.processingTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-foreground-muted mt-1">
                    <DollarSign className="h-3 w-3 text-primary/70" />
                    <span>{dest.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </StaggerContainer>

        <FadeUp delay={0.2}>
          <div className="text-center mt-8 sm:hidden">
            <Button variant="outline" size="sm">
              View All Destinations
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
