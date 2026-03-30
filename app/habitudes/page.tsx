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

const mockHabits: Habit[] = [
  {
    id: 1,
    title: "Marcher 10 000 pas",
    icon: "🚶",
    frequency: "Quotidien",
    streak: 12,
    done: false,
    targetValue: 10000,
    currentValue: 8500,
    unit: "pas",
    points: 15,
    weekLog: [true, true, true, false, true, true, false],
  },
  {
    id: 2,
    title: "Lire 30 min",
    icon: "📖",
    frequency: "Quotidien",
    streak: 7,
    done: true,
    points: 10,
    weekLog: [true, true, false, true, true, true, true],
  },
  {
    id: 3,
    title: "Manger sainement",
    icon: "🥗",
    frequency: "Quotidien",
    streak: 3,
    done: false,
    points: 10,
    weekLog: [false, true, true, false, false, true, false],
  },
  {
    id: 4,
    title: "Sport",
    icon: "💪",
    frequency: "Hebdomadaire",
    streak: 5,
    done: true,
    targetValue: 4,
    currentValue: 3,
    unit: "séances",
    points: 20,
    weekLog: [true, false, false, true, false, true, false],
  },
  {
    id: 5,
    title: "Méditer",
    icon: "🧘",
    frequency: "Quotidien",
    streak: 21,
    done: true,
    points: 10,
    weekLog: [true, true, true, true, true, true, true],
  },
  {
    id: 6,
    title: "Travailler 4h",
    icon: "💻",
    frequency: "Quotidien",
    streak: 9,
    done: false,
    targetValue: 240,
    currentValue: 180,
    unit: "min",
    points: 20,
    weekLog: [true, true, true, true, false, true, true],
  },
  {
    id: 7,
    title: "Boire 2L d'eau",
    icon: "💧",
    frequency: "Quotidien",
    streak: 4,
    done: false,
    targetValue: 2000,
    currentValue: 1200,
    unit: "ml",
    points: 5,
    weekLog: [true, false, true, true, false, false, true],
  },
];

export default function HabitudesPage() {
  const [habits] = useState<Habit[]>(mockHabits);

  const completedCount = habits.filter((h) => h.done).length;
  const totalPoints = habits.reduce((acc, h) => (h.done ? acc + h.points : acc), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Habitudes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Suivez vos habitudes quotidiennes et hebdomadaires
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
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
          <p className="text-2xl font-bold text-orange-600">🔥 21</p>
          <p className="text-xs text-gray-500 mt-0.5">Meilleure série</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">+{totalPoints}</p>
          <p className="text-xs text-gray-500 mt-0.5">Points gagnés</p>
        </div>
      </div>

      {/* Habits list */}
      <div className="space-y-3">
        {habits.map((habit) => (
          <HabitRow
            key={habit.id}
            title={habit.title}
            icon={habit.icon}
            streak={habit.streak}
            done={habit.done}
            targetValue={habit.targetValue}
            currentValue={habit.currentValue}
            unit={habit.unit}
            points={habit.points}
            frequency={habit.frequency}
            weekLog={habit.weekLog}
          />
        ))}
      </div>
    </div>
  );
}
