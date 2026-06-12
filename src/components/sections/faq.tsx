"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/constants";
import { FadeUp } from "@/components/animations/fade-up";
import { cn } from "@/lib/utils";

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-50"
      >
        <span className="text-sm font-medium text-foreground pr-4">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-foreground-muted shrink-0 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="px-5 pb-5">
              <p className="text-sm text-foreground-muted leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section id="faq" className="section-padding relative">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-foreground-muted max-w-xl mx-auto">
              Everything you need to know about visa applications
            </p>
          </div>
        </FadeUp>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, index) => (
            <FadeUp key={index} delay={index * 0.03}>
              <FaqItem
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              />
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
