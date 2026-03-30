"use client";

import { useState } from "react";
import ObjectiveCard from "@/components/objectives/ObjectiveCard";
import type { TaskCategory } from "@/lib/mock-data";

interface MockObjective {
  id: string;
  title: string;
  description: string;
  importance: number;
  progress: number;
  deadline: string;
  color: string;
  status: "active" | "completed" | "paused";
  categoryKey: TaskCategory;
  categories: {
    name: string;
    subcategories: {
      name: string;
      tasks: { title: string; status: "todo" | "in_progress" | "done" }[];
    }[];
  }[];
}

const mockObjectives: MockObjective[] = [
  {
    id: "o1",
    title: "Maitriser Next.js 15",
    description:
      "Apprendre en profondeur le framework Next.js 15 avec App Router, Server Components et les nouvelles fonctionnalites.",
    importance: 5,
    progress: 72,
    deadline: "30 avril 2026",
    color: "bg-violet-500",
    status: "active",
    categoryKey: "etudes",
    categories: [
      {
        name: "Fondamentaux",
        subcategories: [
          {
            name: "App Router",
            tasks: [
              { title: "Routing et layouts", status: "done" },
              { title: "Loading et error states", status: "done" },
              { title: "Parallel routes", status: "in_progress" },
            ],
          },
          {
            name: "Server Components",
            tasks: [
              { title: "Comprendre RSC", status: "done" },
              { title: "Client vs Server", status: "done" },
              { title: "Streaming SSR", status: "todo" },
            ],
          },
        ],
      },
      {
        name: "Avance",
        subcategories: [
          {
            name: "Data Fetching",
            tasks: [
              { title: "Server Actions", status: "in_progress" },
              { title: "Cache et revalidation", status: "todo" },
            ],
          },
          {
            name: "Deploiement",
            tasks: [
              { title: "Middleware & Auth", status: "todo" },
              { title: "CI/CD Vercel", status: "todo" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "o2",
    title: "Courir 10 km en moins de 50 min",
    description:
      "Progresser en course a pied pour atteindre un 10 km sous les 50 minutes d'ici l'ete.",
    importance: 4,
    progress: 55,
    deadline: "15 juin 2026",
    color: "bg-emerald-500",
    status: "active",
    categoryKey: "sport",
    categories: [
      {
        name: "Entrainement",
        subcategories: [
          {
            name: "Endurance",
            tasks: [
              { title: "5 km < 27 min", status: "done" },
              { title: "8 km sans pause", status: "in_progress" },
              { title: "10 km complet", status: "todo" },
            ],
          },
          {
            name: "Vitesse",
            tasks: [
              { title: "Fractionne 400m", status: "done" },
              { title: "Tempo run 6 km", status: "todo" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "o3",
    title: "Epargner 2 000 EUR ce trimestre",
    description:
      "Atteindre 2000 EUR d'epargne supplementaire avant la fin du trimestre Q1 2026.",
    importance: 5,
    progress: 80,
    deadline: "31 mars 2026",
    color: "bg-amber-500",
    status: "active",
    categoryKey: "finance",
    categories: [
      {
        name: "Budget",
        subcategories: [
          {
            name: "Suivi",
            tasks: [
              { title: "Objectif 500 EUR", status: "done" },
              { title: "Objectif 1 000 EUR", status: "done" },
              { title: "Objectif 1 500 EUR", status: "done" },
              { title: "Objectif 2 000 EUR", status: "in_progress" },
            ],
          },
          {
            name: "Optimisation",
            tasks: [
              { title: "Revoir abonnements", status: "done" },
              { title: "Appel comptable", status: "todo" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "o4",
    title: "Lire 12 livres cette annee",
    description:
      "Objectif de lecture : 12 livres dans l'annee, melangeant fiction et non-fiction.",
    importance: 3,
    progress: 25,
    deadline: "31 decembre 2026",
    color: "bg-orange-500",
    status: "active",
    categoryKey: "personnel",
    categories: [
      {
        name: "Lectures",
        subcategories: [
          {
            name: "Fiction",
            tasks: [
              { title: "Le Petit Prince", status: "done" },
              { title: "1984", status: "in_progress" },
            ],
          },
          {
            name: "Non-fiction",
            tasks: [
              { title: "Atomic Habits", status: "done" },
              { title: "Deep Work", status: "todo" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "o5",
    title: "Publier portfolio creatif",
    description:
      "Concevoir et mettre en ligne un portfolio personnel pour presenter mes projets creatifs.",
    importance: 4,
    progress: 40,
    deadline: "31 mai 2026",
    color: "bg-cyan-500",
    status: "active",
    categoryKey: "creativite",
    categories: [
      {
        name: "Design",
        subcategories: [
          {
            name: "Conception",
            tasks: [
              { title: "Wireframes", status: "done" },
              { title: "Design system", status: "in_progress" },
            ],
          },
        ],
      },
      {
        name: "Developpement",
        subcategories: [
          {
            name: "Implementation",
            tasks: [
              { title: "Setup projet", status: "todo" },
              { title: "Pages principales", status: "todo" },
              { title: "Mise en ligne", status: "todo" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "o6",
    title: "Obtenir certification AWS",
    description:
      "Passer et reussir la certification AWS Solutions Architect Associate.",
    importance: 4,
    progress: 10,
    deadline: "30 septembre 2026",
    color: "bg-blue-500",
    status: "paused",
    categoryKey: "etudes",
    categories: [
      {
        name: "Preparation",
        subcategories: [
          {
            name: "Theorie",
            tasks: [
              { title: "Module IAM", status: "done" },
              { title: "Module EC2", status: "todo" },
              { title: "Module S3", status: "todo" },
            ],
          },
        ],
      },
    ],
  },
];

type StatusFilter = "all" | "active" | "completed" | "paused";

export default function ObjectifsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered =
    statusFilter === "all"
      ? mockObjectives
      : mockObjectives.filter((o) => o.status === statusFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Objectifs</h1>
          <p className="text-sm text-gray-400 mt-1">
            Suivez vos objectifs et leur progression
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
          Nouvel objectif
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          >
            <option value="all">Tous</option>
            <option value="active">En cours</option>
            <option value="completed">Termines</option>
            <option value="paused">En pause</option>
          </select>
        </div>
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} objectif{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Objectives grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Aucun objectif ne correspond aux filtres.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((obj) => (
            <ObjectiveCard
              key={obj.id}
              title={obj.title}
              description={obj.description}
              importance={obj.importance}
              progress={obj.progress}
              deadline={obj.deadline}
              color={obj.color}
              status={obj.status}
              categoryKey={obj.categoryKey}
              categories={obj.categories}
            />
          ))}
        </div>
      )}
    </div>
  );
}
