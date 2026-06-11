"use client";

import { Frown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-5">
        <Frown className="h-8 w-8 text-amber-400" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">
        No Visa Options Available
      </h3>
      <p className="text-sm text-foreground-muted max-w-md mb-2 leading-relaxed">
        Sorry for the inconvenience, but we currently don&apos;t have any visa options 
        available for this route.
      </p>
      <p className="text-sm text-foreground-muted/70 max-w-md mb-8">
        Please try selecting a different origin or destination country.
      </p>
      <Link href="/">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change Route
        </Button>
      </Link>
    </div>
  );
}
