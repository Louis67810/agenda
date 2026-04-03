import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PomodoroTimer from "@/components/pomodoro/PomodoroTimer";
import { AppStateProvider } from "@/components/providers/AppStateProvider";

export const metadata: Metadata = {
  title: "Agenda — Organisation Personnelle",
  description: "Agenda intelligent, tâches, habitudes, objectifs et gamification",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="light">
      <body className="antialiased" style={{ backgroundColor: "#07101B" }}>
        <AppStateProvider>
          <Sidebar />
          <div className="ml-60 min-h-screen p-3">
            <div className="bg-white rounded-2xl min-h-[calc(100vh-1.5rem)] flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 p-8">{children}</main>
            </div>
          </div>
          <PomodoroTimer />
        </AppStateProvider>
      </body>
    </html>
  );
}
