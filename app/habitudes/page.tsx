"use client";

import { useState } from "react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { computeHabitStreak } from "@/lib/app-state";

const ICONS = ["run", "read", "sport", "zen", "water", "goal", "focus", "sleep", "notes", "walk"];

export default function HabitudesPage() {
  const { ready, habits, today, createHabit, deleteHabit, toggleHabitForDate } = useAppState();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<{ title: string; icon: string; frequency: "daily" | "weekly"; points: number; targetValue: string; unit: string }>({
    title: "",
    icon: "goal",
    frequency: "daily",
    points: 10,
    targetValue: "",
    unit: "",
  });

  if (!ready) return <div className="text-sm text-gray-400">Chargement des habitudes...</div>;

  const rows = habits.map((habit) => {
    const todayLog = habit.logs.find((log) => log.date === today);
    const streak = computeHabitStreak(habit, today);
    return { habit, todayLog, streak };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Habitudes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Les habitudes completees alimentent automatiquement les points, les performances et le recap quotidien.
          </p>
        </div>
        <button onClick={() => setShowCreate((value) => !value)} className="btn-primary">
          {showCreate ? "Fermer" : "Nouvelle habitude"}
        </button>
      </div>

      {showCreate && (
        <div className="card space-y-4">
          <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Nom de l'habitude" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={form.frequency} onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value as "daily" | "weekly" }))} className="border border-gray-200 rounded-xl px-4 py-3 text-sm">
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
            </select>
            <input type="number" min={1} value={form.points} onChange={(e) => setForm((prev) => ({ ...prev, points: Number(e.target.value) }))} className="border border-gray-200 rounded-xl px-4 py-3 text-sm" />
            <input value={form.targetValue} onChange={(e) => setForm((prev) => ({ ...prev, targetValue: e.target.value }))} placeholder="Cible optionnelle" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" />
            <input value={form.unit} onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))} placeholder="Unite" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" />
          </div>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((icon) => (
              <button key={icon} type="button" onClick={() => setForm((prev) => ({ ...prev, icon }))} className={`rounded-xl border px-3 py-2 text-sm ${form.icon === icon ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500"}`}>
                {icon}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              className="btn-primary"
              onClick={() => {
                if (!form.title.trim()) return;
                createHabit({
                  title: form.title.trim(),
                  icon: form.icon,
                  frequency: form.frequency,
                  points: form.points,
                  targetValue: form.targetValue ? Number(form.targetValue) : undefined,
                  unit: form.unit || undefined,
                });
                setForm({ title: "", icon: "goal", frequency: "daily", points: 10, targetValue: "", unit: "" });
                setShowCreate(false);
              }}
            >
              Creer l'habitude
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rows.map(({ habit, todayLog, streak }) => (
          <div key={habit.id} className="card">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleHabitForDate(habit.id, today, !(todayLog?.done ?? false), todayLog?.value)}
                  className={`h-8 w-8 rounded-xl border-2 flex items-center justify-center ${todayLog?.done ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300"}`}
                >
                  {todayLog?.done ? "✓" : ""}
                </button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm uppercase tracking-wide text-gray-400">{habit.icon}</span>
                    <h3 className={`font-semibold ${todayLog?.done ? "text-gray-400 line-through" : "text-gray-800"}`}>{habit.title}</h3>
                    <span className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-500">{habit.frequency === "daily" ? "quotidienne" : "hebdomadaire"}</span>
                    <span className="text-xs rounded-full bg-amber-50 px-2 py-1 text-amber-600">+{habit.points} points</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Serie actuelle : {streak} jours</p>
                </div>
              </div>
              <button onClick={() => deleteHabit(habit.id)} className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50">Supprimer</button>
            </div>
            {habit.targetValue && (
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="number"
                  value={todayLog?.value ?? ""}
                  onChange={(e) => toggleHabitForDate(habit.id, today, todayLog?.done ?? false, Number(e.target.value))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-40"
                />
                <span className="text-sm text-gray-500">/ {habit.targetValue} {habit.unit}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
