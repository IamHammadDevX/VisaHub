"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HoverScaleProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
}

export function HoverScale({
  children,
  className,
  scale = 1.03,
  duration = 0.3,
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
