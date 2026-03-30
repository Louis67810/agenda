"use client";

import { useState } from "react";

export default function PointsSettingsPage() {
  const [config, setConfig] = useState({
    taskBase: 10,
    habitBase: 5,
    penaltyMissed: 15,
    penaltyDuration: 8,
    bonusMultiplier: 1.5,
    bonusDayScore: 5,
  });
  const [saved, setSaved] = useState(false);

  function update(key: keyof typeof config, value: string) {
    setConfig((prev) => ({ ...prev, [key]: Number(value) }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const fields = [
    { key: "taskBase" as const, label: "Points par étoile d'importance (tâche)", unit: "pts/⭐", desc: "Multiplié par l'importance (1-5)" },
    { key: "habitBase" as const, label: "Points par habitude accomplie", unit: "pts", desc: "Par habitude cochée dans le récap" },
    { key: "penaltyMissed" as const, label: "Pénalité tâche ratée", unit: "pts", desc: "Soustrait si une tâche est marquée 'ratée'" },
    { key: "penaltyDuration" as const, label: "Pénalité durée non justifiée", unit: "pts", desc: "Si tu augmentes une durée sans bonne raison" },
    { key: "bonusMultiplier" as const, label: "Multiplicateur objectif complété", unit: "×", desc: "Multiplicateur sur les points quand un objectif est fini à 100%" },
    { key: "bonusDayScore" as const, label: "Bonus note de journée ≥ 8", unit: "pts", desc: "Bonus si ta note de journée est 8 ou plus" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Système de points</h2>
        <p className="text-sm text-gray-400 mt-1">Configure comment les points sont calculés</p>
      </div>

      {/* Preview */}
      <div className="card bg-gradient-to-br from-orange-500 to-amber-500 border-none text-white">
        <p className="text-sm font-medium text-orange-100 mb-2">Exemple de calcul</p>
        <p className="text-xs text-orange-100">
          Tâche importance 3 ⭐ → <strong>{config.taskBase * 3} pts</strong> •
          Tâche importance 5 ⭐ → <strong>{config.taskBase * 5} pts</strong> •
          Tâche ratée → <strong>-{config.penaltyMissed} pts</strong>
        </p>
      </div>

      <div className="card space-y-5">
        <h3 className="section-title">Configuration</h3>
        {fields.map((f) => (
          <div key={f.key}>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-gray-700">{f.label}</label>
              <span className="text-xs text-gray-400">{f.unit}</span>
            </div>
            <input
              type="number"
              value={config[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
              min={0}
              step={f.key === "bonusMultiplier" ? 0.1 : 1}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-300"
            />
            <p className="text-xs text-gray-400 mt-1">{f.desc}</p>
          </div>
        ))}

        <button onClick={handleSave} className={`btn-primary w-full ${saved ? "!bg-emerald-500" : ""}`}>
          {saved ? "✓ Sauvegardé" : "Sauvegarder les paramètres"}
        </button>
      </div>
    </div>
  );
}
