"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import type { TaskCategory } from "@/lib/mock-data";
import type { TaskCardStatus } from "./TaskCard";

export interface TaskFormData {
  id?: string;
  title: string;
  category: string;
  categoryKey: TaskCategory;
  importance: number;
  duration: string;
  deadline: string;
  status: TaskCardStatus;
  isSimpleTodo: boolean;
  objectif?: string;
  scheduledDate?: string;
  // Recurring
  recurring?: boolean;
  recurringDayOfWeek?: number;
  recurringTime?: string;
}

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TaskFormData) => void;
  initial?: Partial<TaskFormData>;
  mode?: "create" | "edit";
  parentTitle?: string;
}

const CATEGORIES: { key: TaskCategory; label: string }[] = [
  { key: "travail", label: "Travail" },
  { key: "sport", label: "Sport" },
  { key: "etudes", label: "Études" },
  { key: "personnel", label: "Personnel" },
  { key: "creativite", label: "Créativité" },
  { key: "finance", label: "Finance" },
  { key: "sante", label: "Santé" },
  { key: "social", label: "Social" },
];

const DAYS_FR = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];

const DEFAULT: TaskFormData = {
  title: "",
  category: "Travail",
  categoryKey: "travail",
  importance: 3,
  duration: "1h",
  deadline: "",
  status: "todo",
  isSimpleTodo: false,
  scheduledDate: "",
  recurring: false,
  recurringDayOfWeek: 1,
  recurringTime: "09:00",
};

export default function TaskModal({ open, onClose, onSave, initial, mode = "create", parentTitle }: TaskModalProps) {
  const [form, setForm] = useState<TaskFormData>({ ...DEFAULT, ...initial });

  useEffect(() => {
    if (open) setForm({ ...DEFAULT, ...initial });
  }, [open, initial]);

  function set<K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={parentTitle ? `Sous-tâche de "${parentTitle}"` : mode === "create" ? "Nouvelle tâche" : "Modifier la tâche"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Titre *</label>
          <input
            autoFocus
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder={parentTitle ? "Titre de la sous-tâche..." : "Ex: Préparer la présentation..."}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Catégorie</label>
          <select
            value={form.categoryKey}
            onChange={(e) => {
              const key = e.target.value as TaskCategory;
              const cat = CATEGORIES.find((c) => c.key === key);
              set("categoryKey", key);
              set("category", cat?.label ?? key);
            }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Importance */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">
            Importance — {form.importance}/5
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => set("importance", n)} className="flex-1">
                <svg className={`w-6 h-6 mx-auto transition-colors ${n <= form.importance ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Duration */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Durée estimée</label>
            <select
              value={form.duration}
              onChange={(e) => set("duration", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            >
              {["15min", "30min", "45min", "1h", "1h30", "2h", "2h30", "3h", "4h", "+4h"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Statut</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as TaskCardStatus)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            >
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="done">Terminé</option>
            </select>
          </div>
        </div>

        {/* Scheduled date + Deadline */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Date planifiée</label>
            <input
              type="date"
              value={form.scheduledDate ?? ""}
              onChange={(e) => set("scheduledDate", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => set("deadline", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Recurring toggle (only for top-level tasks, not subtasks) */}
        {!parentTitle && (
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set("recurring", !form.recurring)}
                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${form.recurring ? "bg-blue-500" : "bg-gray-200"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.recurring ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-gray-600">Tâche récurrente</span>
            </label>

            {form.recurring && (
              <div className="pl-13 grid grid-cols-2 gap-3 ml-1 border-l-2 border-blue-200 pl-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Jour de la semaine</label>
                  <select
                    value={form.recurringDayOfWeek ?? 1}
                    onChange={(e) => set("recurringDayOfWeek", Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  >
                    {DAYS_FR.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Heure</label>
                  <input
                    type="time"
                    value={form.recurringTime ?? "09:00"}
                    onChange={(e) => set("recurringTime", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Todo simple toggle */}
        {!parentTitle && (
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set("isSimpleTodo", !form.isSimpleTodo)}
              className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${form.isSimpleTodo ? "bg-blue-500" : "bg-gray-200"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isSimpleTodo ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm text-gray-600">Todo simple (sans objectif)</span>
          </label>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Annuler</button>
          <button type="submit" className="btn-primary flex-1">
            {mode === "create" ? (parentTitle ? "Créer la sous-tâche" : "Créer la tâche") : "Enregistrer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
