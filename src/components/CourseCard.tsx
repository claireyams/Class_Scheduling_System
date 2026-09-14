"use client";

import { memo, useState } from "react";
import type { Course, Section } from "@/types/course";
import { SectionRow } from "./SectionRow";
import { useSchedule } from "@/context/ScheduleContext";
import { useToast } from "@/context/ToastContext";

interface CourseCardProps {
  course: Course;
}

function CourseCardBase({ course }: CourseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { selectSection, removeCourse, isSelected, selectedSectionId } = useSchedule();
  const { showToast } = useToast();

  const selectedId = selectedSectionId(course.id);

  const handleToggle = (c: Course, section: Section) => {
    if (isSelected(c.id, section.id)) {
      removeCourse(c.id);
      showToast(`Removed ${c.code} from your schedule`, "info");
    } else {
      const wasAlreadyTaken = Boolean(selectedId);
      selectSection(c, section);
      showToast(
        wasAlreadyTaken
          ? `Switched ${c.code} to section ${section.section}`
          : `Added ${c.code} ${section.section} to your schedule`
      );
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-start justify-between gap-3 border-b border-line bg-gradient-to-r from-forest-50 via-forest-50 to-white px-4 py-3.5 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-display text-base font-semibold text-forest-900">{course.code}</span>
            <span className="truncate text-sm text-ink">{course.title}</span>
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
            <span>{course.units} unit{course.units === 1 ? "" : "s"}</span>
            <span>{course.category}</span>
            <span>
              {course.sections.length} section{course.sections.length === 1 ? "" : "s"}
            </span>
            {selectedId && <span className="font-medium text-forest-600">Selected: {selectedId.split("-").pop()}</span>}
          </div>
        </div>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className={`mt-1 h-4 w-4 flex-shrink-0 text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div className="flex flex-col gap-2 bg-slate-50/60 px-4 py-3">
          {course.sections.map((section) => (
            <SectionRow
              key={section.id}
              course={course}
              section={section}
              isSelected={isSelected(course.id, section.id)}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const CourseCard = memo(CourseCardBase);
