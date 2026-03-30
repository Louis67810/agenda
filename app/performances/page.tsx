"use client";

import { useState } from "react";

// ─── Mock data ──────────────────────────────────────────────────────────────

const stats = [
  { label: "Score total", value: "2 890", unit: "pts", trend: "+290 ce mois", color: "text-orange-500" },
  { label: "Tâches", value: "84", unit: "%", trend: "+7% vs mois dernier", color: "text-emerald-500" },
  { label: "Habitudes", value: "76", unit: "%", trend: "+4% vs mois dernier", color: "text-blue-500" },
  { label: "Focus Pomodoro", value: "48", unit: "h", trend: "Ce mois", color: "text-violet-500" },
];

const weeklyTasks = [
  { week: "S1", done: 8, total: 12 },
  { week: "S2", done: 11, total: 14 },
  { week: "S3", done: 6, total: 10 },
  { week: "S4", done: 13, total: 15 },
  { week: "S5", done: 9, total: 11 },
  { week: "S6", done: 14, total: 16 },
  { week: "S7", done: 10, total: 13 },
  { week: "S8", done: 15, total: 17 },
];

const scoreHistory = [120, 145, 110, 180, 165, 200, 185, 220, 195, 240, 210, 260, 245, 280, 255, 300, 285, 310, 290, 330, 315, 340, 325, 360, 345, 370, 355, 380, 360, 390];

const habits = [
  { name: "Marcher 10 000 pas", icon: "🚶", logs: [1,1,0,1,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0] },
  { name: "Lire 30 min", icon: "📖", logs: [1,0,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1] },
  { name: "Sport", icon: "💪", logs: [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0] },
  { name: "Méditer", icon: "🧘", logs: [1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1] },
  { name: "Boire 2L", icon: "💧", logs: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0] },
];

// Scores par jour (points gagnés) — March 2026
const dailyPoints = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  taskPoints: parseFloat((Math.random() * 6).toFixed(1)),
  habitPoints: Math.floor(Math.random() * 6),
  pomodoroSessions: Math.floor(Math.random() * 5),
  mood: Math.floor(Math.random() * 5) + 5,
  tasksTotal: Math.floor(Math.random() * 5) + 2,
  tasksDone: 0,
})).map((d) => ({ ...d, tasksDone: Math.floor(d.tasksTotal * (0.5 + Math.random() * 0.5)) }));

const objectives = [
  { title: "Maîtriser Next.js 15", progress: 72, color: "bg-orange-500" },
  { title: "Courir 10 km < 50 min", progress: 55, color: "bg-emerald-500" },
  { title: "Épargner 2 000 €", progress: 80, color: "bg-blue-500" },
  { title: "Lire 12 livres", progress: 25, color: "bg-purple-500" },
];

// Pomodoro sessions mock
const pomodoroWeekly = [
  { day: "Lun", sessions: 4, minutes: 100 },
  { day: "Mar", sessions: 3, minutes: 75 },
  { day: "Mer", sessions: 6, minutes: 150 },
  { day: "Jeu", sessions: 2, minutes: 50 },
  { day: "Ven", sessions: 5, minutes: 125 },
  { day: "Sam", sessions: 1, minutes: 25 },
  { day: "Dim", sessions: 0, minutes: 0 },
];

function moodColor(score: number) {
  if (score >= 9) return "bg-emerald-500";
  if (score >= 7) return "bg-emerald-300";
  if (score >= 5) return "bg-amber-300";
  if (score >= 3) return "bg-orange-400";
  return "bg-red-400";
}

interface DayDetailProps {
  day: typeof dailyPoints[0];
  onClose: () => void;
}

function DayDetailModal({ day, onClose }: DayDetailProps) {
  const total = day.taskPoints + day.habitPoints + day.pomodoroSessions * 0.5;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Jour {day.day} mars 2026</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Points breakdown */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-xs text-orange-600 font-semibold">Tâches</p>
            <p className="text-xl font-bold text-orange-600">+{day.taskPoints}</p>
            <p className="text-[10px] text-gray-400">{day.tasksDone}/{day.tasksTotal} faites</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3">
            <p className="text-xs text-emerald-600 font-semibold">Habitudes</p>
            <p className="text-xl font-bold text-emerald-600">+{day.habitPoints}</p>
            <p className="text-[10px] text-gray-400">{day.habitPoints} réalisées</p>
          </div>
          <div className="bg-violet-50 rounded-xl p-3">
            <p className="text-xs text-violet-600 font-semibold">Pomodoro</p>
            <p className="text-xl font-bold text-violet-600">{day.pomodoroSessions}</p>
            <p className="text-[10px] text-gray-400">{day.pomodoroSessions * 25} min focus</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-600 font-semibold">Humeur</p>
            <p className="text-xl font-bold text-blue-600">{day.mood}/10</p>
            <p className="text-[10px] text-gray-400">Note de la journée</p>
          </div>
        </div>

        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
          <span className="text-sm font-semibold text-orange-700">Total du jour</span>
          <span className="text-xl font-extrabold text-orange-500">+{total.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

export default function PerformancesPage() {
  const [period, setPeriod] = useState<"7j" | "30j" | "tout">("30j");
  const [selectedDay, setSelectedDay] = useState<typeof dailyPoints[0] | null>(null);
  const maxScore = Math.max(...scoreHistory);
  const maxPomo = Math.max(...pomodoroWeekly.map((p) => p.sessions));
  const totalFocusH = Math.round(pomodoroWeekly.reduce((s, p) => s + p.minutes, 0) / 60 * 10) / 10;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Performances</h2>
          <p className="text-sm text-gray-400 mt-1">Suivi de tes progrès et statistiques</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(["7j", "30j", "tout"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p === "7j" ? "7 jours" : p === "30j" ? "30 jours" : "Tout"}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            <div className="flex items-end gap-1 mt-2">
              <span className={`text-3xl font-extrabold ${s.color}`}>{s.value}</span>
              <span className="text-gray-400 text-sm mb-1">{s.unit}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{s.trend}</p>
          </div>
        ))}
      </div>

      {/* Score chart */}
      <div className="card">
        <h3 className="section-title mb-4">Évolution du score (30 jours)</h3>
        <div className="flex items-end gap-1 h-32">
          {scoreHistory.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end">
              <div
                className="w-full rounded-t-sm bg-orange-400 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                style={{ height: `${(val / maxScore) * 100}%` }}
                title={`Jour ${i + 1} — ${val} pts`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>Il y a 30 jours</span>
          <span>Aujourd&apos;hui</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly tasks */}
        <div className="card">
          <h3 className="section-title mb-4">Tâches terminées / semaine</h3>
          <div className="space-y-2">
            {weeklyTasks.map((w) => (
              <div key={w.week} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-6">{w.week}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${(w.done / w.total) * 100}%` }}
                  >
                    <span className="text-[10px] text-white font-bold">{w.done}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-8">/{w.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Objectives */}
        <div className="card">
          <h3 className="section-title mb-4">Progression des objectifs</h3>
          <div className="space-y-4">
            {objectives.map((obj) => (
              <div key={obj.title}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700 font-medium">{obj.title}</span>
                  <span className="text-xs font-bold text-gray-500">{obj.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${obj.color}`} style={{ width: `${obj.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pomodoro stats */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Sessions Pomodoro — cette semaine</h3>
          <span className="text-sm font-bold text-violet-600">{totalFocusH}h de focus</span>
        </div>
        <div className="flex items-end gap-2 h-24">
          {pomodoroWeekly.map((p) => (
            <div key={p.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-violet-600 font-semibold">{p.sessions > 0 ? p.sessions : ""}</span>
              <div className="w-full flex flex-col justify-end" style={{ height: "64px" }}>
                <div
                  className="w-full rounded-t-lg bg-violet-400 hover:bg-violet-500 transition-colors"
                  style={{ height: maxPomo > 0 ? `${(p.sessions / maxPomo) * 64}px` : "0px" }}
                  title={`${p.sessions} sessions · ${p.minutes} min`}
                />
              </div>
              <span className="text-[10px] text-gray-400">{p.day}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Chaque barre = sessions de 25 min. Total : {pomodoroWeekly.reduce((s, p) => s + p.sessions, 0)} sessions</p>
      </div>

      {/* Habits heatmap */}
      <div className="card">
        <h3 className="section-title mb-4">Habitudes — 30 derniers jours</h3>
        <div className="space-y-3">
          {habits.map((h) => (
            <div key={h.name} className="flex items-center gap-4">
              <span className="text-sm w-44 flex items-center gap-2 text-gray-600 shrink-0">
                <span>{h.icon}</span>{h.name}
              </span>
              <div className="flex gap-1 flex-wrap flex-1">
                {h.logs.map((done, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-sm ${done ? "bg-emerald-400" : "bg-gray-100"}`}
                    title={`Jour ${i + 1}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {h.logs.filter(Boolean).length}/30
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily points calendar — clickable */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Points par jour — Mars 2026</h3>
          <p className="text-xs text-gray-400">Clique sur un jour pour le détail</p>
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {dailyPoints.map((d) => {
            const total = d.taskPoints + d.habitPoints + d.pomodoroSessions * 0.5;
            const intensity = Math.min(total / 12, 1);
            const colorClass =
              intensity >= 0.8 ? "bg-emerald-500" :
              intensity >= 0.6 ? "bg-emerald-300" :
              intensity >= 0.4 ? "bg-amber-300" :
              intensity >= 0.2 ? "bg-orange-300" : "bg-gray-100";
            return (
              <button
                key={d.day}
                onClick={() => setSelectedDay(d)}
                className={`aspect-square rounded-lg ${colorClass} flex items-center justify-center hover:ring-2 hover:ring-orange-400 transition-all`}
                title={`Jour ${d.day} — +${total.toFixed(1)} pts`}
              >
                <span className={`text-[10px] font-bold ${intensity >= 0.4 ? "text-white" : "text-gray-500"}`}>{d.day}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 inline-block border border-gray-200" /> Faible</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-300 inline-block" /> Moyen</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-300 inline-block" /> Bien</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Excellent</span>
        </div>
      </div>

      {/* Day detail modal */}
      {selectedDay && <DayDetailModal day={selectedDay} onClose={() => setSelectedDay(null)} />}
    </div>
  );
}
