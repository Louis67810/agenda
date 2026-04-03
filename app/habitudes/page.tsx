"use client";

import { useState } from "react";
import HabitRow from "@/components/habits/HabitRow";
import { useAppState } from "@/components/providers/AppStateProvider";
import { computeHabitStreak, startOfWeek } from "@/lib/app-state";

const ICONS = ["🚶", "📖", "🥗", "💪", "🧘", "💻", "💧", "🎯", "🏃", "😴", "🎵", "✍️", "🧹", "🚿", "🥦"];
const FREQUENCIES = ["daily", "weekly"] as const;

export default function HabitudesPage() {
  const { ready, habits, today, createHabit, deleteHabit, toggleHabitForDate } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<{ title: string; icon: string; frequency: "daily" | "weekly"; points: number; targetValue: string; unit: string }>({ title: "", icon: "🎯", frequency: "daily", points: 10, targetValue: "", unit: "" });

  if (!ready) return <div className="text-sm text-gray-400">Chargement des habitudes...</div>;

  const weekStart = startOfWeek(today);
  const completedCount = habits.filter((habit) => habit.logs.some((log) => log.date === today && log.done)).length;
  const totalPoints = habits.reduce((sum, habit) => sum + (habit.logs.some((log) => log.date === today && log.done) ? habit.points : 0), 0);
  const bestStreak = Math.max(...habits.map((habit) => computeHabitStreak(habit, today)), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Habitudes</h1>
          <p className="text-sm text-gray-500 mt-1">Suivez vos habitudes quotidiennes et hebdomadaires</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Nouvelle habitude
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 text-center"><p className="text-2xl font-bold text-gray-900">{completedCount}/{habits.length}</p><p className="text-xs text-gray-500 mt-0.5">Completees aujourd'hui</p></div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 text-center"><p className="text-2xl font-bold text-blue-600">🔥 {bestStreak}</p><p className="text-xs text-gray-500 mt-0.5">Meilleure serie</p></div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 text-center"><p className="text-2xl font-bold text-blue-600">+{totalPoints}</p><p className="text-xs text-gray-500 mt-0.5">Points gagnes</p></div>
      </div>

      <div className="space-y-3">
        {habits.map((habit) => {
          const todayLog = habit.logs.find((log) => log.date === today);
          const streak = computeHabitStreak(habit, today);
          const weekLog = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(`${weekStart}T12:00:00`);
            date.setDate(date.getDate() + index);
            const iso = date.toISOString().slice(0, 10);
            return habit.logs.some((log) => log.date === iso && log.done);
          });
          return (
            <HabitRow
              key={habit.id}
              title={habit.title}
              icon={habit.icon}
              streak={streak}
              done={todayLog?.done ?? false}
              onToggle={() => toggleHabitForDate(habit.id, today, !(todayLog?.done ?? false), todayLog?.value)}
              targetValue={habit.targetValue}
              currentValue={todayLog?.value}
              unit={habit.unit}
              points={habit.points}
              frequency={habit.frequency === "daily" ? "Quotidien" : "Hebdomadaire"}
              weekLog={weekLog}
              onDelete={() => deleteHabit(habit.id)}
            />
          );
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-gray-800">Nouvelle habitude</h2><button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-2">Icone</label>
              <div className="flex flex-wrap gap-2">{ICONS.map((ic) => <button key={ic} onClick={() => setForm((f) => ({ ...f, icon: ic }))} className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.icon === ic ? "bg-blue-100 ring-2 ring-blue-400" : "bg-gray-100 hover:bg-gray-200"}`}>{ic}</button>)}</div>
            </div>
            <div><label className="text-xs font-medium text-gray-500 block mb-1.5">Nom de l'habitude</label><input autoFocus type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ex : Lire 30 min" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-gray-500 block mb-1.5">Frequence</label><select value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as "daily" | "weekly" }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300">{FREQUENCIES.map((fr) => <option key={fr} value={fr}>{fr === "daily" ? "Quotidien" : "Hebdomadaire"}</option>)}</select></div>
              <div><label className="text-xs font-medium text-gray-500 block mb-1.5">Points</label><input type="number" min={1} max={100} value={form.points} onChange={(e) => setForm((f) => ({ ...f, points: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300" /></div>
            </div>
            <div><label className="text-xs font-medium text-gray-500 block mb-1.5">Objectif chiffre (optionnel)</label><div className="flex gap-2"><input type="number" min={0} value={form.targetValue} onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))} placeholder="Ex : 10000" className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300" /><input type="text" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="unite" className="w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300" /></div></div>
            <div className="flex gap-3 pt-1"><button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button><button onClick={() => { if (!form.title.trim()) return; createHabit({ title: form.title.trim(), icon: form.icon, frequency: form.frequency, points: form.points, targetValue: form.targetValue ? Number(form.targetValue) : undefined, unit: form.unit || undefined }); setForm({ title: "", icon: "🎯", frequency: "daily", points: 10, targetValue: "", unit: "" }); setModalOpen(false); }} disabled={!form.title.trim()} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed">Creer</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
