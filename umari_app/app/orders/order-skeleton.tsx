import { Skeleton } from "@/components/ui/skeleton"

export function OrderSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border/60">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Content */}
      <div className="px-5 py-3 space-y-3">
        <div className="flex justify-between items-center py-1.5 border-b border-border/30">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-border/30">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-border/30">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between items-center py-1.5">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}
