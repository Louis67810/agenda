"use client";

import { useMemo, useState } from "react";
import ObjectiveCard from "@/components/objectives/ObjectiveCard";
import Modal from "@/components/ui/Modal";
import { useAppState } from "@/components/providers/AppStateProvider";
import { OBJECTIVE_COLORS } from "@/lib/app-state";
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

type StatusFilter = "all" | "active" | "completed" | "paused";
type ObjectiveFormState = {
  title: string;
  description: string;
  importance: number;
  deadline: string;
  color: string;
  categoryKey: TaskCategory;
  status: "active" | "completed" | "paused";
};

export default function ObjectifsPage() {
  const {
    ready,
    objectives,
    today,
    createObjective,
    updateObjective,
    deleteObjective,
    addObjectiveCategory,
    addObjectiveSubcategory,
    addObjectiveTask,
    toggleObjectiveTask,
    deleteObjectiveCategory,
    deleteObjectiveSubcategory,
    deleteObjectiveTask,
    getObjectiveProgress,
  } = useAppState();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ObjectiveFormState>({
    title: "",
    description: "",
    importance: 3,
    deadline: today,
    color: "bg-blue-500",
    categoryKey: "travail" as TaskCategory,
    status: "active" as const,
  });

  const filtered = useMemo(
    () => objectives.filter((objective) => statusFilter === "all" || objective.status === statusFilter),
    [objectives, statusFilter],
  );

  if (!ready) return <div className="text-sm text-gray-400">Chargement des objectifs...</div>;

  function openCreate() {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      importance: 3,
      deadline: today,
      color: "bg-blue-500",
      categoryKey: "travail",
      status: "active",
    });
    setModalOpen(true);
  }

  function openEdit(id: string) {
    const objective = objectives.find((entry) => entry.id === id);
    if (!objective) return;
    setEditingId(id);
    setForm({
      title: objective.title,
      description: objective.description,
      importance: objective.importance,
      deadline: objective.deadline,
      color: objective.color,
      categoryKey: objective.categoryKey,
      status: objective.status,
    });
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingId) {
      updateObjective(editingId, { ...form, title: form.title.trim(), description: form.description.trim() });
    } else {
      createObjective({ ...form, title: form.title.trim(), description: form.description.trim() });
    }
    setModalOpen(false);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Objectifs</h1>
          <p className="text-sm text-gray-400 mt-1">Suivez vos objectifs et leur progression</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvel objectif
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="all">Tous</option>
            <option value="active">En cours</option>
            <option value="completed">Termines</option>
            <option value="paused">En pause</option>
          </select>
        </div>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} objectif{filtered.length > 1 ? "s" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-gray-400 text-sm">Aucun objectif pour ce filtre.</p>
          <button onClick={openCreate} className="btn-secondary">+ Creer un objectif</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((objective) => (
            <ObjectiveCard
              key={objective.id}
              title={objective.title}
              description={objective.description}
              importance={objective.importance}
              progress={getObjectiveProgress(objective.id)}
              deadline={objective.deadline}
              color={objective.color}
              status={objective.status}
              categoryKey={objective.categoryKey}
              categories={objective.categories.map((category) => ({
                name: category.name,
                subcategories: category.subcategories.map((subcategory) => ({
                  name: subcategory.name,
                  tasks: subcategory.tasks.map((task) => ({
                    title: task.title,
                    status: task.status,
                  })),
                })),
              }))}
              onEdit={() => openEdit(objective.id)}
              onDelete={() => deleteObjective(objective.id)}
              onTaskToggle={(catIdx, subIdx, taskIdx) => {
                const category = objective.categories[catIdx];
                const subcategory = category?.subcategories[subIdx];
                const treeTask = subcategory?.tasks[taskIdx];
                if (!category || !subcategory || !treeTask) return;
                toggleObjectiveTask(objective.id, category.id, subcategory.id, treeTask.id);
              }}
              onAddCategory={(name) => addObjectiveCategory(objective.id, name)}
              onAddSubcategory={(catIdx, name) => {
                const category = objective.categories[catIdx];
                if (category) addObjectiveSubcategory(objective.id, category.id, name);
              }}
              onAddTask={(catIdx, subIdx, title) => {
                const category = objective.categories[catIdx];
                const subcategory = category?.subcategories[subIdx];
                if (category && subcategory) addObjectiveTask(objective.id, category.id, subcategory.id, title);
              }}
              onDeleteCategory={(catIdx) => {
                const category = objective.categories[catIdx];
                if (category) deleteObjectiveCategory(objective.id, category.id);
              }}
              onDeleteSubcategory={(catIdx, subIdx) => {
                const category = objective.categories[catIdx];
                const subcategory = category?.subcategories[subIdx];
                if (category && subcategory) deleteObjectiveSubcategory(objective.id, category.id, subcategory.id);
              }}
              onDeleteTask={(catIdx, subIdx, taskIdx) => {
                const category = objective.categories[catIdx];
                const subcategory = category?.subcategories[subIdx];
                const treeTask = subcategory?.tasks[taskIdx];
                if (category && subcategory && treeTask) {
                  deleteObjectiveTask(objective.id, category.id, subcategory.id, treeTask.id);
                }
              }}
            />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Modifier l'objectif" : "Nouvel objectif"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Titre *</label>
            <input
              autoFocus
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none h-20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Categorie</label>
              <select
                value={form.categoryKey}
                onChange={(e) => setForm((p) => ({ ...p, categoryKey: e.target.value as TaskCategory }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              >
                {CATS.map((cat) => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Statut</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as typeof form.status }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              >
                <option value="active">En cours</option>
                <option value="paused">En pause</option>
                <option value="completed">Termine</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Importance</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setForm((p) => ({ ...p, importance: n }))} className="flex-1">
                  <svg className={`w-6 h-6 mx-auto transition-colors ${n <= form.importance ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Couleur</label>
              <div className="flex gap-1.5 flex-wrap">
                {OBJECTIVE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, color }))}
                    className={`w-6 h-6 rounded-full ${color} ${form.color === color ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : "hover:scale-110"}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost flex-1">Annuler</button>
            <button type="submit" className="btn-primary flex-1">{editingId ? "Enregistrer" : "Creer l'objectif"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

