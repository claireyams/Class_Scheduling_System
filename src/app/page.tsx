"use client";

import { useCallback, useEffect, useState } from "react";
import type { Course } from "@/types/course";
import { fetchCourses } from "@/lib/api";
import { useCourseFilter } from "@/hooks/useCourseFilter";
import { ScheduleProvider } from "@/context/ScheduleContext";
import { ToastProvider } from "@/context/ToastContext";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { CourseList } from "@/components/CourseList";
import { CourseListSkeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/StatusStates";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { ScheduleSidebar } from "@/components/ScheduleSidebar";

type LoadState = "loading" | "error" | "ready";

export default function Page() {
  return (
    <ToastProvider>
      <ScheduleProvider>
        <AppShell />
      </ScheduleProvider>
    </ToastProvider>
  );
}

function AppShell() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [mobileTab, setMobileTab] = useState<"browse" | "schedule">("browse");
  const [scheduleView, setScheduleView] = useState<"grid" | "list">("grid");

  const load = useCallback((withError = false) => {
    setStatus("loading");
    fetchCourses({ simulateError: withError })
      .then((data) => {
        setCourses(data);
        setStatus("ready");
      })
      .catch((err: Error) => {
        setErrorMessage(err.message);
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { query, setQuery, category, setCategory, categories, filtered } = useCourseFilter(courses);

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      {/* Mobile tab switcher */}
      <div className="flex border-b border-line bg-white lg:hidden">
        {(["browse", "schedule"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              mobileTab === tab
                ? "border-forest-600 text-forest-700"
                : "border-transparent text-muted"
            }`}
          >
            {tab === "browse" ? "Courses" : "My Schedule"}
          </button>
        ))}
      </div>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 sm:px-8 lg:flex-row lg:items-start">
        {/* Course browsing column */}
        <section className={`min-w-0 flex-1 ${mobileTab === "schedule" ? "hidden lg:block" : ""}`}>
          <div className="mb-4">
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              category={category}
              onCategoryChange={setCategory}
              categories={categories}
              resultCount={filtered.length}
            />
          </div>

          {status === "loading" && <CourseListSkeleton />}
          {status === "error" && <ErrorState message={errorMessage} onRetry={() => load(false)} />}
          {status === "ready" && <CourseList courses={filtered} />}

          {process.env.NODE_ENV !== "production" && status === "ready" && (
            <button
              onClick={() => load(true)}
              className="mt-6 text-xs text-muted underline-offset-2 hover:underline"
            >
              Dev: simulate a fetch error
            </button>
          )}
        </section>

        {/* Schedule column */}
        <aside
          className={`w-full flex-shrink-0 lg:sticky lg:top-6 lg:w-[420px] ${
            mobileTab === "browse" ? "hidden lg:block" : ""
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-forest-900">My Schedule</h2>
            <div className="flex overflow-hidden rounded-md border border-line text-xs">
              <button
                onClick={() => setScheduleView("grid")}
                className={`px-2.5 py-1 ${scheduleView === "grid" ? "bg-forest-600 text-white" : "bg-white text-muted"}`}
              >
                Timetable
              </button>
              <button
                onClick={() => setScheduleView("list")}
                className={`px-2.5 py-1 ${scheduleView === "list" ? "bg-forest-600 text-white" : "bg-white text-muted"}`}
              >
                List
              </button>
            </div>
          </div>

          {scheduleView === "grid" ? <ScheduleGrid /> : <ScheduleSidebar />}
        </aside>
      </main>
    </div>
  );
}
