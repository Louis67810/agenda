"use client";

import { useState } from "react";

const stats = [
  { label: "Score total", value: "2 845", unit: "pts", trend: "+245", color: "text-orange-500" },
  { label: "Tâches complétées", value: "87", unit: "%", trend: "+5%", color: "text-emerald-500" },
  { label: "Habitudes", value: "74", unit: "%", trend: "+3%", color: "text-blue-500" },
  { label: "Streak actuel", value: "12", unit: "jours", trend: "🔥", color: "text-amber-500" },
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

const moodCalendar = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  score: Math.floor(Math.random() * 5) + 5,
}));

const objectives = [
  { title: "Finir mon site portfolio", progress: 65, color: "bg-orange-500" },
  { title: "Courir 500 km", progress: 45, color: "bg-emerald-500" },
  { title: "Lire 24 livres", progress: 33, color: "bg-blue-500" },
  { title: "Apprendre Next.js", progress: 80, color: "bg-purple-500" },
];

function moodColor(score: number) {
  if (score >= 9) return "bg-emerald-500";
  if (score >= 7) return "bg-emerald-300";
  if (score >= 5) return "bg-amber-300";
  if (score >= 3) return "bg-orange-400";
  return "bg-red-400";
}

export default function PerformancesPage() {
  const [period, setPeriod] = useState<"7j" | "30j" | "tout">("30j");
  const maxScore = Math.max(...scoreHistory);

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
            <p className="text-xs text-emerald-500 font-medium mt-1">{s.trend} vs mois dernier</p>
          </div>
        ))}
      </div>

      {/* Score global chart */}
      <div className="card">
        <h3 className="section-title mb-4">Évolution du score</h3>
        <div className="flex items-end gap-1 h-32">
          {scoreHistory.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
              <div
                className="w-full rounded-t-sm bg-orange-400 opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: `${(val / maxScore) * 100}%` }}
                title={`${val} pts`}
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
        {/* Weekly tasks bar chart */}
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

        {/* Objectives progress */}
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

      {/* Habits heatmap */}
      <div className="card">
        <h3 className="section-title mb-4">Habitudes — 30 derniers jours</h3>
        <div className="space-y-3">
          {habits.map((h) => (
            <div key={h.name} className="flex items-center gap-4">
              <span className="text-sm w-44 flex items-center gap-2 text-gray-600">
                <span>{h.icon}</span>{h.name}
              </span>
              <div className="flex gap-1 flex-wrap">
                {h.logs.map((done, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-sm ${done ? "bg-emerald-400" : "bg-gray-100"}`}
                    title={`Jour ${i + 1}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 ml-1">
                {h.logs.filter(Boolean).length}/30
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mood calendar */}
      <div className="card">
        <h3 className="section-title mb-4">Calendrier humeur — Mars 2026</h3>
        <div className="grid grid-cols-10 gap-1.5">
          {moodCalendar.map((d) => (
            <div
              key={d.day}
              className={`aspect-square rounded-lg ${moodColor(d.score)} flex items-center justify-center`}
              title={`Jour ${d.day} — ${d.score}/10`}
            >
              <span className="text-[10px] font-bold text-white">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> Difficile</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-300 inline-block" /> Moyen</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-300 inline-block" /> Bien</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Excellent</span>
        </div>
      </div>
    </div>
  );
}
