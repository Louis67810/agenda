"use client";

import { useAppState } from "@/components/providers/AppStateProvider";
import { formatDisplayDate } from "@/lib/app-state";

export default function PerformancesPage() {
  const { ready, dailyPoints, tasks, habits, objectives, metrics, getObjectiveProgress } = useAppState();

  if (!ready) return <div className="text-sm text-gray-400">Chargement des performances...</div>;

  const lastDays = dailyPoints.slice(-14);
  const maxValue = Math.max(...lastDays.map((day) => Math.max(day.total, 1)), 1);
  const taskCompletionRate = tasks.length === 0 ? 0 : Math.round((tasks.filter((task) => task.status === "done").length / tasks.length) * 100);
  const habitCompletionRate = habits.length === 0 ? 0 : Math.round((habits.filter((habit) => habit.logs.some((log) => log.done)).length / habits.length) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Performances</h1>
        <p className="text-sm text-gray-500 mt-1">
          Les statistiques sont maintenant calculees a partir des vraies taches terminees, habitudes validees et recaps enregistres.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card"><p className="text-xs text-gray-400">Points totaux</p><p className="text-3xl font-bold text-gray-800 mt-2">{metrics.totalPoints}</p></div>
        <div className="card"><p className="text-xs text-gray-400">Taches terminees</p><p className="text-3xl font-bold text-gray-800 mt-2">{taskCompletionRate}%</p></div>
        <div className="card"><p className="text-xs text-gray-400">Habitudes actives</p><p className="text-3xl font-bold text-gray-800 mt-2">{habitCompletionRate}%</p></div>
        <div className="card"><p className="text-xs text-gray-400">Objectifs</p><p className="text-3xl font-bold text-gray-800 mt-2">{metrics.objectiveCompletionAverage}%</p></div>
      </div>

      <div className="card">
        <h3 className="section-title mb-4">Points par jour</h3>
        <div className="flex items-end gap-2 h-56">
          {lastDays.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col justify-end items-center gap-2">
              <div className="w-full rounded-t-xl bg-orange-400" style={{ height: `${Math.max((day.total / maxValue) * 180, 8)}px` }} />
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700">{day.total}</p>
                <p className="text-[10px] text-gray-400">{new Date(`${day.date}T12:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-3">
          <h3 className="section-title">Detail des derniers jours</h3>
          {lastDays.slice().reverse().map((day) => (
            <div key={day.date} className="rounded-xl border border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-800">{formatDisplayDate(day.date)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {day.tasksDone}/{day.tasksTotal} taches · {day.habitsDone} habitudes
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-gray-800">{day.total} pts</p>
                  <p className="text-xs text-gray-400">{day.taskPoints} taches · {day.habitPoints} habitudes</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card space-y-3">
          <h3 className="section-title">Progression des objectifs</h3>
          {objectives.map((objective) => {
            const progress = getObjectiveProgress(objective.id);
            return (
              <div key={objective.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{objective.title}</span>
                  <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
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

