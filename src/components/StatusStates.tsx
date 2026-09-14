interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-forest-50 text-forest-600">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <circle cx="9" cy="9" r="6.5" />
          <path d="M14 14l4 4" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted">{description}</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-clay-500/30 bg-clay-500/5 px-6 py-14 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-clay-500/10 text-clay-500">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <path d="M10 3l8 14H2l8-14z" strokeLinejoin="round" />
          <path d="M10 8v4" strokeLinecap="round" />
          <circle cx="10" cy="14.5" r="0.5" fill="currentColor" />
        </svg>
      </div>
      <h3 className="font-display text-base font-semibold text-ink">Something went wrong</h3>
      <p className="mt-1 max-w-xs text-sm text-muted">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-lg bg-forest-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-700"
      >
        Try again
      </button>
    </div>
  );
}
