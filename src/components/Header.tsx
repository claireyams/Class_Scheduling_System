"use client";

import { useSchedule } from "@/context/ScheduleContext";

type ThemeMode = "light" | "dark" | "system";

interface HeaderProps {
  onOpenSchedule: () => void;
  theme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

export function Header({ onOpenSchedule, theme, onThemeChange }: HeaderProps) {
  const { entries, totalUnits } = useSchedule();

  return (
    <header className="border-b border-line bg-paper/95 px-5 py-4 backdrop-blur-sm sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-forest-900">
            Class Scheduler
          </h1>
          <p className="text-sm text-muted">Browse sections, build your term.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex overflow-hidden rounded-full border border-line bg-white p-1 shadow-sm">
            {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onThemeChange(mode)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] transition-colors ${
                  theme === mode ? "bg-forest-600 text-white" : "text-muted hover:text-ink"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenSchedule}
            className="flex items-center gap-2 rounded-lg border border-forest-600 bg-forest-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-700"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
              <rect x="3" y="4" width="14" height="13" rx="1.5" />
              <path d="M3 8h14M7 2v4M13 2v4" strokeLinecap="round" />
            </svg>
            My Schedule
            {entries.length > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-semibold">
                {entries.length}
              </span>
            )}
            <span className="hidden text-xs font-normal text-white/80 sm:inline">
              · {totalUnits} unit{totalUnits === 1 ? "" : "s"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}