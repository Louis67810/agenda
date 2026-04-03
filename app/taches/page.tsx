"use client";

import { useMemo, useState } from "react";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal, { type TaskFormData } from "@/components/tasks/TaskModal";
import { useAppState } from "@/components/providers/AppStateProvider";
import { CATEGORY_LABELS, formatDuration, parseDuration } from "@/lib/app-state";

const TODAY = new Date().toISOString().slice(0, 10);

type StatusFilter = "all" | "todo" | "in_progress" | "done";
type SortBy = "recommended" | "importance" | "deadline" | "status";

function urgencyBonus(deadline?: string): number {
  if (!deadline) return 5;
  const now = new Date();
  const due = new Date(deadline);
  if (Number.isNaN(due.getTime())) return 5;
  const days = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (days < 0) return 120;
  if (days < 1) return 100;
  if (days <= 2) return 80;
  if (days <= 7) return 40;
  return 10;
}

export default function TachesPage() {
  const { ready, tasks, objectives, today, createTask, updateTask, deleteTask } = useAppState();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [importanceFilter, setImportanceFilter] = useState(0);
  const [sortBy, setSortBy] = useState<SortBy>("recommended");
  const [todayOnly, setTodayOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const taskRows = useMemo(() => tasks.map((task) => {
    const objective = objectives.find((item) => item.id === task.objectiveId);
    return {
      id: task.id,
      title: task.title,
      category: objective?.title || CATEGORY_LABELS[task.categoryKey],
      categoryKey: task.categoryKey,
      objectif: objective?.title,
      importance: task.importance,
      duration: formatDuration(task.durationMinutes),
      deadline: task.deadline,
      scheduledDate: task.scheduledStart?.slice(0, 10),
      status: task.status,
      recurring: false,
    };
  }), [tasks, objectives]);

  const filtered = useMemo(() => {
    let result = [...taskRows];
    if (todayOnly) result = result.filter((task) => task.scheduledDate === today);
    if (statusFilter !== "all") result = result.filter((task) => task.status === statusFilter);
    if (importanceFilter > 0) result = result.filter((task) => task.importance >= importanceFilter);
    result.sort((a, b) => {
      if (sortBy === "importance") return b.importance - a.importance;
      if (sortBy === "deadline") return (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999");
      if (sortBy === "status") return ["in_progress", "todo", "done"].indexOf(a.status) - ["in_progress", "todo", "done"].indexOf(b.status);
      return (b.importance * 20 + urgencyBonus(b.deadline)) - (a.importance * 20 + urgencyBonus(a.deadline));
    });
    return result;
  }, [importanceFilter, sortBy, statusFilter, taskRows, today, todayOnly]);

  if (!ready) return <div className="text-sm text-gray-400">Chargement des taches...</div>;

  const editingTask = tasks.find((task) => task.id === editingTaskId);
  const doneCnt = tasks.filter((task) => task.status === "done").length;
  const inProgressCnt = tasks.filter((task) => task.status === "in_progress").length;
  const todayCount = tasks.filter((task) => task.scheduledStart?.startsWith(TODAY) && task.status !== "done").length;

  function handleSave(data: TaskFormData) {
    const objective = objectives.find((item) => item.title === data.objectif);
    if (data.id) {
      updateTask(data.id, {
        title: data.title,
        categoryKey: data.categoryKey,
        importance: data.importance,
        durationMinutes: parseDuration(data.duration),
        deadline: data.deadline || undefined,
        status: data.status,
        objectiveId: data.isSimpleTodo ? undefined : objective?.id,
        isSimpleTodo: data.isSimpleTodo,
      });
      return;
    }
    createTask({
      title: data.title,
      categoryKey: data.categoryKey,
      importance: data.importance,
      durationMinutes: parseDuration(data.duration),
      deadline: data.deadline || undefined,
      status: data.status,
      objectiveId: data.isSimpleTodo ? undefined : objective?.id,
      isSimpleTodo: data.isSimpleTodo,
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Taches</h1>
          <p className="text-sm text-gray-400 mt-1">
            <span className="text-blue-500 font-semibold">{inProgressCnt}</span> en cours · <span className="text-emerald-500 font-semibold">{doneCnt}</span> terminees · {tasks.length - doneCnt - inProgressCnt} a faire
            {todayCount > 0 && <> · <span className="text-blue-500 font-semibold">{todayCount}</span> pour aujourd'hui</>}
          </p>
        </div>
        <button onClick={() => { setEditingTaskId(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Nouvelle tache
        </button>
      </div>

      {todayCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p className="text-sm text-blue-700 font-medium">{todayCount} tache{todayCount > 1 ? "s" : ""} planifiee{todayCount > 1 ? "s" : ""} pour aujourd'hui.</p>
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button onClick={() => setTodayOnly(false)} className={`px-4 py-2 rounded-lg text-sm font-medium ${!todayOnly ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Toutes</button>
        <button onClick={() => setTodayOnly(true)} className={`px-4 py-2 rounded-lg text-sm font-medium ${todayOnly ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Aujourd'hui</button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Statut</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400">
            <option value="all">Tous</option><option value="todo">A faire</option><option value="in_progress">En cours</option><option value="done">Termine</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Importance min.</label>
          <select value={importanceFilter} onChange={(e) => setImportanceFilter(Number(e.target.value))} className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400">
            <option value={0}>Toutes</option>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Trier par</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400">
            <option value="recommended">Recommande</option><option value="importance">Importance</option><option value="deadline">Echeance</option><option value="status">Statut</option>
          </select>
        </div>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} tache{filtered.length > 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? <div className="text-center py-16 space-y-3"><p className="text-gray-400 text-sm">Aucune tache ne correspond aux filtres.</p><button onClick={() => { setEditingTaskId(null); setModalOpen(true); }} className="btn-secondary">+ Creer une tache</button></div> : filtered.map((task) => (
          <div key={task.id} className={`rounded-xl transition-all ${task.scheduledDate === TODAY && task.status !== "done" ? "ring-1 ring-blue-200" : ""}`}>
            <TaskCard
              title={task.title}
              category={task.objectif || task.category}
              categoryKey={task.categoryKey}
              importance={task.importance}
              duration={task.duration}
              deadline={task.deadline}
              status={task.status}
              onStatusChange={(status) => updateTask(task.id, { status })}
              onEdit={() => { setEditingTaskId(task.id); setModalOpen(true); }}
              onDelete={() => deleteTask(task.id)}
            />
          </div>
        ))}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        mode={editingTask ? "edit" : "create"}
        initial={editingTask ? {
          id: editingTask.id,
          title: editingTask.title,
          category: CATEGORY_LABELS[editingTask.categoryKey],
          categoryKey: editingTask.categoryKey,
          importance: editingTask.importance,
          duration: formatDuration(editingTask.durationMinutes),
          deadline: editingTask.deadline ?? "",
          status: editingTask.status,
          isSimpleTodo: editingTask.isSimpleTodo,
          objectif: objectives.find((item) => item.id === editingTask.objectiveId)?.title,
          scheduledDate: editingTask.scheduledStart?.slice(0, 10) ?? "",
        } : undefined}
      />
    </div>
  );
}
