"use client";

export function VisaCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 animate-pulse">
      <div className="h-4 w-28 bg-white/10 rounded-lg mb-3" />
      <div className="h-3 w-20 bg-white/10 rounded-lg mb-5" />
      <div className="h-14 w-full bg-white/10 rounded-xl mb-4" />
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-3.5 w-full bg-white/10 rounded-lg" />
        ))}
      </div>
      <div className="h-9 w-full bg-white/10 rounded-full mt-5" />
    </div>
  );
}

export function VisaCardSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <VisaCardSkeleton key={i} />
      ))}
    </div>
  );
}
