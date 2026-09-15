# Technical Rationale

## Framework & tooling

**Next.js (App Router) + TypeScript + Tailwind CSS**, no additional UI/data libraries.

- Next.js was named directly in the brief, and its App Router keeps the project close to a
  default create-next-app layout, which matters for maintainability more than for any
  feature I actually needed (no routing, no SSR data fetching).
- TypeScript gives the `Course → Section → Meeting` shape real type-checking across
  components, which is worth the setup cost the moment a course card, a filter hook, and a
  schedule grid all need to agree on that shape.
- Tailwind was chosen over a component library (shadcn/ui, Material UI) because the UI
  surface here is small and mostly bespoke (a timetable grid isn't something a component
  library ships out of the box), so a library would have added weight without saving much
  work. Design tokens (`tailwind.config.ts`) centralize the palette and font choices instead
  of scattering hex values through components.
- No data-fetching library (TanStack Query, SWR): there's exactly one query with no
  caching, pagination, or invalidation needs, so `useState` + a `useEffect` covers it without
  pulling in a dependency whose main value (cache management) isn't exercised here.

## Data layer

All data access goes through `src/lib/api.ts`, a single `fetchCourses()` function that
returns a `Promise<Course[]>` after an artificial delay. Nothing else in the app knows or
cares that the data currently comes from a local JSON file — components only see a
Promise-based contract. That's the seam the brief asks for ("designed with the assumption
that the application could eventually consume a real backend API"): pointing `fetchCourses`
at a real endpoint later is a one-file change.

The mock dataset (`src/data/courses.json`) follows `Course → Sections → Schedule /
Instructor / Room` as suggested, with a few additions (`category` for filtering, `slotsTotal`
/ `slotsTaken` for a "seats left" affordance) that a real registration system would plausibly
expose too.

## State management

- **`ScheduleContext`** (`useReducer`) owns the set of selected sections, keyed by course ID
  so a student can hold at most one section per course. Selecting a new section for a course
  already in the schedule swaps it rather than adding a second entry. A reducer was chosen
  over scattered `useState` because "select," "remove," and "clear" are the actual state
  transitions the app has, and a reducer names them explicitly instead of leaving that logic
  implicit in event handlers.
- **`ToastContext`** is separate from schedule state on purpose. Toasts are transient UI
  feedback, not application data, and coupling them to the reducer would have forced every
  schedule mutation to also carry a message string.
- Local component state (`useState`) handles everything else: search text, category filter,
  which course cards are expanded, which mobile tab is active. None of that needs to be
  shared beyond the component that owns it.

## Component architecture & reusability

- **Separation of concerns**: UI components (`CourseCard`, `SectionRow`, `SearchBar`, `ScheduleGrid`,
  `StatusStates`, `Modal`) are purely presentational and accept data + callbacks as props; they have
  no direct dependency on context (except where they must read schedule state), making them testable
  and reusable. Event handlers and state transitions live in parent components or contexts, not in
  presentation logic.
- **Shared state layer**: Only `ScheduleContext` and `ToastContext` own application state;
  everything else is local component state or derived. This keeps data flow predictable and reduces
  coupling.
- **Leaf components**: `StatusStates` (empty/error UI), `Skeleton` (loading placeholder), and `Modal`
  (dialog wrapper) are single-purpose components used in multiple places (`CourseList`, `ScheduleGrid`,
  error boundary), reducing duplication and keeping layouts consistent.
- **Custom hooks**: `useCourseFilter` encapsulates search/filter logic and can be tested or reused
  independently of any component.

## Performance considerations

- **Filtering is memoized** (`useCourseFilter`): the filtered list and the derived category
  list only recompute when the courses, query, or category actually change, not on every
  render (e.g. when a toast fires).
- **`CourseCard` and `SectionRow` are wrapped in `React.memo`**, so selecting a section in one
  card doesn't re-render every other card in the list — only the schedule-derived UI
  (header count, schedule panel) re-renders, since that's genuinely new state.
- **Course cards are collapsed by default** and only render their section rows once
  expanded, which keeps the initial DOM small regardless of how many sections a course has.
- **Efficient filtering**: search operates on course code, title, and instructor names in a single
  pass with `.filter()` and `.includes()`, avoiding redundant iterations.
- At the current scale (a dozen courses) none of this is a real performance concern.
  If the catalog grew to the point of visible jank, the next step for the course list would be
  windowing (e.g. `react-window`) so only visible cards render — deliberately not added here,
  since it would be complexity without a corresponding problem to solve at this dataset size.

## Accessibility & responsive design

- **Semantic HTML** throughout: form inputs have associated labels, buttons are real `<button>`
  elements with `type="button"` and `aria-label` where needed, dialogs use `role="dialog"` and
  `aria-modal="true"`, interactive regions use `aria-expanded` and `aria-pressed` to signal state.
- **Keyboard navigation**: all interactive elements are reachable via Tab; modals trap focus and
  close on Escape; the schedule grid blocks can be removed via keyboard.
- **Focus management**: visible focus outlines (outline-offset, border colors) help keyboard users
  track where they are; modals explicitly focus on open.
- **Responsive layout**: Tailwind breakpoints (`sm:`, `lg:`) collapse the two-column desktop layout
  into single-column stacked tabs on mobile; the timetable grid reflows for narrower viewports;
  touch targets remain >44px.
- **Color contrast**: theme colors were chosen to meet WCAG AA contrast ratios in both light and
  dark modes; disabled sections use muted text without relying solely on color to convey state.

## Theme system

- **Light/dark/system preference**: `ThemeContext` manages theme mode (`light`, `dark`, or
  `system`) with automatic detection of OS preference via `prefers-color-scheme` media query.
- **Persistent preference**: theme choice is stored in localStorage and restored on page load,
  avoiding the "flash of wrong theme" problem common in dark mode implementations.
- **Pre-hydration script**: a small inline script runs before React hydrates, reading localStorage
  and applying the correct `theme-light` or `theme-dark` class to `<html>` before the first paint to ensure no visual flicker.
- **CSS variables**: theme colors (--bg, --text, --line, --forest, etc.) are defined per theme class
  in `globals.css` to  it trivial to add new themes or adjust the palette later.

## UI/UX decisions

- A weekly timetable is the primary schedule view (what the brief asks for), with a **List**
  view as an alternate for a fast glance and one-click removal — both read from the same
  `ScheduleContext`, so they can never disagree.
- Empty and error states are explicit components (`StatusStates.tsx`) rather than inline
  conditionals, so their copy and layout stay consistent between the two places they're used
  today (course list, schedule grid) and anywhere else they might be needed later.
- Every state-changing action (select, swap, remove, clear) triggers a toast, since a silent
  UI change is easy to miss, especially on a grid where the click target is small.
- Full sections are shown but disabled (not hidden), so a student can still see what's
  offered even if they can't select it.
- Draggable split-pane divider (desktop only) lets users adjust the course list / schedule ratio.

## What was deliberately left out

- **Conflict detection** - while the brief states the mock data contains no conflicts and 
  detection is not required, I implemented it as a bonus feature. The app pairwise-compares 
  selected courses' meeting times and flags overlaps with red "Clash" badges in the timetable 
  and red borders in the list view. This adds safety without overhead and demonstrates 
  thoughtful engineering beyond the minimum.
- **Real API / backend, automated tests, local persistence** - listed as optional
  extensions in the brief; leaving them out kept the submission focused on the required
  functionality rather than spreading effort across features that weren't asked for.