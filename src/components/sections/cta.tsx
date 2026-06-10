"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/animations/fade-up";

export function CTA() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="rounded-3xl border border-primary/10 bg-primary/[0.02] p-10 md:p-14 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Start Your Visa{" "}
              <span className="gradient-text">Application Today</span>
            </h2>

            <p className="text-foreground-muted text-base mb-8 max-w-lg mx-auto">
              Join 50,000+ travelers who have successfully obtained their visas through VisaHub.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="xl">
                Apply for Visa
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="secondary" size="xl">
                Check Requirements
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-foreground-muted">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Secure & Encrypted
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground-muted">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                AI-Powered Assistance
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground-muted">
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
                150+ Countries
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
