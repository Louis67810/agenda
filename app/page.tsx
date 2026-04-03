"use client";

import Link from "next/link";
import { useAppState } from "@/components/providers/AppStateProvider";
import { CATEGORY_LABELS, computeHabitStreak, formatDisplayDateTime } from "@/lib/app-state";

export default function HomePage() {
  const { ready, tasks, habits, objectives, metrics, getObjectiveProgress, today } = useAppState();

  if (!ready) {
    return <div className="max-w-6xl mx-auto text-sm text-gray-400">Chargement de l'application...</div>;
  }

  const todayTasks = tasks
    .filter((task) => task.scheduledStart?.startsWith(today))
    .sort((a, b) => (a.scheduledStart ?? "").localeCompare(b.scheduledStart ?? ""));
  const todayHabits = habits.map((habit) => ({
    ...habit,
    done: habit.logs.some((log) => log.date === today && log.done),
    streak: computeHabitStreak(habit, today),
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Version connectee de l'agenda</h2>
          <p className="text-sm text-gray-500 mt-1">
            Taches, objectifs, habitudes, recap et performances partagent maintenant la meme base locale.
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 px-5 py-4 text-white shadow-sm">
          <p className="text-xs uppercase tracking-wide text-orange-100">Points cumules</p>
          <p className="text-4xl font-extrabold">{metrics.totalPoints}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-gray-400">Taches du jour</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {metrics.completedTasksToday}/{metrics.scheduledTasksToday}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Habitudes validees</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {metrics.completedHabitsToday}/{metrics.totalHabits}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Objectifs actifs</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{objectives.filter((item) => item.status === "active").length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Progression moyenne</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{metrics.objectiveCompletionAverage}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Agenda du jour</h3>
            <Link href="/agenda" className="text-sm text-orange-500 hover:text-orange-600">
              Ouvrir l'agenda
            </Link>
          </div>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune tache planifiee aujourd'hui.</p>
            ) : (
              todayTasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-gray-100 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-800">{task.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDisplayDateTime(task.scheduledStart)}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-500">{CATEGORY_LABELS[task.categoryKey]}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Habitudes du jour</h3>
            <Link href="/habitudes" className="text-sm text-orange-500 hover:text-orange-600">
              Gerer
            </Link>
          </div>
          <div className="space-y-3">
            {todayHabits.map((habit) => (
              <div key={habit.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{habit.icon}</span>
                  <div>
                    <p className={`font-medium ${habit.done ? "text-gray-400 line-through" : "text-gray-800"}`}>{habit.title}</p>
                    <p className="text-xs text-gray-400">{habit.streak} jours de suite</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold ${habit.done ? "text-emerald-600" : "text-gray-400"}`}>
                  {habit.done ? "faite" : "a faire"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Objectifs connectes</h3>
          <Link href="/objectifs" className="text-sm text-orange-500 hover:text-orange-600">
            Voir les objectifs
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {objectives.map((objective) => {
            const progress = getObjectiveProgress(objective.id);
            const linkedTasks = tasks.filter((task) => task.objectiveId === objective.id);
            return (
              <div key={objective.id} className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{objective.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{linkedTasks.length} taches reliees</p>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{progress}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full ${objective.color}`} style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

