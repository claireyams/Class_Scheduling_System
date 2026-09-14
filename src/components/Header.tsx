"use client";

import { useSchedule } from "@/context/ScheduleContext";

export function Header() {
  const { entries, totalUnits } = useSchedule();

  return (
    <header className="border-b border-line bg-paper/95 px-5 py-4 backdrop-blur-sm sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-forest-900">
            Class Scheduler
          </h1>
          <p className="text-sm text-muted">Browse sections, build your term.</p>
        </div>
        <div className="text-sm text-muted">
          <span className="font-medium text-ink">{entries.length}</span> course
          {entries.length === 1 ? "" : "s"} selected · {totalUnits} unit
          {totalUnits === 1 ? "" : "s"}
        </div>
      </div>
    </header>
  );
}
