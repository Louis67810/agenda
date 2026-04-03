"use client";

import { useState, useMemo } from "react";
import { tasks as INITIAL_TASKS, blockedSlots, type Task, type BlockedSlot, type TaskCategory } from "@/lib/mock-data";

export interface DurationAdjustment {
  taskId: string;
  taskTitle: string;
  addedMinutes: number;
  date: string;
}

// ─── New category colors (hex, as per design spec) ────────────────────────────
const CAT_COLORS: Record<TaskCategory, { bg: string; text: string }> = {
  travail:    { bg: "#FEE6D0", text: "#B45309" },
  personnel:  { bg: "#D5EEFF", text: "#1E40AF" },
  sport:      { bg: "#D1FAE5", text: "#065F46" },
  etudes:     { bg: "#D1FAE5", text: "#065F46" },
  social:     { bg: "#E1D1FA", text: "#5B21B6" },
  finance:    { bg: "#FEF3C7", text: "#92400E" },
  sante:      { bg: "#FCE7F3", text: "#9D174D" },
  creativite: { bg: "#E1D1FA", text: "#5B21B6" },
};
const BLOCKED_COLOR = { bg: "#F1F1F1", text: "#6B7280" };

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MONTH_NAMES = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAY_LABELS_FULL = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

function todayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
}
function dateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function getWeekDates(year: number, month: number, day: number): Date[] {
  const d = new Date(year, month, day);
  const dow = (d.getDay()+6)%7;
  const mon = new Date(d); mon.setDate(d.getDate()-dow);
  return Array.from({length:7},(_,i)=>{ const dt=new Date(mon); dt.setDate(mon.getDate()+i); return dt; });
}
function toMin(t: string) { const [h,m]=t.split(":").map(Number); return h*60+m; }
function addMinutes(time: string, mins: number): string {
  const total = toMin(time) + mins;
  return `${String(Math.floor(total/60)).padStart(2,"0")}:${String(total%60).padStart(2,"0")}`;
}
function durationLabel(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins/60), m = mins%60;
  return m ? `${h}h${m}` : `${h}h`;
}
function formatDateFr(ds: string) {
  const [y,m,d]=ds.split("-").map(Number);
  return new Date(y,m-1,d).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
}

const importanceLabels: Record<string, string> = { low:"Faible", medium:"Moyenne", high:"Haute", critical:"Critique" };

function ChevronLeft() {
  return <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 15l-5-5 5-5"/></svg>;
}
function ChevronRight() {
  return <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 5l5 5-5 5"/></svg>;
}

// ─── Task Detail Panel ────────────────────────────────────────────────────────
function TaskDetailPanel({ task, adjustments, onClose, onToggleDone, onAddTime }: {
  task: Task;
  adjustments: DurationAdjustment[];
  onClose: () => void;
  onToggleDone: (id: string) => void;
  onAddTime: (adj: DurationAdjustment) => void;
}) {
  const [addingTime, setAddingTime] = useState(false);
  const [extraMins, setExtraMins] = useState(15);
  const colors = CAT_COLORS[task.category];
  const isDone = task.status === "done";
  const baseDuration = toMin(task.endTime) - toMin(task.startTime);
  const totalAdded = adjustments.filter(a => a.taskId === task.id).reduce((s,a) => s+a.addedMinutes, 0);

  function confirmAddTime() {
    onAddTime({ taskId: task.id, taskTitle: task.title, addedMinutes: extraMins, date: task.date });
    setAddingTime(false);
    setExtraMins(15);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end" style={{ backdropFilter:"blur(2px)", backgroundColor:"rgba(0,0,0,0.15)" }} onClick={onClose}>
      <div className="bg-white h-full w-full max-w-sm shadow-2xl flex flex-col" onClick={e=>e.stopPropagation()}>
        <div className="h-1 rounded-none" style={{ backgroundColor: colors.text }} />
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: colors.bg, color: colors.text }}>
            {task.category}
          </span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <h2 className={`text-lg font-bold ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>{task.title}</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label:"Date", value: formatDateFr(task.date) },
              { label:"Horaire", value: `${task.startTime} – ${addMinutes(task.endTime, totalAdded)}` },
              { label:"Durée", value: durationLabel(baseDuration) },
              { label:"Importance", value: importanceLabels[task.importance] ?? task.importance },
            ].map(({label,value}) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5 capitalize">{value}</p>
              </div>
            ))}
          </div>
          {totalAdded > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <span className="text-amber-600 text-sm font-medium">⏱ +{durationLabel(totalAdded)} ajoutés</span>
              <span className="text-amber-500 text-xs ml-auto">À justifier au récap</span>
            </div>
          )}
          <button
            onClick={() => onToggleDone(task.id)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
              isDone ? "bg-gray-100 text-gray-500 hover:bg-gray-200" : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
            }`}
          >
            {isDone ? "Marquer comme à faire" : "✓ Marquer comme terminé"}
          </button>
          {!isDone && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setAddingTime(!addingTime)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>⏱ Ajouter du temps</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${addingTime?"rotate-180":""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
              {addingTime && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 pt-3">Combien de minutes en plus ?</p>
                  <div className="flex gap-2">
                    {[15,30,45,60].map(n=>(
                      <button key={n} onClick={()=>setExtraMins(n)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${extraMins===n?"bg-blue-500 text-white border-blue-500":"bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}
                      >+{n}</button>
                    ))}
                  </div>
                  <button onClick={confirmAddTime} className="btn-primary w-full text-sm py-2">
                    Confirmer +{durationLabel(extraMins)}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Quick Add Modal ──────────────────────────────────────────────────────────
const CATS: {key: TaskCategory; label: string}[] = [
  {key:"travail",label:"Travail"},{key:"sport",label:"Sport"},{key:"etudes",label:"Études"},
  {key:"personnel",label:"Personnel"},{key:"social",label:"Social"},{key:"finance",label:"Finance"},
];

function QuickAddModal({ date, onClose, onAdd, existingTasks }: { date: string; onClose: () => void; onAdd: (t: Task) => void; existingTasks?: Task[] }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("travail");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [overlapError, setOverlapError] = useState("");

  function hasOverlap(newStart: string, newEnd: string): boolean {
    const newS = toMin(newStart), newE = toMin(newEnd);
    // Check against existing tasks on the same date
    const dateTasks = (existingTasks || []).filter(t => t.date === date);
    for (const t of dateTasks) {
      if (newS < toMin(t.endTime) && newE > toMin(t.startTime)) return true;
    }
    // Check against blocked slots for this day of week
    const [y, m, d] = date.split("-").map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    const dayBlocked = blockedSlots.filter(b => b.dayOfWeek === dow);
    for (const b of dayBlocked) {
      if (newS < toMin(b.endTime) && newE > toMin(b.startTime)) return true;
    }
    return false;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const endMin = toMin(startTime)+duration;
    const endTime = `${String(Math.floor(endMin/60)).padStart(2,"0")}:${String(endMin%60).padStart(2,"0")}`;
    if (hasOverlap(startTime, endTime)) {
      setOverlapError("Ce créneau est déjà occupé. Choisissez un autre horaire.");
      return;
    }
    setOverlapError("");
    onAdd({ id:`quick-${Date.now()}`, title, date, startTime, endTime, category, importance:"medium", status:"todo" });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:"rgba(0,0,0,0.3)"}} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-800">Nouvelle tâche</h3>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{formatDateFr(date)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <input autoFocus type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titre de la tâche..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Début</label>
              <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Durée</label>
              <select value={duration} onChange={e=>setDuration(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                {[15,30,45,60,90,120,180,240].map(d=><option key={d} value={d}>{durationLabel(d)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATS.map(c=>{
              const col = CAT_COLORS[c.key];
              return (
                <button key={c.key} type="button" onClick={()=>setCategory(c.key)}
                  className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                  style={category===c.key ? { backgroundColor: col.bg, color: col.text, borderColor: "transparent" } : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }}
                >{c.label}</button>
              );
            })}
          </div>
          {overlapError && (
            <p className="text-xs text-red-500 font-medium -mt-1">{overlapError}</p>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Annuler</button>
            <button type="submit" className="btn-primary flex-1">Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Weekly View ──────────────────────────────────────────────────────────────
const H_START=7, H_END=22, SLOT_H=60;
const TOTAL_H=(H_END-H_START)*SLOT_H, TOTAL_MIN=(H_END-H_START)*60;

const DIAGONAL_BG = "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(0,0,0,0.025) 8px, rgba(0,0,0,0.026) 9px)";

function WeeklyView({ year, month, day, taskMap, onTaskClick, onDayClick }: {
  year: number; month: number; day: number;
  taskMap: Record<string, Task[]>;
  onTaskClick: (t: Task) => void;
  onDayClick: (ds: string) => void;
}) {
  const today = todayStr();
  const weekDates = useMemo(()=>getWeekDates(year,month,day),[year,month,day]);
  const blockedByDow = useMemo(()=>{
    const map: Record<number, BlockedSlot[]>={};
    for (const b of blockedSlots){if(!map[b.dayOfWeek])map[b.dayOfWeek]=[];map[b.dayOfWeek].push(b);}
    return map;
  },[]);

  function pos(start: string, end: string) {
    const sMin=toMin(start)-H_START*60, eMin=toMin(end)-H_START*60;
    const top=Math.max(0,(sMin/TOTAL_MIN)*TOTAL_H);
    const height=Math.max(20,((eMin-sMin)/TOTAL_MIN)*TOTAL_H);
    return { top:`${top}px`, height:`${height}px`, heightPx: height };
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Day headers */}
      <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
        <div className="border-r border-gray-100" />
        {weekDates.map((date,i)=>{
          const ds=dateStr(date), isToday=ds===today;
          const dayName = DAY_LABELS_FULL[i];
          const monthName = MONTH_NAMES[date.getMonth()];
          return (
            <div key={i} className="text-center py-3 px-1 border-r border-gray-100 last:border-r-0">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {dayName} {date.getDate()} {monthName}
              </div>
              {isToday && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mx-auto mt-1" />}
            </div>
          );
        })}
      </div>

      {/* Grid body */}
      <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "64px repeat(7, 1fr)", height: `${TOTAL_H}px` }}>
          {/* Hour labels */}
          <div className="relative border-r border-gray-100" style={{height:`${TOTAL_H}px`}}>
            {Array.from({length:H_END-H_START},(_,i)=>(
              <div key={i} className="absolute right-3 text-[11px] text-gray-400 font-medium -translate-y-1/2" style={{top:`${i*SLOT_H}px`}}>
                {String(H_START+i).padStart(2,"0")}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map((date,ci)=>{
            const ds=dateStr(date), isToday=ds===today;
            const dayTasks=taskMap[ds]||[];
            const blocked=blockedByDow[date.getDay()]||[];
            return (
              <div
                key={ci}
                className="relative border-r border-gray-100 last:border-r-0 cursor-pointer"
                style={{
                  height:`${TOTAL_H}px`,
                  backgroundColor: isToday ? "rgba(59,130,246,0.03)" : "white",
                  backgroundImage: DIAGONAL_BG,
                }}
                onClick={()=>onDayClick(ds)}
              >
                {/* Hour grid lines */}
                {Array.from({length:H_END-H_START},(_,i)=>(
                  <div key={i} className="absolute left-0 right-0 border-t border-gray-100" style={{top:`${i*SLOT_H}px`}}/>
                ))}

                {/* Blocked slots (external/predefined) */}
                {blocked.map(slot=>{
                  const p=pos(slot.startTime,slot.endTime);
                  return (
                    <div
                      key={slot.id}
                      className="absolute left-1 right-1 rounded-xl overflow-hidden px-2.5 py-1.5 z-10"
                      style={{ top:p.top, height:p.height, backgroundColor: BLOCKED_COLOR.bg }}
                    >
                      <p className="text-[11px] font-semibold truncate leading-tight" style={{ color: BLOCKED_COLOR.text }}>{slot.title}</p>
                      {p.heightPx>=36 && <p className="text-[10px] leading-tight mt-0.5" style={{ color: `${BLOCKED_COLOR.text}B3` }}>{slot.startTime}–{slot.endTime}</p>}
                    </div>
                  );
                })}

                {/* Task blocks */}
                {dayTasks.map(task=>{
                  const p=pos(task.startTime,task.endTime);
                  const col=CAT_COLORS[task.category];
                  return (
                    <button
                      key={task.id}
                      onClick={e=>{e.stopPropagation();onTaskClick(task);}}
                      className="absolute left-1 right-1 rounded-xl overflow-hidden px-2.5 py-1.5 z-20 text-left hover:brightness-95 transition-all"
                      style={{ top:p.top, height:p.height, backgroundColor: col.bg, opacity: task.status==="done" ? 0.55 : 1 }}
                    >
                      <p className="text-[11px] font-semibold truncate leading-tight" style={{ color: col.text }}>{task.title}</p>
                      {p.heightPx>=36 && (
                        <p className="text-[10px] leading-tight mt-0.5" style={{ color: `${col.text}B3` }}>
                          {task.startTime} – {task.endTime}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AgendaPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [day, setDay] = useState(now.getDate());
  const [allTasks, setAllTasks] = useState<Task[]>(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState<Task|null>(null);
  const [quickAddDate, setQuickAddDate] = useState<string|null>(null);
  const [adjustments, setAdjustments] = useState<DurationAdjustment[]>([]);

  const taskMap = useMemo(()=>{
    const map: Record<string,Task[]>={};
    for (const t of allTasks){if(!map[t.date])map[t.date]=[];map[t.date].push(t);}
    for (const k of Object.keys(map)) map[k].sort((a,b)=>a.startTime.localeCompare(b.startTime));
    return map;
  },[allTasks]);

  function goPrevWeek() {
    const d = new Date(year, month, day);
    d.setDate(d.getDate() - 7);
    setYear(d.getFullYear()); setMonth(d.getMonth()); setDay(d.getDate());
  }
  function goNextWeek() {
    const d = new Date(year, month, day);
    d.setDate(d.getDate() + 7);
    setYear(d.getFullYear()); setMonth(d.getMonth()); setDay(d.getDate());
  }
  function goToday() { setYear(now.getFullYear()); setMonth(now.getMonth()); setDay(now.getDate()); }

  function toggleDone(id: string) {
    setAllTasks(prev=>prev.map(t=>t.id===id?{...t,status:t.status==="done"?"todo":"done"}:t));
    setSelectedTask(prev=>prev?.id===id?{...prev,status:prev.status==="done"?"todo":"done"}:prev);
  }

  function handleAddTime(adj: DurationAdjustment) {
    setAdjustments(prev=>[...prev,adj]);
    setAllTasks(prev=>prev.map(t=>t.id!==adj.taskId?t:{...t,endTime:addMinutes(t.endTime,adj.addedMinutes)}));
    setSelectedTask(prev=>!prev||prev.id!==adj.taskId?prev:{...prev,endTime:addMinutes(prev.endTime,adj.addedMinutes)});
  }

  function handleAddTask(task: Task) { setAllTasks(prev=>[...prev,task]); }

  const todayAdjustments = adjustments.filter(a=>a.date===todayStr());

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goPrevWeek} className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm transition-colors">
            <ChevronLeft/>
          </button>
          <button onClick={goNextWeek} className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm transition-colors">
            <ChevronRight/>
          </button>
          <h2 className="text-base font-bold text-gray-800">{MONTH_NAMES[month]} {year}</h2>
        </div>
        <div className="flex items-center gap-3">
          {todayAdjustments.length>0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
              <span className="text-xs font-medium text-amber-700">⏱ {todayAdjustments.length} ajout{todayAdjustments.length>1?"s":""} à justifier</span>
            </div>
          )}
          <button onClick={goToday} className="btn-secondary text-sm px-4 py-2">Aujourd&apos;hui</button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(CAT_COLORS) as [TaskCategory, {bg:string;text:string}][]).map(([cat,col])=>(
          <span key={cat} className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: col.bg, color: col.text }}>
            {cat.charAt(0).toUpperCase()+cat.slice(1)}
          </span>
        ))}
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: BLOCKED_COLOR.bg, color: BLOCKED_COLOR.text }}>
          Prédéfini
        </span>
      </div>

      {/* Calendar */}
      <WeeklyView
        year={year} month={month} day={day}
        taskMap={taskMap}
        onTaskClick={setSelectedTask}
        onDayClick={setQuickAddDate}
      />

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          adjustments={adjustments}
          onClose={()=>setSelectedTask(null)}
          onToggleDone={toggleDone}
          onAddTime={handleAddTime}
        />
      )}
      {quickAddDate && <QuickAddModal date={quickAddDate} onClose={()=>setQuickAddDate(null)} onAdd={handleAddTask} existingTasks={allTasks}/>}
    </div>
  );
}
