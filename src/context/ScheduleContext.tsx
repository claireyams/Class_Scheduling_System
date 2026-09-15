"use client";

import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import type { Course, ScheduledEntry, Section } from "@/types/course";
import { colorForCourse, meetingsOverlap } from "@/lib/time";

interface ScheduleState {
  // keyed by courseId -> the currently selected section for that course
  selections: Record<string, ScheduledEntry>;
}

type Action =
  | { type: "SELECT"; course: Course; section: Section }
  | { type: "REMOVE"; courseId: string }
  | { type: "CLEAR" };

function reducer(state: ScheduleState, action: Action): ScheduleState {
  switch (action.type) {
    case "SELECT": {
      const entry: ScheduledEntry = {
        courseId: action.course.id,
        courseCode: action.course.code,
        courseTitle: action.course.title,
        units: action.course.units,
        section: action.section,
        color: colorForCourse(action.course.id),
      };
      return { selections: { ...state.selections, [action.course.id]: entry } };
    }
    case "REMOVE": {
      const next = { ...state.selections };
      delete next[action.courseId];
      return { selections: next };
    }
    case "CLEAR":
      return { selections: {} };
    default:
      return state;
  }
}

interface ScheduleContextValue {
  entries: ScheduledEntry[];
  totalUnits: number;
  isSelected: (courseId: string, sectionId: string) => boolean;
  selectedSectionId: (courseId: string) => string | undefined;
  selectSection: (course: Course, section: Section) => void;
  removeCourse: (courseId: string) => void;
  clearSchedule: () => void;
  // True if this course's selected section has a time overlap with any
  // other selected course. Computed once here so the grid and the list
  // agree on what counts as a clash.
  hasConflict: (courseId: string) => boolean;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { selections: {} });

  const selectSection = useCallback((course: Course, section: Section) => {
    dispatch({ type: "SELECT", course, section });
  }, []);

  const removeCourse = useCallback((courseId: string) => {
    dispatch({ type: "REMOVE", courseId });
  }, []);

  const clearSchedule = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const entries = useMemo(() => Object.values(state.selections), [state.selections]);

  const totalUnits = useMemo(
    () => entries.reduce((sum, e) => sum + e.units, 0),
    [entries]
  );

  const isSelected = useCallback(
    (courseId: string, sectionId: string) =>
      state.selections[courseId]?.section.id === sectionId,
    [state.selections]
  );

  const selectedSectionId = useCallback(
    (courseId: string) => state.selections[courseId]?.section.id,
    [state.selections]
  );

  // Pairwise-compare every selected course's meetings against every other
  // selected course's meetings. O(n^2) over selected courses, which is fine
  // since a term's worth of selections is a handful of entries, not hundreds.
  const conflictingCourseIds = useMemo(() => {
    const conflicted = new Set<string>();
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i];
        const b = entries[j];
        const clashes = a.section.schedule.some((meetingA) =>
          b.section.schedule.some((meetingB) => meetingsOverlap(meetingA, meetingB))
        );
        if (clashes) {
          conflicted.add(a.courseId);
          conflicted.add(b.courseId);
        }
      }
    }
    return conflicted;
  }, [entries]);

  const hasConflict = useCallback(
    (courseId: string) => conflictingCourseIds.has(courseId),
    [conflictingCourseIds]
  );

  const value = useMemo(
    () => ({
      entries,
      totalUnits,
      isSelected,
      selectedSectionId,
      selectSection,
      removeCourse,
      clearSchedule,
      hasConflict,
    }),
    [entries, totalUnits, isSelected, selectedSectionId, selectSection, removeCourse, clearSchedule, hasConflict]
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within a ScheduleProvider");
  return ctx;
}