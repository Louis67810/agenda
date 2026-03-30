"use client";

import { useState } from "react";
import Link from "next/link";
import TaskCard, { type TaskCardStatus } from "@/components/tasks/TaskCard";
import TaskModal, { type TaskFormData } from "@/components/tasks/TaskModal";
import type { TaskCategory } from "@/lib/mock-data";

interface FullTask {
  id: string;
  title: string;
  category: string;
  categoryKey: TaskCategory;
  objectif?: string;
  importance: number;
  duration: string;
  deadline?: string;
  status: TaskCardStatus;
  isSimpleTodo: boolean;
}

const INITIAL_TASKS: FullTask[] = [
  { id: "ft1", title: "Envoyer rapport Q1", category: "Travail", categoryKey: "travail", objectif: "Maîtriser Next.js 15", importance: 5, duration: "1h", deadline: "30 mars 2026", status: "todo", isSimpleTodo: false },
  { id: "ft2", title: "Revue objectifs Q1", category: "Travail", categoryKey: "travail", importance: 4, duration: "1h30", deadline: "29 mars 2026", status: "in_progress", isSimpleTodo: false },
  { id: "ft3", title: "Course à pied — 8 km", category: "Sport", categoryKey: "sport", objectif: "Courir 10 km < 50 min", importance: 3, duration: "50min", status: "todo", isSimpleTodo: false },
  { id: "ft4", title: "Dessiner maquettes app", category: "Créativité", categoryKey: "creativite", objectif: "Publier portfolio créatif", importance: 3, duration: "2h", deadline: "29 mars 2026", status: "todo", isSimpleTodo: false },
  { id: "ft5", title: "Lecture chapitre 6", category: "Études", categoryKey: "etudes", objectif: "Lire 12 livres", importance: 2, duration: "1h30", deadline: "31 mars 2026", status: "todo", isSimpleTodo: false },
  { id: "ft6", title: "Appel comptable", category: "Finance", categoryKey: "finance", objectif: "Épargner 2 000 EUR", importance: 4, duration: "30min", deadline: "31 mars 2026", status: "todo", isSimpleTodo: false },
  { id: "ft7", title: "Préparer slides formation", category: "Travail", categoryKey: "travail", importance: 4, duration: "2h", deadline: "24 mars 2026", status: "in_progress", isSimpleTodo: false },
  { id: "ft8", title: "Yoga matinal", category: "Sport", categoryKey: "sport", importance: 2, duration: "1h", status: "done", isSimpleTodo: false },
  { id: "ft9", title: "Natation", category: "Sport", categoryKey: "sport", importance: 3, duration: "1h", status: "in_progress", isSimpleTodo: false },
  { id: "ft10", title: "Rétrospective sprint", category: "Travail", categoryKey: "travail", importance: 4, duration: "1h30", deadline: "23 mars 2026", status: "done", isSimpleTodo: false },
  { id: "st1", title: "Acheter du lait", category: "Personnel", categoryKey: "personnel", importance: 1, duration: "15min", status: "todo", isSimpleTodo: true },
  { id: "st2", title: "Renouveler abonnement Netflix", category: "Personnel", categoryKey: "personnel", importance: 1, duration: "5min", deadline: "31 mars 2026", status: "todo", isSimpleTodo: true },
  { id: "st3", title: "Prendre RDV coiffeur", category: "Personnel", categoryKey: "personnel", importance: 2, duration: "5min", status: "done", isSimpleTodo: true },
];

type Tab = "all" | "objectifs" | "todos";
type StatusFilter = "all" | "todo" | "in_progress" | "done";
type SortBy = "importance" | "deadline" | "status";

let nextId = 100;

export default function TachesPage() {
  const [tasks, setTasks] = useState<FullTask[]>(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [importanceFilter, setImportanceFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortBy>("importance");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FullTask | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "objectifs", label: "Objectifs" },
    { key: "todos", label: "Todos simples" },
  ];

  // Filter + sort
  let filtered = tasks.filter((t) => {
    if (activeTab === "objectifs") return !t.isSimpleTodo;
    if (activeTab === "todos") return t.isSimpleTodo;
    return true;
  });
  if (statusFilter !== "all") filtered = filtered.filter((t) => t.status === statusFilter);
  if (importanceFilter > 0) filtered = filtered.filter((t) => t.importance >= importanceFilter);
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "importance") return b.importance - a.importance;
    if (sortBy === "status") return (["todo", "in_progress", "done"].indexOf(a.status)) - (["todo", "in_progress", "done"].indexOf(b.status));
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return a.deadline.localeCompare(b.deadline);
  });

  function handleStatusChange(id: string, status: TaskCardStatus) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  }

  function handleSave(data: TaskFormData) {
    if (data.id) {
      // Edit
      setTasks((prev) => prev.map((t) => t.id === data.id ? { ...t, ...data } : t));
    } else {
      // Create
      const newTask: FullTask = { ...data, id: `task-${++nextId}` };
      setTasks((prev) => [newTask, ...prev]);
    }
  }

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function openCreate() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEdit(task: FullTask) {
    setEditingTask(task);
    setModalOpen(true);
  }

  const doneCnt = tasks.filter((t) => t.status === "done").length;
  const inProgressCnt = tasks.filter((t) => t.status === "in_progress").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tâches</h1>
          <p className="text-sm text-gray-400 mt-1">
            <span className="text-orange-500 font-semibold">{inProgressCnt}</span> en cours ·{" "}
            <span className="text-emerald-500 font-semibold">{doneCnt}</span> terminées ·{" "}
            {tasks.length - doneCnt - inProgressCnt} à faire
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle tâche
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Statut</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-400">
            <option value="all">Tous</option>
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="done">Terminé</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Importance min.</label>
          <select value={importanceFilter} onChange={(e) => setImportanceFilter(Number(e.target.value))} className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-400">
            <option value={0}>Toutes</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Trier par</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-400">
            <option value="importance">Importance</option>
            <option value="deadline">Échéance</option>
            <option value="status">Statut</option>
          </select>
        </div>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} tâche{filtered.length > 1 ? "s" : ""}</span>
      </div>

      {activeTab === "todos" && (
        <div className="text-xs text-gray-400">
          <Link href="/taches/todo" className="text-orange-500 hover:text-orange-600 font-medium">
            Ouvrir la vue checklist simplifiée →
          </Link>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-gray-400 text-sm">Aucune tâche ne correspond aux filtres.</p>
            <button onClick={openCreate} className="btn-secondary">+ Créer une tâche</button>
          </div>
        ) : (
          filtered.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              category={task.objectif || task.category}
              categoryKey={task.categoryKey}
              importance={task.importance}
              duration={task.duration}
              deadline={task.deadline}
              status={task.status}
              onStatusChange={(s) => handleStatusChange(task.id, s)}
              onEdit={() => openEdit(task)}
              onDelete={() => handleDelete(task.id)}
            />
          ))
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        mode={editingTask ? "edit" : "create"}
        initial={editingTask ? { ...editingTask } : undefined}
      />
    </div>
  );
}
