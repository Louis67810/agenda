"use client";

import { useState } from "react";
import Link from "next/link";

const sections = [
  { href: "/parametres/compte", icon: "👤", label: "Compte", desc: "Profil, avatar, email" },
  { href: "/parametres/points", icon: "⭐", label: "Système de points", desc: "Configurer les points et pénalités" },
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
  const [saved, setSaved] = useState(false);

  function updateDay(i: number, patch: Partial<DaySchedule>) {
    setSchedule((prev) => prev.map((d, idx) => idx === i ? { ...d, ...patch } : d));
  }

  function handleSave() {
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
            className="card flex items-center gap-4 hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer block"
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
                  {/* Toggle */}
                  <button
                    onClick={() => updateDay(i, { enabled: !day.enabled })}
                    className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                      day.enabled ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        day.enabled ? "translate-x-5" : ""
                      }`}
                    />
                  </button>

                  {/* Day label */}
                  <span className={`w-24 text-sm font-medium shrink-0 ${day.enabled ? "text-gray-800" : "text-gray-400"}`}>
                    {label}
                  </span>

                  {/* Time inputs */}
                  {day.enabled ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={day.start}
                        onChange={(e) => updateDay(i, { start: e.target.value })}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-orange-300"
                      />
                      <span className="text-gray-300 text-xs">→</span>
                      <input
                        type="time"
                        value={day.end}
                        onChange={(e) => updateDay(i, { end: e.target.value })}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-orange-300"
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
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-300"
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
