"use client";

import { useMemo } from "react";
import { useSchedule } from "@/context/ScheduleContext";
import { DAYS, GRID_START_MINUTES, GRID_END_MINUTES, toMinutes, formatDayShort, formatTime } from "@/lib/time";
import { EmptyState } from "./StatusStates";

const SLOT_MINUTES = 30;
const ROW_COUNT = (GRID_END_MINUTES - GRID_START_MINUTES) / SLOT_MINUTES;
const HOUR_LABELS = Array.from({ length: ROW_COUNT / 2 + 1 }, (_, i) => GRID_START_MINUTES + i * 60);

interface GridBlock {
  key: string;
  courseId: string;
  day: string;
  rowStart: number;
  rowSpan: number;
  label: string;
  sub: string;
  color: string;
}

export function ScheduleGrid() {
  const { entries, removeCourse } = useSchedule();

  const blocks: GridBlock[] = useMemo(() => {
    const out: GridBlock[] = [];
    for (const entry of entries) {
      for (const meeting of entry.section.schedule) {
        const start = toMinutes(meeting.startTime);
        const end = toMinutes(meeting.endTime);
        const rowStart = Math.round((start - GRID_START_MINUTES) / SLOT_MINUTES) + 1;
        const rowSpan = Math.max(1, Math.round((end - start) / SLOT_MINUTES));
        out.push({
          key: `${entry.section.id}-${meeting.day}`,
          courseId: entry.courseId,
          day: meeting.day,
          rowStart,
          rowSpan,
          label: entry.courseCode,
          sub: `${formatTime(meeting.startTime)}–${formatTime(meeting.endTime)} · ${entry.section.room}`,
          color: entry.color,
        });
      }
    }
    return out;
  }, [entries]);

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Your schedule is empty"
        description="Select sections from the course list to see them here."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-card">
      <div className="min-w-[640px]">
        {/* Day header row */}
        <div
          className="grid border-b border-line"
          style={{ gridTemplateColumns: `56px repeat(${DAYS.length}, 1fr)` }}
        >
          <div />
          {DAYS.map((day) => (
            <div key={day} className="border-l border-line px-2 py-2 text-center text-xs font-medium text-ink">
              {formatDayShort(day)}
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div className="relative grid" style={{ gridTemplateColumns: `56px repeat(${DAYS.length}, 1fr)` }}>
          {/* Time labels column */}
          <div
            className="grid"
            style={{ gridTemplateRows: `repeat(${ROW_COUNT}, 28px)` }}
          >
            {HOUR_LABELS.map((minutes, i) => (
              <div
                key={minutes}
                style={{ gridRow: `${i * 2 + 1} / span 1` }}
                className="relative"
              >
                <span className="absolute -top-2 right-2 text-[10px] text-muted">
                  {formatTime(`${String(Math.floor(minutes / 60)).padStart(2, "0")}:00`)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map((day) => (
            <div
              key={day}
              className="relative grid border-l border-line"
              style={{ gridTemplateRows: `repeat(${ROW_COUNT}, 28px)` }}
            >
              {Array.from({ length: ROW_COUNT }).map((_, i) => (
                <div key={i} className={`${i % 2 === 0 ? "border-t border-line/70" : ""}`} />
              ))}
              {blocks
                .filter((b) => b.day === day)
                .map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => removeCourse(b.courseId)}
                    title={`${b.label} — click to remove from schedule`}
                    style={{
                      gridRow: `${b.rowStart} / span ${b.rowSpan}`,
                      backgroundColor: `${b.color}1A`,
                      borderColor: b.color,
                      color: b.color,
                    }}
                    className="absolute inset-x-0.5 z-10 flex flex-col overflow-hidden rounded-md border-l-[3px] px-1.5 py-1 text-left transition-opacity hover:opacity-80"
                  >
                    <span className="truncate text-[11px] font-semibold">{b.label}</span>
                    <span className="truncate text-[10px] opacity-80">{b.sub}</span>
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

