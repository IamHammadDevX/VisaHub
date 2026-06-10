"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { VisaSearchForm } from "@/components/search/visa-search-form";
import { SITE_CONFIG } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-background" />
      <div className="absolute inset-0 bg-grid opacity-20" />

      {/* Glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[150px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.05] mb-4 tracking-tight"
          >
            Find Your Visa in{" "}
            <span className="gradient-text">Seconds</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg text-foreground-muted max-w-xl mb-10 leading-relaxed"
          >
            {SITE_CONFIG.description}
          </motion.p>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-2xl"
          >
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-2 mb-5 text-left">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Select your route</span>
              </div>
              <VisaSearchForm />
            </div>
          </motion.div>

          {/* Trust indicator */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xs text-foreground-muted/60 mt-6"
          >
            ✦ Trusted by 50,000+ travelers worldwide
          </motion.p>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
