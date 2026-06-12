"use client";

import { Globe } from "lucide-react";
import { VisaSearchForm } from "@/components/search/visa-search-form";
import { SITE_CONFIG } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20">
      {/* Travel image background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80')",
        }}
      />
      {/* White overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.05] mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            Find Your Visa in{" "}
            <span className="gradient-text">Seconds</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-foreground-muted max-w-xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            {SITE_CONFIG.description}
          </p>

          {/* Search Card */}
          <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5 text-left">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Select your route
                </span>
              </div>
              <VisaSearchForm />
            </div>
          </div>

          {/* Trust indicator */}
          <p className="text-xs text-foreground-muted mt-6 animate-in fade-in duration-700 delay-500">
            ✦ Trusted by 50,000+ travelers worldwide
          </p>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
