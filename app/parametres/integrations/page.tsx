"use client";

import { useState } from "react";

export default function IntegrationsPage() {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [ecoleConnected, setEcoleConnected] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Intégrations</h2>
        <p className="text-sm text-gray-400 mt-1">Connecte tes sources pour importer automatiquement tes créneaux</p>
      </div>

      {/* Google Calendar */}
      <div className="card space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">📅</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Google Calendar</p>
                <p className="text-xs text-gray-400 mt-0.5">Importe tes événements comme créneaux bloqués</p>
              </div>
              {googleConnected ? (
                <span className="badge-green">Connecté</span>
              ) : (
                <span className="badge-gray">Non connecté</span>
              )}
            </div>
          </div>
        </div>

        {googleConnected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-600">Dernière sync</span>
              <span className="text-xs font-medium text-gray-700">Il y a 2 min</span>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary flex-1 text-sm">Synchroniser</button>
              <button
                onClick={() => setGoogleConnected(false)}
                className="btn-ghost flex-1 text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Déconnecter
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setGoogleConnected(true)}
            className="btn-primary w-full"
          >
            Connecter Google Calendar
          </button>
        )}
      </div>

      {/* École Directe */}
      <div className="card space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">🎓</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">École Directe</p>
                <p className="text-xs text-gray-400 mt-0.5">Importe ton emploi du temps scolaire</p>
              </div>
              {ecoleConnected ? (
                <span className="badge-green">Connecté</span>
              ) : (
                <span className="badge-gray">Non connecté</span>
              )}
            </div>
          </div>
        </div>

        {!ecoleConnected && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Identifiant École Directe"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-300"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-300"
            />
            <button
              onClick={() => setEcoleConnected(true)}
              className="btn-primary w-full"
            >
              Connecter École Directe
            </button>
          </div>
        )}

        {ecoleConnected && (
          <div className="flex gap-2">
            <button className="btn-secondary flex-1 text-sm">Synchroniser</button>
            <button
              onClick={() => setEcoleConnected(false)}
              className="btn-ghost flex-1 text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Déconnecter
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card bg-blue-50 border-blue-100">
        <p className="text-xs text-blue-700">
          <strong>Note :</strong> Les créneaux importés apparaissent automatiquement dans ton agenda comme bloqués.
          L&apos;algorithme de planification ne placera jamais de tâches sur ces créneaux.
        </p>
      </div>
    </div>
  );
}
