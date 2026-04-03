"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import { useAppState } from "@/components/providers/AppStateProvider";
import { addDays, dateFromDateTime, formatDuration, isoToday } from "@/lib/app-state";
import type { AppTask } from "@/lib/app-state";
import type { TaskCategory } from "@/lib/mock-data";

const DAY_LABELS_FULL = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MONTH_NAMES = ["Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Decembre"];
const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  travail: { bg: "#FEE6D0", text: "#B45309" },
  personnel: { bg: "#D5EEFF", text: "#1E40AF" },
  sport: { bg: "#D1FAE5", text: "#065F46" },
  etudes: { bg: "#D1FAE5", text: "#065F46" },
  social: { bg: "#E1D1FA", text: "#5B21B6" },
  finance: { bg: "#FEF3C7", text: "#92400E" },
  sante: { bg: "#FCE7F3", text: "#9D174D" },
  creativite: { bg: "#E1D1FA", text: "#5B21B6" },
};
const BLOCKED_COLOR = { bg: "#F1F1F1", text: "#6B7280" };
const DIAGONAL_BG = "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(0,0,0,0.025) 8px, rgba(0,0,0,0.026) 9px)";
const H_START = 7;
const H_END = 22;
const TOTAL_H = (H_END - H_START) * 60;

function toMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function formatTime(minutes: number) { return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`; }
function addMinutes(time: string, mins: number) { return formatTime(toMin(time) + mins); }
function isoToDate(iso: string) { return new Date(`${iso}T12:00:00`); }
function startIso(date: string, time: string) { return `${date}T${time}:00`; }

function positionFor(start: string, end: string) {
  const top = Math.max(0, toMin(start) - H_START * 60);
  const height = Math.max(36, toMin(end) - toMin(start));
  return { top, height };
}

function findSafeStart(date: string, wantedTime: string, durationMinutes: number, tasks: AppTask[], blockedSlots: { dayOfWeek: number; startTime: string; endTime: string }[]) {
  const targetDayTasks = tasks.filter((task) => dateFromDateTime(task.scheduledStart) === date && task.status !== "done");
  const busyRanges = [
    ...targetDayTasks.map((task) => ({ start: toMin(task.scheduledStart?.slice(11, 16) ?? "08:00"), end: toMin(task.scheduledEnd?.slice(11, 16) ?? addMinutes(task.scheduledStart?.slice(11, 16) ?? "08:00", task.durationMinutes)) })),
    ...blockedSlots.map((slot) => ({ start: toMin(slot.startTime), end: toMin(slot.endTime) })),
  ].sort((a, b) => a.start - b.start);

  let cursor = Math.max(toMin(wantedTime), H_START * 60);
  while (cursor + durationMinutes <= H_END * 60) {
    const overlap = busyRanges.find((range) => cursor < range.end && cursor + durationMinutes > range.start);
    if (!overlap) return formatTime(cursor);
    cursor = overlap.end;
  }
  return formatTime(Math.max(H_START * 60, H_END * 60 - durationMinutes));
}

export default function AgendaPage() {
  const { ready, tasks, blockedSlots, today, createTask, updateTask, scheduleTaskAt, postponeTask } = useAppState();
  const [currentDate, setCurrentDate] = useState(isoToday());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createDate, setCreateDate] = useState<string | null>(null);
  const [createTime, setCreateTime] = useState("09:00");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [delayMinutes, setDelayMinutes] = useState(30);
  const [form, setForm] = useState({ title: "", durationMinutes: 60, categoryKey: "travail" as TaskCategory, importance: 3, isSplittable: false });

  useEffect(() => {
    const taskId = new URLSearchParams(window.location.search).get("task");
    if (taskId) setSelectedTaskId(taskId);
  }, []);

  const current = isoToDate(currentDate);
  const monday = new Date(current);
  monday.setDate(current.getDate() - ((current.getDay() + 6) % 7));
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });

  const taskMap = Object.fromEntries(weekDates.map((date) => {
    const ds = date.toISOString().slice(0, 10);
    return [ds, tasks.filter((task) => dateFromDateTime(task.scheduledStart) === ds).sort((a, b) => (a.scheduledStart ?? "").localeCompare(b.scheduledStart ?? ""))];
  }));

  const availableTasks = tasks.filter((task) => task.status !== "done");
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  if (!ready) return <div className="text-sm text-gray-400">Chargement de l'agenda...</div>;

  function openCreate(date: string, defaultTime: string) {
    setCreateDate(date);
    setCreateTime(defaultTime);
  }

  function handleCreate() {
    if (!createDate || !form.title.trim()) return;
    createTask({
      title: form.title.trim(),
      categoryKey: form.categoryKey,
      importance: form.importance,
      durationMinutes: form.durationMinutes,
      deadline: createDate,
      status: "todo",
      isSimpleTodo: true,
      isSplittable: form.isSplittable,
      scheduledStart: startIso(createDate, createTime),
      manualScheduled: true,
    });
    setCreateDate(null);
    setForm({ title: "", durationMinutes: 60, categoryKey: "travail", importance: 3, isSplittable: false });
  }

  function assignExisting(task: AppTask) {
    if (!createDate) return;
    scheduleTaskAt(task.id, startIso(createDate, createTime));
    setCreateDate(null);
  }

  function handleDrop(task: AppTask, date: string, time: string) {
    const dayBlocked = blockedSlots.filter((slot) => slot.dayOfWeek === new Date(`${date}T12:00:00`).getDay());
    const safeStart = findSafeStart(date, time, task.durationMinutes, tasks.filter((entry) => entry.id !== task.id), dayBlocked);
    scheduleTaskAt(task.id, startIso(date, safeStart));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm transition-colors">‹</button>
          <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm transition-colors">›</button>
          <h2 className="text-base font-bold text-gray-800">{MONTH_NAMES[current.getMonth()]} {current.getFullYear()}</h2>
        </div>
        <button onClick={() => setCurrentDate(today)} className="btn-secondary text-sm px-4 py-2">Aujourd'hui</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(CAT_COLORS).map(([cat, color]) => <span key={cat} className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: color.bg, color: color.text }}>{cat}</span>)}
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: BLOCKED_COLOR.bg, color: BLOCKED_COLOR.text }}>Predefini</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
          <div className="border-r border-gray-100" />
          {weekDates.map((date, index) => {
            const ds = date.toISOString().slice(0, 10);
            const isToday = ds === today;
            return <div key={ds} className="text-center py-3 px-1 border-r border-gray-100 last:border-r-0"><div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{DAY_LABELS_FULL[index]} {date.getDate()} {MONTH_NAMES[date.getMonth()]}</div>{isToday ? <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mx-auto mt-1" /> : null}</div>;
          })}
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "64px repeat(7, 1fr)", height: `${TOTAL_H}px` }}>
            <div className="relative border-r border-gray-100" style={{ height: `${TOTAL_H}px` }}>
              {Array.from({ length: H_END - H_START }, (_, i) => <div key={i} className="absolute right-3 text-[11px] text-gray-400 font-medium -translate-y-1/2" style={{ top: `${i * 60}px` }}>{String(H_START + i).padStart(2, "0")}:00</div>)}
            </div>
            {weekDates.map((date) => {
              const ds = date.toISOString().slice(0, 10);
              const isToday = ds === today;
              const dayBlocked = blockedSlots.filter((slot) => slot.dayOfWeek === date.getDay());
              return (
                <div
                  key={ds}
                  className="relative border-r border-gray-100 last:border-r-0"
                  style={{ height: `${TOTAL_H}px`, backgroundColor: isToday ? "rgba(59,130,246,0.03)" : "white", backgroundImage: DIAGONAL_BG }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const taskId = e.dataTransfer.getData("text/task-id");
                    const task = tasks.find((entry) => entry.id === taskId);
                    if (!task) return;
                    const bounds = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    const minuteOffset = Math.max(0, Math.min(TOTAL_H, e.clientY - bounds.top));
                    const snapped = Math.round(minuteOffset / 30) * 30 + H_START * 60;
                    handleDrop(task, ds, formatTime(snapped));
                    setDraggingTaskId(null);
                  }}
                >
                  {Array.from({ length: H_END - H_START }, (_, i) => {
                    const cellTime = formatTime(H_START * 60 + i * 60);
                    return <button key={i} className="absolute left-0 right-0 border-t border-gray-100 hover:bg-blue-50/40 transition-colors text-left" style={{ top: `${i * 60}px`, height: "60px" }} onClick={() => openCreate(ds, cellTime)} />;
                  })}
                  {dayBlocked.map((slot) => {
                    const p = positionFor(slot.startTime, slot.endTime);
                    return <div key={slot.id} className="absolute left-1 right-1 rounded-xl overflow-hidden px-2.5 py-1.5 z-10" style={{ top: p.top, height: p.height, backgroundColor: BLOCKED_COLOR.bg }}><p className="text-[11px] font-semibold truncate leading-tight" style={{ color: BLOCKED_COLOR.text }}>{slot.title}</p><p className="text-[10px] leading-tight mt-0.5" style={{ color: `${BLOCKED_COLOR.text}B3` }}>{slot.startTime}-{slot.endTime}</p></div>;
                  })}
                  {(taskMap[ds] || []).map((task) => {
                    const start = task.scheduledStart?.slice(11, 16) ?? "08:00";
                    const end = task.scheduledEnd?.slice(11, 16) ?? addMinutes(start, task.durationMinutes);
                    const p = positionFor(start, end);
                    const color = task.status === "done" ? { bg: "#DCFCE7", text: "#15803D" } : CAT_COLORS[task.categoryKey];
                    return <button key={task.id} draggable onDragStart={(e) => { e.dataTransfer.setData("text/task-id", task.id); setDraggingTaskId(task.id); }} onDragEnd={() => setDraggingTaskId(null)} onClick={(e) => { e.stopPropagation(); setSelectedTaskId(task.id); }} className="absolute left-1 right-1 rounded-xl overflow-hidden px-2.5 py-1.5 z-20 text-left hover:brightness-95 transition-all" style={{ top: p.top, height: p.height, backgroundColor: color.bg, transform: draggingTaskId === task.id ? "rotate(-6deg) scale(1.02)" : "none", boxShadow: draggingTaskId === task.id ? "0 12px 24px rgba(15,23,42,0.16)" : undefined }}><div className="flex items-start justify-between gap-2"><p className="text-[11px] font-semibold leading-tight break-words pr-2 line-clamp-2" style={{ color: color.text }}>{task.title}</p>{task.status === "done" ? <span className="text-[10px] font-semibold text-emerald-700">?</span> : null}</div><p className="text-[10px] leading-tight mt-0.5 truncate" style={{ color: `${color.text}B3` }}>{task.status === "done" ? "Termine" : `${start} - ${end}`}</p>{task.splitPartCount ? <p className="text-[10px] mt-0.5" style={{ color: `${color.text}B3` }}>Partie {task.splitPartIndex}/{task.splitPartCount}</p> : null}</button>;
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Modal open={Boolean(createDate)} onClose={() => setCreateDate(null)} title="Ajouter ou placer une tache" width="max-w-2xl">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-800">Creer une nouvelle tache</p>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Titre de la tache" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input type="time" value={createTime} onChange={(e) => setCreateTime(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
                <input type="number" min={15} step={15} value={form.durationMinutes} onChange={(e) => setForm((p) => ({ ...p, durationMinutes: Number(e.target.value) }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={form.categoryKey} onChange={(e) => setForm((p) => ({ ...p, categoryKey: e.target.value as TaskCategory }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm">{Object.keys(CAT_COLORS).map((key) => <option key={key} value={key}>{key}</option>)}</select>
                <select value={form.importance} onChange={(e) => setForm((p) => ({ ...p, importance: Number(e.target.value) }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm">{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} etoile{value > 1 ? "s" : ""}</option>)}</select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={form.isSplittable} onChange={(e) => setForm((p) => ({ ...p, isSplittable: e.target.checked }))} /> Tache divisible</label>
              <button onClick={handleCreate} className="btn-primary w-full">Creer et placer</button>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-800">Ou choisir une tache existante</p>
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {availableTasks.map((task) => <button key={task.id} onClick={() => assignExisting(task)} className="w-full text-left border border-gray-100 rounded-xl px-3 py-3 hover:border-blue-200 hover:bg-blue-50/40 transition-colors"><div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-gray-800">{task.title}</span><span className="text-xs text-blue-500">{task.importance}/5</span></div><p className="text-xs text-gray-400 mt-1">{formatDuration(task.durationMinutes)}{task.deadline ? ` · limite ${task.deadline}` : ""}</p></button>)}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(selectedTask)} onClose={() => setSelectedTaskId(null)} title={selectedTask?.title ?? "Tache active"}>
        {selectedTask ? <div className="space-y-4"><div className="rounded-xl border border-gray-100 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-gray-800">{selectedTask.title}</p><p className="text-xs text-gray-400 mt-1">{selectedTask.scheduledStart?.slice(11, 16)} - {selectedTask.scheduledEnd?.slice(11, 16)} · {formatDuration(selectedTask.durationMinutes)}</p></div><span className="text-xs text-blue-500 font-semibold">{selectedTask.importance}/5 etoiles</span></div></div><div className="grid grid-cols-2 gap-3"><button onClick={() => { updateTask(selectedTask.id, { status: selectedTask.status === "done" ? "todo" : "done" }); setSelectedTaskId(null); }} className={`py-3 rounded-xl text-sm font-semibold ${selectedTask.status === "done" ? "bg-gray-100 text-gray-600" : "bg-emerald-500 text-white"}`}>{selectedTask.status === "done" ? "Remettre a faire" : "Valider"}</button><button onClick={() => { postponeTask(selectedTask.id, delayMinutes); setSelectedTaskId(null); }} className="py-3 rounded-xl text-sm font-semibold bg-slate-700 text-white">Decaler</button></div><div><p className="text-xs font-medium text-gray-500 mb-2">Combien de temps decaler ?</p><div className="flex gap-2">{[30, 60, 90, 120].map((value) => <button key={value} onClick={() => setDelayMinutes(value)} className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${delayMinutes === value ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-500 border-gray-200"}`}>+{value} min</button>)}</div></div></div> : null}
      </Modal>
    </div>
  );
}

