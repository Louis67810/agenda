"use client";

import Link from "next/link";
import { useAppState } from "@/components/providers/AppStateProvider";
import { formatDisplayDateTime } from "@/lib/app-state";

export default function TodoPage() {
  const { ready, tasks, updateTask } = useAppState();

  if (!ready) return <div className="text-sm text-gray-400">Chargement des todos...</div>;

  const todos = tasks.filter((task) => task.isSimpleTodo);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Todos simples</h1>
          <p className="text-sm text-gray-500 mt-1">Cette vue reprend uniquement les taches non rattachees a un objectif.</p>
        </div>
        <Link href="/taches" className="btn-secondary">Retour aux taches</Link>
      </div>

      <div className="space-y-3">
        {todos.map((todo) => (
          <div key={todo.id} className="card flex items-center justify-between gap-4">
            <div>
              <p className={`font-medium ${todo.status === "done" ? "line-through text-gray-400" : "text-gray-800"}`}>{todo.title}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDisplayDateTime(todo.scheduledStart)}</p>
            </div>
            <button onClick={() => updateTask(todo.id, { status: todo.status === "done" ? "todo" : "done" })} className={`rounded-xl px-3 py-2 text-sm ${todo.status === "done" ? "border border-gray-200 text-gray-600" : "bg-orange-500 text-white"}`}>
              {todo.status === "done" ? "Reouvrir" : "Marquer comme fait"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

