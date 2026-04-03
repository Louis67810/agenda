"use client";

import { useState } from "react";

// ─── Config (would come from params in a real app) ─────────────────────────
const TASKS_TOTAL_POINTS = 6; // configurable in /parametres

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
  const [submitted, setSubmitted] = useState(false);
  const totalSteps = 4;

  // Step 1 — Tasks
  const [taskStatuses, setTaskStatuses] = useState<Record<number, TaskStatus>>({});
  const [justifications, setJustifications] = useState<Record<number, string>>({});
  const [justified, setJustified] = useState<Record<number, boolean | null>>({});

  // Step 2 — Habits
  const [habitDone, setHabitDone] = useState<Record<number, boolean>>({});
  const [habitValues, setHabitValues] = useState<Record<number, string>>({});

  // Step 3 — Bilan
  const [dayScore, setDayScore] = useState(7);
  const [mood, setMood] = useState("");
  const [moodNote, setMoodNote] = useState("");
  const [videoNote, setVideoNote] = useState("");

  // ─── Points calculation (new system) ──────────────────────────────────────
  const doneTasksCount = Object.values(taskStatuses).filter((s) => s === "done").length;
  const missedTasksCount = Object.values(taskStatuses).filter((s) => s === "missed").length;
  const doneHabitsCount = Object.values(habitDone).filter(Boolean).length;

  // Tasks: proportional share of TASKS_TOTAL_POINTS
  const taskCompletionRatio = todayTasks.length > 0 ? doneTasksCount / todayTasks.length : 0;
  const taskPoints = Math.round(TASKS_TOTAL_POINTS * taskCompletionRatio * 10) / 10;

  // Habits: 1 point each
  const habitPoints = doneHabitsCount;

  // Deductions: 0.5 per unjustified time addition
  const unjustifiedCount = todayTasks.filter(
    (t) => t.durationIncreased && taskStatuses[t.id] === "done" && justified[t.id] === false
  ).length;
  const deductions = unjustifiedCount * 0.5;

  const netPoints = Math.max(0, taskPoints + habitPoints - deductions);
  const totalBase = 2890;

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center space-y-6 py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Récap validé !</h2>
            <p className="text-gray-400 text-sm mt-2">Belle journée. Continue comme ça !</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold mb-1">Tâches</p>
              <p className="text-2xl font-bold text-blue-600">+{taskPoints}</p>
              <p className="text-[10px] text-gray-400">{doneTasksCount}/{todayTasks.length} faites</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs text-emerald-600 font-semibold mb-1">Habitudes</p>
              <p className="text-2xl font-bold text-emerald-600">+{habitPoints}</p>
              <p className="text-[10px] text-gray-400">{doneHabitsCount}/{todayHabits.length} faites</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold mb-1">Net du jour</p>
              <p className="text-2xl font-bold text-blue-600">+{netPoints}</p>
              <p className="text-[10px] text-gray-400">
                {deductions > 0 ? `-${deductions} pénalités` : "Aucune pénalité"}
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-100">
            <p className="text-xs text-gray-400 mb-1">Score total</p>
            <div className="flex items-end gap-2 justify-center">
              <span className="text-5xl font-extrabold text-blue-500">
                {(totalBase + netPoints).toFixed(1).replace(".0", "")}
              </span>
              <span className="text-gray-400 mb-1">pts</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {doneTasksCount}/{todayTasks.length} tâches · {doneHabitsCount}/{todayHabits.length} habitudes · {dayScore}/10
            </p>
          </div>
          {videoNote && (
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-left">
              <p className="text-xs font-semibold text-violet-600 mb-1">📹 Note vidéo enregistrée</p>
              <p className="text-xs text-gray-500">{videoNote}</p>
            </div>
          )}
          <button
            onClick={() => { setSubmitted(false); setStep(1); setTaskStatuses({}); setHabitDone({}); setMood(""); setDayScore(7); setMoodNote(""); setVideoNote(""); }}
            className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            Recommencer
          </button>
        </div>
      </div>
    );
  }

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
            <button
              onClick={() => i + 1 < step && setStep(i + 1)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i + 1 < step
                  ? "bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600"
                  : i + 1 === step
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-400 cursor-default"
              }`}
            >
              {i + 1 < step ? "✓" : i + 1}
            </button>
            {i < totalSteps - 1 && (
              <div className={`h-0.5 w-16 rounded-full ${i + 1 < step ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
        <span className="ml-2 text-sm text-gray-400">Étape {step}/{totalSteps}</span>
      </div>

      {/* Step 1 — Tâches */}
      {step === 1 && (
        <div className="card space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="section-title">Tâches du jour</h3>
              <p className="text-sm text-gray-400 mt-0.5">Comment s&apos;est passée chaque tâche ?</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Points tâches</p>
              <p className="text-lg font-bold text-blue-500">+{taskPoints}</p>
              <p className="text-[10px] text-gray-400">/{TASKS_TOTAL_POINTS} max</p>
            </div>
          </div>
          {todayTasks.map((task) => (
            <div key={task.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{task.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{task.time}</p>
                </div>
                {task.durationIncreased && (
                  <span className="badge-blue text-[10px]">+{task.addedMinutes} min</span>
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
                  <p className="text-xs text-gray-500">Tu as ajouté +{task.addedMinutes} min. Pourquoi ?</p>
                  <textarea
                    value={justifications[task.id] || ""}
                    onChange={(e) => setJustifications((p) => ({ ...p, [task.id]: e.target.value }))}
                    placeholder="Explique brièvement..."
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 resize-none h-16 focus:outline-none focus:border-blue-300"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setJustified((p) => ({ ...p, [task.id]: true }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${justified[task.id] === true ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-500 border-gray-200"}`}
                    >
                      Oui, c&apos;était justifié
                    </button>
                    <button
                      onClick={() => setJustified((p) => ({ ...p, [task.id]: false }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${justified[task.id] === false ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-500 border-gray-200"}`}
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
          <div className="flex items-start justify-between">
            <div>
              <h3 className="section-title">Habitudes du jour</h3>
              <p className="text-sm text-gray-400 mt-0.5">Chaque habitude accomplie = 1 point</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Points habitudes</p>
              <p className="text-lg font-bold text-emerald-500">+{doneHabitsCount}</p>
              <p className="text-[10px] text-gray-400">/{todayHabits.length} max</p>
            </div>
          </div>
          {todayHabits.map((h) => (
            <div
              key={h.id}
              className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all cursor-pointer ${
                habitDone[h.id] ? "border-emerald-200 bg-emerald-50" : "border-gray-100 bg-white hover:border-gray-200"
              }`}
              onClick={() => setHabitDone((p) => ({ ...p, [h.id]: !p[h.id] }))}
            >
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${habitDone[h.id] ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}>
                {habitDone[h.id] && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-lg">{h.icon}</span>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">{h.name}</span>
              </div>
              <span className="text-xs font-bold text-emerald-600">+1 pt</span>
              {h.hasTarget && (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="number"
                    value={habitValues[h.id] || ""}
                    onChange={(e) => setHabitValues((p) => ({ ...p, [h.id]: e.target.value }))}
                    placeholder="0"
                    className="w-20 text-xs border border-gray-200 rounded-lg p-1.5 text-center focus:outline-none focus:border-blue-300"
                  />
                  <span className="text-xs text-gray-400">{h.unit}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 3 — Bilan + Vidéo */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="card space-y-5">
            <h3 className="section-title">Bilan de ta journée</h3>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">Note de la journée</p>
                <span className="text-2xl font-extrabold text-blue-500">{dayScore}/10</span>
              </div>
              <input
                type="range" min={1} max={10} value={dayScore}
                onChange={(e) => setDayScore(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Horrible</span><span>Excellent</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Comment tu t&apos;es senti ?</p>
              <div className="flex gap-2">
                {moods.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all ${
                      mood === m.value ? "border-orange-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] text-gray-500">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Note libre (optionnel)</p>
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Qu'est-ce qui s'est bien passé ? Qu'est-ce que tu veux améliorer ?"
                className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none h-24 focus:outline-none focus:border-blue-300"
              />
            </div>
          </div>

          {/* Section Vidéo */}
          <div className="card space-y-3">
            <div>
              <h3 className="section-title">📹 Vidéo du jour</h3>
              <p className="text-xs text-gray-400 mt-1">Enregistre une courte vidéo pour te souvenir de ta journée</p>
            </div>
            <div className="bg-violet-50 border-2 border-dashed border-violet-200 rounded-xl p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-violet-700">Fonctionnalité en cours de développement</p>
                <p className="text-xs text-gray-400 mt-1">L&apos;enregistrement vidéo sera disponible prochainement via Supabase Storage</p>
              </div>
              <input
                type="text"
                value={videoNote}
                onChange={(e) => setVideoNote(e.target.value)}
                placeholder="En attendant, ajoute une note écrite sur ta journée..."
                className="w-full text-sm border border-violet-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-violet-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4 — Résumé */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="section-title mb-4">Résumé des points</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <div>
                  <span className="text-sm text-orange-700 font-medium">Tâches</span>
                  <p className="text-xs text-blue-500 mt-0.5">
                    {doneTasksCount}/{todayTasks.length} faites → {Math.round(taskCompletionRatio * 100)}% × {TASKS_TOTAL_POINTS} pts
                  </p>
                </div>
                <span className="text-lg font-extrabold text-blue-600">+{taskPoints}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                <div>
                  <span className="text-sm text-emerald-700 font-medium">Habitudes</span>
                  <p className="text-xs text-emerald-500 mt-0.5">{doneHabitsCount} × 1 pt chacune</p>
                </div>
                <span className="text-lg font-extrabold text-emerald-600">+{habitPoints}</span>
              </div>
              {deductions > 0 && (
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                  <div>
                    <span className="text-sm text-red-600 font-medium">Pénalités</span>
                    <p className="text-xs text-red-400 mt-0.5">{unjustifiedCount} ajout(s) de temps non justifié(s)</p>
                  </div>
                  <span className="text-lg font-extrabold text-red-500">-{deductions}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-sm text-blue-700 font-semibold">Net du jour</span>
                <span className="text-xl font-extrabold text-blue-600">+{netPoints}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title mb-3">Score total</h3>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-extrabold text-blue-500">
                {(totalBase + netPoints).toFixed(1).replace(".0", "")}
              </span>
              <span className="text-gray-400 mb-1">pts</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {doneTasksCount}/{todayTasks.length} tâches · {doneHabitsCount}/{todayHabits.length} habitudes · Note {dayScore}/10
            </p>
          </div>

          <button onClick={() => setSubmitted(true)} className="btn-primary w-full py-3 text-base">
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
          <button onClick={() => setStep((s) => s + 1)} className="btn-primary flex-1">
            {step === 3 ? "Voir le résumé →" : "Suivant →"}
          </button>
        </div>
      )}
    </div>
  );
}
