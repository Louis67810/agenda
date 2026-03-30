"use client";

import { useState } from "react";
import ObjectiveCard, { type TreeCategory } from "@/components/objectives/ObjectiveCard";
import Modal from "@/components/ui/Modal";
import type { TaskCategory } from "@/lib/mock-data";

interface Objective {
  id: string;
  title: string;
  description: string;
  importance: number;
  progress: number;
  deadline: string;
  color: string;
  status: "active" | "completed" | "paused";
  categoryKey: TaskCategory;
  categories: TreeCategory[];
}

const COLORS = [
  { label: "Orange",  value: "bg-orange-500" },
  { label: "Violet",  value: "bg-violet-500" },
  { label: "Vert",    value: "bg-emerald-500" },
  { label: "Bleu",    value: "bg-blue-500" },
  { label: "Amber",   value: "bg-amber-500" },
  { label: "Cyan",    value: "bg-cyan-500" },
  { label: "Rose",    value: "bg-pink-500" },
];

const CATS: { key: TaskCategory; label: string }[] = [
  { key: "travail",   label: "Travail" },
  { key: "sport",     label: "Sport" },
  { key: "etudes",    label: "Études" },
  { key: "personnel", label: "Personnel" },
  { key: "creativite",label: "Créativité" },
  { key: "finance",   label: "Finance" },
  { key: "sante",     label: "Santé" },
  { key: "social",    label: "Social" },
];

const INITIAL_OBJECTIVES: Objective[] = [
  {
    id: "o1", title: "Maîtriser Next.js 15", description: "Apprendre en profondeur Next.js 15 avec App Router, Server Components et les nouvelles fonctionnalités.",
    importance: 5, progress: 72, deadline: "30 avril 2026", color: "bg-violet-500", status: "active", categoryKey: "etudes",
    categories: [
      { name: "Fondamentaux", subcategories: [
        { name: "App Router", tasks: [{ title: "Routing et layouts", status: "done" }, { title: "Loading et error states", status: "done" }, { title: "Parallel routes", status: "in_progress" }] },
        { name: "Server Components", tasks: [{ title: "Comprendre RSC", status: "done" }, { title: "Client vs Server", status: "done" }, { title: "Streaming SSR", status: "todo" }] },
      ]},
      { name: "Avancé", subcategories: [
        { name: "Data Fetching", tasks: [{ title: "Server Actions", status: "in_progress" }, { title: "Cache et revalidation", status: "todo" }] },
        { name: "Déploiement", tasks: [{ title: "Middleware & Auth", status: "todo" }, { title: "CI/CD Vercel", status: "todo" }] },
      ]},
    ],
  },
  {
    id: "o2", title: "Courir 10 km en moins de 50 min", description: "Progresser en course à pied pour atteindre un 10 km sous les 50 minutes d'ici l'été.",
    importance: 4, progress: 55, deadline: "15 juin 2026", color: "bg-emerald-500", status: "active", categoryKey: "sport",
    categories: [
      { name: "Entraînement", subcategories: [
        { name: "Endurance", tasks: [{ title: "5 km < 27 min", status: "done" }, { title: "8 km sans pause", status: "in_progress" }, { title: "10 km complet", status: "todo" }] },
        { name: "Vitesse", tasks: [{ title: "Fractionné 400m", status: "done" }, { title: "Tempo run 6 km", status: "todo" }] },
      ]},
    ],
  },
  {
    id: "o3", title: "Épargner 2 000 EUR ce trimestre", description: "Atteindre 2000 EUR d'épargne supplémentaire avant la fin du trimestre Q1 2026.",
    importance: 5, progress: 80, deadline: "31 mars 2026", color: "bg-amber-500", status: "active", categoryKey: "finance",
    categories: [
      { name: "Budget", subcategories: [
        { name: "Suivi", tasks: [{ title: "Objectif 500 EUR", status: "done" }, { title: "Objectif 1 000 EUR", status: "done" }, { title: "Objectif 1 500 EUR", status: "done" }, { title: "Objectif 2 000 EUR", status: "in_progress" }] },
        { name: "Optimisation", tasks: [{ title: "Revoir abonnements", status: "done" }, { title: "Appel comptable", status: "todo" }] },
      ]},
    ],
  },
  {
    id: "o4", title: "Lire 12 livres cette année", description: "Objectif de lecture : 12 livres dans l'année, mélangeant fiction et non-fiction.",
    importance: 3, progress: 25, deadline: "31 décembre 2026", color: "bg-orange-500", status: "active", categoryKey: "personnel",
    categories: [
      { name: "Lectures", subcategories: [
        { name: "Fiction", tasks: [{ title: "Le Petit Prince", status: "done" }, { title: "1984", status: "in_progress" }] },
        { name: "Non-fiction", tasks: [{ title: "Atomic Habits", status: "done" }, { title: "Deep Work", status: "todo" }] },
      ]},
    ],
  },
  {
    id: "o5", title: "Publier portfolio créatif", description: "Concevoir et mettre en ligne un portfolio personnel pour présenter mes projets créatifs.",
    importance: 4, progress: 40, deadline: "31 mai 2026", color: "bg-cyan-500", status: "active", categoryKey: "creativite",
    categories: [
      { name: "Design", subcategories: [{ name: "Conception", tasks: [{ title: "Wireframes", status: "done" }, { title: "Design system", status: "in_progress" }] }] },
      { name: "Développement", subcategories: [{ name: "Implémentation", tasks: [{ title: "Setup projet", status: "todo" }, { title: "Pages principales", status: "todo" }, { title: "Mise en ligne", status: "todo" }] }] },
    ],
  },
  {
    id: "o6", title: "Obtenir certification AWS", description: "Passer et réussir la certification AWS Solutions Architect Associate.",
    importance: 4, progress: 10, deadline: "30 septembre 2026", color: "bg-blue-500", status: "paused", categoryKey: "etudes",
    categories: [
      { name: "Préparation", subcategories: [{ name: "Théorie", tasks: [{ title: "Module IAM", status: "done" }, { title: "Module EC2", status: "todo" }, { title: "Module S3", status: "todo" }] }] },
    ],
  },
];

type StatusFilter = "all" | "active" | "completed" | "paused";
let nextId = 100;

function computeProgress(categories: TreeCategory[]): number {
  let total = 0, done = 0;
  for (const cat of categories)
    for (const sub of cat.subcategories)
      for (const t of sub.tasks) { total++; if (t.status === "done") done++; }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export default function ObjectifsPage() {
  const [objectives, setObjectives] = useState<Objective[]>(INITIAL_OBJECTIVES);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingObj, setEditingObj] = useState<Objective | null>(null);

  // Create/edit form state
  const [form, setForm] = useState({ title: "", description: "", importance: 3, deadline: "", color: "bg-orange-500", categoryKey: "travail" as TaskCategory, status: "active" as Objective["status"] });

  const filtered = objectives.filter((o) => statusFilter === "all" || o.status === statusFilter);

  function openCreate() {
    setEditingObj(null);
    setForm({ title: "", description: "", importance: 3, deadline: "", color: "bg-orange-500", categoryKey: "travail", status: "active" });
    setModalOpen(true);
  }

  function openEdit(obj: Objective) {
    setEditingObj(obj);
    setForm({ title: obj.title, description: obj.description, importance: obj.importance, deadline: obj.deadline, color: obj.color, categoryKey: obj.categoryKey, status: obj.status });
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingObj) {
      setObjectives((prev) => prev.map((o) => o.id === editingObj.id ? { ...o, ...form } : o));
    } else {
      setObjectives((prev) => [...prev, { ...form, id: `obj-${++nextId}`, progress: 0, categories: [] }]);
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
  }

  function handleTaskToggle(objId: string, catIdx: number, subIdx: number, taskIdx: number) {
    setObjectives((prev) => prev.map((obj) => {
      if (obj.id !== objId) return obj;
      const cats = obj.categories.map((cat, ci) => ci !== catIdx ? cat : {
        ...cat,
        subcategories: cat.subcategories.map((sub, si) => si !== subIdx ? sub : {
          ...sub,
          tasks: sub.tasks.map((t, ti) => ti !== taskIdx ? t : {
            ...t,
            status: t.status === "done" ? "todo" : "done" as TreeTask["status"],
          }),
        }),
      });
      return { ...obj, categories: cats, progress: computeProgress(cats) };
    }));
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Objectifs</h1>
          <p className="text-sm text-gray-400 mt-1">Suivez vos objectifs et leur progression</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvel objectif
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Statut</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-400">
            <option value="all">Tous</option>
            <option value="active">En cours</option>
            <option value="completed">Terminés</option>
            <option value="paused">En pause</option>
          </select>
        </div>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} objectif{filtered.length > 1 ? "s" : ""}</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-gray-400 text-sm">Aucun objectif pour ce filtre.</p>
          <button onClick={openCreate} className="btn-secondary">+ Créer un objectif</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((obj) => (
            <ObjectiveCard
              key={obj.id}
              {...obj}
              onEdit={() => openEdit(obj)}
              onDelete={() => handleDelete(obj.id)}
              onTaskToggle={(ci, si, ti) => handleTaskToggle(obj.id, ci, si, ti)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingObj ? "Modifier l'objectif" : "Nouvel objectif"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Titre *</label>
            <input autoFocus type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Ex: Finir mon portfolio..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" required />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Décris cet objectif..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none h-20" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Catégorie</label>
              <select value={form.categoryKey} onChange={(e) => setForm((p) => ({ ...p, categoryKey: e.target.value as TaskCategory }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                {CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Statut</label>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Objective["status"] }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                <option value="active">En cours</option>
                <option value="paused">En pause</option>
                <option value="completed">Terminé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Importance — {form.importance}/5</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setForm((p) => ({ ...p, importance: n }))} className="flex-1">
                  <svg className={`w-6 h-6 mx-auto transition-colors ${n <= form.importance ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Couleur</label>
              <div className="flex gap-1.5 flex-wrap">
                {COLORS.map((c) => (
                  <button key={c.value} type="button" onClick={() => setForm((p) => ({ ...p, color: c.value }))} className={`w-6 h-6 rounded-full ${c.value} transition-transform ${form.color === c.value ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : "hover:scale-110"}`} title={c.label} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost flex-1">Annuler</button>
            <button type="submit" className="btn-primary flex-1">{editingObj ? "Enregistrer" : "Créer l'objectif"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Fix missing import
import type { TreeTask } from "@/components/objectives/ObjectiveCard";
