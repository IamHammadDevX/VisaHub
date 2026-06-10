"use client";

import { motion } from "framer-motion";
import {
  Clock,
  CalendarDays,
  Timer,
  DollarSign,
  Shield,
  Repeat,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VisaCard as VisaCardType } from "@/types/visa";
import { useRouter } from "next/navigation";

interface VisaCardProps {
  visa: VisaCardType;
  index: number;
}

export function VisaCard({ visa, index }: VisaCardProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <div className="group relative h-full rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 transition-all duration-500 hover:border-primary/20 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-primary/5">
        {/* Glow on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                {visa.visaType}
              </h3>
              {visa.description && (
                <p className="text-xs text-foreground-muted/70 mt-1 line-clamp-1">
                  {visa.description}
                </p>
              )}
            </div>
            <Badge variant="outline" size="sm" className="shrink-0 mt-0.5">
              ID: {visa.id}
            </Badge>
          </div>

          {/* Price */}
          <div className="relative mb-5 p-4 rounded-xl bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] border border-primary/10 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
            <div className="relative flex items-baseline gap-1.5">
              <DollarSign className="h-5 w-5 text-primary shrink-0" />
              {visa.totalFee > 0 ? (
                <>
                  <span className="text-3xl font-bold text-foreground tracking-tight">
                    ${visa.totalFee.toLocaleString()}
                  </span>
                  <span className="text-xs text-foreground-muted ml-1">total</span>
                </>
              ) : (
                <span className="text-base text-foreground-muted">Contact for pricing</span>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mb-5 flex-1">
            {visa.visaFee > 0 && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-foreground-muted uppercase tracking-wider mb-1.5">
                  <DollarSign className="h-3 w-3 text-primary/70" />
                  Visa Fee
                </div>
                <p className="text-sm font-semibold text-foreground">
                  ${visa.visaFee.toLocaleString()}
                </p>
              </div>
            )}
            {visa.serviceFee > 0 && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-foreground-muted uppercase tracking-wider mb-1.5">
                  <Shield className="h-3 w-3 text-primary/70" />
                  Service Fee
                </div>
                <p className="text-sm font-semibold text-foreground">
                  ${visa.serviceFee.toLocaleString()}
                </p>
              </div>
            )}
            {visa.validity !== "N/A" && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-foreground-muted uppercase tracking-wider mb-1.5">
                  <CalendarDays className="h-3 w-3 text-primary/70" />
                  Validity
                </div>
                <p className="text-sm font-semibold text-foreground">{visa.validity}</p>
              </div>
            )}
            {visa.stayDuration !== "N/A" && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-foreground-muted uppercase tracking-wider mb-1.5">
                  <Timer className="h-3 w-3 text-primary/70" />
                  Stay
                </div>
                <p className="text-sm font-semibold text-foreground">{visa.stayDuration}</p>
              </div>
            )}
            {visa.processingTime !== "N/A" && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-foreground-muted uppercase tracking-wider mb-1.5">
                  <Clock className="h-3 w-3 text-primary/70" />
                  Processing
                </div>
                <p className="text-sm font-semibold text-foreground">{visa.processingTime}</p>
              </div>
            )}
            {visa.entryType !== "N/A" && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-foreground-muted uppercase tracking-wider mb-1.5">
                  <Repeat className="h-3 w-3 text-primary/70" />
                  Entry
                </div>
                <p className="text-sm font-semibold text-foreground">{visa.entryType}</p>
              </div>
            )}
          </div>

          {/* Apply Button */}
          <Button
            onClick={() => router.push(`/apply?visaId=${visa.id}`)}
            className="w-full group/btn"
            size="lg"
          >
            Apply for {visa.visaType}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
