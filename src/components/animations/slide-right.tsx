"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface SlideRightProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function SlideRight({
  children,
  className,
  delay = 0,
  once = true,
}: SlideRightProps) {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0, x: -60 },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            duration: 0.7,
            delay,
            ease: [0.25, 0.4, 0.25, 1],
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
