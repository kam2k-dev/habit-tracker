import { motion } from 'framer-motion';

interface ShimmerSkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
}

export function ShimmerSkeleton({ 
  className = "", 
  width = "100%", 
  height = "20px", 
  borderRadius = "8px" 
}: ShimmerSkeletonProps) {
  return (
    <div 
      className={`relative overflow-hidden bg-muted/60 ${className}`}
      style={{ width, height, borderRadius }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        }}
      />
    </div>
  );
}

export function HabitCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 bg-card border rounded-lg">
      {/* Checkbox circle skeleton */}
      <ShimmerSkeleton width="24px" height="24px" borderRadius="9999px" className="shrink-0" />
      
      {/* Habit Name skeleton */}
      <div className="flex-1 space-y-2">
        <ShimmerSkeleton width="60%" height="16px" />
      </div>

      {/* Stats skeletons */}
      <div className="flex items-center gap-2">
        <ShimmerSkeleton width="30px" height="12px" />
        <ShimmerSkeleton width="30px" height="12px" />
      </div>
      
      {/* Ellipsis skeleton */}
      <ShimmerSkeleton width="20px" height="20px" borderRadius="4px" />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="p-4 bg-card border rounded-lg space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <ShimmerSkeleton width="40%" height="12px" />
              <ShimmerSkeleton width="70%" height="24px" />
              <ShimmerSkeleton width="50%" height="10px" />
            </div>
            <ShimmerSkeleton width="32px" height="32px" borderRadius="8px" className="shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
