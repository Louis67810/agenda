"use client";

import { useState } from "react";
import Link from "next/link";
import TaskCard, { type TaskCardStatus } from "@/components/tasks/TaskCard";
import type { TaskCategory } from "@/lib/mock-data";

// ─── Inline mock data for the tasks page ─────────────────────────────────────

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

const mockTasks: FullTask[] = [
  {
    id: "ft1",
    title: "Envoyer rapport Q1",
    category: "Travail",
    categoryKey: "travail",
    objectif: "Maitriser Next.js 15",
    importance: 5,
    duration: "1h",
    deadline: "30 mars 2026",
    status: "todo",
    isSimpleTodo: false,
  },
  {
    id: "ft2",
    title: "Revue objectifs Q1",
    category: "Travail",
    categoryKey: "travail",
    importance: 4,
    duration: "1h30",
    deadline: "29 mars 2026",
    status: "in_progress",
    isSimpleTodo: false,
  },
  {
    id: "ft3",
    title: "Course a pied - 8 km",
    category: "Sport",
    categoryKey: "sport",
    objectif: "Courir 10 km < 50 min",
    importance: 3,
    duration: "50min",
    status: "todo",
    isSimpleTodo: false,
  },
  {
    id: "ft4",
    title: "Dessiner maquettes app",
    category: "Creativite",
    categoryKey: "creativite",
    objectif: "Publier portfolio creatif",
    importance: 3,
    duration: "2h",
    deadline: "29 mars 2026",
    status: "todo",
    isSimpleTodo: false,
  },
  {
    id: "ft5",
    title: "Lecture chapitre 6",
    category: "Etudes",
    categoryKey: "etudes",
    objectif: "Lire 12 livres",
    importance: 2,
    duration: "1h30",
    deadline: "31 mars 2026",
    status: "todo",
    isSimpleTodo: false,
  },
  {
    id: "ft6",
    title: "Appel comptable",
    category: "Finance",
    categoryKey: "finance",
    objectif: "Epargner 2000 EUR",
    importance: 4,
    duration: "30min",
    deadline: "31 mars 2026",
    status: "todo",
    isSimpleTodo: false,
  },
  {
    id: "ft7",
    title: "Preparer slides formation",
    category: "Travail",
    categoryKey: "travail",
    importance: 4,
    duration: "2h",
    deadline: "24 mars 2026",
    status: "in_progress",
    isSimpleTodo: false,
  },
  {
    id: "ft8",
    title: "Yoga matinal",
    category: "Sport",
    categoryKey: "sport",
    importance: 2,
    duration: "1h",
    status: "done",
    isSimpleTodo: false,
  },
  {
    id: "ft9",
    title: "Natation",
    category: "Sport",
    categoryKey: "sport",
    importance: 3,
    duration: "1h",
    status: "in_progress",
    isSimpleTodo: false,
  },
  {
    id: "ft10",
    title: "Retrospecive sprint",
    category: "Travail",
    categoryKey: "travail",
    importance: 4,
    duration: "1h30",
    deadline: "23 mars 2026",
    status: "done",
    isSimpleTodo: false,
  },
  // Simple todos
  {
    id: "st1",
    title: "Acheter du lait",
    category: "Personnel",
    categoryKey: "personnel",
    importance: 1,
    duration: "15min",
    status: "todo",
    isSimpleTodo: true,
  },
  {
    id: "st2",
    title: "Renouveler abonnement Netflix",
    category: "Personnel",
    categoryKey: "personnel",
    importance: 1,
    duration: "5min",
    deadline: "31 mars 2026",
    status: "todo",
    isSimpleTodo: true,
  },
  {
    id: "st3",
    title: "Prendre RDV coiffeur",
    category: "Personnel",
    categoryKey: "personnel",
    importance: 2,
    duration: "5min",
    status: "done",
    isSimpleTodo: true,
  },
];

type Tab = "all" | "objectifs" | "todos";
type StatusFilter = "all" | "todo" | "in_progress" | "done";
type SortBy = "importance" | "deadline" | "status";

export default function TachesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [importanceFilter, setImportanceFilter] = useState<number>(0); // 0 = all
  const [sortBy, setSortBy] = useState<SortBy>("importance");

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "objectifs", label: "Objectifs" },
    { key: "todos", label: "Todos simples" },
  ];

  // Filter
  let filtered = mockTasks.filter((t) => {
    if (activeTab === "objectifs") return !t.isSimpleTodo;
    if (activeTab === "todos") return t.isSimpleTodo;
    return true;
  });

  if (statusFilter !== "all") {
    filtered = filtered.filter((t) => t.status === statusFilter);
  }

  if (importanceFilter > 0) {
    filtered = filtered.filter((t) => t.importance >= importanceFilter);
  }

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === "importance") return b.importance - a.importance;
    if (sortBy === "status") {
      const order = { todo: 0, in_progress: 1, done: 2 };
      return order[a.status] - order[b.status];
    }
    // deadline
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return a.deadline.localeCompare(b.deadline);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Taches</h1>
          <p className="text-sm text-gray-400 mt-1">
            Gerez toutes vos taches et objectifs
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nouvelle tache
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.key
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          >
            <option value="all">Tous</option>
            <option value="todo">A faire</option>
            <option value="in_progress">En cours</option>
            <option value="done">Termine</option>
          </select>
        </div>

        {/* Importance filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">
            Importance min.
          </label>
          <select
            value={importanceFilter}
            onChange={(e) => setImportanceFilter(Number(e.target.value))}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          >
            <option value={0}>Toutes</option>
            <option value={1}>1+</option>
            <option value={2}>2+</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={5}>5</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Trier par</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          >
            <option value="importance">Importance</option>
            <option value="deadline">Echeance</option>
            <option value="status">Statut</option>
          </select>
        </div>

        {/* Count */}
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} tache{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Redirect hint for simple todos */}
      {activeTab === "todos" && (
        <div className="text-xs text-gray-400">
          <Link
            href="/taches/todo"
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Ouvrir la vue checklist simplifiee
          </Link>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Aucune tache ne correspond aux filtres.
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
            />
          ))
        )}
      </div>
    </div>
  );
}
