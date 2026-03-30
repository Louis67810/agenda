"use client";

import { useState } from "react";
import { categoryColors, type TaskCategory } from "@/lib/mock-data";

export type TaskCardStatus = "todo" | "in_progress" | "done";

interface TaskCardProps {
  title: string;
  category: string;
  categoryKey?: TaskCategory;
  importance: number;
  duration: string;
  deadline?: string;
  status: TaskCardStatus;
  onStatusChange?: (status: TaskCardStatus) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const STATUS_CYCLE: TaskCardStatus[] = ["todo", "in_progress", "done"];

const statusConfig: Record<TaskCardStatus, { label: string; bg: string; text: string; next: string }> = {
  todo:        { label: "À faire",   bg: "bg-gray-100",    text: "text-gray-600",    next: "→ En cours" },
  in_progress: { label: "En cours",  bg: "bg-orange-100",  text: "text-orange-700",  next: "→ Terminé" },
  done:        { label: "Terminé",   bg: "bg-emerald-100", text: "text-emerald-700", next: "→ À faire" },
};

function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < count ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function TaskCard({ title, category, categoryKey, importance, duration, deadline, status, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const statusCfg = statusConfig[status];
  const catColor = categoryKey ? categoryColors[categoryKey] : { bg: "bg-gray-100", text: "text-gray-700" };

  function cycleStatus() {
    if (!onStatusChange) return;
    const idx = STATUS_CYCLE.indexOf(status);
    onStatusChange(STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
  }

  return (
    <div className={`bg-white rounded-xl border shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 hover:shadow-md transition-all duration-200 ${status === "done" ? "opacity-70 border-gray-100" : "border-gray-100 hover:border-gray-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Clickable status circle */}
          <button
            onClick={cycleStatus}
            title={statusCfg.next}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              status === "done" ? "bg-emerald-500 border-emerald-500" :
              status === "in_progress" ? "border-orange-400 bg-orange-50" :
              "border-gray-300 hover:border-orange-400"
            }`}
          >
            {status === "done" && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === "in_progress" && <div className="w-2 h-2 rounded-full bg-orange-400" />}
          </button>

          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold truncate ${status === "done" ? "line-through text-gray-400" : "text-gray-800"}`}>
              {title}
            </h4>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${catColor.bg} ${catColor.text}`}>
                {category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {duration}
              </span>
              {deadline && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {deadline}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1">
            {/* Status badge — click to cycle */}
            <button
              onClick={cycleStatus}
              title="Changer le statut"
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors hover:opacity-80 ${statusCfg.bg} ${statusCfg.text}`}
            >
              {statusCfg.label}
            </button>

            {/* Action menu */}
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
                        <button
                          onClick={() => { setMenuOpen(false); onEdit(); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Modifier
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => { setMenuOpen(false); onDelete(); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <Stars count={importance} />
        </div>
      </div>
    </div>
  );
}

export { Stars };
