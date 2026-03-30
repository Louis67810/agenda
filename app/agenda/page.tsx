"use client";

import { useState, useMemo } from "react";
import {
  tasks,
  blockedSlots,
  categoryColors,
  type Task,
  type BlockedSlot,
  type TaskCategory,
} from "@/lib/mock-data";

// ─── Helpers ────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function todayStr(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

/** Return the Monday-based week grid for a month (6 rows x 7 cols). */
function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  // Monday = 0
  const startDow = (first.getDay() + 6) % 7;
  const totalDays = last.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

function dateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getWeekDates(year: number, month: number, day: number): Date[] {
  const d = new Date(year, month, day);
  const dow = (d.getDay() + 6) % 7; // Monday=0
  const monday = new Date(d);
  monday.setDate(d.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// ─── Icons (inline SVGs) ───────────────────────────────────────────────────

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 15l-5-5 5-5" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 5l5 5-5 5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// ─── Task Pill (month view) ─────────────────────────────────────────────────

function TaskPill({ task }: { task: Task }) {
  const colors = categoryColors[task.category];
  return (
    <div
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] leading-tight font-medium truncate ${colors.bg} ${colors.text}`}
      title={`${task.title} (${task.startTime}–${task.endTime})`}
    >
      <span className="opacity-70 shrink-0">{task.startTime}</span>
      <span className="truncate">{task.title}</span>
    </div>
  );
}

// ─── Monthly View ───────────────────────────────────────────────────────────

function MonthlyView({ year, month }: { year: number; month: number }) {
  const today = todayStr();
  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of tasks) {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    }
    // Sort tasks within each day by start time
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, []);

  return (
    <div className="card p-0 overflow-hidden">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`text-center text-xs font-semibold py-3 ${
              i >= 5 ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Rows */}
      {grid.map((row, ri) => (
        <div key={ri} className="grid grid-cols-7 border-b last:border-b-0 border-gray-50">
          {row.map((cell, ci) => {
            if (!cell) {
              return <div key={ci} className="min-h-[110px] bg-gray-50/40" />;
            }
            const ds = dateStr(cell);
            const isToday = ds === today;
            const dayTasks = tasksByDate[ds] || [];
            const isWeekend = ci >= 5;
            const hasTasks = dayTasks.length > 0;
            const maxVisible = 3;
            const overflow = dayTasks.length - maxVisible;

            return (
              <div
                key={ci}
                className={`min-h-[110px] p-1.5 border-r last:border-r-0 border-gray-50 transition-colors ${
                  isWeekend ? "bg-stone-50/60" : ""
                } ${hasTasks && !isWeekend ? "bg-orange-50/20" : ""} hover:bg-orange-50/40`}
              >
                {/* Date number */}
                <div className="flex justify-end mb-1">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-semibold w-7 h-7 rounded-full ${
                      isToday
                        ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                        : isWeekend
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    {cell.getDate()}
                  </span>
                </div>

                {/* Tasks */}
                <div className="flex flex-col gap-0.5">
                  {dayTasks.slice(0, maxVisible).map((task) => (
                    <TaskPill key={task.id} task={task} />
                  ))}
                  {overflow > 0 && (
                    <span className="text-[10px] text-gray-400 font-medium pl-1">
                      +{overflow} autres
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Weekly View ────────────────────────────────────────────────────────────

const HOUR_START = 8;
const HOUR_END = 22;
const TOTAL_MINUTES = (HOUR_END - HOUR_START) * 60;
const SLOT_HEIGHT = 60; // px per hour
const TOTAL_HEIGHT = (HOUR_END - HOUR_START) * SLOT_HEIGHT;

function WeeklyView({ year, month, day }: { year: number; month: number; day: number }) {
  const today = todayStr();
  const weekDates = useMemo(() => getWeekDates(year, month, day), [year, month, day]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of tasks) {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    }
    return map;
  }, []);

  const blockedByDow = useMemo(() => {
    const map: Record<number, BlockedSlot[]> = {};
    for (const b of blockedSlots) {
      if (!map[b.dayOfWeek]) map[b.dayOfWeek] = [];
      map[b.dayOfWeek].push(b);
    }
    return map;
  }, []);

  function positionStyle(startTime: string, endTime: string) {
    const startMin = timeToMinutes(startTime) - HOUR_START * 60;
    const endMin = timeToMinutes(endTime) - HOUR_START * 60;
    const top = Math.max(0, (startMin / TOTAL_MINUTES) * TOTAL_HEIGHT);
    const height = Math.max(20, ((endMin - startMin) / TOTAL_MINUTES) * TOTAL_HEIGHT);
    return { top: `${top}px`, height: `${height}px` };
  }

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100">
        <div className="p-2" />
        {weekDates.map((date, i) => {
          const ds = dateStr(date);
          const isToday = ds === today;
          return (
            <div key={i} className="text-center py-3 border-l border-gray-50">
              <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                {DAY_LABELS[i]}
              </div>
              <div
                className={`inline-flex items-center justify-center mt-0.5 text-sm font-bold w-8 h-8 rounded-full ${
                  isToday
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                    : "text-gray-700"
                }`}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] overflow-y-auto max-h-[calc(100vh-280px)]">
        {/* Hour labels */}
        <div className="relative" style={{ height: `${TOTAL_HEIGHT}px` }}>
          {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
            <div
              key={i}
              className="absolute right-2 text-[10px] text-gray-400 font-medium -translate-y-1/2"
              style={{ top: `${i * SLOT_HEIGHT}px` }}
            >
              {String(HOUR_START + i).padStart(2, "0")}h
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDates.map((date, ci) => {
          const ds = dateStr(date);
          const isToday = ds === today;
          const dayTasks = tasksByDate[ds] || [];
          const jsDow = date.getDay(); // 0=Sun
          const blocked = blockedByDow[jsDow] || [];

          return (
            <div
              key={ci}
              className={`relative border-l border-gray-50 ${isToday ? "bg-orange-50/30" : ""}`}
              style={{ height: `${TOTAL_HEIGHT}px` }}
            >
              {/* Hour lines */}
              {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ top: `${i * SLOT_HEIGHT}px` }}
                />
              ))}

              {/* Blocked slots */}
              {blocked.map((slot) => {
                const style = positionStyle(slot.startTime, slot.endTime);
                return (
                  <div
                    key={slot.id}
                    className="absolute left-0.5 right-0.5 rounded-lg bg-gray-100 border border-gray-200/60 flex flex-col justify-center px-2 z-10"
                    style={style}
                  >
                    <span className="text-[10px] font-semibold text-gray-500 truncate">
                      {slot.title}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {slot.startTime}–{slot.endTime}
                    </span>
                  </div>
                );
              })}

              {/* Tasks */}
              {dayTasks.map((task) => {
                const style = positionStyle(task.startTime, task.endTime);
                const colors = categoryColors[task.category];
                return (
                  <div
                    key={task.id}
                    className={`absolute left-1 right-1 rounded-lg border px-2 py-1 flex flex-col justify-center z-20 shadow-sm ${colors.bg} ${colors.border}`}
                    style={style}
                    title={`${task.title} (${task.startTime}–${task.endTime})`}
                  >
                    <span className={`text-[11px] font-semibold truncate ${colors.text}`}>
                      {task.title}
                    </span>
                    <span className={`text-[9px] opacity-70 ${colors.text}`}>
                      {task.startTime}–{task.endTime}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

type ViewMode = "month" | "week";

export default function AgendaPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [view, setView] = useState<ViewMode>("month");

  function goToday() {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
  }

  function goPrev() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function goNext() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <CalendarIcon />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Agenda</h1>
            <p className="text-sm text-gray-400">Planification et suivi de vos activités</p>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setView("month")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              view === "month"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mois
          </button>
          <button
            onClick={() => setView("week")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              view === "week"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Semaine
          </button>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goPrev}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={goNext}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
          >
            <ChevronRight />
          </button>
          <h2 className="text-lg font-bold text-gray-800 ml-1">
            {MONTH_NAMES[month]} {year}
          </h2>
        </div>

        <button
          onClick={goToday}
          className="btn-secondary text-sm"
        >
          Aujourd&apos;hui
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3">
        {(Object.entries(categoryColors) as [TaskCategory, typeof categoryColors[TaskCategory]][]).map(
          ([cat, colors]) => (
            <span
              key={cat}
              className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${colors.text.replace("text-", "bg-")}`} />
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </span>
          )
        )}
      </div>

      {/* Calendar view */}
      {view === "month" ? (
        <MonthlyView year={year} month={month} />
      ) : (
        <WeeklyView year={year} month={month} day={now.getDate()} />
      )}
    </div>
  );
}
