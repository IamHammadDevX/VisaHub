"use client";

import { Search, FileText, Upload, CheckCircle } from "lucide-react";
import { HOW_IT_WORKS } from "@/lib/constants";
import { FadeUp } from "@/components/animations/fade-up";
import { StaggerContainer, staggerItemVariants } from "@/components/animations/stagger-container";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ElementType> = {
  Search,
  FileText,
  Upload,
  CheckCircle,
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-foreground-muted max-w-xl mx-auto">
              Get your visa in 4 simple steps
            </p>
          </div>
        </FadeUp>

        <StaggerContainer staggerDelay={0.08}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {HOW_IT_WORKS.map((step, index) => {
              const Icon = iconMap[step.icon] || Search;
              return (
                <motion.div key={step.step} variants={staggerItemVariants}>
                  <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 group hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300">
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold">
                      {step.step}
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      {step.description}
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
