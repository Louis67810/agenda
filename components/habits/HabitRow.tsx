"use client";

import { useState } from "react";

interface HabitRowProps {
  title: string;
  icon: string;
  streak: number;
  done: boolean;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  points: number;
  frequency?: string;
  weekLog?: boolean[];
}

export default function HabitRow({
  title,
  icon,
  streak,
  done: initialDone,
  targetValue,
  currentValue,
  unit,
  points,
  frequency = "Quotidien",
  weekLog = [],
}: HabitRowProps) {
  const [done, setDone] = useState(initialDone);

  const progressPercent =
    targetValue && currentValue
      ? Math.min(Math.round((currentValue / targetValue) * 100), 100)
      : 0;

  const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="flex items-center gap-4">
        {/* Toggle checkbox */}
        <button
          onClick={() => setDone(!done)}
          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
            done
              ? "bg-orange-500 border-orange-500 text-white"
              : "border-gray-300 hover:border-orange-400"
          }`}
        >
          {done && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Icon + Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <h4 className={`text-sm font-semibold truncate ${done ? "text-gray-400 line-through" : "text-gray-800"}`}>
              {title}
            </h4>
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {/* Frequency */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
              {frequency}
            </span>
            {/* Streak */}
            {streak > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600">
                🔥 {streak} jour{streak > 1 ? "s" : ""}
              </span>
            )}
            {/* Points */}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
              +{points} pts
            </span>
          </div>

          {/* Progress bar */}
          {targetValue !== undefined && currentValue !== undefined && unit && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                <span>{currentValue.toLocaleString("fr-FR")} / {targetValue.toLocaleString("fr-FR")} {unit}</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-orange-400 to-amber-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Weekly mini-calendar */}
        {weekLog.length > 0 && (
          <div className="flex gap-1 shrink-0">
            {weekLog.map((dayDone, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-gray-400 font-medium">{dayLabels[i]}</span>
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    dayDone ? "bg-emerald-400" : "bg-gray-200"
                  }`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
