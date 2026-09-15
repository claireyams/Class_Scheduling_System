import type { Day, Meeting } from "@/types/course";

export const DAYS: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const GRID_START_MINUTES = 7 * 60; // 07:00
export const GRID_END_MINUTES = 21 * 60 + 15; // 21:15 latest possible end

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Two meetings clash if they fall on the same day and their time ranges overlap.
// Shared by ScheduleContext (course-level conflict flags) and ScheduleGrid
// (per-block lane layout) so both views agree on what counts as a clash.
export function meetingsOverlap(a: Meeting, b: Meeting): boolean {
  if (a.day !== b.day) return false;
  const aStart = toMinutes(a.startTime);
  const aEnd = toMinutes(a.endTime);
  const bStart = toMinutes(b.startTime);
  const bEnd = toMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatDayShort(day: Day): string {
  return day.slice(0, 3);
}

// Palette rotation for per-course accents in the schedule grid.
const COURSE_COLORS = [
  "#1F7A5A",
  "#D97706",
  "#C2410C",
  "#2563EB",
  "#7C3AED",
  "#0F766E",
  "#DC2626",
  "#DB2777",
  "#0891B2",
  "#A16207",
  "#15803D",
  "#7C2D12",
  "#4338CA",
  "#BE185D",
  "#0369A1",
  "#E11D48",
];

export function colorForCourse(courseId: string): string {
  let hash = 0;
  for (let i = 0; i < courseId.length; i++) {
    hash = (hash * 31 + courseId.charCodeAt(i)) >>> 0;
  }
  return COURSE_COLORS[hash % COURSE_COLORS.length];
}