"use client";

import { useState } from "react";
import { categoryColors, type TaskCategory } from "@/lib/mock-data";
import { Stars } from "@/components/tasks/TaskCard";

interface TreeCategory {
  name: string;
  subcategories: {
    name: string;
    tasks: { title: string; status: "todo" | "in_progress" | "done" }[];
  }[];
}

interface ObjectiveCardProps {
  title: string;
  description: string;
  importance: number;
  progress: number;
  deadline: string;
  color: string; // tailwind bg class e.g. "bg-orange-500"
  status: "active" | "completed" | "paused";
  categoryKey?: TaskCategory;
  categories?: TreeCategory[];
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  active: { label: "En cours", bg: "bg-orange-100", text: "text-orange-700" },
  completed: {
    label: "Termine",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  paused: { label: "En pause", bg: "bg-gray-100", text: "text-gray-600" },
};

const taskStatusDot: Record<string, string> = {
  todo: "bg-gray-300",
  in_progress: "bg-orange-400",
  done: "bg-emerald-500",
};

export default function ObjectiveCard({
  title,
  description,
  importance,
  progress,
  deadline,
  color,
  status,
  categoryKey,
  categories,
}: ObjectiveCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [openSubcategories, setOpenSubcategories] = useState<Set<string>>(
    new Set()
  );
  const statusCfg = statusConfig[status] || statusConfig.active;
  const catColor = categoryKey
    ? categoryColors[categoryKey]
    : { bg: "bg-gray-100", text: "text-gray-700" };

  const toggleCategory = (name: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleSubcategory = (name: string) => {
    setOpenSubcategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200">
      {/* Color indicator bar */}
      <div className={`h-1.5 ${color}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
              {description}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${statusCfg.bg} ${statusCfg.text}`}
          >
            {statusCfg.label}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${catColor.bg} ${catColor.text}`}
          >
            {categoryKey || "General"}
          </span>
          <Stars count={importance} />
          <span className="inline-flex items-center gap-1 text-xs text-gray-400 ml-auto">
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
            {deadline}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Progression</span>
            <span className="text-xs font-bold text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Expand button */}
        {categories && categories.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400 hover:text-orange-500 transition-colors py-1"
          >
            <span>{expanded ? "Masquer" : "Voir"} l&apos;arborescence</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}

        {/* Tree structure */}
        {expanded && categories && (
          <div className="mt-3 border-t border-gray-100 pt-3 space-y-1">
            {categories.map((cat) => (
              <div key={cat.name}>
                {/* Category level */}
                <button
                  onClick={() => toggleCategory(cat.name)}
                  className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className={`w-3 h-3 text-gray-400 transition-transform duration-150 ${openCategories.has(cat.name) ? "rotate-90" : ""}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6 4l8 6-8 6V4z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-600">
                    {cat.name}
                  </span>
                </button>

                {openCategories.has(cat.name) && (
                  <div className="ml-4 space-y-0.5">
                    {cat.subcategories.map((sub) => (
                      <div key={sub.name}>
                        {/* Subcategory level */}
                        <button
                          onClick={() =>
                            toggleSubcategory(`${cat.name}-${sub.name}`)
                          }
                          className="flex items-center gap-2 w-full text-left py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <svg
                            className={`w-2.5 h-2.5 text-gray-300 transition-transform duration-150 ${openSubcategories.has(`${cat.name}-${sub.name}`) ? "rotate-90" : ""}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6 4l8 6-8 6V4z" />
                          </svg>
                          <span className="text-[11px] font-medium text-gray-500">
                            {sub.name}
                          </span>
                          <span className="text-[10px] text-gray-300 ml-auto">
                            {sub.tasks.length}
                          </span>
                        </button>

                        {openSubcategories.has(`${cat.name}-${sub.name}`) && (
                          <div className="ml-6 space-y-0.5">
                            {sub.tasks.map((task, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 py-1 px-2"
                              >
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${taskStatusDot[task.status]}`}
                                />
                                <span
                                  className={`text-[11px] ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-600"}`}
                                >
                                  {task.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
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
