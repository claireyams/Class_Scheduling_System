"use client";

import { memo } from "react";
import type { Course, Section } from "@/types/course";
import { formatDayShort, formatTime } from "@/lib/time";

interface SectionRowProps {
  course: Course;
  section: Section;
  isSelected: boolean;
  onToggle: (course: Course, section: Section) => void;
}

function SectionRowBase({ course, section, isSelected, onToggle }: SectionRowProps) {
  const isFull = section.slotsTaken >= section.slotsTotal;
  const slotsLeft = section.slotsTotal - section.slotsTaken;

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border px-3 py-2.5 transition-colors sm:flex-row sm:items-center sm:justify-between ${
        isSelected
          ? "border-forest-500 bg-forest-50"
          : "border-line bg-white hover:border-forest-300"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-medium text-ink">{section.section}</span>
          <span className="text-muted">{section.instructor}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
          <span>
            {section.schedule
              .map((m) => `${formatDayShort(m.day)} ${formatTime(m.startTime)}–${formatTime(m.endTime)}`)
              .join(" · ")}
          </span>
          <span>{section.room}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:flex-shrink-0">
        <span
          className={`text-xs ${
            isFull ? "text-clay-500" : slotsLeft <= 5 ? "text-gold-600" : "text-muted"
          }`}
        >
          {isFull ? "Full" : `${slotsLeft} slot${slotsLeft === 1 ? "" : "s"} left`}
        </span>
        <button
          type="button"
          disabled={isFull && !isSelected}
          aria-pressed={isSelected}
          onClick={() => onToggle(course, section)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            isSelected
              ? "bg-clay-500 text-white hover:bg-clay-600"
              : isFull
              ? "cursor-not-allowed bg-line text-muted"
              : "bg-forest-50 text-forest-700 hover:bg-forest-100"
          }`}
        >
          {isSelected ? "Remove" : isFull ? "Full" : "Select"}
        </button>
      </div>
    </div>
  );
}

export const SectionRow = memo(SectionRowBase);
