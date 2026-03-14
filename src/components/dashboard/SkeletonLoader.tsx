export function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-5 rounded-lg bg-card shadow-premium">
          <div className="space-y-3">
            <div className="h-3 bg-muted rounded animate-pulse-skeleton" style={{ width: "30%" }} />
            <div className="h-5 bg-muted rounded animate-pulse-skeleton" style={{ width: `${80 - i * 5}%` }} />
            <div className="h-4 bg-muted rounded animate-pulse-skeleton" style={{ width: `${90 - i * 5}%` }} />
            <div className="h-4 bg-muted rounded animate-pulse-skeleton" style={{ width: `${70 - i * 5}%` }} />
            <div className="h-3 bg-muted rounded animate-pulse-skeleton" style={{ width: "50%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
