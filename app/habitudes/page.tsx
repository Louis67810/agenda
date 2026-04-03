"use client";

import { useState } from "react";
import HabitRow from "@/components/habits/HabitRow";

interface Habit {
  id: number;
  title: string;
  icon: string;
  frequency: string;
  streak: number;
  done: boolean;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  points: number;
  weekLog: boolean[];
}

const INITIAL_HABITS: Habit[] = [
  { id: 1, title: "Marcher 10 000 pas", icon: "🚶", frequency: "Quotidien", streak: 12, done: false, targetValue: 10000, currentValue: 8500, unit: "pas", points: 15, weekLog: [true, true, true, false, true, true, false] },
  { id: 2, title: "Lire 30 min", icon: "📖", frequency: "Quotidien", streak: 7, done: true, points: 10, weekLog: [true, true, false, true, true, true, true] },
  { id: 3, title: "Manger sainement", icon: "🥗", frequency: "Quotidien", streak: 3, done: false, points: 10, weekLog: [false, true, true, false, false, true, false] },
  { id: 4, title: "Sport", icon: "💪", frequency: "Hebdomadaire", streak: 5, done: true, targetValue: 4, currentValue: 3, unit: "séances", points: 20, weekLog: [true, false, false, true, false, true, false] },
  { id: 5, title: "Méditer", icon: "🧘", frequency: "Quotidien", streak: 21, done: true, points: 10, weekLog: [true, true, true, true, true, true, true] },
  { id: 6, title: "Travailler 4h", icon: "💻", frequency: "Quotidien", streak: 9, done: false, targetValue: 240, currentValue: 180, unit: "min", points: 20, weekLog: [true, true, true, true, false, true, true] },
  { id: 7, title: "Boire 2L d'eau", icon: "💧", frequency: "Quotidien", streak: 4, done: false, targetValue: 2000, currentValue: 1200, unit: "ml", points: 5, weekLog: [true, false, true, true, false, false, true] },
];

const ICONS = ["🚶", "📖", "🥗", "💪", "🧘", "💻", "💧", "🎯", "🏃", "😴", "🎵", "✍️", "🧹", "🚿", "🥦"];
const FREQUENCIES = ["Quotidien", "Hebdomadaire"];

let nextId = 100;

export default function HabitudesPage() {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", icon: "🎯", frequency: "Quotidien", points: 10, targetValue: "", unit: "" });

  function toggleHabit(id: number) {
    setHabits((prev) =>
      prev.map((h) => h.id === id ? { ...h, done: !h.done } : h)
    );
  }

  function deleteHabit(id: number) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  function handleCreate() {
    if (!form.title.trim()) return;
    const newHabit: Habit = {
      id: ++nextId,
      title: form.title.trim(),
      icon: form.icon,
      frequency: form.frequency,
      streak: 0,
      done: false,
      points: Number(form.points) || 10,
      weekLog: [false, false, false, false, false, false, false],
      ...(form.targetValue ? { targetValue: Number(form.targetValue), currentValue: 0, unit: form.unit } : {}),
    };
    setHabits((prev) => [newHabit, ...prev]);
    setForm({ title: "", icon: "🎯", frequency: "Quotidien", points: 10, targetValue: "", unit: "" });
    setModalOpen(false);
  }

  const completedCount = habits.filter((h) => h.done).length;
  const totalPoints = habits.reduce((acc, h) => (h.done ? acc + h.points : acc), 0);
  const bestStreak = Math.max(...habits.map((h) => h.streak), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Habitudes</h1>
          <p className="text-sm text-gray-500 mt-1">Suivez vos habitudes quotidiennes et hebdomadaires</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle habitude
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{completedCount}/{habits.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Complétées aujourd&apos;hui</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">🔥 {bestStreak}</p>
          <p className="text-xs text-gray-500 mt-0.5">Meilleure série</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">+{totalPoints}</p>
          <p className="text-xs text-gray-500 mt-0.5">Points gagnés</p>
        </div>
      </div>

      {/* Habits list */}
      <div className="space-y-3">
        {habits.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Aucune habitude. Crée-en une !</p>
          </div>
        )}
        {habits.map((habit) => (
          <HabitRow
            key={habit.id}
            title={habit.title}
            icon={habit.icon}
            streak={habit.streak}
            done={habit.done}
            onToggle={() => toggleHabit(habit.id)}
            targetValue={habit.targetValue}
            currentValue={habit.currentValue}
            unit={habit.unit}
            points={habit.points}
            frequency={habit.frequency}
            weekLog={habit.weekLog}
            onDelete={() => deleteHabit(habit.id)}
          />
        ))}
      </div>

      {/* Modal nouvelle habitude */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Nouvelle habitude</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Icon picker */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-2">Icône</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                      form.icon === ic ? "bg-blue-100 ring-2 ring-blue-400" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Nom de l&apos;habitude</label>
              <input
                autoFocus
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ex : Lire 30 min"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300"
              />
            </div>

            {/* Frequency + Points */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Fréquence</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300"
                >
                  {FREQUENCIES.map((fr) => <option key={fr}>{fr}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Points</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.points}
                  onChange={(e) => setForm((f) => ({ ...f, points: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300"
                />
              </div>
            </div>

            {/* Optional target */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Objectif chiffré (optionnel)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={form.targetValue}
                  onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))}
                  placeholder="Ex : 10000"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300"
                />
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  placeholder="unité"
                  className="w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.title.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
