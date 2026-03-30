"use client";

import { useState } from "react";
import Link from "next/link";

const sections = [
  { href: "/parametres/compte", icon: "👤", label: "Compte", desc: "Profil, avatar, email" },
  { href: "/parametres/points", icon: "⭐", label: "Système de points", desc: "Configurer les points et pénalités" },
  { href: "/parametres/integrations", icon: "🔗", label: "Intégrations", desc: "Google Calendar, École Directe" },
];

export default function ParametresPage() {
  const [workStart, setWorkStart] = useState("08:00");
  const [workEnd, setWorkEnd] = useState("22:00");
  const [recapTime, setRecapTime] = useState("21:00");
  const [saved, setSaved] = useState(false);

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

      {/* Préférences générales */}
      <div className="card space-y-4">
        <h3 className="section-title">Préférences générales</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Début de journée</label>
            <input
              type="time"
              value={workStart}
              onChange={(e) => setWorkStart(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Fin de journée</label>
            <input
              type="time"
              value={workEnd}
              onChange={(e) => setWorkEnd(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-300"
            />
          </div>
        </div>

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

        <button onClick={handleSave} className={`btn-primary w-full ${saved ? "!bg-emerald-500" : ""}`}>
          {saved ? "✓ Sauvegardé" : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
