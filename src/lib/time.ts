import type { Day } from "@/types/course";

export const DAYS: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const GRID_START_MINUTES = 7 * 60; // 07:00
export const GRID_END_MINUTES = 20 * 60; // 20:00

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
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
  "#2F6B3C", // forest-500
  "#B9821A", // gold-600
  "#C1584B", // clay-500
  "#3E6E8E",
  "#7A5CA8",
  "#4B8A6F",
  "#A65D8B",
  "#8A7B3E",
];

export function colorForCourse(courseId: string): string {
  let hash = 0;
  for (let i = 0; i < courseId.length; i++) {
    hash = (hash * 31 + courseId.charCodeAt(i)) >>> 0;
  }
  return COURSE_COLORS[hash % COURSE_COLORS.length];
}
