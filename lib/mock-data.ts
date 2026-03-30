// ─── Types ───────────────────────────────────────────────────────────────────

export type TaskCategory =
  | "travail"
  | "personnel"
  | "sport"
  | "etudes"
  | "sante"
  | "social"
  | "finance"
  | "creativite";

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskImportance = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: TaskCategory;
  importance: TaskImportance;
  status: TaskStatus;
  description?: string;
}

export interface BlockedSlot {
  id: string;
  title: string;
  dayOfWeek: number; // 0=Sun … 6=Sat
  startTime: string;
  endTime: string;
  type: "cours" | "sport" | "autre";
}

export interface Objective {
  id: string;
  title: string;
  category: TaskCategory;
  subcategory: string;
  progress: number; // 0–100
  deadline: string;
  milestones: string[];
}

export interface Habit {
  id: string;
  title: string;
  category: TaskCategory;
  frequency: "daily" | "weekly" | "monthly";
  streak: number;
  completedDates: string[];
  targetPerWeek?: number;
}

// ─── Category colours (Tailwind classes) ─────────────────────────────────────

export const categoryColors: Record<
  TaskCategory,
  { bg: string; text: string; border: string }
> = {
  travail: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  personnel: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  sport: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  etudes: { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
  sante: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  social: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  finance: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  creativite: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
};

// ─── Helper: build a date string relative to "today" ────────────────────────

function d(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// We generate tasks for March 2026 to match the current date context.
const Y = 2026;
const M = 3;

// ─── Mock Tasks ──────────────────────────────────────────────────────────────

export const tasks: Task[] = [
  // Week 1
  { id: "t1", title: "Réunion équipe produit", date: d(Y, M, 2), startTime: "09:00", endTime: "10:00", category: "travail", importance: "high", status: "done" },
  { id: "t2", title: "Code review PR #42", date: d(Y, M, 2), startTime: "14:00", endTime: "15:00", category: "travail", importance: "medium", status: "done" },
  { id: "t3", title: "Course à pied", date: d(Y, M, 3), startTime: "07:00", endTime: "08:00", category: "sport", importance: "medium", status: "done" },
  { id: "t4", title: "Préparer présentation Q1", date: d(Y, M, 3), startTime: "10:00", endTime: "12:00", category: "travail", importance: "critical", status: "done" },
  { id: "t5", title: "Appel médecin", date: d(Y, M, 4), startTime: "11:00", endTime: "11:30", category: "sante", importance: "high", status: "done" },
  { id: "t6", title: "Déjeuner avec Marie", date: d(Y, M, 5), startTime: "12:30", endTime: "14:00", category: "social", importance: "low", status: "done" },
  { id: "t7", title: "Musculation", date: d(Y, M, 5), startTime: "18:00", endTime: "19:30", category: "sport", importance: "medium", status: "done" },

  // Week 2
  { id: "t8", title: "Sprint planning", date: d(Y, M, 9), startTime: "09:30", endTime: "11:00", category: "travail", importance: "high", status: "done" },
  { id: "t9", title: "Lecture chapitre 5", date: d(Y, M, 9), startTime: "20:00", endTime: "21:00", category: "etudes", importance: "medium", status: "done" },
  { id: "t10", title: "Payer loyer", date: d(Y, M, 10), startTime: "09:00", endTime: "09:15", category: "finance", importance: "critical", status: "done" },
  { id: "t11", title: "Yoga", date: d(Y, M, 10), startTime: "07:30", endTime: "08:30", category: "sport", importance: "low", status: "done" },
  { id: "t12", title: "Écrire article blog", date: d(Y, M, 11), startTime: "15:00", endTime: "17:00", category: "creativite", importance: "medium", status: "done" },
  { id: "t13", title: "Rendez-vous dentiste", date: d(Y, M, 12), startTime: "14:00", endTime: "15:00", category: "sante", importance: "high", status: "done" },

  // Week 3
  { id: "t14", title: "Demo client", date: d(Y, M, 16), startTime: "10:00", endTime: "11:30", category: "travail", importance: "critical", status: "done" },
  { id: "t15", title: "Apéro collègues", date: d(Y, M, 16), startTime: "18:30", endTime: "20:00", category: "social", importance: "low", status: "done" },
  { id: "t16", title: "Course à pied", date: d(Y, M, 17), startTime: "07:00", endTime: "08:00", category: "sport", importance: "medium", status: "done" },
  { id: "t17", title: "Réviser TypeScript avancé", date: d(Y, M, 18), startTime: "19:00", endTime: "21:00", category: "etudes", importance: "high", status: "done" },
  { id: "t18", title: "Budget mensuel", date: d(Y, M, 19), startTime: "10:00", endTime: "11:00", category: "finance", importance: "high", status: "done" },

  // Week 4
  { id: "t19", title: "Rétrospective sprint", date: d(Y, M, 23), startTime: "09:00", endTime: "10:30", category: "travail", importance: "high", status: "in_progress" },
  { id: "t20", title: "Natation", date: d(Y, M, 23), startTime: "12:30", endTime: "13:30", category: "sport", importance: "medium", status: "in_progress" },
  { id: "t21", title: "Préparer slides formation", date: d(Y, M, 24), startTime: "14:00", endTime: "16:00", category: "travail", importance: "high", status: "in_progress" },
  { id: "t22", title: "Dîner famille", date: d(Y, M, 25), startTime: "19:30", endTime: "22:00", category: "social", importance: "medium", status: "todo" },
  { id: "t23", title: "Musculation", date: d(Y, M, 26), startTime: "18:00", endTime: "19:30", category: "sport", importance: "medium", status: "todo" },

  // Current week / upcoming
  { id: "t24", title: "Standup lundi", date: d(Y, M, 30), startTime: "09:00", endTime: "09:15", category: "travail", importance: "medium", status: "todo" },
  { id: "t25", title: "Envoyer rapport Q1", date: d(Y, M, 30), startTime: "11:00", endTime: "12:00", category: "travail", importance: "critical", status: "todo" },
  { id: "t26", title: "Course à pied", date: d(Y, M, 30), startTime: "07:00", endTime: "08:00", category: "sport", importance: "medium", status: "todo" },
  { id: "t27", title: "Lecture chapitre 6", date: d(Y, M, 31), startTime: "20:00", endTime: "21:30", category: "etudes", importance: "medium", status: "todo" },
  { id: "t28", title: "Appel comptable", date: d(Y, M, 31), startTime: "10:00", endTime: "10:30", category: "finance", importance: "high", status: "todo" },

  // Today (March 29)
  { id: "t29", title: "Revue objectifs Q1", date: d(Y, M, 29), startTime: "10:00", endTime: "11:30", category: "travail", importance: "high", status: "in_progress" },
  { id: "t30", title: "Yoga", date: d(Y, M, 29), startTime: "08:00", endTime: "09:00", category: "sport", importance: "low", status: "done" },
  { id: "t31", title: "Dessiner maquettes app", date: d(Y, M, 29), startTime: "14:00", endTime: "16:00", category: "creativite", importance: "medium", status: "todo" },
  { id: "t32", title: "Appel parents", date: d(Y, M, 29), startTime: "18:00", endTime: "18:30", category: "personnel", importance: "medium", status: "todo" },
];

// ─── Mock Blocked Slots (recurring weekly) ───────────────────────────────────

export const blockedSlots: BlockedSlot[] = [
  { id: "b1", title: "Cours Algo", dayOfWeek: 1, startTime: "08:00", endTime: "10:00", type: "cours" },
  { id: "b2", title: "Cours Maths", dayOfWeek: 1, startTime: "14:00", endTime: "16:00", type: "cours" },
  { id: "b3", title: "Cours Systèmes", dayOfWeek: 3, startTime: "08:00", endTime: "10:00", type: "cours" },
  { id: "b4", title: "TD Programmation", dayOfWeek: 3, startTime: "14:00", endTime: "17:00", type: "cours" },
  { id: "b5", title: "Cours Réseaux", dayOfWeek: 5, startTime: "10:00", endTime: "12:00", type: "cours" },
  { id: "b6", title: "Football", dayOfWeek: 2, startTime: "18:00", endTime: "20:00", type: "sport" },
  { id: "b7", title: "Salle de sport", dayOfWeek: 4, startTime: "17:00", endTime: "19:00", type: "sport" },
];

// ─── Mock Objectives ─────────────────────────────────────────────────────────

export const objectives: Objective[] = [
  {
    id: "o1",
    title: "Maîtriser Next.js 15",
    category: "etudes",
    subcategory: "Développement web",
    progress: 72,
    deadline: d(Y, 4, 30),
    milestones: ["App Router basics", "Server components", "Data fetching", "Middleware & Auth", "Déploiement"],
  },
  {
    id: "o2",
    title: "Courir 10 km en moins de 50 min",
    category: "sport",
    subcategory: "Course à pied",
    progress: 55,
    deadline: d(Y, 6, 15),
    milestones: ["5 km < 27 min", "8 km sans pause", "10 km complet", "10 km < 50 min"],
  },
  {
    id: "o3",
    title: "Épargner 2 000 € ce trimestre",
    category: "finance",
    subcategory: "Épargne",
    progress: 80,
    deadline: d(Y, 3, 31),
    milestones: ["500 €", "1 000 €", "1 500 €", "2 000 €"],
  },
  {
    id: "o4",
    title: "Lire 12 livres cette année",
    category: "personnel",
    subcategory: "Lecture",
    progress: 25,
    deadline: d(Y, 12, 31),
    milestones: ["3 livres", "6 livres", "9 livres", "12 livres"],
  },
  {
    id: "o5",
    title: "Publier portfolio créatif",
    category: "creativite",
    subcategory: "Design",
    progress: 40,
    deadline: d(Y, 5, 31),
    milestones: ["Wireframes", "Design system", "Développement", "Mise en ligne"],
  },
];

// ─── Mock Habits ─────────────────────────────────────────────────────────────

export const habits: Habit[] = [
  {
    id: "h1",
    title: "Méditation 10 min",
    category: "sante",
    frequency: "daily",
    streak: 14,
    completedDates: Array.from({ length: 14 }, (_, i) => d(Y, M, 29 - i)),
  },
  {
    id: "h2",
    title: "Lire 30 min",
    category: "personnel",
    frequency: "daily",
    streak: 7,
    completedDates: Array.from({ length: 7 }, (_, i) => d(Y, M, 29 - i)),
  },
  {
    id: "h3",
    title: "Exercice physique",
    category: "sport",
    frequency: "weekly",
    streak: 8,
    targetPerWeek: 3,
    completedDates: [
      d(Y, M, 29), d(Y, M, 27), d(Y, M, 25),
      d(Y, M, 23), d(Y, M, 21), d(Y, M, 19),
    ],
  },
  {
    id: "h4",
    title: "Révision code",
    category: "etudes",
    frequency: "daily",
    streak: 5,
    completedDates: Array.from({ length: 5 }, (_, i) => d(Y, M, 29 - i)),
  },
  {
    id: "h5",
    title: "Planifier semaine",
    category: "travail",
    frequency: "weekly",
    streak: 12,
    targetPerWeek: 1,
    completedDates: [d(Y, M, 29), d(Y, M, 22), d(Y, M, 15), d(Y, M, 8), d(Y, M, 1)],
  },
];
