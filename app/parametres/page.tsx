"use client";

import { useState } from "react";
import Link from "next/link";

const sections = [
  { href: "/parametres/compte", icon: "👤", label: "Compte", desc: "Profil, avatar, email" },
  { href: "/parametres/integrations", icon: "🔗", label: "Intégrations", desc: "Google Calendar, École Directe" },
];

const DAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { enabled: true,  start: "08:00", end: "22:00" },
  { enabled: true,  start: "08:00", end: "22:00" },
  { enabled: true,  start: "08:00", end: "22:00" },
  { enabled: true,  start: "08:00", end: "22:00" },
  { enabled: true,  start: "08:00", end: "22:00" },
  { enabled: false, start: "09:00", end: "18:00" },
  { enabled: false, start: "09:00", end: "18:00" },
];

export default function ParametresPage() {
  const [recapTime, setRecapTime] = useState("21:00");
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);

  // Points system
  const [tasksTotalPoints, setTasksTotalPoints] = useState(6);
  const [pomoDurationMin, setPomoDurationMin] = useState(25);

  const [saved, setSaved] = useState(false);

  function updateDay(i: number, patch: Partial<DaySchedule>) {
    setSchedule((prev) => prev.map((d, idx) => idx === i ? { ...d, ...patch } : d));
  }

  function handleSave() {
    // In a real app, persist to Supabase / localStorage
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Paramètres</h2>
        <p className="text-sm text-gray-400 mt-1">Configure l&apos;application selon tes préférences</p>
      </div>

      {/* Quick sections */}
      <div className="space-y-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="card flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer block"
          >
            <span className="text-2xl">{s.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{s.label}</p>
              <p className="text-xs text-gray-400">{s.desc}</p>
            </div>
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Système de points */}
      <div className="card space-y-4">
        <div>
          <h3 className="section-title">Système de points</h3>
          <p className="text-xs text-gray-400 mt-1">Configure comment les points sont calculés chaque jour</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Règles de calcul</p>
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">●</span>
              <span><strong>Tâches :</strong> toutes les tâches du jour = <strong>{tasksTotalPoints} points</strong> au total, proportionnels au % réalisé</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">●</span>
              <span><strong>Habitudes :</strong> chaque habitude accomplie = <strong>1 point</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">●</span>
              <span><strong>Pomodoro :</strong> chaque session complète = <strong>0.5 point</strong></span>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              Points totaux pour les tâches
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={20}
                value={tasksTotalPoints}
                onChange={(e) => setTasksTotalPoints(Number(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="text-lg font-extrabold text-blue-500 w-8 text-right">{tasksTotalPoints}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Points si 100% des tâches sont faites</p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              Durée Pomodoro par défaut
            </label>
            <div className="flex gap-1">
              {[25, 45, 60].map((min) => (
                <button
                  key={min}
                  onClick={() => setPomoDurationMin(min)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    pomoDurationMin === min
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Disponibilité par jour */}
      <div className="card space-y-4">
        <div>
          <h3 className="section-title">Disponibilité par jour</h3>
          <p className="text-xs text-gray-400 mt-1">Définis tes plages de travail pour chaque jour de la semaine</p>
        </div>

        <div className="space-y-2">
          {DAY_LABELS.map((label, i) => {
            const day = schedule[i];
            return (
              <div
                key={label}
                className={`rounded-xl border p-3 transition-all ${
                  day.enabled ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateDay(i, { enabled: !day.enabled })}
                    className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                      day.enabled ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        day.enabled ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                  <span className={`w-24 text-sm font-medium shrink-0 ${day.enabled ? "text-gray-800" : "text-gray-400"}`}>
                    {label}
                  </span>
                  {day.enabled ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={day.start}
                        onChange={(e) => updateDay(i, { start: e.target.value })}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-300"
                      />
                      <span className="text-gray-300 text-xs">→</span>
                      <input
                        type="time"
                        value={day.end}
                        onChange={(e) => updateDay(i, { end: e.target.value })}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-300"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Indisponible</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Récap */}
      <div className="card space-y-4">
        <h3 className="section-title">Rappels</h3>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Heure du récap quotidien</label>
          <input
            type="time"
            value={recapTime}
            onChange={(e) => setRecapTime(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-300"
          />
          <p className="text-xs text-gray-400 mt-1">Tu seras notifié à cette heure pour remplir ton récap de journée</p>
        </div>
      </div>

      <button onClick={handleSave} className={`btn-primary w-full ${saved ? "!bg-emerald-500" : ""}`}>
        {saved ? "✓ Sauvegardé" : "Sauvegarder les paramètres"}
      </button>
    </div>
  );
}
