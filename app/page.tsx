"use client";

import { useState } from "react";

const initialTasks = [
  { id: 1, title: "Préparer la présentation client", time: "09:00 - 10:30", importance: 3, done: false, tag: "Travail" },
  { id: 2, title: "Répondre aux emails urgents",     time: "11:00 - 11:30", importance: 2, done: true,  tag: "Travail" },
  { id: 3, title: "Acheter des courses",             time: "18:00 - 19:00", importance: 1, done: false, tag: "Personnel" },
  { id: 4, title: "Appel médecin",                   time: "14:00 - 14:30", importance: 3, done: false, tag: "Santé" },
];

const initialHabits = [
  { id: 1, name: "Méditation",      icon: "🧘", done: true,  streak: 12, points: 10 },
  { id: 2, name: "Lecture 30 min",  icon: "📖", done: false, streak: 5,  points: 10 },
  { id: 3, name: "Exercice physique",icon: "💪", done: true,  streak: 8,  points: 20 },
  { id: 4, name: "Boire 2L d'eau",  icon: "💧", done: false, streak: 3,  points: 5  },
  { id: 5, name: "Journaling",      icon: "✍️", done: false, streak: 15, points: 10 },
  { id: 6, name: "Révision code",   icon: "💻", done: true,  streak: 9,  points: 15 },
];

const objectives = [
  { id: 1, title: "Lire 24 livres cette année",  progress: 42, current: 10,  target: 24,  color: "#EF4444" },
  { id: 2, title: "Courir 500 km",               progress: 65, current: 325, target: 500, color: "#22C55E" },
  { id: 3, title: "Apprendre Next.js 15",        progress: 72, current: 72,  target: 100, color: "#F59E0B" },
  { id: 4, title: "Épargner 2 000 €",            progress: 80, current: 1600,target: 2000,color: "#F97316" },
];

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= count ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function HomePage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [habits, setHabits] = useState(initialHabits);

  const habitsDone = habits.filter((h) => h.done).length;
  const habitsTotal = habits.length;
  const habitsPercent = Math.round((habitsDone / habitsTotal) * 100);
  const tasksDone = tasks.filter((t) => t.done).length;
  const tasksLeft = tasks.length - tasksDone;

  const taskPoints = Math.round((tasksDone / tasks.length) * 6 * 10) / 10;
  const habitPoints = habitsDone;
  const totalScore = 2890 + taskPoints + habitPoints;

  function toggleTask(id: number) {
    setTasks((p) => p.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }
  function toggleHabit(id: number) {
    setHabits((p) => p.map((h) => h.id === id ? { ...h, done: !h.done } : h));
  }

  return (
    <div className="space-y-6">
      {/* Top grid: Tasks + Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Tasks */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title text-gray-900">Tâches du jour</h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-600">
              {tasksLeft} restante{tasksLeft > 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 ${
                  task.done ? "bg-gray-50/70 border-gray-100 opacity-60" : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    task.done ? "bg-blue-500 border-blue-500" : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {task.done && <CheckIcon />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${task.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{task.time}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{task.tag}</span>
                  </div>
                </div>
                <Stars count={task.importance} />
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Score card — blue gradient */}
          <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" }}>
            <p className="text-sm font-medium text-blue-100">Agenda</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-5xl font-extrabold leading-none">{Math.round(totalScore)}</span>
              <span className="text-blue-200 text-sm font-medium mb-1">pts</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-blue-100 text-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>+{taskPoints + habitPoints} pts vs. hier</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="card">
            <p className="text-sm font-bold text-gray-800 mb-4">Résumé rapide</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Tâches complétées</span>
                <span className="text-sm font-bold text-gray-800">{tasksDone}/{tasks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Habitudes</span>
                <span className="text-sm font-bold text-gray-800">{habitsDone}/{habitsTotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Streak max</span>
                <span className="text-sm font-bold text-blue-500">15 jours 🔥</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom grid: Habits + Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Habits */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Habitudes</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">{habitsDone}/{habitsTotal}</span>
              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${habitsPercent}%` }} />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            {habits.map((habit) => (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
                  habit.done ? "bg-blue-50/60" : "hover:bg-gray-50"
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                  habit.done ? "bg-blue-500 border-blue-500" : "border-gray-300 hover:border-blue-400"
                }`}>
                  {habit.done && <CheckIcon />}
                </div>
                <span className="text-base leading-none">{habit.icon}</span>
                <span className={`flex-1 text-sm font-medium ${habit.done ? "text-gray-400 line-through" : "text-gray-700"}`}>
                  {habit.name}
                </span>
                <span className="text-xs text-gray-400">{habit.streak}j</span>
                <span className="text-blue-400">🔥</span>
              </div>
            ))}
          </div>
        </div>

        {/* Objectives progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Résumé rapide</h3>
            <a href="/objectifs" className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">Voir tout</a>
          </div>
          <div className="space-y-5">
            {objectives.map((obj) => (
              <div key={obj.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700 truncate flex-1 mr-3">{obj.title}</p>
                  <span className="text-xs font-bold text-gray-500 shrink-0">{obj.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${obj.progress}%`, backgroundColor: obj.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
