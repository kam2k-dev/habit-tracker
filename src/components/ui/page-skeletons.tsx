import { HabitCardSkeleton, ShimmerSkeleton, StatsSkeleton } from '@/components/ui/shimmer-skeleton';

export function TodayPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2rem] p-6 space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <ShimmerSkeleton width="40%" height="24px" borderRadius="6px" />
            <ShimmerSkeleton width="60%" height="16px" borderRadius="4px" />
          </div>
          <ShimmerSkeleton width="52px" height="52px" borderRadius="16px" />
        </div>
        <ShimmerSkeleton width="100%" height="10px" borderRadius="999px" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card/50 p-4 rounded-2xl border border-border/50 flex flex-col items-center gap-2">
              <ShimmerSkeleton width="50%" height="10px" />
              <ShimmerSkeleton width="40%" height="24px" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <ShimmerSkeleton key={i} width="96px" height="40px" borderRadius="6px" />
        ))}
      </div>

      <div className="space-y-3">
        <ShimmerSkeleton width="120px" height="16px" borderRadius="4px" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <HabitCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatsPageSkeleton() {
  return (
    <div className="space-y-6">
      <StatsSkeleton />
      <div className="bg-card border rounded-xl p-5 space-y-4">
        <ShimmerSkeleton width="140px" height="16px" borderRadius="4px" />
        <ShimmerSkeleton width="100%" height="180px" borderRadius="12px" />
      </div>
    </div>
  );
}
