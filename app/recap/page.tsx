"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/components/providers/AppStateProvider";

const MOODS = [
  { value: "great", label: "Super" },
  { value: "good", label: "Bien" },
  { value: "neutral", label: "Neutre" },
  { value: "bad", label: "Pas top" },
  { value: "terrible", label: "Mauvais" },
] as const;

export default function RecapPage() {
  const { ready, today, tasks, habits, adjustments, recaps, submitRecap } = useAppState();
  const todayTasks = useMemo(() => tasks.filter((task) => task.scheduledStart?.startsWith(today)), [tasks, today]);
  const todayAdjustments = adjustments.filter((entry) => entry.date === today);
  const existingRecap = recaps.find((entry) => entry.date === today);

  const [taskStatuses, setTaskStatuses] = useState<Record<string, "todo" | "in_progress" | "done">>({});
  const [habitState, setHabitState] = useState<Record<string, { done: boolean; value?: number }>>({});
  const [dayScore, setDayScore] = useState(existingRecap?.dayScore ?? 7);
  const [mood, setMood] = useState<typeof MOODS[number]["value"]>(existingRecap?.mood ?? "good");
  const [moodNote, setMoodNote] = useState(existingRecap?.moodNote ?? "");
  const [adjustmentFeedback, setAdjustmentFeedback] = useState<Record<string, { justification?: string; justified?: boolean }>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!ready) return <div className="text-sm text-gray-400">Chargement du recap...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Recap quotidien</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ce recap met a jour directement les taches, les habitudes et les points de la journee.
        </p>
      </div>

      <div className="card space-y-4">
        <h3 className="section-title">Taches du jour</h3>
        {todayTasks.map((task) => (
          <div key={task.id} className="rounded-xl border border-gray-100 px-4 py-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gray-800">{task.title}</p>
                <p className="text-xs text-gray-400 mt-1">Statut actuel : {task.status}</p>
              </div>
              <select
                value={taskStatuses[task.id] ?? task.status}
                onChange={(e) => setTaskStatuses((prev) => ({ ...prev, [task.id]: e.target.value as "todo" | "in_progress" | "done" }))}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="todo">A faire</option>
                <option value="in_progress">En cours</option>
                <option value="done">Terminee</option>
              </select>
            </div>
            {todayAdjustments.filter((entry) => entry.taskId === task.id).map((entry) => (
              <div key={entry.id} className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-3">
                <p className="text-sm text-amber-700">+{entry.addedMinutes} minutes ajoutees aujourd'hui</p>
                <textarea
                  value={adjustmentFeedback[task.id]?.justification ?? ""}
                  onChange={(e) => setAdjustmentFeedback((prev) => ({ ...prev, [task.id]: { ...prev[task.id], justification: e.target.value } }))}
                  placeholder="Pourquoi as-tu ajoute du temps ?"
                  className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm h-20"
                />
                <div className="flex gap-2">
                  <button onClick={() => setAdjustmentFeedback((prev) => ({ ...prev, [task.id]: { ...prev[task.id], justified: true } }))} className={`rounded-xl px-3 py-2 text-sm ${adjustmentFeedback[task.id]?.justified === true ? "bg-emerald-500 text-white" : "border border-gray-200 text-gray-600"}`}>
                    Justifie
                  </button>
                  <button onClick={() => setAdjustmentFeedback((prev) => ({ ...prev, [task.id]: { ...prev[task.id], justified: false } }))} className={`rounded-xl px-3 py-2 text-sm ${adjustmentFeedback[task.id]?.justified === false ? "bg-red-500 text-white" : "border border-gray-200 text-gray-600"}`}>
                    Non justifie
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="card space-y-4">
        <h3 className="section-title">Habitudes du jour</h3>
        {habits.map((habit) => {
          const currentLog = habit.logs.find((log) => log.date === today);
          const current = habitState[habit.id] ?? { done: currentLog?.done ?? false, value: currentLog?.value };
          return (
            <div key={habit.id} className="rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{habit.icon}</span>
                <div>
                  <p className="font-medium text-gray-800">{habit.title}</p>
                  <p className="text-xs text-gray-400">+{habit.points} points</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {habit.targetValue && (
                  <input
                    type="number"
                    value={current.value ?? ""}
                    onChange={(e) => setHabitState((prev) => ({ ...prev, [habit.id]: { ...current, value: Number(e.target.value) } }))}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-28"
                  />
                )}
                <button onClick={() => setHabitState((prev) => ({ ...prev, [habit.id]: { ...current, done: !current.done } }))} className={`rounded-xl px-3 py-2 text-sm ${current.done ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-600"}`}>
                  {current.done ? "Faite" : "A faire"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card space-y-4">
        <h3 className="section-title">Bilan</h3>
        <input type="range" min={1} max={10} value={dayScore} onChange={(e) => setDayScore(Number(e.target.value))} className="w-full accent-orange-500" />
        <p className="text-sm text-gray-500">Note du jour : {dayScore}/10</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((entry) => (
            <button key={entry.value} onClick={() => setMood(entry.value)} className={`rounded-xl px-4 py-2 text-sm ${mood === entry.value ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-600"}`}>
              {entry.label}
            </button>
          ))}
        </div>
        <textarea value={moodNote} onChange={(e) => setMoodNote(e.target.value)} placeholder="Ce que tu retiens de ta journee" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm h-28" />
      </div>

      <div className="flex justify-end">
        <button
          className="btn-primary"
          onClick={() => {
            submitRecap({
              date: today,
              taskStatuses,
              habits: habitState,
              dayScore,
              mood,
              moodNote,
              adjustments: adjustmentFeedback,
            });
            setSubmitted(true);
          }}
        >
          Valider le recap
        </button>
      </div>

      {submitted && <div className="card text-sm text-emerald-600">Le recap a ete enregistre et les donnees du reste de l'application ont ete mises a jour.</div>}
    </div>
  );
}

