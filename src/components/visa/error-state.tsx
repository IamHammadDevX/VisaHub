"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-5">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Failed to Load Visas
      </h3>
      <p className="text-sm text-foreground-muted max-w-sm mb-6">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
