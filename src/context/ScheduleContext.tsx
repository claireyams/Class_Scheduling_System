"use client";

import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import type { Course, ScheduledEntry, Section } from "@/types/course";
import { colorForCourse } from "@/lib/time";

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

  const value = useMemo(
    () => ({ entries, totalUnits, isSelected, selectedSectionId, selectSection, removeCourse, clearSchedule }),
    [entries, totalUnits, isSelected, selectedSectionId, selectSection, removeCourse, clearSchedule]
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within a ScheduleProvider");
  return ctx;
}
