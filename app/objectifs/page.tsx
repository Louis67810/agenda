"use client";

import { useState } from "react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { CATEGORY_LABELS, OBJECTIVE_COLORS, formatDisplayDateTime, formatDuration } from "@/lib/app-state";
import type { TaskCategory } from "@/lib/mock-data";

const CATEGORIES: TaskCategory[] = ["travail", "personnel", "sport", "etudes", "sante", "social", "finance", "creativite"];

export default function ObjectifsPage() {
  const { ready, objectives, createObjective, createTask, updateObjective, deleteObjective, getObjectiveProgress, getObjectiveTasks, today } = useAppState();
  const [creatingObjective, setCreatingObjective] = useState(false);
  const [taskEditorFor, setTaskEditorFor] = useState<string | null>(null);
  const [objectiveForm, setObjectiveForm] = useState({
    title: "",
    description: "",
    importance: 3,
    deadline: today,
    color: OBJECTIVE_COLORS[0],
    status: "active" as const,
    categoryKey: "travail" as TaskCategory,
  });
  const [taskForm, setTaskForm] = useState({ title: "", duration: 60, importance: 3, deadline: today, description: "" });

  if (!ready) return <div className="text-sm text-gray-400">Chargement des objectifs...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Objectifs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Les taches creees depuis cette page sont automatiquement ajoutees a l'objectif puis planifiees dans l'agenda.
          </p>
        </div>
        <button onClick={() => setCreatingObjective((value) => !value)} className="btn-primary">
          {creatingObjective ? "Fermer" : "Nouvel objectif"}
        </button>
      </div>

      {creatingObjective && (
        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={objectiveForm.title} onChange={(e) => setObjectiveForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Titre" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" />
            <input type="date" value={objectiveForm.deadline} onChange={(e) => setObjectiveForm((prev) => ({ ...prev, deadline: e.target.value }))} className="border border-gray-200 rounded-xl px-4 py-3 text-sm" />
            <select value={objectiveForm.categoryKey} onChange={(e) => setObjectiveForm((prev) => ({ ...prev, categoryKey: e.target.value as TaskCategory }))} className="border border-gray-200 rounded-xl px-4 py-3 text-sm">
              {CATEGORIES.map((category) => <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>)}
            </select>
            <select value={objectiveForm.importance} onChange={(e) => setObjectiveForm((prev) => ({ ...prev, importance: Number(e.target.value) }))} className="border border-gray-200 rounded-xl px-4 py-3 text-sm">
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>Importance {value}/5</option>)}
            </select>
          </div>
          <textarea value={objectiveForm.description} onChange={(e) => setObjectiveForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm h-24" />
          <div className="flex flex-wrap gap-2">
            {OBJECTIVE_COLORS.map((color) => (
              <button key={color} type="button" onClick={() => setObjectiveForm((prev) => ({ ...prev, color }))} className={`h-8 w-8 rounded-full ${color} ${objectiveForm.color === color ? "ring-2 ring-offset-2 ring-gray-400" : ""}`} />
            ))}
          </div>
          <div className="flex justify-end">
            <button
              className="btn-primary"
              onClick={() => {
                if (!objectiveForm.title.trim()) return;
                createObjective({ ...objectiveForm, title: objectiveForm.title.trim(), description: objectiveForm.description.trim() });
                setObjectiveForm({ title: "", description: "", importance: 3, deadline: today, color: OBJECTIVE_COLORS[0], status: "active", categoryKey: "travail" });
                setCreatingObjective(false);
              }}
            >
              Creer l'objectif
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {objectives.map((objective) => {
          const progress = getObjectiveProgress(objective.id);
          const linkedTasks = getObjectiveTasks(objective.id).sort((a, b) => (a.scheduledStart ?? "").localeCompare(b.scheduledStart ?? ""));
          const editingTasks = taskEditorFor === objective.id;

          return (
            <div key={objective.id} className="card space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-800">{objective.title}</h3>
                    <span className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-500">{CATEGORY_LABELS[objective.categoryKey]}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{objective.description || "Sans description"}</p>
                </div>
                <div className="flex flex-col gap-2 min-w-36">
                  <select value={objective.status} onChange={(e) => updateObjective(objective.id, { status: e.target.value as typeof objective.status })} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
                    <option value="active">En cours</option>
                    <option value="paused">En pause</option>
                    <option value="completed">Termine</option>
                  </select>
                  <button onClick={() => deleteObjective(objective.id)} className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50">Supprimer</button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Progression reelle</span>
                  <span className="font-semibold text-gray-700">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full ${objective.color}`} style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-2 text-xs text-gray-400">Deadline : {objective.deadline}</div>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800">Taches liees</h4>
                <button onClick={() => setTaskEditorFor(editingTasks ? null : objective.id)} className="text-sm text-orange-500 hover:text-orange-600">
                  {editingTasks ? "Annuler" : "Ajouter une tache"}
                </button>
              </div>

              {editingTasks && (
                <div className="rounded-2xl border border-gray-100 p-4 space-y-3 bg-stone-50">
                  <input value={taskForm.title} onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Titre de la tache" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                  <textarea value={taskForm.description} onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm h-20" />
                  <div className="grid grid-cols-3 gap-3">
                    <input type="number" min={15} step={15} value={taskForm.duration} onChange={(e) => setTaskForm((prev) => ({ ...prev, duration: Number(e.target.value) }))} className="border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                    <select value={taskForm.importance} onChange={(e) => setTaskForm((prev) => ({ ...prev, importance: Number(e.target.value) }))} className="border border-gray-200 rounded-xl px-4 py-3 text-sm">
                      {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>Importance {value}</option>)}
                    </select>
                    <input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm((prev) => ({ ...prev, deadline: e.target.value }))} className="border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="btn-primary"
                      onClick={() => {
                        if (!taskForm.title.trim()) return;
                        createTask({
                          title: taskForm.title.trim(),
                          description: taskForm.description.trim() || undefined,
                          categoryKey: objective.categoryKey,
                          importance: taskForm.importance,
                          durationMinutes: taskForm.duration,
                          deadline: taskForm.deadline,
                          status: "todo",
                          isSimpleTodo: false,
                          objectiveId: objective.id,
                        });
                        setTaskForm({ title: "", duration: 60, importance: 3, deadline: today, description: "" });
                        setTaskEditorFor(null);
                      }}
                    >
                      Creer et planifier
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {linkedTasks.length === 0 ? (
                  <p className="text-sm text-gray-400">Aucune tache reliee pour le moment.</p>
                ) : (
                  linkedTasks.map((task) => (
                    <div key={task.id} className="rounded-xl border border-gray-100 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={`font-medium ${task.status === "done" ? "line-through text-gray-400" : "text-gray-800"}`}>{task.title}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDuration(task.durationMinutes)} · {formatDisplayDateTime(task.scheduledStart)}
                          </p>
                        </div>
                        <span className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-500">{task.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

