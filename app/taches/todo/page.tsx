"use client";

import { useState } from "react";
import { Stars } from "@/components/tasks/TaskCard";

interface SimpleTodo {
  id: string;
  title: string;
  importance: number;
  deadline?: string;
  done: boolean;
}

const initialTodos: SimpleTodo[] = [
  {
    id: "st1",
    title: "Acheter du lait",
    importance: 1,
    done: false,
  },
  {
    id: "st2",
    title: "Renouveler abonnement Netflix",
    importance: 1,
    deadline: "31 mars 2026",
    done: false,
  },
  {
    id: "st3",
    title: "Prendre RDV coiffeur",
    importance: 2,
    done: true,
  },
  {
    id: "st4",
    title: "Envoyer formulaire impots",
    importance: 4,
    deadline: "15 avril 2026",
    done: false,
  },
  {
    id: "st5",
    title: "Deposer colis a la poste",
    importance: 2,
    deadline: "30 mars 2026",
    done: false,
  },
  {
    id: "st6",
    title: "Acheter cadeau anniversaire Lea",
    importance: 3,
    deadline: "5 avril 2026",
    done: false,
  },
  {
    id: "st7",
    title: "Mettre a jour CV",
    importance: 3,
    done: false,
  },
  {
    id: "st8",
    title: "Nettoyer garage",
    importance: 1,
    done: true,
  },
  {
    id: "st9",
    title: "Commander nouvelles chaussures running",
    importance: 2,
    done: true,
  },
  {
    id: "st10",
    title: "Appeler electricien",
    importance: 4,
    deadline: "2 avril 2026",
    done: false,
  },
];

type StatusFilter = "all" | "todo" | "done";

export default function TodoPage() {
  const [todos, setTodos] = useState<SimpleTodo[]>(initialTodos);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const filtered = todos.filter((t) => {
    if (statusFilter === "todo") return !t.done;
    if (statusFilter === "done") return t.done;
    return true;
  });

  const doneCount = todos.filter((t) => t.done).length;
  const totalCount = todos.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Todos simples</h1>
          <p className="text-sm text-gray-400 mt-1">
            {doneCount}/{totalCount} termines
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
          Nouveau todo
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          >
            <option value="all">Tous</option>
            <option value="todo">A faire</option>
            <option value="done">Termines</option>
          </select>
        </div>
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} todo{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out"
            style={{
              width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Todo list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Aucun todo ne correspond au filtre.
          </div>
        ) : (
          filtered.map((todo) => (
            <div
              key={todo.id}
              className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-4 py-3 flex items-center gap-3 hover:shadow-md hover:border-gray-200 transition-all duration-200"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTodo(todo.id)}
                className={
                  todo.done ? "check-box-done" : "check-box-pending"
                }
              >
                {todo.done && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              {/* Title */}
              <span
                className={`flex-1 text-sm ${
                  todo.done
                    ? "text-gray-400 line-through"
                    : "text-gray-800 font-medium"
                }`}
              >
                {todo.title}
              </span>

              {/* Stars */}
              <Stars count={todo.importance} />

              {/* Deadline */}
              {todo.deadline && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400 shrink-0">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {todo.deadline}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
