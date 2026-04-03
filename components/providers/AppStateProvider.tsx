"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  APP_STATE_STORAGE_KEY,
  CATEGORY_LABELS,
  type AppHabit,
  type AppObjective,
  type AppStateData,
  type AppTask,
  type AppTaskStatus,
  type ObjectiveTreeCategory,
  type DailyPointBreakdown,
  type DayRecap,
  type MoodValue,
  type TaskDurationAdjustment,
  createId,
  computeDailyPoints,
  computeHabitStreak,
  computeObjectiveProgress,
  computeTotalPoints,
  createHabit as buildHabit,
  createObjective as buildObjective,
  createSeedState,
  createTask as buildTask,
  dateFromDateTime,
  isoToday,
  scheduleTasks,
  startOfWeek,
  type HabitFrequency,
} from "@/lib/app-state";
import type { TaskCategory } from "@/lib/mock-data";

interface TaskInput {
  title: string;
  description?: string;
  categoryKey: TaskCategory;
  importance: number;
  durationMinutes: number;
  deadline?: string;
  status: AppTaskStatus;
  isSimpleTodo: boolean;
  objectiveId?: string;
  isSplittable?: boolean;
  scheduledStart?: string;
  manualScheduled?: boolean;
}

interface ObjectiveInput {
  title: string;
  description: string;
  importance: number;
  deadline: string;
  color: string;
  status: AppObjective["status"];
  categoryKey: TaskCategory;
}

interface HabitInput {
  title: string;
  icon: string;
  frequency: HabitFrequency;
  points: number;
  targetValue?: number;
  unit?: string;
}

interface SubmitRecapInput {
  date: string;
  taskStatuses: Record<string, AppTaskStatus>;
  habits: Record<string, { done: boolean; value?: number }>;
  dayScore: number;
  mood: MoodValue;
  moodNote: string;
  adjustments?: Record<string, { justification?: string; justified?: boolean }>;
}

interface DashboardMetrics {
  totalPoints: number;
  completedTasksToday: number;
  scheduledTasksToday: number;
  completedHabitsToday: number;
  totalHabits: number;
  objectiveCompletionAverage: number;
}

interface AppStateContextValue {
  data: AppStateData;
  ready: boolean;
  tasks: AppTask[];
  objectives: AppObjective[];
  habits: AppHabit[];
  recaps: DayRecap[];
  adjustments: TaskDurationAdjustment[];
  blockedSlots: AppStateData["blockedSlots"];
  dailyPoints: DailyPointBreakdown[];
  metrics: DashboardMetrics;
  today: string;
  createTask: (input: TaskInput) => void;
  updateTask: (id: string, patch: Partial<AppTask>) => void;
  deleteTask: (id: string) => void;
  addTaskTime: (taskId: string, addedMinutes: number) => void;
  createObjective: (input: ObjectiveInput) => void;
  updateObjective: (id: string, patch: Partial<AppObjective>) => void;
  deleteObjective: (id: string) => void;
  addObjectiveCategory: (objectiveId: string, name: string) => void;
  addObjectiveSubcategory: (objectiveId: string, categoryId: string, name: string) => void;
  addObjectiveTask: (objectiveId: string, categoryId: string, subcategoryId: string, title: string) => void;
  toggleObjectiveTask: (objectiveId: string, categoryId: string, subcategoryId: string, treeTaskId: string) => void;
  deleteObjectiveCategory: (objectiveId: string, categoryId: string) => void;
  deleteObjectiveSubcategory: (objectiveId: string, categoryId: string, subcategoryId: string) => void;
  deleteObjectiveTask: (objectiveId: string, categoryId: string, subcategoryId: string, treeTaskId: string) => void;
  createHabit: (input: HabitInput) => void;
  deleteHabit: (id: string) => void;
  toggleHabitForDate: (habitId: string, date: string, done: boolean, value?: number) => void;
  submitRecap: (input: SubmitRecapInput) => void;
  getObjectiveProgress: (objectiveId: string) => number;
  getObjectiveTasks: (objectiveId: string) => AppTask[];
  scheduleTaskAt: (taskId: string, startIso: string, durationMinutes?: number) => void;
  postponeTask: (taskId: string, minutes: number) => void;
  getHabitStreak: (habitId: string) => number;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

function reschedule(data: AppStateData) {
  return {
    ...data,
    tasks: scheduleTasks(data.tasks, data.blockedSlots),
  };
}

function normalizeData(data: AppStateData): AppStateData {
  return {
    ...data,
    objectives: data.objectives.map((objective) => ({
      ...objective,
      categories: objective.categories ?? [],
    })),
  };
}

function splitTaskInput(input: TaskInput) {
  if (!input.isSplittable || input.durationMinutes <= 120) {
    return [buildTask(input)];
  }

  const splitGroupId = createId("split");
  const count = Math.ceil(input.durationMinutes / 120);
  const segments = Array.from({ length: count }, (_, index) => {
    const partDuration = index === count - 1 ? input.durationMinutes - 120 * (count - 1) : 120;
    return buildTask({
      ...input,
      title: `${input.title} (${index + 1}/${count})`,
      durationMinutes: partDuration,
      splitGroupId,
      splitPartIndex: index + 1,
      splitPartCount: count,
      manualScheduled: input.manualScheduled,
      scheduledStart: undefined,
    });
  });

  return segments;
}

function updateObjectiveTreeStatuses(categories: ObjectiveTreeCategory[], tasks: AppTask[]) {
  return categories.map((category) => ({
    ...category,
    subcategories: category.subcategories.map((subcategory) => ({
      ...subcategory,
      tasks: subcategory.tasks.map((treeTask) => ({
        ...treeTask,
        status: treeTask.taskId ? tasks.find((task) => task.id === treeTask.taskId)?.status ?? treeTask.status : treeTask.status,
      })),
    })),
  }));
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppStateData>(createSeedState());
  const [ready, setReady] = useState(false);
  const today = isoToday();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(APP_STATE_STORAGE_KEY);
      if (raw) {
        const parsed = normalizeData(JSON.parse(raw) as AppStateData);
        setData(reschedule(parsed));
      } else {
        const seeded = createSeedState();
        setData(seeded);
        window.localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(seeded));
      }
    } catch {
      setData(createSeedState());
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  function updateData(updater: (prev: AppStateData) => AppStateData) {
    setData((prev) => reschedule(updater(prev)));
  }

  const dailyPoints = useMemo(() => computeDailyPoints(data), [data]);

  const metrics = useMemo<DashboardMetrics>(() => {
    const completedTasksToday = data.tasks.filter((task) => task.completedAt === today).length;
    const scheduledTasksToday = data.tasks.filter((task) => dateFromDateTime(task.scheduledStart) === today).length;
    const completedHabitsToday = data.habits.filter((habit) => habit.logs.some((log) => log.date === today && log.done)).length;
    const objectiveCompletionAverage =
      data.objectives.length === 0
        ? 0
        : Math.round(
            data.objectives.reduce((sum, objective) => sum + computeObjectiveProgress(data.tasks, objective.id), 0) /
              data.objectives.length,
          );

    return {
      totalPoints: computeTotalPoints(data),
      completedTasksToday,
      scheduledTasksToday,
      completedHabitsToday,
      totalHabits: data.habits.length,
      objectiveCompletionAverage,
    };
  }, [data, today]);

  const value = useMemo<AppStateContextValue>(() => ({
    data,
    ready,
    tasks: data.tasks,
    objectives: data.objectives,
    habits: data.habits,
    recaps: data.recaps,
    adjustments: data.adjustments,
    blockedSlots: data.blockedSlots,
    dailyPoints,
    metrics,
    today,
    createTask(input) {
      updateData((prev) => ({
        ...prev,
        tasks: [...prev.tasks, ...splitTaskInput(input)],
      }));
    },
    updateTask(id, patch) {
      updateData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) => {
          if (task.id !== id) return task;
          const nextStatus = patch.status ?? task.status;
          return {
            ...task,
            ...patch,
            completedAt:
              nextStatus === "done"
                ? task.completedAt ?? today
                : patch.status && patch.status !== "done"
                ? undefined
                : task.completedAt,
          };
        }),
        objectives: prev.objectives.map((objective) => ({
          ...objective,
          categories: updateObjectiveTreeStatuses(
            objective.categories,
            prev.tasks.map((task) =>
              task.id === id
                ? {
                    ...task,
                    ...patch,
                    completedAt:
                      (patch.status ?? task.status) === "done"
                        ? task.completedAt ?? today
                        : patch.status && patch.status !== "done"
                        ? undefined
                        : task.completedAt,
                  }
                : task,
            ),
          ),
        })),
      }));
    },
    deleteTask(id) {
      updateData((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== id),
        adjustments: prev.adjustments.filter((entry) => entry.taskId !== id),
      }));
    },
    addTaskTime(taskId, addedMinutes) {
      updateData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                durationMinutes: task.durationMinutes + addedMinutes,
              }
            : task,
        ),
        adjustments: [
          ...prev.adjustments,
          {
            id: `adj-${Date.now()}`,
            taskId,
            date: today,
            addedMinutes,
          },
        ],
      }));
    },
    createObjective(input) {
      updateData((prev) => ({
        ...prev,
        objectives: [...prev.objectives, buildObjective({ ...input, categories: [] })],
      }));
    },
    updateObjective(id, patch) {
      updateData((prev) => ({
        ...prev,
        objectives: prev.objectives.map((objective) => (objective.id === id ? { ...objective, ...patch } : objective)),
      }));
    },
    deleteObjective(id) {
      updateData((prev) => ({
        ...prev,
        objectives: prev.objectives.filter((objective) => objective.id !== id),
        tasks: prev.tasks.map((task) =>
          task.objectiveId === id
            ? {
                ...task,
                objectiveId: undefined,
                isSimpleTodo: true,
              }
            : task,
          ),
      }));
    },
    addObjectiveCategory(objectiveId, name) {
      updateData((prev) => ({
        ...prev,
        objectives: prev.objectives.map((objective) =>
          objective.id !== objectiveId
            ? objective
            : {
                ...objective,
                categories: [...objective.categories, { id: createId("objcat"), name, subcategories: [] }],
              },
        ),
      }));
    },
    addObjectiveSubcategory(objectiveId, categoryId, name) {
      updateData((prev) => ({
        ...prev,
        objectives: prev.objectives.map((objective) =>
          objective.id !== objectiveId
            ? objective
            : {
                ...objective,
                categories: objective.categories.map((category) =>
                  category.id !== categoryId
                    ? category
                    : {
                        ...category,
                        subcategories: [...category.subcategories, { id: createId("objsub"), name, tasks: [] }],
                      },
                ),
              },
        ),
      }));
    },
    addObjectiveTask(objectiveId, categoryId, subcategoryId, title) {
      updateData((prev) => {
        const objective = prev.objectives.find((entry) => entry.id === objectiveId);
        if (!objective) return prev;
        const newTask = buildTask({
          title,
          categoryKey: objective.categoryKey,
          importance: objective.importance,
          durationMinutes: 60,
          deadline: objective.deadline,
          status: "todo",
          isSimpleTodo: false,
          objectiveId,
        });

        return {
          ...prev,
          tasks: [...prev.tasks, newTask],
          objectives: prev.objectives.map((entry) =>
            entry.id !== objectiveId
              ? entry
              : {
                  ...entry,
                  categories: entry.categories.map((category) =>
                    category.id !== categoryId
                      ? category
                      : {
                          ...category,
                          subcategories: category.subcategories.map((subcategory) =>
                            subcategory.id !== subcategoryId
                              ? subcategory
                              : {
                                  ...subcategory,
                                  tasks: [
                                    ...subcategory.tasks,
                                    {
                                      id: createId("tree"),
                                      title,
                                      taskId: newTask.id,
                                      status: "todo",
                                    },
                                  ],
                                },
                          ),
                        },
                  ),
                },
          ),
        };
      });
    },
    toggleObjectiveTask(objectiveId, categoryId, subcategoryId, treeTaskId) {
      updateData((prev) => {
        let linkedTaskId: string | undefined;
        const objective = prev.objectives.find((entry) => entry.id === objectiveId);
        objective?.categories.forEach((category) => {
          if (category.id !== categoryId) return;
          category.subcategories.forEach((subcategory) => {
            if (subcategory.id !== subcategoryId) return;
            subcategory.tasks.forEach((treeTask) => {
              if (treeTask.id === treeTaskId) linkedTaskId = treeTask.taskId;
            });
          });
        });

        const tasks = prev.tasks.map((task) =>
          task.id === linkedTaskId
            ? {
                ...task,
                status: (task.status === "done" ? "todo" : "done") as AppTaskStatus,
                completedAt: task.status === "done" ? undefined : today,
              }
            : task,
        );

        return {
          ...prev,
          tasks,
          objectives: prev.objectives.map((entry) =>
            entry.id !== objectiveId
              ? entry
              : {
                  ...entry,
                  categories: updateObjectiveTreeStatuses(entry.categories, tasks),
                },
          ),
        };
      });
    },
    deleteObjectiveCategory(objectiveId, categoryId) {
      updateData((prev) => ({
        ...prev,
        objectives: prev.objectives.map((objective) =>
          objective.id !== objectiveId
            ? objective
            : {
                ...objective,
                categories: objective.categories.filter((category) => category.id !== categoryId),
              },
        ),
      }));
    },
    deleteObjectiveSubcategory(objectiveId, categoryId, subcategoryId) {
      updateData((prev) => ({
        ...prev,
        objectives: prev.objectives.map((objective) =>
          objective.id !== objectiveId
            ? objective
            : {
                ...objective,
                categories: objective.categories.map((category) =>
                  category.id !== categoryId
                    ? category
                    : {
                        ...category,
                        subcategories: category.subcategories.filter((subcategory) => subcategory.id !== subcategoryId),
                      },
                ),
              },
        ),
      }));
    },
    deleteObjectiveTask(objectiveId, categoryId, subcategoryId, treeTaskId) {
      updateData((prev) => {
        let linkedTaskId: string | undefined;
        const nextObjectives = prev.objectives.map((objective) =>
          objective.id !== objectiveId
            ? objective
            : {
                ...objective,
                categories: objective.categories.map((category) =>
                  category.id !== categoryId
                    ? category
                    : {
                        ...category,
                        subcategories: category.subcategories.map((subcategory) =>
                          subcategory.id !== subcategoryId
                            ? subcategory
                            : {
                                ...subcategory,
                                tasks: subcategory.tasks.filter((treeTask) => {
                                  if (treeTask.id === treeTaskId) linkedTaskId = treeTask.taskId;
                                  return treeTask.id !== treeTaskId;
                                }),
                              },
                        ),
                      },
                ),
              },
        );

        return {
          ...prev,
          objectives: nextObjectives,
          tasks: linkedTaskId ? prev.tasks.filter((task) => task.id !== linkedTaskId) : prev.tasks,
          adjustments: linkedTaskId ? prev.adjustments.filter((entry) => entry.taskId !== linkedTaskId) : prev.adjustments,
        };
      });
    },
    createHabit(input) {
      updateData((prev) => ({
        ...prev,
        habits: [...prev.habits, buildHabit(input)],
      }));
    },
    deleteHabit(id) {
      updateData((prev) => ({
        ...prev,
        habits: prev.habits.filter((habit) => habit.id !== id),
      }));
    },
    toggleHabitForDate(habitId, date, done, value) {
      updateData((prev) => ({
        ...prev,
        habits: prev.habits.map((habit) => {
          if (habit.id !== habitId) return habit;
          const exists = habit.logs.some((log) => log.date === date);
          const nextLogs = exists
            ? habit.logs.map((log) => (log.date === date ? { ...log, done, value } : log))
            : [...habit.logs, { date, done, value }];

          return {
            ...habit,
            logs: nextLogs.sort((a, b) => a.date.localeCompare(b.date)),
          };
        }),
      }));
    },
    submitRecap(input) {
      updateData((prev) => {
        const tasks = prev.tasks.map((task) => {
          const nextStatus = input.taskStatuses[task.id];
          if (!nextStatus) return task;
          return {
            ...task,
            status: nextStatus,
            completedAt: nextStatus === "done" ? input.date : undefined,
          };
        });

        const habits = prev.habits.map((habit) => {
          const entry = input.habits[habit.id];
          if (!entry) return habit;
          const exists = habit.logs.some((log) => log.date === input.date);
          const nextLogs = exists
            ? habit.logs.map((log) =>
                log.date === input.date ? { ...log, done: entry.done, value: entry.value } : log,
              )
            : [...habit.logs, { date: input.date, done: entry.done, value: entry.value }];
          return { ...habit, logs: nextLogs.sort((a, b) => a.date.localeCompare(b.date)) };
        });

        const recap = {
          date: input.date,
          dayScore: input.dayScore,
          mood: input.mood,
          moodNote: input.moodNote,
        } satisfies DayRecap;

        const recaps = prev.recaps.some((entry) => entry.date === input.date)
          ? prev.recaps.map((entry) => (entry.date === input.date ? recap : entry))
          : [...prev.recaps, recap];

        const adjustments = prev.adjustments.map((entry) => {
          const patch = input.adjustments?.[entry.taskId];
          if (entry.date !== input.date || !patch) return entry;
          return {
            ...entry,
            justification: patch.justification,
            justified: patch.justified,
          };
        });

        return {
          ...prev,
          tasks,
          habits,
          recaps,
          adjustments,
          objectives: prev.objectives.map((objective) => ({
            ...objective,
            categories: updateObjectiveTreeStatuses(objective.categories, tasks),
          })),
        };
      });
    },
    getObjectiveProgress(objectiveId) {
      return computeObjectiveProgress(data.tasks, objectiveId);
    },
    getObjectiveTasks(objectiveId) {
      return data.tasks.filter((task) => task.objectiveId === objectiveId);
    },
    scheduleTaskAt(taskId, startIso, durationMinutes) {
      updateData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id !== taskId
            ? task
            : {
                ...task,
                durationMinutes: durationMinutes ?? task.durationMinutes,
                scheduledStart: startIso,
                scheduledEnd: new Date(new Date(startIso).getTime() + (durationMinutes ?? task.durationMinutes) * 60000)
                  .toISOString()
                  .slice(0, 16),
                manualScheduled: true,
              },
        ),
      }));
    },
    postponeTask(taskId, minutes) {
      updateData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) => {
          if (task.id !== taskId || !task.scheduledStart) return task;
          const start = new Date(task.scheduledStart);
          const end = new Date(task.scheduledEnd ?? task.scheduledStart);
          start.setMinutes(start.getMinutes() + minutes);
          end.setMinutes(end.getMinutes() + minutes);
          return {
            ...task,
            scheduledStart: start.toISOString().slice(0, 16),
            scheduledEnd: end.toISOString().slice(0, 16),
            manualScheduled: true,
          };
        }),
      }));
    },
    getHabitStreak(habitId) {
      const habit = data.habits.find((entry) => entry.id === habitId);
      return habit ? computeHabitStreak(habit) : 0;
    },
  }), [dailyPoints, data, metrics, ready, today]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }
  return context;
}

export function useObjectiveLabelMap() {
  const { objectives } = useAppState();
  return useMemo(
    () =>
      Object.fromEntries(
        objectives.map((objective) => [
          objective.id,
          {
            title: objective.title,
            categoryLabel: CATEGORY_LABELS[objective.categoryKey],
          },
        ]),
      ),
    [objectives],
  );
}

export function useWeekCompletion() {
  const { dailyPoints, today } = useAppState();
  const weekStart = startOfWeek(today);
  return dailyPoints.filter((day) => day.date >= weekStart).slice(-7);
}
