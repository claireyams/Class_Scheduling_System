# Class Scheduler

A class scheduling web app built for the LSCS Frontend Engineering Take-Home Assessment
(41st LSCS, Term 1 — September 2026). Students can browse course sections, build a
personal schedule, and see it laid out as a weekly timetable.

## Getting started

Requires Node.js 18.17 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## What's included

- **Browse & search** — all courses load from a local mock dataset (`src/data/courses.json`)
  behind a simulated network call, with searching by course code / title / instructor and
  filtering by category.
- **Section selection** — expand a course to see its sections (instructor, room, meeting
  times, remaining slots), and select one section per course. Selecting a new section for a
  course you've already picked swaps it, so you're never double-booked in the same course.
- **My Schedule panel** — toggle between a **Timetable** view (a Mon–Sat weekly grid) and a
  **List** view (a compact summary with per-course remove buttons and a running unit total).
  Clicking a block on the timetable also removes it.
- **Loading / empty / error states** — the course list shows a skeleton while "loading,"
  a friendly empty state when a search has no matches, and an error state with a retry button
  if the fetch fails. A "Dev: simulate a fetch error" link (development mode only) lets you
  trigger the error state on demand.
- **Responsive layout** — a two-column layout on desktop (course list + sticky schedule
  panel); on narrow screens this collapses into a "Courses" / "My Schedule" tab switcher.

## Project structure

```
src/
  app/            # Next.js App Router entry (layout, page, global styles)
  components/     # Presentational + interactive UI components
  context/        # ScheduleContext (selected sections) and ToastContext (feedback)
  hooks/          # useCourseFilter (search/filter logic)
  lib/            # api.ts (mock data-fetching seam), time.ts (schedule math)
  types/          # Shared TypeScript types (Course, Section, Meeting, ...)
  data/           # Mock course/section dataset
```

See `TECHNICAL_RATIONALE.md` for the reasoning behind these decisions.

## Scope notes

Per the assessment brief, the provided mock data has no conflicting schedules, so
conflict detection is intentionally not implemented. Optional extensions (real API,
automated tests, local persistence, etc.) were left out to keep the submission focused
on the required functionality.
