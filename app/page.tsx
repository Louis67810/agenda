"use client";

import Link from "next/link";
import { useAppState } from "@/components/providers/AppStateProvider";
import { computeHabitStreak, formatDisplayDateTime } from "@/lib/app-state";
import { CATEGORY_LABELS } from "@/lib/app-state";

export default function HomePage() {
  const { ready, tasks, habits, objectives, metrics, getObjectiveProgress, today } = useAppState();

  if (!ready) return <div className="text-sm text-gray-400">Chargement...</div>;

  const todayTasks = tasks.filter((task) => task.scheduledStart?.startsWith(today)).sort((a, b) => (a.scheduledStart ?? "").localeCompare(b.scheduledStart ?? ""));
  const todayHabits = habits.map((habit) => ({
    ...habit,
    done: habit.logs.some((log) => log.date === today && log.done),
    streak: computeHabitStreak(habit, today),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title text-gray-900">Taches du jour</h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-600">
              {Math.max(metrics.scheduledTasksToday - metrics.completedTasksToday, 0)} restante{metrics.scheduledTasksToday - metrics.completedTasksToday > 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2">
            {todayTasks.length === 0 ? (
              <div className="p-4 rounded-xl border border-gray-100 text-sm text-gray-400">Aucune tache planifiee aujourd'hui.</div>
            ) : todayTasks.map((task) => (
              <div key={task.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 ${task.status === "done" ? "bg-gray-50/70 border-gray-100 opacity-60" : "bg-white border-gray-100"}`}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${task.status === "done" ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}>
                  {task.status === "done" ? <span className="text-white text-xs">✓</span> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${task.status === "done" ? "line-through text-gray-400" : "text-gray-800"}`}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{formatDisplayDateTime(task.scheduledStart)}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{CATEGORY_LABELS[task.categoryKey]}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-500">{task.importance}/5</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" }}>
            <p className="text-sm font-medium text-blue-100">Agenda</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-5xl font-extrabold leading-none">{metrics.totalPoints}</span>
              <span className="text-blue-200 text-sm font-medium mb-1">pts</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-blue-100 text-xs">
              <span>{metrics.completedTasksToday} taches et {metrics.completedHabitsToday} habitudes validees aujourd'hui</span>
            </div>
          </div>

          <div className="card">
            <p className="text-sm font-bold text-gray-800 mb-4">Resume rapide</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Taches completees</span>
                <span className="text-sm font-bold text-gray-800">{metrics.completedTasksToday}/{metrics.scheduledTasksToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Habitudes</span>
                <span className="text-sm font-bold text-gray-800">{metrics.completedHabitsToday}/{metrics.totalHabits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Objectifs</span>
                <span className="text-sm font-bold text-blue-500">{metrics.objectiveCompletionAverage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Habitudes</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">{metrics.completedHabitsToday}/{metrics.totalHabits}</span>
              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${metrics.totalHabits ? Math.round((metrics.completedHabitsToday / metrics.totalHabits) * 100) : 0}%` }} />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            {todayHabits.map((habit) => (
              <div key={habit.id} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 ${habit.done ? "bg-blue-50/60" : "hover:bg-gray-50"}`}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${habit.done ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}>
                  {habit.done ? <span className="text-white text-xs">✓</span> : null}
                </div>
                <span className="text-base leading-none">{habit.icon}</span>
                <span className={`flex-1 text-sm font-medium ${habit.done ? "text-gray-400 line-through" : "text-gray-700"}`}>{habit.title}</span>
                <span className="text-xs text-gray-400">{habit.streak}j</span>
                <span className="text-blue-400">🔥</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Resume rapide</h3>
            <Link href="/objectifs" className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">Voir tout</Link>
          </div>
          <div className="space-y-5">
            {objectives.map((objective) => {
              const progress = getObjectiveProgress(objective.id);
              return (
                <div key={objective.id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 truncate flex-1 mr-3">{objective.title}</p>
                    <span className="text-xs font-bold text-gray-500 shrink-0">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${objective.color}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
