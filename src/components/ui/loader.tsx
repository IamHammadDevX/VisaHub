import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function Loader({ size = "default", className }: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    default: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-white/20 border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-primary" />
        <p className="text-sm text-foreground-muted animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
