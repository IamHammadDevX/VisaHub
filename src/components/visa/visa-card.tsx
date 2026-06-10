"use client";

import { motion } from "framer-motion";
import { Clock, CalendarDays, Timer, DollarSign, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VisaCard as VisaCardType } from "@/types/visa";

interface VisaCardProps {
  visa: VisaCardType;
  index: number;
}

export function VisaCard({ visa, index }: VisaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card className="h-full group">
        <CardContent className="p-5 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {visa.visaType}
              </h3>
              {visa.description && (
                <p className="text-xs text-foreground-muted mt-1 line-clamp-1">
                  {visa.description}
                </p>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1 mb-4 p-3 rounded-xl bg-primary/[0.03] border border-primary/10">
            <DollarSign className="h-4 w-4 text-primary" />
            {visa.totalFee > 0 ? (
              <>
                <span className="text-2xl font-bold text-foreground">
                  ${visa.totalFee.toLocaleString()}
                </span>
                <span className="text-xs text-foreground-muted">total</span>
              </>
            ) : (
              <span className="text-sm text-foreground-muted">Contact for pricing</span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2.5 flex-1">
            {visa.visaFee > 0 && (
              <div className="flex items-center gap-2.5 text-xs text-foreground-muted">
                <DollarSign className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span>
                  Visa Fee: <strong className="text-foreground">${visa.visaFee.toLocaleString()}</strong>
                </span>
              </div>
            )}
            {visa.serviceFee > 0 && (
              <div className="flex items-center gap-2.5 text-xs text-foreground-muted">
                <Shield className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span>
                  Service Fee: <strong className="text-foreground">${visa.serviceFee.toLocaleString()}</strong>
                </span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-xs text-foreground-muted">
              <Clock className="h-3.5 w-3.5 text-primary/70 shrink-0" />
              <span>
                Processing: <strong className="text-foreground">{visa.processingTime}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-foreground-muted">
              <CalendarDays className="h-3.5 w-3.5 text-primary/70 shrink-0" />
              <span>
                Validity: <strong className="text-foreground">{visa.validity}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-foreground-muted">
              <Timer className="h-3.5 w-3.5 text-primary/70 shrink-0" />
              <span>
                Stay: <strong className="text-foreground">{visa.stayDuration}</strong>
              </span>
            </div>
          </div>

          {/* CTA */}
          <Button className="w-full mt-5" size="sm">
            Apply for {visa.visaType}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
