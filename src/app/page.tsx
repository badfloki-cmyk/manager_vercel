"use client";
// Trigger deploy v2.1.1

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar as CalendarIcon,
  Trophy,
  LayoutDashboard,
  MessageSquare,
  Settings
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPlayers } from "@/lib/squad";
import { getEvents } from "@/lib/events";

const features = [
  {
    title: "Kaderverwaltung",
    description: "Spielerprofile, Staff und Rollen für 1. & 2. Mannschaft.",
    icon: Users,
    href: "/squad",
    color: "bg-red-500/10 text-red-500",
  },
  {
    title: "Kalender & Events",
    description: "Trainingstermine, Spieltage und Team-Events im Überblick.",
    icon: CalendarIcon,
    href: "/calendar",
    color: "bg-red-500/10 text-red-500",
  },
  {
    title: "Taktik-Board",
    description: "Digitale Aufstellungen und Spielzüge per Drag & Drop.",
    icon: LayoutDashboard,
    href: "/tactics",
    color: "bg-red-500/10 text-red-500",
  },
  {
    title: "Statistiken",
    description: "Leistungsanalyse und Leaderboards für das gesamte Team.",
    icon: Trophy,
    href: "/stats",
    color: "bg-red-500/10 text-red-500",
  },
  {
    title: "Kommunikation",
    description: "Interne Nachrichten und Datei-Austausch für alle Teams.",
    icon: MessageSquare,
    href: "/messages",
    color: "bg-red-500/10 text-red-500",
  },
  {
    title: "Einstellungen",
    description: "Club-Konfiguration und Berechtigungen verwalten.",
    icon: Settings,
    href: "/settings",
    color: "bg-red-500/10 text-red-500",
  },
];

export default function Home() {
  const [stats, setStats] = useState({ players: 0, events: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { players } = await getPlayers();
        const { events } = await getEvents();
        setStats({
          players: players?.length || 0,
          events: events?.length || 0
        });
      } catch (error) {
        console.error("Dashboard load error:", error);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24 pb-16 lg:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(227,6,19,0.15),transparent)] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex justify-center mb-12">
              <Image
                src="https://erspattensen.de/wp-content/uploads/2023/02/ERS-1024x208.jpg"
                alt="ERS Pattensen Logo"
                width={400}
                height={80}
                className="h-24 w-auto object-contain brightness-0 invert"
                priority
              />
            </div>

            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20 mb-8">
              Club Manager Beta
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
              Vereinsverwaltung auf dem <br /> nächsten Level.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-400 max-w-2xl mx-auto">
              Verwalte deine 1. und 2. Mannschaft der ERS Pattensen mit einem professionellen System für Kader,
              Taktik und Performance-Analyse.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-red-500">{stats.players}</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Spieler</span>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-red-500">{stats.events}</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Termine</span>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-red-500">2</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Teams</span>
              </div>
            </div>
          </motion.div>

          {/* Grid */}
          <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={feature.href}
                  className="group flex flex-col h-full rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:bg-slate-800/80 hover:border-red-500/30 transition-all active:scale-[0.98]"
                >
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-6", feature.color)}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-red-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Background Element */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
    </div>
  );
}
