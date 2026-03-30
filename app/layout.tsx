import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PomodoroTimer from "@/components/pomodoro/PomodoroTimer";

export const metadata: Metadata = {
  title: "Agenda — Organisation Personnelle",
  description:
    "Agenda intelligent, tâches, habitudes, objectifs et gamification",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="light">
      <body className="bg-stone-50 text-gray-800 antialiased">
        <Sidebar />
        {/* Main area offset by sidebar width */}
        <div className="ml-60 min-h-screen flex flex-col transition-all duration-200">
          <Header />
          <main className="flex-1 p-8">{children}</main>
        </div>
        <PomodoroTimer />
      </body>
    </html>
  );
}
