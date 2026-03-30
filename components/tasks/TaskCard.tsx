"use client";

import { categoryColors, type TaskCategory } from "@/lib/mock-data";

export type TaskCardStatus = "todo" | "in_progress" | "done";

interface TaskCardProps {
  title: string;
  category: string;
  categoryKey?: TaskCategory;
  importance: number; // 1-5
  duration: string;
  deadline?: string;
  status: TaskCardStatus;
}

const statusConfig: Record<
  TaskCardStatus,
  { label: string; bg: string; text: string }
> = {
  todo: { label: "A faire", bg: "bg-gray-100", text: "text-gray-600" },
  in_progress: {
    label: "En cours",
    bg: "bg-orange-100",
    text: "text-orange-700",
  },
  done: { label: "Termine", bg: "bg-emerald-100", text: "text-emerald-700" },
};

function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < count ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function TaskCard({
  title,
  category,
  categoryKey,
  importance,
  duration,
  deadline,
  status,
}: TaskCardProps) {
  const statusCfg = statusConfig[status];
  const catColor = categoryKey
    ? categoryColors[categoryKey]
    : { bg: "bg-gray-100", text: "text-gray-700" };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-800 truncate">
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Category pill */}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${catColor.bg} ${catColor.text}`}
            >
              {category}
            </span>
            {/* Duration */}
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {duration}
            </span>
            {/* Deadline */}
            {deadline && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
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
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {/* Status badge */}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusCfg.bg} ${statusCfg.text}`}
          >
            {statusCfg.label}
          </span>
          {/* Stars */}
          <Stars count={importance} />
        </div>
      </div>
    </div>
  );
}

export { Stars };
