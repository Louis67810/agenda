"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/agenda": "Agenda",
  "/taches": "Tâches",
  "/objectifs": "Objectifs",
  "/habitudes": "Habitudes",
  "/performances": "Performances",
  "/recap": "Récap",
  "/parametres": "Paramètres",
};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";

  return (
    <header className="h-14 bg-white flex items-center justify-between px-8 border-b border-gray-100 shrink-0">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        <div className="w-px h-6 bg-gray-100 mx-1" />

        {/* User avatar */}
        <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            U
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Utilisateur</span>
        </button>
      </div>
    </header>
  );
}
