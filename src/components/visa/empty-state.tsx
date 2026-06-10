"use client";

import { SearchX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <SearchX className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No Visa Options Available
      </h3>
      <p className="text-sm text-foreground-muted max-w-sm mb-6">
        No visa options available for this route. Try a different destination.
      </p>
      <Link href="/">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change Destination
        </Button>
      </Link>
    </div>
  );
}
