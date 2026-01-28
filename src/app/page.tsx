"use client";
// public repo deploy v1

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar as CalendarIcon,
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
    color: "bg-brand/10 text-brand",
  },
  {
    title: "Kalender & Events",
    description: "Trainingstermine, Spieltage und Team-Events im Überblick.",
    icon: CalendarIcon,
    href: "/calendar",
    color: "bg-brand/10 text-brand",
  },
  {
    title: "Taktik-Board",
    description: "Digitale Aufstellungen und Spielzüge per Drag & Drop.",
    icon: LayoutDashboard,
    href: "/tactics",
    color: "bg-brand/10 text-brand",
  },
  {
    title: "Kommunikation",
    description: "Interne Nachrichten und Datei-Austausch für alle Teams.",
    icon: MessageSquare,
    href: "/messages",
    color: "bg-brand/10 text-brand",
  },
  {
    title: "Einstellungen",
    description: "Club-Konfiguration und Berechtigungen verwalten.",
    icon: Settings,
    href: "/settings",
    color: "bg-brand/10 text-brand",
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
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24 pb-16 lg:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(212,0,109,0.08),transparent)] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex justify-center mb-12">
              <Image
                src="/logo_new.png"
                alt="ERS Pattensen Logo"
                width={400}
                height={80}
                className="h-24 w-auto object-contain rounded-xl shadow-md"
                priority
              />
            </div>

            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-bold bg-brand/10 text-brand ring-1 ring-inset ring-brand/20 mb-8 lowercase tracking-tight">
              club manager beta
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-7xl text-brand mb-4">
              Vereinsverwaltung auf dem <br /> nächsten Level.
            </h1>
            <p className="mt-8 text-xl leading-8 text-slate-600 max-w-2xl mx-auto font-medium">
              Verwalte deine 1. und 2. Mannschaft der ERS Pattensen mit einem professionellen System für Kader,
              Taktik und Performance-Analyse.
            </p>

            <div className="mt-12 flex items-center justify-center gap-x-12">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-brand tracking-tight">{stats.players}</span>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">Spieler</span>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-brand tracking-tight">{stats.events}</span>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">Termine</span>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-brand tracking-tight">2</span>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">Teams</span>
              </div>
            </div>
          </motion.div>

          {/* Grid */}
          <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={feature.href}
                  className="group flex flex-col h-full rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-brand/5 hover:border-brand/20 transition-all active:scale-[0.98]"
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner", feature.color)}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 text-slate-900 group-hover:text-brand transition-colors tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Background Element */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
    </div>
  );
}
