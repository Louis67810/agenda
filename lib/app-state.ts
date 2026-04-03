"use client";

import type { TaskCategory } from "@/lib/mock-data";

export type AppTaskStatus = "todo" | "in_progress" | "done";
export type ObjectiveStatus = "active" | "completed" | "paused";
export type HabitFrequency = "daily" | "weekly";
export type MoodValue = "great" | "good" | "neutral" | "bad" | "terrible";

export interface BlockedSlot {
  id: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: "cours" | "sport" | "autre";
}

export interface AppTask {
  id: string;
  title: string;
  description?: string;
  categoryKey: TaskCategory;
  importance: number;
  durationMinutes: number;
  deadline?: string;
  status: AppTaskStatus;
  isSimpleTodo: boolean;
  objectiveId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  completedAt?: string;
}

export interface AppObjective {
  id: string;
  title: string;
  description: string;
  importance: number;
  deadline: string;
  color: string;
  status: ObjectiveStatus;
  categoryKey: TaskCategory;
}

export interface HabitLog {
  date: string;
  done: boolean;
  value?: number;
}

export interface AppHabit {
  id: string;
  title: string;
  icon: string;
  frequency: HabitFrequency;
  points: number;
  targetValue?: number;
  unit?: string;
  logs: HabitLog[];
}

export interface DayRecap {
  date: string;
  dayScore: number;
  mood: MoodValue;
  moodNote: string;
}

export interface TaskDurationAdjustment {
  id: string;
  taskId: string;
  date: string;
  addedMinutes: number;
  justification?: string;
  justified?: boolean;
}

export interface AppStateData {
  tasks: AppTask[];
  objectives: AppObjective[];
  habits: AppHabit[];
  recaps: DayRecap[];
  adjustments: TaskDurationAdjustment[];
  blockedSlots: BlockedSlot[];
}

export interface DailyPointBreakdown {
  date: string;
  taskPoints: number;
  habitPoints: number;
  recapBonus: number;
  deductions: number;
  total: number;
  tasksDone: number;
  tasksTotal: number;
  habitsDone: number;
}

export const APP_STATE_STORAGE_KEY = "agenda-app-state-v1";

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  travail: "Travail",
  personnel: "Personnel",
  sport: "Sport",
  etudes: "Etudes",
  sante: "Sante",
  social: "Social",
  finance: "Finance",
  creativite: "Creativite",
};

export const OBJECTIVE_COLORS = [
  "bg-orange-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-pink-500",
];

export const INITIAL_BLOCKED_SLOTS: BlockedSlot[] = [
  { id: "b1", title: "Cours Algo", dayOfWeek: 1, startTime: "08:00", endTime: "10:00", type: "cours" },
  { id: "b2", title: "Cours Maths", dayOfWeek: 1, startTime: "14:00", endTime: "16:00", type: "cours" },
  { id: "b3", title: "Football", dayOfWeek: 2, startTime: "18:00", endTime: "20:00", type: "sport" },
  { id: "b4", title: "TD Programmation", dayOfWeek: 3, startTime: "14:00", endTime: "17:00", type: "cours" },
  { id: "b5", title: "Salle de sport", dayOfWeek: 4, startTime: "17:00", endTime: "19:00", type: "sport" },
  { id: "b6", title: "Cours Reseaux", dayOfWeek: 5, startTime: "10:00", endTime: "12:00", type: "cours" },
];

export function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

export function startOfDayIso(date: string, time = "08:00") {
  return `${date}T${time}:00`;
}

export function toDateTimeInput(iso: string) {
  return iso.slice(0, 16);
}

export function dateFromDateTime(iso?: string) {
  return iso?.slice(0, 10);
}

export function timeFromDateTime(iso?: string) {
  return iso?.slice(11, 16);
}

export function addMinutesToIso(iso: string, minutes: number) {
  const value = new Date(iso);
  value.setMinutes(value.getMinutes() + minutes);
  return value.toISOString().slice(0, 16);
}

export function addDays(date: string, offset: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + offset);
  return value.toISOString().slice(0, 10);
}

export function startOfWeek(date: string) {
  const value = new Date(`${date}T12:00:00`);
  const offset = (value.getDay() + 6) % 7;
  value.setDate(value.getDate() - offset);
  return value.toISOString().slice(0, 10);
}

export function daysBetween(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
}

export function formatDisplayDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDisplayDateTime(iso?: string) {
  if (!iso) return "Non planifiee";
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h${String(mins).padStart(2, "0")}` : `${hours}h`;
}

export function parseDuration(duration: string) {
  const trimmed = duration.trim().toLowerCase();
  if (trimmed === "+4h") return 240;
  if (trimmed.endsWith("min")) return Number(trimmed.replace("min", ""));
  const match = trimmed.match(/^(\d+)h(?:(\d+))?$/);
  if (!match) return 60;
  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  return hours * 60 + minutes;
}

function pointsForTask(task: AppTask) {
  return task.importance * 10;
}

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function sortTasksForScheduling(tasks: AppTask[]) {
  return [...tasks].sort((a, b) => {
    const scoreA = schedulingScore(a);
    const scoreB = schedulingScore(b);
    return scoreB - scoreA;
  });
}

function schedulingScore(task: AppTask) {
  const durationBonus = 1 / Math.max(task.durationMinutes, 15);
  const urgency = !task.deadline ? 0 : Math.max(0, 14 - Math.max(daysBetween(isoToday(), task.deadline), 0));
  const inProgressBoost = task.status === "in_progress" ? 100 : 0;
  return task.importance * 30 + urgency * 4 + durationBonus + inProgressBoost;
}

function overlapsBlocked(start: Date, end: Date, slots: BlockedSlot[]) {
  return slots.some((slot) => {
    const slotStart = combineDateAndTime(start.toISOString().slice(0, 10), slot.startTime);
    const slotEnd = combineDateAndTime(start.toISOString().slice(0, 10), slot.endTime);
    return start < slotEnd && end > slotStart;
  });
}

function combineDateAndTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function dayBlockedSlots(date: string, blockedSlots: BlockedSlot[]) {
  const value = new Date(`${date}T12:00:00`);
  const dayOfWeek = value.getDay();
  return blockedSlots.filter((slot) => slot.dayOfWeek === dayOfWeek);
}

export function scheduleTasks(tasks: AppTask[], blockedSlots: BlockedSlot[]) {
  const sorted = sortTasksForScheduling(tasks);
  const occupied: Record<string, { start: Date; end: Date }[]> = {};

  return sorted.map((task) => {
    if (task.status === "done") {
      return task;
    }

    const deadlineOrToday = task.deadline ?? isoToday();
    const baseDate = deadlineOrToday < isoToday() ? isoToday() : deadlineOrToday;
    let scheduledStart = task.scheduledStart;

    if (task.status === "in_progress" && task.scheduledStart && task.scheduledEnd) {
      const day = dateFromDateTime(task.scheduledStart) as string;
      if (!occupied[day]) occupied[day] = [];
      occupied[day].push({ start: new Date(task.scheduledStart), end: new Date(task.scheduledEnd) });
      return task;
    }

    outer:
    for (let dayOffset = 0; dayOffset < 21; dayOffset += 1) {
      const date = addDays(baseDate, dayOffset);
      const slots = dayBlockedSlots(date, blockedSlots);
      if (!occupied[date]) occupied[date] = [];

      for (let minutes = 8 * 60; minutes <= 21 * 60; minutes += 30) {
        const start = combineDateAndTime(date, `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + task.durationMinutes);

        if (end.getHours() > 22 || (end.getHours() === 22 && end.getMinutes() > 0)) {
          continue;
        }

        if (overlapsBlocked(start, end, slots)) {
          continue;
        }

        const overlapsTask = occupied[date].some((busy) => start < busy.end && end > busy.start);
        if (overlapsTask) {
          continue;
        }

        occupied[date].push({ start, end });
        scheduledStart = start.toISOString().slice(0, 16);
        break outer;
      }
    }

    if (!scheduledStart) {
      scheduledStart = startOfDayIso(baseDate, "08:00");
    }

    return {
      ...task,
      scheduledStart,
      scheduledEnd: addMinutesToIso(scheduledStart, task.durationMinutes),
    };
  });
}

export function computeObjectiveProgress(tasks: AppTask[], objectiveId: string) {
  const objectiveTasks = tasks.filter((task) => task.objectiveId === objectiveId);
  if (objectiveTasks.length === 0) return 0;
  const completed = objectiveTasks.filter((task) => task.status === "done").length;
  return Math.round((completed / objectiveTasks.length) * 100);
}

export function computeHabitStreak(habit: AppHabit, today = isoToday()) {
  const lookup = new Set(habit.logs.filter((log) => log.done).map((log) => log.date));
  let streak = 0;
  let cursor = today;

  while (lookup.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function getHabitLogForDate(habit: AppHabit, date: string) {
  return habit.logs.find((log) => log.date === date);
}

export function computeDailyPoints(data: AppStateData) {
  const dates = new Set<string>();
  data.tasks.forEach((task) => {
    if (task.completedAt) dates.add(task.completedAt);
    if (task.scheduledStart) dates.add(dateFromDateTime(task.scheduledStart) as string);
  });
  data.habits.forEach((habit) => habit.logs.forEach((log) => dates.add(log.date)));
  data.recaps.forEach((recap) => dates.add(recap.date));
  data.adjustments.forEach((adjustment) => dates.add(adjustment.date));

  return [...dates]
    .filter(Boolean)
    .sort()
    .map((date) => {
      const dayTasks = data.tasks.filter((task) => dateFromDateTime(task.scheduledStart) === date);
      const doneTasks = data.tasks.filter((task) => task.completedAt === date);
      const taskPoints = doneTasks.reduce((sum, task) => sum + pointsForTask(task), 0);
      const habitPoints = data.habits.reduce((sum, habit) => {
        const log = habit.logs.find((entry) => entry.date === date && entry.done);
        return sum + (log ? habit.points : 0);
      }, 0);
      const recap = data.recaps.find((entry) => entry.date === date);
      const recapBonus = recap && recap.dayScore >= 8 ? 5 : 0;
      const deductions = data.adjustments
        .filter((entry) => entry.date === date && entry.justified === false)
        .reduce((sum, entry) => sum + Math.round(entry.addedMinutes / 15), 0);

      return {
        date,
        taskPoints,
        habitPoints,
        recapBonus,
        deductions,
        total: taskPoints + habitPoints + recapBonus - deductions,
        tasksDone: doneTasks.length,
        tasksTotal: dayTasks.length,
        habitsDone: data.habits.filter((habit) => habit.logs.some((log) => log.date === date && log.done)).length,
      } satisfies DailyPointBreakdown;
    });
}

export function computeTotalPoints(data: AppStateData) {
  return computeDailyPoints(data).reduce((sum, day) => sum + day.total, 0);
}

export function createSeedState(): AppStateData {
  const today = isoToday();
  const yesterday = addDays(today, -1);
  const inThreeDays = addDays(today, 3);
  const nextWeek = addDays(today, 7);

  const objectives: AppObjective[] = [
    {
      id: "obj-nextjs",
      title: "Lancer la vraie app agenda",
      description: "Connecter les modules et stabiliser les flux du produit.",
      importance: 5,
      deadline: nextWeek,
      color: "bg-violet-500",
      status: "active",
      categoryKey: "travail",
    },
    {
      id: "obj-running",
      title: "Courir 10 km sous 50 min",
      description: "Construire un plan progressif avec des seances planifiees.",
      importance: 4,
      deadline: addDays(today, 45),
      color: "bg-emerald-500",
      status: "active",
      categoryKey: "sport",
    },
  ];

  const tasks = scheduleTasks(
    [
      {
        id: "task-1",
        title: "Connecter les pages a une vraie source de donnees",
        categoryKey: "travail",
        importance: 5,
        durationMinutes: 120,
        deadline: today,
        status: "in_progress",
        isSimpleTodo: false,
        objectiveId: "obj-nextjs",
      },
      {
        id: "task-2",
        title: "Revoir le recap quotidien",
        categoryKey: "travail",
        importance: 4,
        durationMinutes: 60,
        deadline: inThreeDays,
        status: "todo",
        isSimpleTodo: false,
        objectiveId: "obj-nextjs",
      },
      {
        id: "task-3",
        title: "Seance endurance 8 km",
        categoryKey: "sport",
        importance: 3,
        durationMinutes: 50,
        deadline: inThreeDays,
        status: "todo",
        isSimpleTodo: false,
        objectiveId: "obj-running",
      },
      {
        id: "task-4",
        title: "Acheter des courses",
        categoryKey: "personnel",
        importance: 2,
        durationMinutes: 30,
        deadline: today,
        status: "todo",
        isSimpleTodo: true,
      },
      {
        id: "task-5",
        title: "Finaliser le tableau de bord",
        categoryKey: "travail",
        importance: 4,
        durationMinutes: 90,
        deadline: yesterday,
        status: "done",
        isSimpleTodo: false,
        objectiveId: "obj-nextjs",
        completedAt: yesterday,
      },
    ],
    INITIAL_BLOCKED_SLOTS,
  );

  const habits: AppHabit[] = [
    {
      id: "habit-1",
      title: "Lire 30 min",
      icon: "📖",
      frequency: "daily",
      points: 10,
      logs: [
        { date: yesterday, done: true },
        { date: today, done: false },
      ],
    },
    {
      id: "habit-2",
      title: "Marcher 10 000 pas",
      icon: "🚶",
      frequency: "daily",
      points: 15,
      targetValue: 10000,
      unit: "pas",
      logs: [
        { date: yesterday, done: true, value: 11200 },
        { date: today, done: false, value: 4200 },
      ],
    },
    {
      id: "habit-3",
      title: "Sport",
      icon: "💪",
      frequency: "weekly",
      points: 20,
      targetValue: 3,
      unit: "seances",
      logs: [{ date: yesterday, done: true, value: 1 }],
    },
  ];

  return {
    tasks,
    objectives,
    habits,
    recaps: [{ date: yesterday, dayScore: 8, mood: "good", moodNote: "Bonne avancee sur le projet." }],
    adjustments: [],
    blockedSlots: INITIAL_BLOCKED_SLOTS,
  };
}

export function createTask(input: Omit<AppTask, "id" | "scheduledStart" | "scheduledEnd" | "completedAt">) {
  return {
    ...input,
    id: nextId("task"),
  } satisfies AppTask;
}

export function createObjective(input: Omit<AppObjective, "id">) {
  return {
    ...input,
    id: nextId("objective"),
  } satisfies AppObjective;
}

export function createHabit(input: Omit<AppHabit, "id" | "logs">) {
  return {
    ...input,
    id: nextId("habit"),
    logs: [],
  } satisfies AppHabit;
}
