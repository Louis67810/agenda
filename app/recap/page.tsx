"use client";

import { useState } from "react";

const todayTasks = [
  { id: 1, title: "Préparer la présentation client", time: "09:00 - 10:30", durationIncreased: true, addedMinutes: 30 },
  { id: 2, title: "Répondre aux emails urgents", time: "11:00 - 11:30", durationIncreased: false, addedMinutes: 0 },
  { id: 3, title: "Acheter des courses", time: "18:00 - 19:00", durationIncreased: false, addedMinutes: 0 },
];

const todayHabits = [
  { id: 1, name: "Marcher 10 000 pas", icon: "🚶", hasTarget: true, target: 10000, unit: "pas" },
  { id: 2, name: "Lire 30 min", icon: "📖", hasTarget: false },
  { id: 3, name: "Sport", icon: "💪", hasTarget: false },
  { id: 4, name: "Méditer", icon: "🧘", hasTarget: false },
  { id: 5, name: "Boire 2L d'eau", icon: "💧", hasTarget: true, target: 2, unit: "L" },
];

const moods = [
  { emoji: "😄", label: "Super", value: "great" },
  { emoji: "🙂", label: "Bien", value: "good" },
  { emoji: "😐", label: "Neutre", value: "neutral" },
  { emoji: "😔", label: "Pas top", value: "bad" },
  { emoji: "😞", label: "Mauvais", value: "terrible" },
];

type TaskStatus = "done" | "missed" | "postponed" | null;

export default function RecapPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Step 1 state
  const [taskStatuses, setTaskStatuses] = useState<Record<number, TaskStatus>>({});
  const [justifications, setJustifications] = useState<Record<number, string>>({});
  const [justified, setJustified] = useState<Record<number, boolean>>({});

  // Step 2 state
  const [habitDone, setHabitDone] = useState<Record<number, boolean>>({});
  const [habitValues, setHabitValues] = useState<Record<number, string>>({});

  // Step 3 state
  const [dayScore, setDayScore] = useState(7);
  const [mood, setMood] = useState("");
  const [moodNote, setMoodNote] = useState("");

  const pointsGained =
    Object.values(taskStatuses).filter((s) => s === "done").length * 25 +
    Object.values(habitDone).filter(Boolean).length * 10;

  const pointsLost =
    Object.values(taskStatuses).filter((s) => s === "missed").length * 15 +
    todayTasks
      .filter((t) => t.durationIncreased && taskStatuses[t.id] === "done" && justified[t.id] === false)
      .length * 8;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Récap de journée</h2>
        <p className="text-sm text-gray-400 mt-1">Prends 5 minutes pour faire le bilan de ta journée</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i + 1 < step
                  ? "bg-emerald-500 text-white"
                  : i + 1 === step
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i + 1 < step ? "✓" : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={`h-0.5 w-16 rounded-full ${i + 1 < step ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
        <span className="ml-2 text-sm text-gray-400">
          Étape {step}/{totalSteps}
        </span>
      </div>

      {/* Step 1 — Tâches */}
      {step === 1 && (
        <div className="card space-y-4">
          <h3 className="section-title">Tâches du jour</h3>
          <p className="text-sm text-gray-400">Comment s&apos;est passée chaque tâche ?</p>
          {todayTasks.map((task) => (
            <div key={task.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{task.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{task.time}</p>
                </div>
                {task.durationIncreased && (
                  <span className="badge-orange text-[10px]">+{task.addedMinutes} min</span>
                )}
              </div>
              <div className="flex gap-2">
                {(["done", "missed", "postponed"] as TaskStatus[]).map((s) => (
                  <button
                    key={s as string}
                    onClick={() => setTaskStatuses((prev) => ({ ...prev, [task.id]: s }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      taskStatuses[task.id] === s
                        ? s === "done"
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : s === "missed"
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {s === "done" ? "✓ Terminée" : s === "missed" ? "✗ Ratée" : "→ Reportée"}
                  </button>
                ))}
              </div>
              {task.durationIncreased && taskStatuses[task.id] === "done" && (
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Tu as ajouté +{task.addedMinutes} min. Pourquoi ?
                  </p>
                  <textarea
                    value={justifications[task.id] || ""}
                    onChange={(e) => setJustifications((p) => ({ ...p, [task.id]: e.target.value }))}
                    placeholder="Explique brièvement..."
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 resize-none h-16 focus:outline-none focus:border-orange-300"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setJustified((p) => ({ ...p, [task.id]: true }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        justified[task.id] === true
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-gray-500 border-gray-200"
                      }`}
                    >
                      Oui, c&apos;était justifié
                    </button>
                    <button
                      onClick={() => setJustified((p) => ({ ...p, [task.id]: false }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        justified[task.id] === false
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-white text-gray-500 border-gray-200"
                      }`}
                    >
                      Non, pas vraiment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 2 — Habitudes */}
      {step === 2 && (
        <div className="card space-y-4">
          <h3 className="section-title">Habitudes du jour</h3>
          <p className="text-sm text-gray-400">Qu&apos;est-ce que tu as accompli aujourd&apos;hui ?</p>
          {todayHabits.map((h) => (
            <div
              key={h.id}
              className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
                habitDone[h.id] ? "border-emerald-200 bg-emerald-50" : "border-gray-100 bg-white"
              }`}
            >
              <button
                onClick={() => setHabitDone((p) => ({ ...p, [h.id]: !p[h.id] }))}
                className={`check-box shrink-0 ${habitDone[h.id] ? "check-box-done" : "check-box-pending"}`}
              >
                {habitDone[h.id] && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-lg">{h.icon}</span>
              <span className="flex-1 text-sm font-medium text-gray-700">{h.name}</span>
              {h.hasTarget && (
                <input
                  type="number"
                  value={habitValues[h.id] || ""}
                  onChange={(e) => setHabitValues((p) => ({ ...p, [h.id]: e.target.value }))}
                  placeholder="0"
                  className="w-20 text-xs border border-gray-200 rounded-lg p-1.5 text-center focus:outline-none focus:border-orange-300"
                />
              )}
              {h.hasTarget && <span className="text-xs text-gray-400">{h.unit}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Step 3 — Bilan */}
      {step === 3 && (
        <div className="card space-y-5">
          <h3 className="section-title">Bilan de ta journée</h3>

          {/* Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">Note de la journée</p>
              <span className="text-2xl font-extrabold text-orange-500">{dayScore}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={dayScore}
              onChange={(e) => setDayScore(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Horrible</span><span>Excellent</span>
            </div>
          </div>

          {/* Mood */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Comment tu t&apos;es senti ?</p>
            <div className="flex gap-2">
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all ${
                    mood === m.value
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] text-gray-500">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note libre */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Note libre (optionnel)</p>
            <textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Qu'est-ce qui s'est bien passé ? Qu'est-ce que tu veux améliorer ?"
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none h-24 focus:outline-none focus:border-orange-300"
            />
          </div>
        </div>
      )}

      {/* Step 4 — Résumé */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="section-title mb-4">Résumé des points</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                <span className="text-sm text-emerald-700 font-medium">Points gagnés</span>
                <span className="text-lg font-extrabold text-emerald-600">+{pointsGained}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                <span className="text-sm text-red-600 font-medium">Points perdus</span>
                <span className="text-lg font-extrabold text-red-500">-{pointsLost}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-200">
                <span className="text-sm text-orange-700 font-semibold">Net du jour</span>
                <span className={`text-xl font-extrabold ${pointsGained - pointsLost >= 0 ? "text-orange-500" : "text-red-500"}`}>
                  {pointsGained - pointsLost >= 0 ? "+" : ""}{pointsGained - pointsLost}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title mb-3">Score total</h3>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-extrabold text-orange-500">2 890</span>
              <span className="text-gray-400 mb-1">pts</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Tâches terminées : {Object.values(taskStatuses).filter((s) => s === "done").length}/{todayTasks.length} •{" "}
              Habitudes : {Object.values(habitDone).filter(Boolean).length}/{todayHabits.length} •{" "}
              Note du jour : {dayScore}/10
            </p>
          </div>

          <button className="btn-primary w-full py-3 text-base">
            Valider le récap ✓
          </button>
        </div>
      )}

      {/* Navigation */}
      {step < 4 && (
        <div className="flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} className="btn-ghost flex-1">
              ← Précédent
            </button>
          )}
          <button
            onClick={() => setStep((s) => s + 1)}
            className="btn-primary flex-1"
          >
            {step === 3 ? "Voir le résumé →" : "Suivant →"}
          </button>
        </div>
      )}
    </div>
  );
}
