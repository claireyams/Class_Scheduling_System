"use client";

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  resultCount: number;
}

export function SearchBar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  categories,
  resultCount,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="M17 17l-4-4" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by code, title, or instructor"
          aria-label="Search courses"
          className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="category" className="sr-only">
          Filter by category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="hidden whitespace-nowrap text-xs text-muted sm:inline">
          {resultCount} result{resultCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
