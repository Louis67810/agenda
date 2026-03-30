"use client";

const tasks = [
  {
    id: 1,
    title: "Préparer la présentation client",
    time: "09:00 - 10:30",
    importance: 3,
    done: false,
    tag: "Travail",
  },
  {
    id: 2,
    title: "Répondre aux emails urgents",
    time: "11:00 - 11:30",
    importance: 2,
    done: true,
    tag: "Travail",
  },
  {
    id: 3,
    title: "Acheter des courses",
    time: "18:00 - 19:00",
    importance: 1,
    done: false,
    tag: "Personnel",
  },
];

const habits = [
  { id: 1, name: "Méditation", icon: "🧘", done: true, streak: 12 },
  { id: 2, name: "Lecture 30 min", icon: "📖", done: false, streak: 5 },
  { id: 3, name: "Exercice physique", icon: "💪", done: true, streak: 8 },
  { id: 4, name: "Boire 2L d'eau", icon: "💧", done: false, streak: 3 },
  { id: 5, name: "Journaling", icon: "✍️", done: false, streak: 15 },
];

const objectives = [
  {
    id: 1,
    title: "Lire 24 livres cette année",
    progress: 42,
    current: 10,
    target: 24,
    color: "bg-orange-500",
  },
  {
    id: 2,
    title: "Courir 500 km",
    progress: 65,
    current: 325,
    target: 500,
    color: "bg-emerald-500",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i <= count ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function formatDateFr(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const formatted = now.toLocaleDateString("fr-FR", options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function HomePage() {
  const dateStr = formatDateFr();
  const habitsDone = habits.filter((h) => h.done).length;
  const habitsTotal = habits.length;
  const habitsPercent = Math.round((habitsDone / habitsTotal) * 100);
  const tasksDone = tasks.filter((t) => t.done).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Bonjour ! 👋</h2>
        <p className="text-gray-400 text-sm mt-1">{dateStr}</p>
      </div>

      {/* Top grid: Tasks + Score/Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Tâches du jour</h3>
            <span className="badge-orange">
              {tasks.length - tasksDone} restantes
            </span>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-150 ${
                  task.done
                    ? "bg-gray-50/80 border-gray-100 opacity-60"
                    : "bg-white border-gray-100 hover:border-orange-200 hover:shadow-sm"
                }`}
              >
                {/* Checkbox circle */}
                <div
                  className={
                    task.done ? "check-circle-done" : "check-circle-pending"
                  }
                >
                  {task.done && <CheckIcon />}
                </div>

                {/* Task content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      task.done
                        ? "line-through text-gray-400"
                        : "text-gray-700"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{task.time}</span>
                    <span className="badge-gray text-[10px]">{task.tag}</span>
                  </div>
                </div>

                {/* Importance stars */}
                <Stars count={task.importance} />
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Score + Quick stats */}
        <div className="space-y-6">
          {/* Score card */}
          <div className="card bg-gradient-to-br from-orange-500 to-amber-500 border-none text-white">
            <p className="text-sm font-medium text-orange-100">Score du jour</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-4xl font-extrabold leading-none">285</span>
              <span className="text-orange-200 text-sm font-medium mb-1">
                pts
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-orange-100 text-xs">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span>+45 pts vs. hier</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="card">
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Résumé rapide
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Tâches complétées
                </span>
                <span className="text-sm font-bold text-gray-800">
                  {tasksDone}/{tasks.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Habitudes</span>
                <span className="text-sm font-bold text-gray-800">
                  {habitsDone}/{habitsTotal}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Streak max</span>
                <span className="text-sm font-bold text-orange-500">
                  15 jours 🔥
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom grid: Habits + Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habits */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Habitudes du jour</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {habitsDone}/{habitsTotal}
              </span>
              <div className="w-16 progress-bar">
                <div
                  className="progress-fill bg-orange-500"
                  style={{ width: `${habitsPercent}%` }}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-150 ${
                  habit.done ? "bg-orange-50/50" : "hover:bg-gray-50"
                }`}
              >
                {/* Checkbox square */}
                <div
                  className={
                    habit.done ? "check-box-done" : "check-box-pending"
                  }
                >
                  {habit.done && <CheckIcon />}
                </div>

                <span className="text-lg leading-none">{habit.icon}</span>
                <span
                  className={`flex-1 text-sm font-medium ${
                    habit.done
                      ? "text-gray-400 line-through"
                      : "text-gray-700"
                  }`}
                >
                  {habit.name}
                </span>
                <span className="text-xs text-gray-400">
                  {habit.streak}j 🔥
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Objectives */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Objectifs en cours</h3>
            <button className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors">
              Voir tout
            </button>
          </div>
          <div className="space-y-5">
            {objectives.map((obj) => (
              <div key={obj.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    {obj.title}
                  </p>
                  <span className="text-xs font-bold text-gray-500">
                    {obj.progress}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${obj.color}`}
                    style={{ width: `${obj.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {obj.current} / {obj.target}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
