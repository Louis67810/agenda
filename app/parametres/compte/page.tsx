"use client";

import { useState } from "react";

export default function CompteSettingsPage() {
  const [name, setName] = useState("Louis");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Mon compte</h2>
        <p className="text-sm text-gray-400 mt-1">Gère ton profil et tes informations</p>
      </div>

      <div className="card space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{name}</p>
            <button className="text-xs text-blue-500 hover:text-blue-600 mt-0.5">Changer la photo</button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Prénom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Email</label>
          <input
            type="email"
            defaultValue="louis@example.com"
            readOnly
            className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Géré par Supabase Auth</p>
        </div>

        <button onClick={handleSave} className={`btn-primary w-full ${saved ? "!bg-emerald-500" : ""}`}>
          {saved ? "✓ Sauvegardé" : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
