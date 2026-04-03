"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { addDays, dateFromDateTime, formatDisplayDateTime, formatDuration, isoToday } from "@/lib/app-state";

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

function toMin(t: string) { const [h,m] = t.split(":").map(Number); return h * 60 + m; }
function isoToDate(iso: string) { const value = new Date(`${iso}T12:00:00`); return value; }

export default function AgendaPage() {
  const { ready, tasks, blockedSlots, today, updateTask, addTaskTime, createTask } = useAppState();
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(isoToday());
  const [showCreate, setShowCreate] = useState<string | null>(null);
  const [form, setForm] = useState<{ title: string; durationMinutes: number; categoryKey: "travail" | "personnel" | "sport" | "etudes" | "social" | "finance" | "sante" | "creativite" }>({ title: "", durationMinutes: 60, categoryKey: "travail" });

  const current = isoToDate(currentDate);
  const monday = new Date(current);
  monday.setDate(current.getDate() - ((current.getDay() + 6) % 7));
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });

  if (!ready) return <div className="text-sm text-gray-400">Chargement de l'agenda...</div>;

  const taskMap = Object.fromEntries(weekDates.map((date) => {
    const ds = date.toISOString().slice(0, 10);
    return [ds, tasks.filter((task) => dateFromDateTime(task.scheduledStart) === ds).sort((a, b) => (a.scheduledStart ?? "").localeCompare(b.scheduledStart ?? ""))];
  }));

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
          <div style={{ display: "grid", gridTemplateColumns: "64px repeat(7, 1fr)", height: "900px" }}>
            <div className="relative border-r border-gray-100" style={{ height: "900px" }}>
              {Array.from({ length: 15 }, (_, i) => <div key={i} className="absolute right-3 text-[11px] text-gray-400 font-medium -translate-y-1/2" style={{ top: `${i * 60}px` }}>{String(7 + i).padStart(2, "0")}:00</div>)}
            </div>
            {weekDates.map((date) => {
              const ds = date.toISOString().slice(0, 10);
              const isToday = ds === today;
              const dayBlocked = blockedSlots.filter((slot) => slot.dayOfWeek === date.getDay());
              return (
                <div key={ds} className="relative border-r border-gray-100 last:border-r-0 cursor-pointer" style={{ height: "900px", backgroundColor: isToday ? "rgba(59,130,246,0.03)" : "white", backgroundImage: DIAGONAL_BG }} onClick={() => setShowCreate(ds)}>
                  {Array.from({ length: 15 }, (_, i) => <div key={i} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: `${i * 60}px` }} />)}
                  {dayBlocked.map((slot) => {
                    const top = Math.max(0, toMin(slot.startTime) - 420);
                    const height = Math.max(20, toMin(slot.endTime) - toMin(slot.startTime));
                    return <div key={slot.id} className="absolute left-1 right-1 rounded-xl overflow-hidden px-2.5 py-1.5 z-10" style={{ top, height, backgroundColor: BLOCKED_COLOR.bg }}><p className="text-[11px] font-semibold truncate leading-tight" style={{ color: BLOCKED_COLOR.text }}>{slot.title}</p><p className="text-[10px] leading-tight mt-0.5" style={{ color: `${BLOCKED_COLOR.text}B3` }}>{slot.startTime}-{slot.endTime}</p></div>;
                  })}
                  {(taskMap[ds] || []).map((task) => {
                    const start = task.scheduledStart?.slice(11, 16) ?? "08:00";
                    const end = task.scheduledEnd?.slice(11, 16) ?? "09:00";
                    const top = Math.max(0, toMin(start) - 420);
                    const height = Math.max(20, toMin(end) - toMin(start));
                    const color = CAT_COLORS[task.categoryKey];
                    return <button key={task.id} onClick={(e) => { e.stopPropagation(); updateTask(task.id, { status: task.status === "done" ? "todo" : "done" }); }} className="absolute left-1 right-1 rounded-xl overflow-hidden px-2.5 py-1.5 z-20 text-left hover:brightness-95 transition-all" style={{ top, height, backgroundColor: color.bg, opacity: task.status === "done" ? 0.55 : 1 }}><p className="text-[11px] font-semibold truncate leading-tight" style={{ color: color.text }}>{task.title}</p>{height >= 36 ? <p className="text-[10px] leading-tight mt-0.5" style={{ color: `${color.text}B3` }}>{start} - {end}</p> : null}</button>;
                  })}
                  {showCreate === ds ? (
                    <div className="absolute inset-x-2 bottom-2 bg-white border border-gray-200 rounded-xl p-3 z-30 shadow-lg" onClick={(e) => e.stopPropagation()}>
                      <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Nouvelle tache" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2" />
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input type="number" min={15} step={15} value={form.durationMinutes} onChange={(e) => setForm((p) => ({ ...p, durationMinutes: Number(e.target.value) }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                        <select value={form.categoryKey} onChange={(e) => setForm((p) => ({ ...p, categoryKey: e.target.value as "travail" | "personnel" | "sport" | "etudes" | "social" | "finance" | "sante" | "creativite" }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">{Object.keys(CAT_COLORS).map((key) => <option key={key} value={key}>{key}</option>)}</select>
                      </div>
                      <div className="flex gap-2"><button onClick={() => setShowCreate(null)} className="btn-ghost flex-1">Annuler</button><button onClick={() => { if (!form.title.trim()) return; createTask({ title: form.title.trim(), categoryKey: form.categoryKey, importance: 3, durationMinutes: form.durationMinutes, deadline: ds, status: "todo", isSimpleTodo: true }); setForm({ title: "", durationMinutes: 60, categoryKey: "travail" }); setShowCreate(null); }} className="btn-primary flex-1">Ajouter</button></div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.filter((task) => task.scheduledStart?.startsWith(today)).map((task) => (
          <div key={task.id} className="card flex items-center justify-between gap-4">
            <div>
              <p className={`text-sm font-semibold ${task.status === "done" ? "line-through text-gray-400" : "text-gray-800"}`}>{task.title}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDisplayDateTime(task.scheduledStart)} · {formatDuration(task.durationMinutes)}</p>
            </div>
            <button onClick={() => addTaskTime(task.id, 30)} className="btn-secondary text-sm">+30 min</button>
          </div>
        ))}
      </div>
    </div>
  );
}


