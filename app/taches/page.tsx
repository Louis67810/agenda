"use client";

import { useState } from "react";
import Link from "next/link";
import TaskCard, { type TaskCardStatus } from "@/components/tasks/TaskCard";
import TaskModal, { type TaskFormData } from "@/components/tasks/TaskModal";
import type { TaskCategory } from "@/lib/mock-data";

const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

export interface SubTask {
  id: string;
  title: string;
  category: string;
  categoryKey: TaskCategory;
  importance: number;
  duration: string;
  deadline?: string;
  scheduledDate?: string;
  status: TaskCardStatus;
}

export interface FullTask {
  id: string;
  title: string;
  category: string;
  categoryKey: TaskCategory;
  objectif?: string;
  importance: number;
  duration: string;
  deadline?: string;
  scheduledDate?: string;
  status: TaskCardStatus;
  isSimpleTodo: boolean;
  recurring?: boolean;
  recurringDayOfWeek?: number;
  recurringTime?: string;
  subtasks: SubTask[];
}

const INITIAL_TASKS: FullTask[] = [
  {
    id: "ft1", title: "Envoyer rapport Q1", category: "Travail", categoryKey: "travail",
    objectif: "Maîtriser Next.js 15", importance: 5, duration: "1h",
    deadline: "2026-03-30", scheduledDate: "2026-03-30", status: "todo", isSimpleTodo: false,
    subtasks: [
      { id: "ft1-s1", title: "Rédiger l'introduction", category: "Travail", categoryKey: "travail", importance: 4, duration: "30min", scheduledDate: "2026-03-30", status: "done" },
      { id: "ft1-s2", title: "Compiler les chiffres Q1", category: "Travail", categoryKey: "travail", importance: 5, duration: "30min", scheduledDate: "2026-03-30", status: "todo" },
    ],
  },
  {
    id: "ft2", title: "Revue objectifs Q1", category: "Travail", categoryKey: "travail",
    importance: 4, duration: "1h30", deadline: "2026-03-29", scheduledDate: "2026-03-30",
    status: "in_progress", isSimpleTodo: false, subtasks: [],
  },
  {
    id: "ft3", title: "Course à pied — 8 km", category: "Sport", categoryKey: "sport",
    objectif: "Courir 10 km < 50 min", importance: 3, duration: "50min",
    scheduledDate: "2026-03-30", status: "todo", isSimpleTodo: false, subtasks: [],
    recurring: true, recurringDayOfWeek: 1, recurringTime: "07:00",
  },
  {
    id: "ft4", title: "Dessiner maquettes app", category: "Créativité", categoryKey: "creativite",
    objectif: "Publier portfolio créatif", importance: 3, duration: "2h",
    deadline: "2026-03-29", status: "todo", isSimpleTodo: false,
    subtasks: [
      { id: "ft4-s1", title: "Wireframes mobile", category: "Créativité", categoryKey: "creativite", importance: 3, duration: "1h", status: "todo" },
      { id: "ft4-s2", title: "Wireframes desktop", category: "Créativité", categoryKey: "creativite", importance: 3, duration: "1h", status: "todo" },
    ],
  },
  {
    id: "ft5", title: "Lecture chapitre 6", category: "Études", categoryKey: "etudes",
    objectif: "Lire 12 livres", importance: 2, duration: "1h30",
    deadline: "2026-03-31", status: "todo", isSimpleTodo: false, subtasks: [],
  },
  {
    id: "ft6", title: "Appel comptable", category: "Finance", categoryKey: "finance",
    objectif: "Épargner 2 000 EUR", importance: 4, duration: "30min",
    deadline: "2026-03-31", scheduledDate: "2026-03-31", status: "todo", isSimpleTodo: false, subtasks: [],
  },
  {
    id: "ft7", title: "Préparer slides formation", category: "Travail", categoryKey: "travail",
    importance: 4, duration: "2h", deadline: "2026-03-24", status: "in_progress",
    isSimpleTodo: false, subtasks: [],
  },
  {
    id: "ft8", title: "Yoga matinal", category: "Sport", categoryKey: "sport",
    importance: 2, duration: "1h", status: "done", isSimpleTodo: false, subtasks: [],
  },
  {
    id: "ft9", title: "Natation", category: "Sport", categoryKey: "sport",
    importance: 3, duration: "1h", status: "in_progress", isSimpleTodo: false, subtasks: [],
  },
  {
    id: "ft10", title: "Rétrospective sprint", category: "Travail", categoryKey: "travail",
    importance: 4, duration: "1h30", deadline: "2026-03-23", status: "done",
    isSimpleTodo: false, subtasks: [],
  },
  { id: "st1", title: "Acheter du lait", category: "Personnel", categoryKey: "personnel", importance: 1, duration: "15min", status: "todo", isSimpleTodo: true, subtasks: [] },
  { id: "st2", title: "Renouveler abonnement Netflix", category: "Personnel", categoryKey: "personnel", importance: 1, duration: "5min", deadline: "2026-03-31", status: "todo", isSimpleTodo: true, subtasks: [] },
  { id: "st3", title: "Prendre RDV coiffeur", category: "Personnel", categoryKey: "personnel", importance: 2, duration: "5min", status: "done", isSimpleTodo: true, subtasks: [] },
];

type Tab = "all" | "objectifs" | "todos";
type StatusFilter = "all" | "todo" | "in_progress" | "done";
type SortBy = "recommended" | "importance" | "deadline" | "status";

let nextId = 100;

function urgencyBonus(deadline?: string): number {
  if (!deadline) return 5;
  const now = new Date();
  const due = new Date(deadline);
  if (isNaN(due.getTime())) return 5;
  const days = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (days < 0) return 120;
  if (days < 1) return 100;
  if (days <= 2) return 80;
  if (days <= 7) return 40;
  return 10;
}

function taskScore(t: FullTask): number {
  const isToday = t.scheduledDate === TODAY;
  if (t.status === "done") return -1;
  const todayBonus = isToday ? 500 : 0;
  if (t.status === "in_progress") return 1000 + todayBonus + t.importance * 20 + urgencyBonus(t.deadline);
  return todayBonus + t.importance * 20 + urgencyBonus(t.deadline);
}

// Compute effective status: parent is done only when all subtasks done
function effectiveStatus(task: FullTask): TaskCardStatus {
  if (task.subtasks.length === 0) return task.status;
  const allDone = task.subtasks.every((s) => s.status === "done");
  if (allDone && task.status !== "done") return "in_progress";
  return task.status;
}

export default function TachesPage() {
  const [tasks, setTasks] = useState<FullTask[]>(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [importanceFilter, setImportanceFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortBy>("recommended");
  const [modalOpen, setModalOpen] = useState(false);
  const [subtaskModalParent, setSubtaskModalParent] = useState<FullTask | null>(null);
  const [editingTask, setEditingTask] = useState<FullTask | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(["ft1", "ft4"]));

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "objectifs", label: "Objectifs" },
    { key: "todos", label: "Todos simples" },
  ];

  let filtered = tasks.filter((t) => {
    if (activeTab === "objectifs") return !t.isSimpleTodo;
    if (activeTab === "todos") return t.isSimpleTodo;
    return true;
  });
  if (statusFilter !== "all") filtered = filtered.filter((t) => {
    const eff = effectiveStatus(t);
    return eff === statusFilter || t.status === statusFilter;
  });
  if (importanceFilter > 0) filtered = filtered.filter((t) => t.importance >= importanceFilter);

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "recommended") return taskScore(b) - taskScore(a);
    if (sortBy === "importance") return b.importance - a.importance;
    if (sortBy === "status") return (["in_progress", "todo", "done"].indexOf(a.status)) - (["in_progress", "todo", "done"].indexOf(b.status));
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return a.deadline.localeCompare(b.deadline);
  });

  function handleStatusChange(id: string, status: TaskCardStatus) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  }

  function handleSubtaskStatusChange(parentId: string, subId: string, status: TaskCardStatus) {
    setTasks((prev) => prev.map((t) => {
      if (t.id !== parentId) return t;
      const updatedSubs = t.subtasks.map((s) => s.id === subId ? { ...s, status } : s);
      const allDone = updatedSubs.every((s) => s.status === "done");
      return { ...t, subtasks: updatedSubs, status: allDone ? "done" : (t.status === "done" ? "in_progress" : t.status) };
    }));
  }

  function handleSave(data: TaskFormData) {
    if (data.id) {
      setTasks((prev) => prev.map((t) => t.id === data.id ? { ...t, ...data } : t));
    } else {
      const newTask: FullTask = {
        ...data,
        id: `task-${++nextId}`,
        subtasks: [],
        scheduledDate: data.scheduledDate ?? "",
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  }

  function handleSubtaskSave(parentId: string, data: TaskFormData) {
    const sub: SubTask = {
      id: `sub-${++nextId}`,
      title: data.title,
      category: data.category,
      categoryKey: data.categoryKey,
      importance: data.importance,
      duration: data.duration,
      deadline: data.deadline || undefined,
      scheduledDate: data.scheduledDate || undefined,
      status: data.status,
    };
    setTasks((prev) => prev.map((t) => t.id === parentId ? { ...t, subtasks: [...t.subtasks, sub] } : t));
    setExpandedTasks((prev) => new Set([...prev, parentId]));
  }

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleExpand(id: string) {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openCreate() { setEditingTask(null); setModalOpen(true); }
  function openEdit(task: FullTask) { setEditingTask(task); setModalOpen(true); }

  const doneCnt = tasks.filter((t) => t.status === "done").length;
  const inProgressCnt = tasks.filter((t) => t.status === "in_progress").length;
  const todayTasks = tasks.filter((t) => t.scheduledDate === TODAY && t.status !== "done");

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
            {todayTasks.length > 0 && (
              <> · <span className="text-blue-500 font-semibold">{todayTasks.length}</span> pour aujourd&apos;hui</>
            )}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle tâche
        </button>
      </div>

      {/* Today banner */}
      {todayTasks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-blue-600 text-lg">📅</span>
          <p className="text-sm text-blue-700 font-medium">
            {todayTasks.length} tâche{todayTasks.length > 1 ? "s" : ""} planifiée{todayTasks.length > 1 ? "s" : ""} pour aujourd&apos;hui — elles apparaissent en premier dans l&apos;ordre recommandé.
          </p>
        </div>
      )}

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
            <option value="recommended">Recommandé</option>
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
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-gray-400 text-sm">Aucune tâche ne correspond aux filtres.</p>
            <button onClick={openCreate} className="btn-secondary">+ Créer une tâche</button>
          </div>
        ) : (
          filtered.map((task) => {
            const isExpanded = expandedTasks.has(task.id);
            const isToday = task.scheduledDate === TODAY;
            return (
              <div key={task.id}>
                {/* Today label */}
                {isToday && sortBy === "recommended" && (
                  <div className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide px-1 mb-1 mt-2 first:mt-0">
                    📅 Aujourd&apos;hui
                  </div>
                )}

                <div className={`rounded-xl transition-all ${isToday ? "ring-1 ring-blue-200" : ""}`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <TaskCard
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
                    </div>

                    {/* Right actions: expand + add subtask */}
                    <div className="flex flex-col gap-1 pt-3 pr-1 shrink-0">
                      {task.subtasks.length > 0 && (
                        <button
                          onClick={() => toggleExpand(task.id)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          title="Voir les sous-tâches"
                        >
                          <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => setSubtaskModalParent(task)}
                        className="w-7 h-7 rounded-lg bg-orange-50 hover:bg-orange-100 flex items-center justify-center transition-colors"
                        title="Ajouter une sous-tâche"
                      >
                        <svg className="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Subtasks */}
                  {task.subtasks.length > 0 && (
                    <div className="ml-8 mt-0.5 border-l-2 border-gray-100">
                      {/* Summary pill when collapsed */}
                      {!isExpanded && (
                        <button onClick={() => toggleExpand(task.id)} className="ml-3 mb-1 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                          <span>{task.subtasks.filter(s => s.status === "done").length}/{task.subtasks.length} sous-tâches</span>
                          <span className="text-[10px]">▸</span>
                        </button>
                      )}
                      {isExpanded && (
                        <div className="space-y-1 ml-3 mb-2 mt-1">
                          {task.subtasks.map((sub) => (
                            <div key={sub.id} className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 px-3 py-2 shadow-sm">
                              <button
                                onClick={() => handleSubtaskStatusChange(task.id, sub.id, sub.status === "done" ? "todo" : "done")}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                  sub.status === "done" ? "bg-emerald-500 border-emerald-500" : "border-gray-300 hover:border-orange-400"
                                }`}
                              >
                                {sub.status === "done" && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                              <span className={`flex-1 text-sm ${sub.status === "done" ? "line-through text-gray-400" : "text-gray-700"}`}>
                                {sub.title}
                              </span>
                              <span className="text-xs text-gray-400">{sub.duration}</span>
                              {sub.scheduledDate && (
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sub.scheduledDate === TODAY ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                                  {sub.scheduledDate === TODAY ? "Aujourd'hui" : sub.scheduledDate}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recurring badge */}
                  {task.recurring && (
                    <div className="ml-3 mb-2">
                      <span className="text-[10px] font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                        🔄 Récurrente — {["dim","lun","mar","mer","jeu","ven","sam"][task.recurringDayOfWeek ?? 1]} à {task.recurringTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
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

      {/* Subtask Modal */}
      <TaskModal
        open={subtaskModalParent !== null}
        onClose={() => setSubtaskModalParent(null)}
        onSave={(data) => { if (subtaskModalParent) handleSubtaskSave(subtaskModalParent.id, data); setSubtaskModalParent(null); }}
        mode="create"
        parentTitle={subtaskModalParent?.title}
        initial={subtaskModalParent ? { categoryKey: subtaskModalParent.categoryKey, category: subtaskModalParent.category } : undefined}
      />
    </div>
  );
}
