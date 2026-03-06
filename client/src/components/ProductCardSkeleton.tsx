/**
 * Skeleton loader para cards de produto na Home.
 * Exibido enquanto os produtos estão sendo carregados da API.
 */
export default function ProductCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "oklch(0.99 0 0)", border: "2px solid oklch(0.93 0.02 305)" }}
    >
      {/* Image skeleton */}
      <div className="skeleton" style={{ height: 180 }} />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category badge */}
        <div className="skeleton h-5 w-20 rounded-full" />
        {/* Title */}
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        {/* Description */}
        <div className="space-y-1.5">
          <div className="skeleton h-3.5 w-full rounded" />
          <div className="skeleton h-3.5 w-2/3 rounded" />
        </div>
        {/* Price + button row */}
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton h-6 w-20 rounded-lg" />
          <div className="skeleton h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}
