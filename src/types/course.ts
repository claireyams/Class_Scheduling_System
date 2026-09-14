export type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export interface Meeting {
  day: Day;
  startTime: string; // "HH:mm", 24h
  endTime: string; // "HH:mm", 24h
}

export interface Section {
  id: string; // e.g. "CCPROG3-Y01"
  section: string; // e.g. "Y01"
  instructor: string;
  room: string;
  schedule: Meeting[];
  slotsTotal: number;
  slotsTaken: number;
}

export interface Course {
  id: string; // e.g. "CCPROG3"
  code: string;
  title: string;
  units: number;
  category: string; // used for filtering, e.g. "Major", "Elective", "GE"
  sections: Section[];
}

// A selected section, flattened for the schedule view.
export interface ScheduledEntry {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  units: number;
  section: Section;
  color: string; // assigned per-course accent, for the grid
}
