"use client";

import { useState } from "react";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal, { type TaskFormData } from "@/components/tasks/TaskModal";
import type { TaskCategory } from "@/lib/mock-data";

const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

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
  status: "todo" | "in_progress" | "done";
  recurring?: boolean;
  recurringDayOfWeek?: number;
  recurringTime?: string;
}

const INITIAL_TASKS: FullTask[] = [
  {
    id: "ft1", title: "Envoyer rapport Q1", category: "Travail", categoryKey: "travail",
    objectif: "Maîtriser Next.js 15", importance: 5, duration: "1h",
    deadline: "2026-03-30", scheduledDate: "2026-03-30", status: "todo",
  },
  {
    id: "ft2", title: "Revue objectifs Q1", category: "Travail", categoryKey: "travail",
    importance: 4, duration: "1h30", deadline: "2026-03-29", scheduledDate: "2026-03-30",
    status: "in_progress",
  },
  {
    id: "ft3", title: "Course à pied — 8 km", category: "Sport", categoryKey: "sport",
    objectif: "Courir 10 km < 50 min", importance: 3, duration: "50min",
    scheduledDate: "2026-03-30", status: "todo",
    recurring: true, recurringDayOfWeek: 1, recurringTime: "07:00",
  },
  {
    id: "ft4", title: "Dessiner maquettes app", category: "Créativité", categoryKey: "creativite",
    objectif: "Publier portfolio créatif", importance: 3, duration: "2h",
    deadline: "2026-03-29", status: "todo",
  },
  {
    id: "ft5", title: "Lecture chapitre 6", category: "Études", categoryKey: "etudes",
    importance: 2, duration: "1h30", deadline: "2026-03-31", status: "todo",
  },
  {
    id: "ft6", title: "Appel comptable", category: "Finance", categoryKey: "finance",
    objectif: "Épargner 2 000 EUR", importance: 4, duration: "30min",
    deadline: "2026-03-31", scheduledDate: "2026-03-31", status: "todo",
  },
  {
    id: "ft7", title: "Préparer slides formation", category: "Travail", categoryKey: "travail",
    importance: 4, duration: "2h", deadline: "2026-03-24", status: "in_progress",
  },
  {
    id: "ft8", title: "Yoga matinal", category: "Sport", categoryKey: "sport",
    importance: 2, duration: "1h", status: "done",
  },
  {
    id: "ft9", title: "Natation", category: "Sport", categoryKey: "sport",
    importance: 3, duration: "1h", status: "in_progress",
  },
  {
    id: "ft10", title: "Rétrospective sprint", category: "Travail", categoryKey: "travail",
    importance: 4, duration: "1h30", deadline: "2026-03-23", status: "done",
  },
  { id: "st1", title: "Acheter du lait", category: "Personnel", categoryKey: "personnel", importance: 1, duration: "15min", status: "todo" },
  { id: "st2", title: "Renouveler abonnement Netflix", category: "Personnel", categoryKey: "personnel", importance: 1, duration: "5min", deadline: "2026-03-31", status: "todo" },
  { id: "st3", title: "Prendre RDV coiffeur", category: "Personnel", categoryKey: "personnel", importance: 2, duration: "5min", status: "done" },
];

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

function effectiveStatus(task: FullTask): "todo" | "in_progress" | "done" {
  if (task.status === "done") return "done";
  if (task.scheduledDate === TODAY) return "in_progress";
  return "todo";
}

function taskScore(t: FullTask): number {
  const eff = effectiveStatus(t);
  if (eff === "done") return -1;
  const isToday = t.scheduledDate === TODAY;
  const todayBonus = isToday ? 500 : 0;
  if (eff === "in_progress") return 1000 + todayBonus + t.importance * 20 + urgencyBonus(t.deadline);
  return todayBonus + t.importance * 20 + urgencyBonus(t.deadline);
}

export default function TachesPage() {
  const [tasks, setTasks] = useState<FullTask[]>(INITIAL_TASKS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [importanceFilter, setImportanceFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortBy>("recommended");
  const [todayOnly, setTodayOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FullTask | null>(null);

  let filtered = [...tasks];

  if (todayOnly) filtered = filtered.filter((t) => t.scheduledDate === TODAY);

  if (statusFilter !== "all") {
    filtered = filtered.filter((t) => effectiveStatus(t) === statusFilter);
  }

  if (importanceFilter > 0) filtered = filtered.filter((t) => t.importance >= importanceFilter);

  filtered = filtered.sort((a, b) => {
    if (sortBy === "recommended") return taskScore(b) - taskScore(a);
    if (sortBy === "importance") return b.importance - a.importance;
    if (sortBy === "status") {
      const order = ["in_progress", "todo", "done"];
      return order.indexOf(effectiveStatus(a)) - order.indexOf(effectiveStatus(b));
    }
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return a.deadline.localeCompare(b.deadline);
  });

  function handleStatusChange(id: string) {
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const eff = effectiveStatus(t);
      if (eff === "in_progress") {
        // en cours → done
        return { ...t, status: "done" };
      } else if (eff === "todo") {
        // à faire → en cours (schedule today)
        return { ...t, scheduledDate: TODAY };
      } else {
        // done → reset to todo, clear scheduledDate
        return { ...t, status: "todo", scheduledDate: undefined };
      }
    }));
  }

  function handleSave(data: TaskFormData) {
    if (data.id) {
      setTasks((prev) => prev.map((t) => t.id === data.id ? { ...t, ...data } : t));
    } else {
      const newTask: FullTask = {
        ...data,
        id: `task-${++nextId}`,
        scheduledDate: data.scheduledDate ?? undefined,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  }

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function openCreate() { setEditingTask(null); setModalOpen(true); }
  function openEdit(task: FullTask) { setEditingTask(task); setModalOpen(true); }

  const doneCnt = tasks.filter((t) => t.status === "done").length;
  const inProgressCnt = tasks.filter((t) => effectiveStatus(t) === "in_progress").length;
  const todayCount = tasks.filter((t) => t.scheduledDate === TODAY && t.status !== "done").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tâches</h1>
          <p className="text-sm text-gray-400 mt-1">
            <span className="text-blue-500 font-semibold">{inProgressCnt}</span> en cours ·{" "}
            <span className="text-emerald-500 font-semibold">{doneCnt}</span> terminées ·{" "}
            {tasks.filter((t) => effectiveStatus(t) === "todo").length} à faire
            {todayCount > 0 && (
              <> · <span className="text-blue-500 font-semibold">{todayCount}</span> pour aujourd&apos;hui</>
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
      {todayCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-blue-700 font-medium">
            {todayCount} tâche{todayCount > 1 ? "s" : ""} planifiée{todayCount > 1 ? "s" : ""} pour aujourd&apos;hui — elles apparaissent en premier dans l&apos;ordre recommandé.
          </p>
        </div>
      )}

      {/* Tabs + Aujourd'hui toggle */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 bg-white text-gray-800 shadow-sm"
          >
            Toutes
          </button>
        </div>
        <button
          onClick={() => setTodayOnly((v) => !v)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${
            todayOnly
              ? "bg-blue-50 border-blue-300 text-blue-700"
              : "bg-white border-gray-200 text-gray-500 hover:text-gray-700"
          }`}
        >
          Aujourd&apos;hui
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="all">Tous</option>
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="done">Terminé</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Importance min.</label>
          <select
            value={importanceFilter}
            onChange={(e) => setImportanceFilter(Number(e.target.value))}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value={0}>Toutes</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Trier par</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="recommended">Recommandé</option>
            <option value="importance">Importance</option>
            <option value="deadline">Échéance</option>
            <option value="status">Statut</option>
          </select>
        </div>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} tâche{filtered.length > 1 ? "s" : ""}</span>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-gray-400 text-sm">Aucune tâche ne correspond aux filtres.</p>
            <button onClick={openCreate} className="btn-secondary">+ Créer une tâche</button>
          </div>
        ) : (
          filtered.map((task) => {
            const eff = effectiveStatus(task);
            const isToday = task.scheduledDate === TODAY;
            return (
              <div key={task.id} className={`rounded-xl transition-all ${isToday && eff !== "done" ? "ring-1 ring-blue-200" : ""}`}>
                <TaskCard
                  title={task.title}
                  category={task.objectif || task.category}
                  categoryKey={task.categoryKey}
                  importance={task.importance}
                  duration={task.duration}
                  deadline={task.deadline}
                  status={eff}
                  onStatusChange={() => handleStatusChange(task.id)}
                  onEdit={() => openEdit(task)}
                  onDelete={() => handleDelete(task.id)}
                />

                {/* Recurring badge */}
                {task.recurring && (
                  <div className="ml-3 mb-2 flex items-center gap-1.5 text-[10px] font-medium text-violet-600">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Récurrente · {["dim","lun","mar","mer","jeu","ven","sam"][task.recurringDayOfWeek ?? 1]} à {task.recurringTime}</span>
                  </div>
                )}
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
    </div>
  );
}
