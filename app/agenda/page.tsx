"use client";

import { useState, useMemo } from "react";
import { tasks as INITIAL_TASKS, blockedSlots, categoryColors, type Task, type BlockedSlot, type TaskCategory } from "@/lib/mock-data";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DurationAdjustment {
  taskId: string;
  taskTitle: string;
  addedMinutes: number;
  date: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTH_NAMES = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function todayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
}
function dateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function getMonthGrid(year: number, month: number): (Date|null)[][] {
  const first = new Date(year, month, 1);
  const startDow = (first.getDay()+6)%7;
  const total = new Date(year, month+1, 0).getDate();
  const cells: (Date|null)[] = [];
  for (let i=0; i<startDow; i++) cells.push(null);
  for (let d=1; d<=total; d++) cells.push(new Date(year, month, d));
  while (cells.length%7) cells.push(null);
  const rows: (Date|null)[][] = [];
  for (let i=0; i<cells.length; i+=7) rows.push(cells.slice(i,i+7));
  return rows;
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
function formatDateFr(ds: string) {
  const [y,m,d]=ds.split("-").map(Number);
  return new Date(y,m-1,d).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
}
function durationLabel(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins/60), m = mins%60;
  return m ? `${h}h${m}` : `${h}h`;
}

const importanceLabels: Record<string, string> = { low:"Faible", medium:"Moyenne", high:"Haute", critical:"Critique" };

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronLeft() { return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 15l-5-5 5-5"/></svg>; }
function ChevronRight() { return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 5l5 5-5 5"/></svg>; }

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
  const colors = categoryColors[task.category];
  const isDone = task.status === "done";
  const baseDuration = toMin(task.endTime) - toMin(task.startTime);
  const totalAdded = adjustments.filter(a => a.taskId === task.id).reduce((s,a) => s+a.addedMinutes, 0);

  function confirmAddTime() {
    onAddTime({ taskId: task.id, taskTitle: task.title, addedMinutes: extraMins, date: task.date });
    setAddingTime(false);
    setExtraMins(15);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-end"
      style={{ backdropFilter:"blur(2px)", backgroundColor:"rgba(0,0,0,0.15)" }}
      onClick={onClose}
    >
      <div className="bg-white h-full w-full max-w-sm shadow-2xl flex flex-col" onClick={e=>e.stopPropagation()}>
        {/* Top bar */}
        <div className={`h-1.5 ${colors.bg}`} />
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${colors.bg} ${colors.text}`}>
            {task.category}
          </span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title */}
          <div>
            <h2 className={`text-lg font-bold ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>{task.title}</h2>
            {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label:"Date", value: formatDateFr(task.date) },
              { label:"Horaire", value: `${task.startTime} – ${addMinutes(task.endTime, totalAdded)}` },
              { label:"Durée base", value: durationLabel(baseDuration) },
              { label:"Importance", value: importanceLabels[task.importance] ?? task.importance },
            ].map(({label,value}) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5 capitalize">{value}</p>
              </div>
            ))}
          </div>

          {/* Time added indicator */}
          {totalAdded > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <span className="text-amber-600 text-sm font-medium">⏱ +{durationLabel(totalAdded)} ajoutés</span>
              <span className="text-amber-500 text-xs ml-auto">À justifier au récap</span>
            </div>
          )}

          {/* ── MARQUER TERMINÉ ── */}
          <button
            onClick={() => onToggleDone(task.id)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
              isDone
                ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
            }`}
          >
            {isDone ? (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg> Marquer comme à faire</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Marquer comme terminé</>
            )}
          </button>

          {/* ── AJOUTER DU TEMPS ── */}
          {!isDone && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setAddingTime(!addingTime)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Ajouter du temps
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${addingTime?"rotate-180":""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>

              {addingTime && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 pt-3">De combien de minutes as-tu besoin en plus ?</p>
                  <div className="flex gap-2">
                    {[15, 30, 45, 60].map(n => (
                      <button key={n} onClick={() => setExtraMins(n)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${extraMins===n ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"}`}
                      >
                        +{n} min
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min={5} max={240} value={extraMins}
                      onChange={e => setExtraMins(Math.max(5, Number(e.target.value)))}
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-orange-400"
                    />
                    <span className="text-xs text-gray-500">min personnalisé</span>
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
  {key:"personnel",label:"Personnel"},{key:"creativite",label:"Créativité"},{key:"finance",label:"Finance"},
];

function QuickAddModal({ date, onClose, onAdd }: { date: string; onClose: () => void; onAdd: (t: Task) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("travail");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(60);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const endMin = toMin(startTime)+duration;
    const endTime = `${String(Math.floor(endMin/60)).padStart(2,"0")}:${String(endMin%60).padStart(2,"0")}`;
    onAdd({ id:`quick-${Date.now()}`, title, date, startTime, endTime, category, importance:"medium", status:"todo" });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:"rgba(0,0,0,0.25)"}} onClick={onClose}>
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
          <input autoFocus type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titre de la tâche..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Début</label>
              <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Durée</label>
              <select value={duration} onChange={e=>setDuration(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                {[15,30,45,60,90,120,180,240].map(d=><option key={d} value={d}>{durationLabel(d)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATS.map(c=>(
              <button key={c.key} type="button" onClick={()=>setCategory(c.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${category===c.key?`${categoryColors[c.key].bg} ${categoryColors[c.key].text} border-transparent`:"bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}
              >{c.label}</button>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Annuler</button>
            <button type="submit" className="btn-primary flex-1">Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Task Pill ────────────────────────────────────────────────────────────────

function TaskPill({ task, onClick }: { task: Task; onClick: () => void }) {
  const colors = categoryColors[task.category];
  return (
    <button
      onClick={e=>{e.stopPropagation();onClick();}}
      className={`w-full flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] leading-tight font-medium truncate hover:opacity-80 transition-opacity ${colors.bg} ${colors.text} ${task.status==="done"?"opacity-50":""}`}
    >
      <span className="opacity-70 shrink-0">{task.startTime}</span>
      <span className="truncate">{task.title}</span>
      {task.status==="done" && <span className="ml-auto shrink-0 text-[9px]">✓</span>}
    </button>
  );
}

// ─── Monthly View ─────────────────────────────────────────────────────────────

function MonthlyView({ year, month, taskMap, onTaskClick, onDayClick }: {
  year: number; month: number;
  taskMap: Record<string, Task[]>;
  onTaskClick: (t: Task) => void;
  onDayClick: (ds: string) => void;
}) {
  const today = todayStr();
  const grid = useMemo(()=>getMonthGrid(year,month),[year,month]);
  return (
    <div className="card p-0 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_LABELS.map((l,i)=><div key={l} className={`text-center text-xs font-semibold py-3 ${i>=5?"text-gray-400":"text-gray-500"}`}>{l}</div>)}
      </div>
      {grid.map((row,ri)=>(
        <div key={ri} className="grid grid-cols-7 border-b last:border-b-0 border-gray-50">
          {row.map((cell,ci)=>{
            if (!cell) return <div key={ci} className="min-h-[110px] bg-gray-50/40"/>;
            const ds = dateStr(cell);
            const isToday = ds===today;
            const dayTasks = taskMap[ds]||[];
            const isWeekend = ci>=5;
            const overflow = dayTasks.length-3;
            return (
              <div key={ci} onClick={()=>onDayClick(ds)}
                className={`min-h-[110px] p-1.5 border-r last:border-r-0 border-gray-50 cursor-pointer group transition-colors ${isWeekend?"bg-stone-50/60":""} ${dayTasks.length>0&&!isWeekend?"bg-orange-50/20":""} hover:bg-orange-50/40`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`inline-flex items-center justify-center text-xs font-semibold w-7 h-7 rounded-full ${isToday?"bg-orange-500 text-white shadow-sm":isWeekend?"text-gray-400":"text-gray-600"}`}>
                    {cell.getDate()}
                  </span>
                  <span className="text-[9px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pt-1 pr-0.5">+</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {dayTasks.slice(0,3).map(t=><TaskPill key={t.id} task={t} onClick={()=>onTaskClick(t)}/>)}
                  {overflow>0 && <span className="text-[10px] text-gray-400 font-medium pl-1">+{overflow} autres</span>}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Weekly View ──────────────────────────────────────────────────────────────

const H_START=8, H_END=22, SLOT_H=60;
const TOTAL_H=(H_END-H_START)*SLOT_H, TOTAL_MIN=(H_END-H_START)*60;

function WeeklyView({ year, month, day, taskMap, onTaskClick }: {
  year: number; month: number; day: number;
  taskMap: Record<string, Task[]>;
  onTaskClick: (t: Task) => void;
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
    const height=Math.max(18,((eMin-sMin)/TOTAL_MIN)*TOTAL_H);
    return { top:`${top}px`, height:`${height}px`, heightPx: height };
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-gray-100">
        <div/>
        {weekDates.map((date,i)=>{
          const ds=dateStr(date), isToday=ds===today;
          return (
            <div key={i} className="text-center py-3 border-l border-gray-50">
              <div className="text-[10px] font-medium text-gray-400 uppercase">{DAY_LABELS[i]}</div>
              <div className={`inline-flex items-center justify-center mt-0.5 text-sm font-bold w-8 h-8 rounded-full ${isToday?"bg-orange-500 text-white":"text-gray-700"}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-[56px_repeat(7,1fr)] overflow-y-auto max-h-[calc(100vh-280px)]">
        {/* Hour labels */}
        <div className="relative" style={{height:`${TOTAL_H}px`}}>
          {Array.from({length:H_END-H_START},(_,i)=>(
            <div key={i} className="absolute right-2 text-[10px] text-gray-400 font-medium -translate-y-1/2" style={{top:`${i*SLOT_H}px`}}>
              {String(H_START+i).padStart(2,"0")}h
            </div>
          ))}
        </div>
        {/* Day columns */}
        {weekDates.map((date,ci)=>{
          const ds=dateStr(date), isToday=ds===today;
          const dayTasks=taskMap[ds]||[];
          const blocked=blockedByDow[date.getDay()]||[];
          return (
            <div key={ci} className={`relative border-l border-gray-50 ${isToday?"bg-orange-50/30":""}`} style={{height:`${TOTAL_H}px`}}>
              {Array.from({length:H_END-H_START},(_,i)=>(
                <div key={i} className="absolute left-0 right-0 border-t border-gray-100" style={{top:`${i*SLOT_H}px`}}/>
              ))}
              {blocked.map(slot=>{
                const p=pos(slot.startTime,slot.endTime);
                return (
                  <div key={slot.id} className="absolute left-0.5 right-0.5 rounded-lg bg-gray-100 border border-gray-200/60 overflow-hidden px-2 flex flex-col justify-center z-10" style={{top:p.top,height:p.height}}>
                    <span className="text-[10px] font-semibold text-gray-500 truncate leading-tight">{slot.title}</span>
                    {p.heightPx>=36 && <span className="text-[9px] text-gray-400 leading-tight">{slot.startTime}–{slot.endTime}</span>}
                  </div>
                );
              })}
              {dayTasks.map(task=>{
                const p=pos(task.startTime,task.endTime);
                const colors=categoryColors[task.category];
                return (
                  <button key={task.id} onClick={()=>onTaskClick(task)}
                    className={`absolute left-1 right-1 rounded-lg border overflow-hidden px-2 flex flex-col justify-center z-20 shadow-sm hover:shadow-md hover:z-30 transition-shadow text-left ${colors.bg} ${colors.border} ${task.status==="done"?"opacity-50":""}`}
                    style={{top:p.top,height:p.height}}
                  >
                    <span className={`text-[11px] font-semibold truncate leading-tight ${colors.text}`}>{task.title}</span>
                    {/* Only show time if block is tall enough */}
                    {p.heightPx>=36 && (
                      <span className={`text-[9px] opacity-70 leading-tight ${colors.text}`}>{task.startTime}–{task.endTime}</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [view, setView] = useState<"month"|"week">("month");
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

  function goPrev(){ month===0?(setMonth(11),setYear(year-1)):setMonth(month-1); }
  function goNext(){ month===11?(setMonth(0),setYear(year+1)):setMonth(month+1); }
  function goToday(){ setYear(now.getFullYear()); setMonth(now.getMonth()); }

  function toggleDone(id: string) {
    setAllTasks(prev=>prev.map(t=>t.id===id?{...t,status:t.status==="done"?"todo":"done"}:t));
    setSelectedTask(prev=>prev?.id===id?{...prev,status:prev.status==="done"?"todo":"done"}:prev);
  }

  function handleAddTime(adj: DurationAdjustment) {
    setAdjustments(prev=>[...prev,adj]);
    // Extend task endTime in the calendar
    setAllTasks(prev=>prev.map(t=>{
      if (t.id!==adj.taskId) return t;
      return {...t, endTime: addMinutes(t.endTime, adj.addedMinutes)};
    }));
    setSelectedTask(prev=>{
      if (!prev||prev.id!==adj.taskId) return prev;
      return {...prev, endTime: addMinutes(prev.endTime, adj.addedMinutes)};
    });
  }

  function handleAddTask(task: Task) {
    setAllTasks(prev=>[...prev,task]);
  }

  const todayAdjustments = adjustments.filter(a=>a.date===todayStr());

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Agenda</h1>
          <p className="text-sm text-gray-400">Cliquez sur une tâche · sur un jour pour ajouter</p>
        </div>
        <div className="flex items-center gap-3">
          {todayAdjustments.length>0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
              <span className="text-xs font-medium text-amber-700">⏱ {todayAdjustments.length} ajout{todayAdjustments.length>1?"s":""} à justifier</span>
            </div>
          )}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(["month","week"] as const).map(v=>(
              <button key={v} onClick={()=>setView(v)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view===v?"bg-white text-gray-800 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
                {v==="month"?"Mois":"Semaine"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goPrev} className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm"><ChevronLeft/></button>
          <button onClick={goNext} className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm"><ChevronRight/></button>
          <h2 className="text-lg font-bold text-gray-800 ml-1">{MONTH_NAMES[month]} {year}</h2>
        </div>
        <button onClick={goToday} className="btn-secondary text-sm">Aujourd&apos;hui</button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(categoryColors) as [TaskCategory, typeof categoryColors[TaskCategory]][]).map(([cat,c])=>(
          <span key={cat} className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
            {cat.charAt(0).toUpperCase()+cat.slice(1)}
          </span>
        ))}
      </div>

      {/* Calendar */}
      {view==="month"
        ? <MonthlyView year={year} month={month} taskMap={taskMap} onTaskClick={setSelectedTask} onDayClick={setQuickAddDate}/>
        : <WeeklyView year={year} month={month} day={now.getDate()} taskMap={taskMap} onTaskClick={setSelectedTask}/>
      }

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          adjustments={adjustments}
          onClose={()=>setSelectedTask(null)}
          onToggleDone={toggleDone}
          onAddTime={handleAddTime}
        />
      )}
      {quickAddDate && <QuickAddModal date={quickAddDate} onClose={()=>setQuickAddDate(null)} onAdd={handleAddTask}/>}
    </div>
  );
}
