"use client";

import { useState, useMemo } from "react";
import { tasks as INITIAL_TASKS, blockedSlots, categoryColors, type Task, type BlockedSlot, type TaskCategory } from "@/lib/mock-data";

// ─── Helpers ────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTH_NAMES = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function todayStr(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}
function dateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDow = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}
function getWeekDates(year: number, month: number, day: number): Date[] {
  const d = new Date(year, month, day);
  const dow = (d.getDay() + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => { const dt = new Date(monday); dt.setDate(monday.getDate() + i); return dt; });
}
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
function formatDate(ds: string): string {
  const [y, m, d] = ds.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

// ─── Icons ─────────────────────────────────────────────────────────────────

function ChevronLeft({ className }: { className?: string }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 15l-5-5 5-5" /></svg>;
}
function ChevronRight({ className }: { className?: string }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 5l5 5-5 5" /></svg>;
}

// ─── Status config ──────────────────────────────────────────────────────────

const statusLabels: Record<string, { label: string; bg: string; text: string }> = {
  todo:      { label: "À faire",  bg: "bg-gray-100",    text: "text-gray-600" },
  in_progress:{ label: "En cours", bg: "bg-orange-100",  text: "text-orange-700" },
  done:      { label: "Terminé",  bg: "bg-emerald-100", text: "text-emerald-700" },
  cancelled: { label: "Annulé",   bg: "bg-red-100",     text: "text-red-600" },
};

const importanceLabels: Record<string, string> = { low: "Faible", medium: "Moyenne", high: "Haute", critical: "Critique" };

// ─── Task Detail Panel ──────────────────────────────────────────────────────

function TaskDetailPanel({ task, onClose, onStatusChange }: { task: Task; onClose: () => void; onStatusChange: (id: string, status: Task["status"]) => void }) {
  const colors = categoryColors[task.category];
  const statusCfg = statusLabels[task.status] || statusLabels.todo;
  const statuses: Task["status"][] = ["todo", "in_progress", "done", "cancelled"];

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end" style={{ backdropFilter: "blur(2px)", backgroundColor: "rgba(0,0,0,0.15)" }} onClick={onClose}>
      <div
        className="bg-white h-full w-full max-w-sm shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`h-1.5 ${colors.bg.replace("bg-", "bg-")}`} style={{ background: "rgb(var(--accent))" }} />
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${colors.bg} ${colors.text}`}>
            {task.category}
          </span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{task.title}</h2>
            {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Date</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5 capitalize">{formatDate(task.date)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Horaire</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{task.startTime} – {task.endTime}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Importance</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{importanceLabels[task.importance] || task.importance}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Durée</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">
                {timeToMinutes(task.endTime) - timeToMinutes(task.startTime)} min
              </p>
            </div>
          </div>

          {/* Status change */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Changer le statut</p>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((s) => {
                const cfg = statusLabels[s];
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange(task.id, s)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border-2 ${task.status === s ? `${cfg.bg} ${cfg.text} border-current` : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"}`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Add Modal ────────────────────────────────────────────────────────

const CATS: { key: TaskCategory; label: string }[] = [
  { key: "travail", label: "Travail" }, { key: "sport", label: "Sport" }, { key: "etudes", label: "Études" },
  { key: "personnel", label: "Personnel" }, { key: "creativite", label: "Créativité" }, { key: "finance", label: "Finance" },
];

function QuickAddModal({ date, onClose, onAdd }: { date: string; onClose: () => void; onAdd: (task: Task) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("travail");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(60);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const [h, m] = startTime.split(":").map(Number);
    const endMin = h * 60 + m + duration;
    const endH = Math.floor(endMin / 60);
    const endM = endMin % 60;
    const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
    onAdd({
      id: `quick-${Date.now()}`,
      title,
      date,
      startTime,
      endTime,
      category,
      importance: "medium",
      status: "todo",
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.25)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-800">Nouvelle tâche</h3>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{formatDate(date)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Titre *</label>
            <input autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Réunion d'équipe..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Heure de début</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Durée</label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                {[15, 30, 45, 60, 90, 120, 180, 240].map((d) => <option key={d} value={d}>{d >= 60 ? `${d / 60}h${d % 60 ? d % 60 : ""}` : `${d} min`}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Catégorie</label>
            <div className="flex gap-1.5 flex-wrap">
              {CATS.map((c) => (
                <button key={c.key} type="button" onClick={() => setCategory(c.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${category === c.key ? `${categoryColors[c.key].bg} ${categoryColors[c.key].text} border-transparent` : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Annuler</button>
            <button type="submit" className="btn-primary flex-1">Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Task Pill ──────────────────────────────────────────────────────────────

function TaskPill({ task, onClick }: { task: Task; onClick: () => void }) {
  const colors = categoryColors[task.category];
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-full flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] leading-tight font-medium truncate transition-opacity hover:opacity-80 ${colors.bg} ${colors.text} ${task.status === "done" ? "opacity-50" : ""}`}
      title={`${task.title} (${task.startTime}–${task.endTime})`}
    >
      <span className="opacity-70 shrink-0">{task.startTime}</span>
      <span className="truncate">{task.title}</span>
      {task.status === "done" && <span className="ml-auto shrink-0 opacity-60">✓</span>}
    </button>
  );
}

// ─── Monthly View ───────────────────────────────────────────────────────────

function MonthlyView({ year, month, taskMap, onTaskClick, onDayClick }: {
  year: number; month: number;
  taskMap: Record<string, Task[]>;
  onTaskClick: (task: Task) => void;
  onDayClick: (ds: string) => void;
}) {
  const today = todayStr();
  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);

  return (
    <div className="card p-0 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_LABELS.map((label, i) => (
          <div key={label} className={`text-center text-xs font-semibold py-3 ${i >= 5 ? "text-gray-400" : "text-gray-500"}`}>{label}</div>
        ))}
      </div>
      {grid.map((row, ri) => (
        <div key={ri} className="grid grid-cols-7 border-b last:border-b-0 border-gray-50">
          {row.map((cell, ci) => {
            if (!cell) return <div key={ci} className="min-h-[110px] bg-gray-50/40" />;
            const ds = dateStr(cell);
            const isToday = ds === today;
            const dayTasks = taskMap[ds] || [];
            const isWeekend = ci >= 5;
            const maxVisible = 3;
            const overflow = dayTasks.length - maxVisible;

            return (
              <div
                key={ci}
                onClick={() => onDayClick(ds)}
                className={`min-h-[110px] p-1.5 border-r last:border-r-0 border-gray-50 transition-colors cursor-pointer group ${isWeekend ? "bg-stone-50/60" : ""} ${dayTasks.length > 0 && !isWeekend ? "bg-orange-50/20" : ""} hover:bg-orange-50/40`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-semibold w-7 h-7 rounded-full ${isToday ? "bg-orange-500 text-white shadow-sm shadow-orange-200" : isWeekend ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {cell.getDate()}
                  </span>
                  <span className="text-[9px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pr-0.5 pt-1">+ Ajouter</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {dayTasks.slice(0, maxVisible).map((task) => (
                    <TaskPill key={task.id} task={task} onClick={() => onTaskClick(task)} />
                  ))}
                  {overflow > 0 && (
                    <span className="text-[10px] text-gray-400 font-medium pl-1">+{overflow} autres</span>
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
const SLOT_HEIGHT = 60;
const TOTAL_HEIGHT = (HOUR_END - HOUR_START) * SLOT_HEIGHT;

function WeeklyView({ year, month, day, taskMap, onTaskClick }: {
  year: number; month: number; day: number;
  taskMap: Record<string, Task[]>;
  onTaskClick: (task: Task) => void;
}) {
  const today = todayStr();
  const weekDates = useMemo(() => getWeekDates(year, month, day), [year, month, day]);

  const blockedByDow = useMemo(() => {
    const map: Record<number, BlockedSlot[]> = {};
    for (const b of blockedSlots) { if (!map[b.dayOfWeek]) map[b.dayOfWeek] = []; map[b.dayOfWeek].push(b); }
    return map;
  }, []);

  function positionStyle(startTime: string, endTime: string) {
    const startMin = timeToMinutes(startTime) - HOUR_START * 60;
    const endMin = timeToMinutes(endTime) - HOUR_START * 60;
    return { top: `${Math.max(0, (startMin / TOTAL_MINUTES) * TOTAL_HEIGHT)}px`, height: `${Math.max(20, ((endMin - startMin) / TOTAL_MINUTES) * TOTAL_HEIGHT)}px` };
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100">
        <div className="p-2" />
        {weekDates.map((date, i) => {
          const ds = dateStr(date);
          const isToday = ds === today;
          return (
            <div key={i} className="text-center py-3 border-l border-gray-50">
              <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{DAY_LABELS[i]}</div>
              <div className={`inline-flex items-center justify-center mt-0.5 text-sm font-bold w-8 h-8 rounded-full ${isToday ? "bg-orange-500 text-white shadow-sm shadow-orange-200" : "text-gray-700"}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-[60px_repeat(7,1fr)] overflow-y-auto max-h-[calc(100vh-280px)]">
        <div className="relative" style={{ height: `${TOTAL_HEIGHT}px` }}>
          {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
            <div key={i} className="absolute right-2 text-[10px] text-gray-400 font-medium -translate-y-1/2" style={{ top: `${i * SLOT_HEIGHT}px` }}>
              {String(HOUR_START + i).padStart(2, "0")}h
            </div>
          ))}
        </div>
        {weekDates.map((date, ci) => {
          const ds = dateStr(date);
          const isToday = ds === today;
          const dayTasks = taskMap[ds] || [];
          const jsDow = date.getDay();
          const blocked = blockedByDow[jsDow] || [];
          return (
            <div key={ci} className={`relative border-l border-gray-50 ${isToday ? "bg-orange-50/30" : ""}`} style={{ height: `${TOTAL_HEIGHT}px` }}>
              {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
                <div key={i} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: `${i * SLOT_HEIGHT}px` }} />
              ))}
              {blocked.map((slot) => (
                <div key={slot.id} className="absolute left-0.5 right-0.5 rounded-lg bg-gray-100 border border-gray-200/60 flex flex-col justify-center px-2 z-10" style={positionStyle(slot.startTime, slot.endTime)}>
                  <span className="text-[10px] font-semibold text-gray-500 truncate">{slot.title}</span>
                  <span className="text-[9px] text-gray-400">{slot.startTime}–{slot.endTime}</span>
                </div>
              ))}
              {dayTasks.map((task) => {
                const style = positionStyle(task.startTime, task.endTime);
                const colors = categoryColors[task.category];
                return (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`absolute left-1 right-1 rounded-lg border px-2 py-1 flex flex-col justify-center z-20 shadow-sm hover:shadow-md hover:z-30 transition-shadow text-left ${colors.bg} ${colors.border} ${task.status === "done" ? "opacity-50" : ""}`}
                    style={style}
                  >
                    <span className={`text-[11px] font-semibold truncate ${colors.text}`}>{task.title}</span>
                    <span className={`text-[9px] opacity-70 ${colors.text}`}>{task.startTime}–{task.endTime}</span>
                  </button>
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
  const [month, setMonth] = useState(now.getMonth());
  const [view, setView] = useState<ViewMode>("month");
  const [allTasks, setAllTasks] = useState<Task[]>(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [quickAddDate, setQuickAddDate] = useState<string | null>(null);

  const taskMap = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of allTasks) {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    }
    for (const key of Object.keys(map)) map[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
    return map;
  }, [allTasks]);

  function goPrev() { month === 0 ? (setMonth(11), setYear(year - 1)) : setMonth(month - 1); }
  function goNext() { month === 11 ? (setMonth(0), setYear(year + 1)) : setMonth(month + 1); }
  function goToday() { setYear(now.getFullYear()); setMonth(now.getMonth()); }

  function handleStatusChange(id: string, status: Task["status"]) {
    setAllTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    setSelectedTask((prev) => prev?.id === id ? { ...prev, status } : prev);
  }

  function handleAddTask(task: Task) {
    setAllTasks((prev) => [...prev, task]);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Agenda</h1>
            <p className="text-sm text-gray-400">Cliquez sur une tâche pour les détails · sur un jour pour ajouter</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["month", "week"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === v ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {v === "month" ? "Mois" : "Semaine"}
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goPrev} className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm transition-colors"><ChevronLeft /></button>
          <button onClick={goNext} className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm transition-colors"><ChevronRight /></button>
          <h2 className="text-lg font-bold text-gray-800 ml-1">{MONTH_NAMES[month]} {year}</h2>
        </div>
        <button onClick={goToday} className="btn-secondary text-sm">Aujourd&apos;hui</button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3">
        {(Object.entries(categoryColors) as [TaskCategory, typeof categoryColors[TaskCategory]][]).map(([cat, colors]) => (
          <span key={cat} className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </span>
        ))}
      </div>

      {/* Calendar */}
      {view === "month" ? (
        <MonthlyView year={year} month={month} taskMap={taskMap} onTaskClick={setSelectedTask} onDayClick={setQuickAddDate} />
      ) : (
        <WeeklyView year={year} month={month} day={now.getDate()} taskMap={taskMap} onTaskClick={setSelectedTask} />
      )}

      {/* Task detail panel */}
      {selectedTask && (
        <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} onStatusChange={handleStatusChange} />
      )}

      {/* Quick add modal */}
      {quickAddDate && (
        <QuickAddModal date={quickAddDate} onClose={() => setQuickAddDate(null)} onAdd={handleAddTask} />
      )}
    </div>
  );
}
