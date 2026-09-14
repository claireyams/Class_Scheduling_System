import { useMemo, useState } from "react";
import type { Course } from "@/types/course";

export type CategoryFilter = "All" | string;

export function useCourseFilter(courses: Course[]) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");

  const categories = useMemo(() => {
    const set = new Set(courses.map((c) => c.category));
    return ["All", ...Array.from(set).sort()];
  }, [courses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesCategory = category === "All" || course.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = [
        course.code,
        course.title,
        ...course.sections.map((s) => s.instructor),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [courses, query, category]);

  return { query, setQuery, category, setCategory, categories, filtered };
}
