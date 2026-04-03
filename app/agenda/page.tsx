"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { CATEGORY_LABELS, addDays, dateFromDateTime, formatDisplayDateTime, formatDuration, isoToday } from "@/lib/app-state";
import type { TaskCategory } from "@/lib/mock-data";

const CATEGORIES: TaskCategory[] = ["travail", "personnel", "sport", "etudes", "sante", "social", "finance", "creativite"];

export default function AgendaPage() {
  const { ready, tasks, blockedSlots, createTask, updateTask, addTaskTime } = useAppState();
  const [selectedDate, setSelectedDate] = useState(isoToday());
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [form, setForm] = useState({ title: "", categoryKey: "travail" as TaskCategory, durationMinutes: 60, importance: 3 });

  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(selectedDate, index)), [selectedDate]);

  if (!ready) return <div className="text-sm text-gray-400">Chargement de l'agenda...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agenda</h1>
          <p className="text-sm text-gray-500 mt-1">
            Les nouvelles taches arrivent ici automatiquement apres creation, avec un placement base sur la duree, la deadline et les creneaux bloques.
          </p>
        </div>
        <button onClick={() => setShowQuickCreate((value) => !value)} className="btn-primary">
          {showQuickCreate ? "Fermer" : "Ajouter dans l'agenda"}
        </button>
      </div>

      {showQuickCreate && (
        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Titre" className="border border-gray-200 rounded-xl px-4 py-3 text-sm md:col-span-2" />
            <select value={form.categoryKey} onChange={(e) => setForm((prev) => ({ ...prev, categoryKey: e.target.value as TaskCategory }))} className="border border-gray-200 rounded-xl px-4 py-3 text-sm">
              {CATEGORIES.map((category) => <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>)}
            </select>
            <input type="number" min={15} step={15} value={form.durationMinutes} onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))} className="border border-gray-200 rounded-xl px-4 py-3 text-sm" />
          </div>
          <div className="flex justify-end">
            <button
              className="btn-primary"
              onClick={() => {
                if (!form.title.trim()) return;
                createTask({
                  title: form.title.trim(),
                  categoryKey: form.categoryKey,
                  importance: form.importance,
                  durationMinutes: form.durationMinutes,
                  deadline: selectedDate,
                  status: "todo",
                  isSimpleTodo: true,
                });
                setForm({ title: "", categoryKey: "travail", durationMinutes: 60, importance: 3 });
                setShowQuickCreate(false);
              }}
            >
              Ajouter et planifier
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {weekDates.map((date) => (
          <button key={date} onClick={() => setSelectedDate(date)} className={`rounded-xl px-4 py-2 text-sm ${selectedDate === date ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
            {new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr,1fr] gap-6">
        <div className="card space-y-3">
          <h3 className="section-title">Taches planifiees</h3>
          {tasks
            .filter((task) => dateFromDateTime(task.scheduledStart) === selectedDate)
            .sort((a, b) => (a.scheduledStart ?? "").localeCompare(b.scheduledStart ?? ""))
            .map((task) => (
              <div key={task.id} className="rounded-xl border border-gray-100 px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold ${task.status === "done" ? "line-through text-gray-400" : "text-gray-800"}`}>{task.title}</p>
                      <span className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-500">{CATEGORY_LABELS[task.categoryKey]}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{formatDisplayDateTime(task.scheduledStart)} · {formatDuration(task.durationMinutes)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateTask(task.id, { status: task.status === "done" ? "todo" : "done" })} className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                      {task.status === "done" ? "Reouvrir" : "Terminer"}
                    </button>
                    <button onClick={() => addTaskTime(task.id, 30)} className="rounded-xl border border-orange-200 px-3 py-2 text-sm text-orange-500 hover:bg-orange-50">
                      +30 min
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="card space-y-3">
          <h3 className="section-title">Creneaux bloques</h3>
          {blockedSlots
            .filter((slot) => new Date(`${selectedDate}T12:00:00`).getDay() === slot.dayOfWeek)
            .map((slot) => (
              <div key={slot.id} className="rounded-xl border border-gray-100 px-4 py-3">
                <p className="font-medium text-gray-800">{slot.title}</p>
                <p className="text-xs text-gray-400 mt-1">{slot.startTime} - {slot.endTime}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

