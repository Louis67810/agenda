"use client";

import { useState } from "react";
import { categoryColors, type TaskCategory } from "@/lib/mock-data";
import { Stars } from "@/components/tasks/TaskCard";

export interface TreeTask { title: string; status: "todo" | "in_progress" | "done" }
export interface TreeSubcategory { name: string; tasks: TreeTask[] }
export interface TreeCategory { name: string; subcategories: TreeSubcategory[] }

interface ObjectiveCardProps {
  title: string;
  description: string;
  importance: number;
  progress: number;
  deadline: string;
  color: string;
  status: "active" | "completed" | "paused";
  categoryKey?: TaskCategory;
  categories?: TreeCategory[];
  onEdit?: () => void;
  onDelete?: () => void;
  onTaskToggle?: (catIdx: number, subIdx: number, taskIdx: number) => void;
}

const statusConfig = {
  active:    { label: "En cours",  bg: "bg-amber-100",  text: "text-amber-700" },
  completed: { label: "Terminé",   bg: "bg-emerald-100", text: "text-emerald-700" },
  paused:    { label: "En pause",  bg: "bg-gray-100",    text: "text-gray-600" },
};

const taskStatusDot: Record<string, string> = {
  todo: "bg-gray-300",
  in_progress: "bg-blue-400",
  done: "bg-emerald-500",
};

export default function ObjectiveCard({ title, description, importance, progress, deadline, color, status, categoryKey, categories, onEdit, onDelete, onTaskToggle }: ObjectiveCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [openCats, setOpenCats] = useState<Set<string>>(new Set());
  const [openSubs, setOpenSubs] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);

  const statusCfg = statusConfig[status];
  const catColor = categoryKey ? categoryColors[categoryKey] : { bg: "bg-gray-100", text: "text-gray-700" };

  function toggleCat(name: string) {
    setOpenCats((p) => { const n = new Set(p); n.has(name) ? n.delete(name) : n.add(name); return n; });
  }
  function toggleSub(key: string) {
    setOpenSubs((p) => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200">
      

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{description}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusCfg.bg} ${statusCfg.text}`}>
              {statusCfg.label}
            </span>
            {(onEdit || onDelete) && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((p) => !p)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-7 z-20 bg-white rounded-xl border border-gray-100 shadow-lg py-1 min-w-[120px]">
                      {onEdit && (
                        <button onClick={() => { setMenuOpen(false); onEdit(); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          Modifier
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => { setMenuOpen(false); onDelete(); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Supprimer
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${catColor.bg} ${catColor.text}`}>
            {categoryKey || "Général"}
          </span>
          <Stars count={importance} />
          <span className="inline-flex items-center gap-1 text-xs text-gray-400 ml-auto">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {deadline}
          </span>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Progression</span>
            <span className="text-xs font-bold text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Expand toggle */}
        {categories && categories.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400 hover:text-blue-500 transition-colors py-1"
          >
            <span>{expanded ? "Masquer" : "Voir"} l&apos;arborescence</span>
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Tree */}
        {expanded && categories && (
          <div className="mt-3 border-t border-gray-100 pt-3 space-y-1">
            {categories.map((cat, catIdx) => (
              <div key={cat.name}>
                <button onClick={() => toggleCat(cat.name)} className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className={`w-3 h-3 text-gray-400 transition-transform ${openCats.has(cat.name) ? "rotate-90" : ""}`} fill="currentColor" viewBox="0 0 20 20"><path d="M6 4l8 6-8 6V4z" /></svg>
                  <span className="text-xs font-semibold text-gray-600">{cat.name}</span>
                  <span className="text-[10px] text-gray-300 ml-auto">
                    {cat.subcategories.reduce((a, s) => a + s.tasks.filter((t) => t.status === "done").length, 0)}/
                    {cat.subcategories.reduce((a, s) => a + s.tasks.length, 0)}
                  </span>
                </button>

                {openCats.has(cat.name) && (
                  <div className="ml-4 space-y-0.5">
                    {cat.subcategories.map((sub, subIdx) => {
                      const subKey = `${cat.name}-${sub.name}`;
                      return (
                        <div key={sub.name}>
                          <button onClick={() => toggleSub(subKey)} className="flex items-center gap-2 w-full text-left py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <svg className={`w-2.5 h-2.5 text-gray-300 transition-transform ${openSubs.has(subKey) ? "rotate-90" : ""}`} fill="currentColor" viewBox="0 0 20 20"><path d="M6 4l8 6-8 6V4z" /></svg>
                            <span className="text-[11px] font-medium text-gray-500">{sub.name}</span>
                            <span className="text-[10px] text-gray-300 ml-auto">
                              {sub.tasks.filter((t) => t.status === "done").length}/{sub.tasks.length}
                            </span>
                          </button>

                          {openSubs.has(subKey) && (
                            <div className="ml-6 space-y-0.5">
                              {sub.tasks.map((task, taskIdx) => (
                                <button
                                  key={taskIdx}
                                  onClick={() => onTaskToggle?.(catIdx, subIdx, taskIdx)}
                                  className="flex items-center gap-2 py-1.5 px-2 w-full text-left rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                    task.status === "done" ? "bg-emerald-500 border-emerald-500" :
                                    task.status === "in_progress" ? "border-blue-400" : "border-gray-300 group-hover:border-blue-300"
                                  }`}>
                                    {task.status === "done" && (
                                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                    {task.status === "in_progress" && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                  </div>
                                  <span className={`text-[11px] ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-600"}`}>
                                    {task.title}
                                  </span>
                                  {task.status !== "done" && (
                                    <span className="text-[10px] text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                      Cocher
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
