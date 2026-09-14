export function CourseListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-line bg-white p-4 shadow-card">
          <div className="mb-3 h-4 w-1/3 animate-pulse rounded bg-line" />
          <div className="mb-2 h-3 w-2/3 animate-pulse rounded bg-line" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-line" />
        </div>
      ))}
    </div>
  );
}
