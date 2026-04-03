"use client";

import { useState } from "react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { OBJECTIVE_COLORS, formatDuration, formatDisplayDateTime } from "@/lib/app-state";
import type { TaskCategory } from "@/lib/mock-data";

const CATS: { key: TaskCategory; label: string }[] = [
  { key: "travail", label: "Travail" },
  { key: "sport", label: "Sport" },
  { key: "etudes", label: "Etudes" },
  { key: "personnel", label: "Personnel" },
  { key: "creativite", label: "Creativite" },
  { key: "finance", label: "Finance" },
  { key: "sante", label: "Sante" },
  { key: "social", label: "Social" },
];

export default function ObjectifsPage() {
  const { ready, objectives, createObjective, updateObjective, deleteObjective, createTask, getObjectiveProgress, getObjectiveTasks, today } = useAppState();
  const [openCreate, setOpenCreate] = useState(false);
  const [taskForObjective, setTaskForObjective] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", importance: 3, deadline: today, color: "bg-blue-500", categoryKey: "travail" as TaskCategory, status: "active" as const });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", importance: 3, durationMinutes: 60, deadline: today });

  if (!ready) return <div className="text-sm text-gray-400">Chargement des objectifs...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Objectifs</h1>
          <p className="text-sm text-gray-400 mt-1">Suivez vos objectifs et leur progression</p>
        </div>
        <button onClick={() => setOpenCreate((value) => !value)} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Nouvel objectif
        </button>
      </div>

      {openCreate && (
        <div className="card space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Titre *</label>
            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none h-20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.categoryKey} onChange={(e) => setForm((p) => ({ ...p, categoryKey: e.target.value as TaskCategory }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400">
              {CATS.map((cat) => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as typeof form.status }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400">
              <option value="active">En cours</option><option value="paused">En pause</option><option value="completed">Termine</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
            <select value={form.importance} onChange={(e) => setForm((p) => ({ ...p, importance: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400">
              {[1,2,3,4,5].map((n) => <option key={n} value={n}>Importance {n}/5</option>)}
            </select>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {OBJECTIVE_COLORS.map((color) => <button key={color} type="button" onClick={() => setForm((p) => ({ ...p, color }))} className={`w-6 h-6 rounded-full ${color} ${form.color === color ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : "hover:scale-110"}`} />)}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpenCreate(false)} className="btn-ghost flex-1">Annuler</button>
            <button type="button" onClick={() => { if (!form.title.trim()) return; createObjective({ ...form, title: form.title.trim(), description: form.description.trim() }); setOpenCreate(false); setForm({ title: "", description: "", importance: 3, deadline: today, color: "bg-blue-500", categoryKey: "travail", status: "active" }); }} className="btn-primary flex-1">Creer l'objectif</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {objectives.map((objective) => {
          const progress = getObjectiveProgress(objective.id);
          const objectiveTasks = getObjectiveTasks(objective.id);
          const showTaskForm = taskForObjective === objective.id;
          return (
            <div key={objective.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200">
              <div className={`h-1.5 ${objective.color}`} />
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-800">{objective.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{objective.description}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <select value={objective.status} onChange={(e) => updateObjective(objective.id, { status: e.target.value as typeof objective.status })} className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400">
                      <option value="active">En cours</option><option value="paused">Pause</option><option value="completed">Termine</option>
                    </select>
                    <button onClick={() => deleteObjective(objective.id)} className="text-xs text-red-500 hover:text-red-600">Supprimer</button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">{CATS.find((cat) => cat.key === objective.categoryKey)?.label}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400 ml-auto">{objective.deadline}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5"><span className="text-xs text-gray-500">Progression</span><span className="text-xs font-bold text-gray-700">{progress}%</span></div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${objective.color}`} style={{ width: `${progress}%` }} /></div>
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={() => setTaskForObjective(showTaskForm ? null : objective.id)} className="text-xs font-medium text-blue-500 hover:text-blue-600">Ajouter une tache</button>
                  <span className="text-xs text-gray-400">{objectiveTasks.length} tache{objectiveTasks.length > 1 ? "s" : ""}</span>
                </div>
                {showTaskForm && (
                  <div className="border-t border-gray-100 pt-3 space-y-3">
                    <input value={taskForm.title} onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))} placeholder="Titre de la tache" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                    <textarea value={taskForm.description} onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm h-20 resize-none focus:outline-none focus:border-blue-400" />
                    <div className="grid grid-cols-3 gap-2">
                      <input type="number" min={15} step={15} value={taskForm.durationMinutes} onChange={(e) => setTaskForm((p) => ({ ...p, durationMinutes: Number(e.target.value) }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
                      <select value={taskForm.importance} onChange={(e) => setTaskForm((p) => ({ ...p, importance: Number(e.target.value) }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm">{[1,2,3,4,5].map((n) => <option key={n} value={n}>Imp. {n}</option>)}</select>
                      <input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm((p) => ({ ...p, deadline: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
                    </div>
                    <button type="button" onClick={() => { if (!taskForm.title.trim()) return; createTask({ title: taskForm.title.trim(), description: taskForm.description.trim() || undefined, categoryKey: objective.categoryKey, importance: taskForm.importance, durationMinutes: taskForm.durationMinutes, deadline: taskForm.deadline || undefined, status: "todo", isSimpleTodo: false, objectiveId: objective.id }); setTaskForObjective(null); setTaskForm({ title: "", description: "", importance: 3, durationMinutes: 60, deadline: today }); }} className="btn-primary w-full">Creer la tache</button>
                  </div>
                )}
                <div className="space-y-2">
                  {objectiveTasks.map((task) => (
                    <div key={task.id} className="bg-gray-50 rounded-xl px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2"><p className={`text-xs font-medium ${task.status === "done" ? "line-through text-gray-400" : "text-gray-700"}`}>{task.title}</p><span className="text-[10px] text-gray-400">{task.status}</span></div>
                      <p className="text-[10px] text-gray-400 mt-1">{formatDuration(task.durationMinutes)} · {formatDisplayDateTime(task.scheduledStart)}</p>
                    </div>
                  ))}
                  {objectiveTasks.length === 0 && <p className="text-xs text-gray-400">Aucune tache reliee pour le moment.</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
