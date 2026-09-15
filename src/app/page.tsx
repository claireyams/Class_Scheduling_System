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
import { Modal } from "@/components/Modal";
import { useTheme } from "@/context/ThemeContext";

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
  const { effective: effectiveTheme } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleView, setScheduleView] = useState<"grid" | "list">("grid");
  const [showLanding, setShowLanding] = useState(true);
  const [splitRatio, setSplitRatio] = useState(52);

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

  const handleDrag = (clientX: number) => {
    const main = document.getElementById("finder-shell");
    if (!main) return;

    const rect = main.getBoundingClientRect();
    const nextRatio = ((clientX - rect.left) / rect.width) * 100;
    setSplitRatio(Math.min(72, Math.max(30, nextRatio)));
  };

  return (
    <div className="min-h-screen">
      <Header onOpenSchedule={() => setScheduleOpen(true)} />

      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        {showLanding && (
          <section className="relative mb-6 overflow-hidden rounded-[28px] border border-forest-100 bg-gradient-to-br from-forest-50 via-white to-gold-100 p-6 shadow-card sm:p-8">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-300/30 blur-3xl" />
            <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-forest-300/20 blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <span className="inline-flex items-center rounded-full border border-forest-200 bg-white/80 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-forest-700">
                  Build smarter terms
                </span>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-forest-900 sm:text-5xl">
                  Organize your semester with clarity.
                </h2>
                <p className="mt-3 max-w-lg text-sm text-muted sm:text-base">
                  Compare sections, check your weekly cadence, and lock in a realistic plan before registration opens.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowLanding(false)}
                  className="rounded-full bg-forest-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-forest-700"
                >
                  Start scheduling
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleOpen(true)}
                  className="rounded-full border border-line bg-white/80 px-5 py-2.5 text-sm font-medium text-ink transition hover:border-forest-300 hover:text-forest-700"
                >
                  View schedule
                </button>
              </div>
            </div>
          </section>
        )}

        <div
          id="finder-shell"
          className="grid gap-5 lg:min-h-[720px] lg:items-stretch"
          style={{ gridTemplateColumns: `minmax(0, calc(${splitRatio}% - 6px)) 12px minmax(0, calc(${100 - splitRatio}% - 6px))` }}
        >
          <section className="min-w-0 rounded-[24px] border border-line bg-white/80 p-3 shadow-card backdrop-blur-sm sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">Course finder</p>
                <h3 className="mt-1 font-display text-xl font-semibold text-forest-900">Browse catalog</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLanding(true)}
                className="rounded-full border border-line px-2.5 py-1.5 text-[11px] font-medium text-muted hover:border-forest-300 hover:text-forest-700"
              >
                Hero view
              </button>
            </div>

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

          <div className="hidden h-full lg:flex lg:w-4 lg:cursor-col-resize lg:items-stretch lg:justify-center">
            <div
              className="h-full w-1 rounded-full bg-line transition-colors hover:bg-forest-400"
              style={{ touchAction: "none", userSelect: "none" }}
              onPointerDown={(event) => {
                event.preventDefault();
                const move = (pointerEvent: PointerEvent) => handleDrag(pointerEvent.clientX);
                const stop = () => {
                  window.removeEventListener("pointermove", move);
                  window.removeEventListener("pointerup", stop);
                };
                window.addEventListener("pointermove", move);
                window.addEventListener("pointerup", stop);
              }}
            />
          </div>

          <aside className="min-w-0 rounded-[24px] border border-line bg-gradient-to-b from-white to-forest-50/40 p-3 shadow-card sm:p-4">
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">Live planner</p>
                <h3 className="mt-1 font-display text-xl font-semibold text-forest-900">Selected plan</h3>
              </div>
              <button
                type="button"
                onClick={() => setScheduleOpen(true)}
                className="rounded-full border border-forest-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-forest-700 transition hover:border-forest-300"
              >
                Expand
              </button>
            </div>

            <div className="mb-3 flex gap-2 rounded-2xl bg-white/80 p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setScheduleView("grid")}
                className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium ${scheduleView === "grid" ? "bg-forest-600 text-white" : "text-muted"}`}
              >
                Timetable
              </button>
              <button
                type="button"
                onClick={() => setScheduleView("list")}
                className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium ${scheduleView === "list" ? "bg-forest-600 text-white" : "text-muted"}`}
              >
                List
              </button>
            </div>

            {scheduleView === "grid" ? <ScheduleGrid /> : <ScheduleSidebar />}
          </aside>
        </div>
      </main>

      <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)} title="My Schedule">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-forest-500" />
            Weekly snapshot
          </div>
          <div className="flex overflow-hidden rounded-xl border border-line bg-white p-0.5 text-xs shadow-sm">
            <button
              onClick={() => setScheduleView("grid")}
              className={`rounded-lg px-3 py-1.5 ${scheduleView === "grid" ? "bg-forest-600 text-white" : "bg-white text-muted"}`}
            >
              Timetable
            </button>
            <button
              onClick={() => setScheduleView("list")}
              className={`rounded-lg px-3 py-1.5 ${scheduleView === "list" ? "bg-forest-600 text-white" : "bg-white text-muted"}`}
            >
              List
            </button>
          </div>
        </div>

        {scheduleView === "grid" ? <ScheduleGrid /> : <ScheduleSidebar />}
      </Modal>
    </div>
  );
}