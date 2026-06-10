"use client";

import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TESTIMONIALS } from "@/lib/constants";
import { FadeUp } from "@/components/animations/fade-up";
import { StaggerContainer, staggerItemVariants } from "@/components/animations/stagger-container";
import { motion } from "framer-motion";

export function Testimonials() {
  return (
    <section className="section-padding relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              What Our Travelers Say
            </h2>
            <p className="text-foreground-muted max-w-xl mx-auto">
              Join thousands of satisfied travelers
            </p>
          </div>
        </FadeUp>

        <StaggerContainer staggerDelay={0.08}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((testimonial) => (
              <motion.div key={testimonial.name} variants={staggerItemVariants}>
                <Card className="h-full">
                  <CardContent className="p-5">
                    <Quote className="h-5 w-5 text-primary/30 mb-3" />
                    <p className="text-sm text-foreground-muted mb-5 leading-relaxed">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </StaggerContainer>
      </div>
    </section>
  );
}
