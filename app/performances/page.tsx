"use client";

import { useAppState } from "@/components/providers/AppStateProvider";
import { formatDisplayDate } from "@/lib/app-state";

export default function PerformancesPage() {
  const { ready, dailyPoints, tasks, habits, objectives, metrics, getObjectiveProgress } = useAppState();

  if (!ready) return <div className="text-sm text-gray-400">Chargement des performances...</div>;

  const scoreHistory = dailyPoints.slice(-30);
  const maxScore = Math.max(...scoreHistory.map((day) => Math.max(day.total, 1)), 1);
  const taskRate = tasks.length ? Math.round((tasks.filter((task) => task.status === "done").length / tasks.length) * 100) : 0;
  const habitRate = habits.length ? Math.round((habits.filter((habit) => habit.logs.some((log) => log.done)).length / habits.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Performances</h2>
          <p className="text-sm text-gray-400 mt-1">Suivi de tes progres et statistiques</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card"><p className="text-xs text-gray-400 font-medium">Score total</p><div className="flex items-end gap-1 mt-2"><span className="text-3xl font-extrabold text-blue-500">{metrics.totalPoints}</span><span className="text-gray-400 text-sm mb-1">pts</span></div><p className="text-xs text-gray-400 mt-1">Calcul reel</p></div>
        <div className="card"><p className="text-xs text-gray-400 font-medium">Taches</p><div className="flex items-end gap-1 mt-2"><span className="text-3xl font-extrabold text-emerald-500">{taskRate}</span><span className="text-gray-400 text-sm mb-1">%</span></div><p className="text-xs text-gray-400 mt-1">Taux de completion</p></div>
        <div className="card"><p className="text-xs text-gray-400 font-medium">Habitudes</p><div className="flex items-end gap-1 mt-2"><span className="text-3xl font-extrabold text-blue-500">{habitRate}</span><span className="text-gray-400 text-sm mb-1">%</span></div><p className="text-xs text-gray-400 mt-1">Habitudes suivies</p></div>
        <div className="card"><p className="text-xs text-gray-400 font-medium">Objectifs</p><div className="flex items-end gap-1 mt-2"><span className="text-3xl font-extrabold text-violet-500">{metrics.objectiveCompletionAverage}</span><span className="text-gray-400 text-sm mb-1">%</span></div><p className="text-xs text-gray-400 mt-1">Progression moyenne</p></div>
      </div>

      <div className="card">
        <h3 className="section-title mb-4">Evolution du score</h3>
        <div className="flex items-end gap-1 h-32">{scoreHistory.map((day) => <div key={day.date} className="flex-1 flex flex-col items-center justify-end"><div className="w-full rounded-t-sm bg-blue-400 opacity-80 hover:opacity-100 transition-opacity cursor-pointer" style={{ height: `${(day.total / maxScore) * 100}%` }} title={`${day.date} - ${day.total} pts`} /></div>)}</div>
        <div className="flex justify-between mt-1 text-xs text-gray-400"><span>Il y a 30 jours</span><span>Aujourd'hui</span></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="section-title mb-4">Taches terminees / jour</h3>
          <div className="space-y-2">{scoreHistory.slice(-8).map((day, index) => <div key={day.date} className="flex items-center gap-3"><span className="text-xs text-gray-400 w-6">S{index + 1}</span><div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden"><div className="h-full bg-blue-400 rounded-full flex items-center justify-end pr-2 transition-all" style={{ width: `${day.tasksTotal ? (day.tasksDone / day.tasksTotal) * 100 : 0}%` }}><span className="text-[10px] text-white font-bold">{day.tasksDone}</span></div></div><span className="text-xs text-gray-400 w-8">/{day.tasksTotal}</span></div>)}</div>
        </div>
        <div className="card">
          <h3 className="section-title mb-4">Progression des objectifs</h3>
          <div className="space-y-4">{objectives.map((objective) => { const progress = getObjectiveProgress(objective.id); return <div key={objective.id}><div className="flex justify-between items-center mb-1"><span className="text-sm text-gray-700 font-medium">{objective.title}</span><span className="text-xs font-bold text-gray-500">{progress}%</span></div><div className="progress-bar"><div className={`progress-fill ${objective.color}`} style={{ width: `${progress}%` }} /></div></div>; })}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-4">Points par jour</h3>
        <div className="grid grid-cols-10 gap-1.5">{scoreHistory.map((day) => { const intensity = Math.min(day.total / 50, 1); const colorClass = intensity >= 0.8 ? "bg-emerald-500" : intensity >= 0.6 ? "bg-emerald-300" : intensity >= 0.4 ? "bg-amber-300" : intensity >= 0.2 ? "bg-orange-300" : "bg-gray-100"; return <div key={day.date} className={`aspect-square rounded-lg ${colorClass} flex items-center justify-center`} title={`${formatDisplayDate(day.date)} - ${day.total} pts`}><span className={`text-[10px] font-bold ${intensity >= 0.4 ? "text-white" : "text-gray-500"}`}>{new Date(`${day.date}T12:00:00`).getDate()}</span></div>; })}</div>
      </div>
    </div>
  );
}
