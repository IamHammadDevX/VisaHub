"use client";

import {
  Globe,
  Briefcase,
  GraduationCap,
  Building2,
  HeartPulse,
  Plane,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VISA_CATEGORIES } from "@/lib/constants";
import { FadeUp } from "@/components/animations/fade-up";
import { StaggerContainer, staggerItemVariants } from "@/components/animations/stagger-container";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ElementType> = {
  Globe,
  Briefcase,
  GraduationCap,
  Building2,
  HeartPulse,
  Plane,
};

export function VisaCategories() {
  return (
    <section id="visa-types" className="section-padding relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Visa Categories
            </h2>
            <p className="text-foreground-muted max-w-xl mx-auto">
              Choose the right visa for your travel purpose
            </p>
          </div>
        </FadeUp>

        <StaggerContainer staggerDelay={0.06}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {VISA_CATEGORIES.map((cat) => {
              const Icon = iconMap[cat.icon] || Globe;
              return (
                <motion.div key={cat.title} variants={staggerItemVariants}>
                  <div className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 text-center">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300"
                      style={{ background: `${cat.color}15`, color: cat.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-foreground-muted leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </StaggerContainer>
      </div>
    </section>
  );
}
