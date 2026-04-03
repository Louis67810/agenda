"use client";

import { useAppState } from "@/components/providers/AppStateProvider";
import { formatDisplayDateTime, formatDuration } from "@/lib/app-state";

export default function TodoPage() {
  const { ready, tasks, updateTask } = useAppState();

  if (!ready) return <div className="text-sm text-gray-400">Chargement des todos...</div>;

  const todos = tasks.filter((task) => task.isSimpleTodo);
  const doneCount = todos.filter((task) => task.status === "done").length;
  const totalCount = todos.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Todos simples</h1>
          <p className="text-sm text-gray-400 mt-1">{doneCount}/{totalCount} termines</p>
        </div>
      </div>
      <div><div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out" style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }} /></div></div>
      <div className="space-y-2">{todos.map((todo) => <div key={todo.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-4 py-3 flex items-center gap-3 hover:shadow-md hover:border-gray-200 transition-all duration-200"><button onClick={() => updateTask(todo.id, { status: todo.status === "done" ? "todo" : "done" })} className={todo.status === "done" ? "check-box-done" : "check-box-pending"}>{todo.status === "done" ? <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : null}</button><span className={`flex-1 text-sm ${todo.status === "done" ? "text-gray-400 line-through" : "text-gray-800 font-medium"}`}>{todo.title}</span><span className="text-xs text-gray-400 shrink-0">{formatDuration(todo.durationMinutes)}</span><span className="inline-flex items-center gap-1 text-xs text-gray-400 shrink-0">{formatDisplayDateTime(todo.scheduledStart)}</span></div>)}</div>
    </div>
  );
}
