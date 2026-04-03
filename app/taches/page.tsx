"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { CATEGORY_LABELS, formatDisplayDateTime, formatDuration, parseDuration } from "@/lib/app-state";
import type { TaskCategory } from "@/lib/mock-data";

const CATEGORIES: TaskCategory[] = ["travail", "personnel", "sport", "etudes", "sante", "social", "finance", "creativite"];

export default function TachesPage() {
  const { ready, tasks, objectives, today, createTask, updateTask, deleteTask } = useAppState();
  const [filter, setFilter] = useState<"all" | "objective" | "todo">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    categoryKey: "travail" as TaskCategory,
    importance: 3,
    duration: "1h",
    deadline: today,
    objectiveId: "",
    description: "",
  });

  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === "objective" && !task.objectiveId) return false;
        if (filter === "todo" && !task.isSimpleTodo) return false;
        if (statusFilter !== "all" && task.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => (a.scheduledStart ?? "9999").localeCompare(b.scheduledStart ?? "9999"));
  }, [filter, statusFilter, tasks]);

  if (!ready) {
    return <div className="text-sm text-gray-400">Chargement des taches...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Taches</h1>
          <p className="text-sm text-gray-500 mt-1">
            Chaque creation est planifiee automatiquement dans l'agenda et rattachee a un objectif si tu le souhaites.
          </p>
        </div>
        <button onClick={() => setShowCreate((value) => !value)} className="btn-primary">
          {showCreate ? "Fermer" : "Nouvelle tache"}
        </button>
      </div>

      {showCreate && (
        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Titre de la tache"
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm"
            />
            <select
              value={form.objectiveId}
              onChange={(e) => setForm((prev) => ({ ...prev, objectiveId: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm"
            >
              <option value="">Todo simple</option>
              {objectives.map((objective) => (
                <option key={objective.id} value={objective.id}>{objective.title}</option>
              ))}
            </select>
            <select
              value={form.categoryKey}
              onChange={(e) => setForm((prev) => ({ ...prev, categoryKey: e.target.value as TaskCategory }))}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>
              ))}
            </select>
            <input
              value={form.duration}
              onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
              placeholder="1h, 30min, 1h30..."
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm"
            />
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm"
            />
            <select
              value={form.importance}
              onChange={(e) => setForm((prev) => ({ ...prev, importance: Number(e.target.value) }))}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>Importance {value}/5</option>
              ))}
            </select>
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description facultative"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm h-24"
          />
          <div className="flex justify-end">
            <button
              className="btn-primary"
              onClick={() => {
                if (!form.title.trim()) return;
                createTask({
                  title: form.title.trim(),
                  description: form.description.trim() || undefined,
                  categoryKey: form.categoryKey,
                  importance: form.importance,
                  durationMinutes: parseDuration(form.duration),
                  deadline: form.deadline || undefined,
                  status: "todo",
                  isSimpleTodo: !form.objectiveId,
                  objectiveId: form.objectiveId || undefined,
                });
                setForm({
                  title: "",
                  categoryKey: "travail",
                  importance: 3,
                  duration: "1h",
                  deadline: today,
                  objectiveId: "",
                  description: "",
                });
                setShowCreate(false);
              }}
            >
              Creer et planifier
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
          <option value="all">Toutes les taches</option>
          <option value="objective">Liees a un objectif</option>
          <option value="todo">Todos simples</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
          <option value="all">Tous les statuts</option>
          <option value="todo">A faire</option>
          <option value="in_progress">En cours</option>
          <option value="done">Terminees</option>
        </select>
        <span className="text-sm text-gray-400 ml-auto">{visibleTasks.length} taches affichees</span>
      </div>

      <div className="space-y-3">
        {visibleTasks.map((task) => {
          const objective = objectives.find((item) => item.id === task.objectiveId);
          return (
            <div key={task.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-lg font-semibold ${task.status === "done" ? "line-through text-gray-400" : "text-gray-800"}`}>{task.title}</h3>
                    <span className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-500">{CATEGORY_LABELS[task.categoryKey]}</span>
                    <span className="text-xs rounded-full bg-orange-50 px-2 py-1 text-orange-600">Importance {task.importance}/5</span>
                    {objective && <span className="text-xs rounded-full bg-blue-50 px-2 py-1 text-blue-600">{objective.title}</span>}
                  </div>
                  <p className="text-sm text-gray-500">{task.description || "Sans description"}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                    <span>Duree estimee : {formatDuration(task.durationMinutes)}</span>
                    <span>Deadline : {task.deadline || "aucune"}</span>
                    <span>Agenda : {formatDisplayDateTime(task.scheduledStart)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-36">
                  <select
                    value={task.status}
                    onChange={(e) => updateTask(task.id, { status: e.target.value as typeof task.status })}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="todo">A faire</option>
                    <option value="in_progress">En cours</option>
                    <option value="done">Terminee</option>
                  </select>
                  <button onClick={() => deleteTask(task.id)} className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {visibleTasks.length === 0 && <div className="card text-sm text-gray-400">Aucune tache pour ce filtre.</div>}
      </div>
    </div>
  );
}

