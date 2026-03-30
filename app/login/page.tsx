"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // TODO: connecter Supabase Auth ici
    // Pour l'instant on simule juste
    await new Promise((r) => setTimeout(r, 800));
    setMessage("Fonctionnalité d'authentification à connecter avec Supabase Auth.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg">
            A
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Agenda</h1>
          <p className="text-sm text-gray-400 mt-1">Ton organisation personnelle</p>
        </div>

        {/* Card */}
        <div className="card space-y-5">
          {/* Toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@example.com"
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
              />
            </div>

            {message && (
              <p className="text-xs text-orange-600 bg-orange-50 rounded-xl p-3">{message}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-60">
              {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer un compte"}
            </button>
          </form>

          {/* Dev bypass */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-center text-gray-400 mb-3">Mode développement</p>
            <a href="/" className="btn-secondary w-full text-center block text-sm py-2">
              Accéder sans connexion →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
