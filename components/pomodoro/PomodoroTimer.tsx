"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PomodoroSession {
  id: string;
  taskName: string;
  durationMin: number;
  completedAt: string;
}

const PRESETS = [
  { label: "25 min", value: 25 },
  { label: "45 min", value: 45 },
  { label: "1h", value: 60 },
];

export default function PomodoroTimer() {
  const [open, setOpen] = useState(false);
  const [durationMin, setDurationMin] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [justCompleted, setJustCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSec = durationMin * 60;
  const progress = ((totalSec - secondsLeft) / totalSec) * 100;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const complete = useCallback(() => {
    setRunning(false);
    setJustCompleted(true);
    setSessions((prev) => [
      {
        id: `ps-${Date.now()}`,
        taskName: taskName || "Session sans nom",
        durationMin,
        completedAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ]);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [taskName, durationMin]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) { complete(); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, complete]);

  function handlePreset(min: number) {
    if (running) return;
    setDurationMin(min);
    setSecondsLeft(min * 60);
    setJustCompleted(false);
  }

  function handleReset() {
    setRunning(false);
    setSecondsLeft(durationMin * 60);
    setJustCompleted(false);
  }

  function handleStart() {
    setJustCompleted(false);
    setRunning(true);
  }

  const totalSessions = sessions.length;
  const totalFocusMin = sessions.reduce((s, p) => s + p.durationMin, 0);
  const [pomodoroPointsPerSession] = useState(0);

  return (
    <>
      {/* Floating button - BLUE */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 ${
          running
            ? "bg-gradient-to-br from-red-500 to-red-600 animate-pulse"
            : "bg-gradient-to-br from-blue-500 to-blue-600"
        }`}
        title="Pomodoro"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {running && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header - BLUE */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-bold text-white">Pomodoro</h3>
              {totalSessions > 0 && (
                <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-medium">
                  {totalSessions} session{totalSessions > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Task input */}
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Sur quoi travailles-tu ?"
              disabled={running}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-300 disabled:bg-gray-50 disabled:text-gray-400"
            />

            {/* Preset buttons - BLUE */}
            <div className="flex gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => handlePreset(p.value)}
                  disabled={running}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 ${
                    durationMin === p.value
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Circular timer */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                  <circle
                    cx="64" cy="64" r="56"
                    fill="none"
                    stroke={running ? "#3B82F6" : justCompleted ? "#10b981" : "#60a5fa"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                    style={{ transition: "stroke-dashoffset 0.5s linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {justCompleted ? (
                    <span className="text-3xl">✅</span>
                  ) : (
                    <>
                      <span className="text-2xl font-extrabold text-gray-800 tabular-nums">
                        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] text-gray-400">{durationMin} min</span>
                    </>
                  )}
                </div>
              </div>

              {justCompleted && (
                <p className="text-sm font-semibold text-emerald-600 text-center">
                  Session terminée !{pomodoroPointsPerSession > 0 ? ` +${pomodoroPointsPerSession} pts` : ""}
                </p>
              )}

              {/* Controls */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={running ? () => setRunning(false) : handleStart}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                    running
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-md"
                  }`}
                >
                  {running ? "Pause" : justCompleted ? "Recommencer" : "Démarrer"}
                </button>
              </div>

              {/* Gear link */}
              <a href="/parametres/points" className="text-xs text-gray-400 hover:text-blue-500">Configurer les points →</a>
            </div>

            {/* Sessions log */}
            {sessions.length > 0 && (
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sessions du jour</p>
                  <span className="text-xs text-blue-600 font-semibold">{totalFocusMin} min focus</span>
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {sessions.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 truncate flex-1">{s.taskName}</span>
                      <span className="text-gray-400 shrink-0 ml-2">{s.durationMin} min · {s.completedAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
