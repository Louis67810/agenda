"use client";

interface HabitRowProps {
  title: string;
  icon: string;
  streak: number;
  done: boolean;
  onToggle: () => void;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  points: number;
  frequency?: string;
  weekLog?: boolean[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function HabitRow({
  title,
  icon,
  streak,
  done,
  onToggle,
  targetValue,
  currentValue,
  unit,
  points,
  frequency = "Quotidien",
  weekLog = [],
  onEdit,
  onDelete,
}: HabitRowProps) {
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
          onClick={onToggle}
          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
            done
              ? "bg-blue-500 border-blue-500 text-white"
              : "border-gray-300 hover:border-blue-400"
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
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
              {frequency}
            </span>
            {streak > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                🔥 {streak} jour{streak > 1 ? "s" : ""}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-500">
              +{points} pts
            </span>
          </div>

          {targetValue !== undefined && currentValue !== undefined && unit && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                <span>{currentValue.toLocaleString("fr-FR")} / {targetValue.toLocaleString("fr-FR")} {unit}</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-blue-500"
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

        {/* Actions menu */}
        {(onEdit || onDelete) && (
          <div className="flex flex-col gap-1 shrink-0">
            {onEdit && (
              <button onClick={onEdit} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
