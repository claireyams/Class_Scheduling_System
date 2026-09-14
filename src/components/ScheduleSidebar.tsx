"use client";

import { useSchedule } from "@/context/ScheduleContext";
import { useToast } from "@/context/ToastContext";
import { formatDayShort, formatTime } from "@/lib/time";

export function ScheduleSidebar() {
  const { entries, totalUnits, removeCourse, clearSchedule } = useSchedule();
  const { showToast } = useToast();

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white/60 px-4 py-8 text-center text-sm text-muted">
        No courses selected yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {entries.map((entry) => (
        <div
          key={entry.courseId}
          className="flex items-start justify-between gap-2 rounded-lg border border-line bg-white px-3 py-2.5"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <span className="truncate text-sm font-medium text-ink">
                {entry.courseCode} · {entry.section.section}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted">
              {entry.section.schedule
                .map((m) => `${formatDayShort(m.day)} ${formatTime(m.startTime)}`)
                .join(", ")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              removeCourse(entry.courseId);
              showToast(`Removed ${entry.courseCode} from your schedule`, "info");
            }}
            aria-label={`Remove ${entry.courseCode} from schedule`}
            className="flex-shrink-0 rounded-md p-1 text-muted transition-colors hover:bg-clay-500/10 hover:text-clay-500"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}

      <div className="mt-1 flex items-center justify-between border-t border-line pt-3 text-sm">
        <span className="text-muted">Total units</span>
        <span className="font-medium text-ink">{totalUnits}</span>
      </div>

      <button
        type="button"
        onClick={() => {
          clearSchedule();
          showToast("Schedule cleared", "info");
        }}
        className="mt-1 text-xs font-medium text-muted underline-offset-2 hover:text-clay-500 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
