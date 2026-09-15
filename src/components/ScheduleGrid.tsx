"use client";

import { useMemo } from "react";
import { useSchedule } from "@/context/ScheduleContext";
import { useTheme } from "@/context/ThemeContext";
import { DAYS, GRID_START_MINUTES, GRID_END_MINUTES, toMinutes, formatDayShort, formatTime } from "@/lib/time";
import { EmptyState } from "./StatusStates";

const SLOT_MINUTES = 30;
const BASE_DAY_WIDTH = 140;

interface GridBlock {
  key: string;
  courseId: string;
  day: string;
  startMinutes: number;
  endMinutes: number;
  label: string;
  sub: string;
  instructor: string;
  color: string;
}

interface PositionedBlock extends GridBlock {
  lane: number;
  laneCount: number;
  hasClash: boolean;
}

export function ScheduleGrid() {
  const { entries, removeCourse } = useSchedule();
  const { effective } = useTheme();

  const blocks: GridBlock[] = useMemo(() => {
    const out: GridBlock[] = [];
    for (const entry of entries) {
      for (const meeting of entry.section.schedule) {
        const start = toMinutes(meeting.startTime);
        const end = toMinutes(meeting.endTime);
        out.push({
          key: `${entry.section.id}-${meeting.day}`,
          courseId: entry.courseId,
          day: meeting.day,
          startMinutes: start,
          endMinutes: end,
          label: `${entry.courseCode} ${entry.section.section}`,
          sub: `${formatTime(meeting.startTime)}–${formatTime(meeting.endTime)} · ${entry.section.room}`,
          instructor: entry.section.instructor,
          color: entry.color,
        });
      }
    }
    return out;
  }, [entries]);

  const gridEnd = Math.min(
    GRID_END_MINUTES,
    Math.max(
      GRID_START_MINUTES + SLOT_MINUTES,
      ...blocks.map((block) => block.endMinutes)
    )
  );
  const rowCount = Math.ceil((gridEnd - GRID_START_MINUTES) / SLOT_MINUTES);
  const hourLabels = Array.from(
    { length: Math.floor((gridEnd - GRID_START_MINUTES) / 60) + 1 },
    (_, i) => GRID_START_MINUTES + i * 60
  );

  const laidOutBlocks = useMemo(() => {
    return DAYS.flatMap((day) => {
      const dayBlocks = blocks
        .filter((block) => block.day === day)
        .sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);
      const groups: GridBlock[][] = [];
      for (const block of dayBlocks) {
        const group = groups[groups.length - 1];
        if (!group || block.startMinutes >= Math.max(...group.map((item) => item.endMinutes))) {
          groups.push([block]);
        } else {
          group.push(block);
        }
      }

      return groups.flatMap((group): PositionedBlock[] => {
        const lanes: number[] = [];
        const positioned = group.map((block) => {
          const lane = lanes.findIndex((end) => end <= block.startMinutes);
          if (lane === -1) {
            lanes.push(block.endMinutes);
            return { block, lane: lanes.length - 1 };
          }
          lanes[lane] = block.endMinutes;
          return { block, lane };
        });
        const laneCount = Math.max(lanes.length, 1);

        return positioned.map(({ block, lane }) => ({
          ...block,
          lane,
          laneCount,
          hasClash: group.length > 1,
        }));
      });
    });
  }, [blocks]);

  const dayLaneCounts = DAYS.map((day) =>
    Math.max(1, ...laidOutBlocks.filter((block) => block.day === day).map((block) => block.laneCount))
  );
  const gridTemplateColumns = `56px ${dayLaneCounts
    .map((laneCount) => `minmax(${laneCount * BASE_DAY_WIDTH}px, ${laneCount}fr)`)
    .join(" ")}`;
  const gridMinWidth = 56 + dayLaneCounts.reduce((total, laneCount) => total + laneCount * BASE_DAY_WIDTH, 0);

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Your schedule is empty"
        description="Select sections from the course list to see them here."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-card">
      <div style={{ minWidth: `${gridMinWidth}px` }}>
        {/* Day header row */}
        <div
          className="grid border-b border-line"
          style={{ gridTemplateColumns }}
        >
          <div />
          {DAYS.map((day) => (
            <div key={day} className="border-l border-line px-2 py-2 text-center text-xs font-medium text-ink">
              {formatDayShort(day)}
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div className="relative grid" style={{ gridTemplateColumns }}>
          {/* Time labels column */}
          <div
            className="grid"
            style={{ gridTemplateRows: `repeat(${rowCount}, 28px)` }}
          >
            {hourLabels.map((minutes, i) => (
              <div
                key={minutes}
                style={{ gridRow: `${i * 2 + 1} / span 1` }}
                className="relative"
              >
                <span className="absolute -top-2 right-2 text-[10px] text-muted">
                  {formatTime(`${String(Math.floor(minutes / 60)).padStart(2, "0")}:00`)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map((day) => (
            <div
              key={day}
              className="relative border-l border-line"
              style={{ display: "grid", gridTemplateRows: `repeat(${rowCount}, 28px)` }}
            >
              {Array.from({ length: rowCount }).map((_, i) => (
                <div key={i} className={`${i % 2 === 0 ? "border-t border-line/70" : ""}`} />
              ))}
              {laidOutBlocks
                .filter((b) => b.day === day)
                .map((b) => {
                  const range = gridEnd - GRID_START_MINUTES;
                  const top = ((b.startMinutes - GRID_START_MINUTES) / range) * 100;
                  const height = ((b.endMinutes - b.startMinutes) / range) * 100;

                  return (
                    <div
                      key={b.key}
                      title={`${b.label} — ${b.instructor}${b.hasClash ? " — schedule clash" : ""}`}
                      style={{
                        position: "absolute",
                        left: `calc(${(b.lane * 100) / b.laneCount}% + 4px)`,
                        width: `calc(${100 / b.laneCount}% - 8px)`,
                        top: `${top}%`,
                        height: `${Math.max(height, 5)}%`,
                        backgroundColor: effective === "dark" ? "#f7f8f5" : `${b.color}1A`,
                        borderColor: b.color,
                        color: b.color,
                      }}
                      className="group z-10 flex flex-col justify-center overflow-hidden rounded-md border-l-[3px] px-1.5 py-1 text-left shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => removeCourse(b.courseId)}
                        aria-label={`Remove ${b.label} from schedule`}
                        className="absolute right-1 top-1 rounded-full bg-white/80 p-0.5 opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <svg viewBox="0 0 20 20" fill="none" stroke={effective === "dark" ? "white" : "currentColor"} strokeWidth="2" className="h-2.5 w-2.5">
                          <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                        </svg>
                      </button>
                      {b.hasClash && (
                        <span className="mb-1 self-start rounded bg-red-600 px-1.5 py-0.5 text-[8px] font-bold uppercase leading-tight text-white">
                          Clash
                        </span>
                      )}
                      <span className="truncate pr-3 text-[11px] font-semibold">{b.label}</span>
                      <span className="truncate pr-3 text-[10px] opacity-80">{b.sub}</span>
                      <span className="truncate pr-3 text-[10px] opacity-70">{b.instructor}</span>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}