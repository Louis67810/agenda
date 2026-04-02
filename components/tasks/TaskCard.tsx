"use client";

import { useState } from "react";
import type { TaskCategory } from "@/lib/mock-data";

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

const STATUS_CFG: Record<TaskCardStatus, { label: string; bg: string; color: string }> = {
  todo:        { label: "À faire",  bg: "#F3F4F6", color: "#374151" },
  in_progress: { label: "En cours", bg: "#FEF3C7", color: "#B45309" },
  done:        { label: "Terminé",  bg: "#DCFCE7", color: "#15803D" },
};

const CAT_BADGE: Record<TaskCategory, { bg: string; color: string }> = {
  travail:    { bg: "#FEE6D0", color: "#B45309" },
  personnel:  { bg: "#D5EEFF", color: "#1E40AF" },
  sport:      { bg: "#D1FAE5", color: "#065F46" },
  etudes:     { bg: "#D1FAE5", color: "#065F46" },
  social:     { bg: "#E1D1FA", color: "#5B21B6" },
  finance:    { bg: "#FEF3C7", color: "#92400E" },
  sante:      { bg: "#FCE7F3", color: "#9D174D" },
  creativite: { bg: "#E1D1FA", color: "#5B21B6" },
};

export function Stars({ count, max = 5 }: { count: number; max?: number }) {
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
  const sCfg = STATUS_CFG[status];
  const catBadge = categoryKey ? CAT_BADGE[categoryKey] : { bg: "#F3F4F6", color: "#6B7280" };

  function cycleStatus() {
    if (!onStatusChange) return;
    const idx = STATUS_CYCLE.indexOf(status);
    onStatusChange(STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
  }

  return (
    <div className={`bg-white rounded-xl border px-4 py-3.5 transition-all duration-200 ${status === "done" ? "opacity-60 border-gray-100" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"}`}>
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <button
          onClick={cycleStatus}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
            status === "done"        ? "bg-blue-500 border-blue-500" :
            status === "in_progress" ? "border-amber-400 bg-amber-50" :
            "border-gray-300 hover:border-blue-400"
          }`}
        >
          {status === "done" && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === "in_progress" && <div className="w-2 h-2 rounded-full bg-amber-400" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-semibold ${status === "done" ? "line-through text-gray-400" : "text-gray-800"}`}>{title}</h4>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: catBadge.bg, color: catBadge.color }}>{category}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {duration}
            </span>
            {deadline && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                {deadline}
              </span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={cycleStatus}
              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full hover:opacity-80 transition-opacity"
              style={{ backgroundColor: sCfg.bg, color: sCfg.color }}
            >
              {sCfg.label}
            </button>
            {(onEdit || onDelete) && (
              <div className="relative">
                <button onClick={() => setMenuOpen(p=>!p)} className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={()=>setMenuOpen(false)}/>
                    <div className="absolute right-0 top-7 z-20 bg-white rounded-xl border border-gray-100 shadow-lg py-1 min-w-[120px]">
                      {onEdit && <button onClick={()=>{setMenuOpen(false);onEdit();}} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        Modifier
                      </button>}
                      {onDelete && <button onClick={()=>{setMenuOpen(false);onDelete();}} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Supprimer
                      </button>}
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
