"use client";
// public repo deploy v1

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar as CalendarIcon,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Activity,
  Trophy
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPlayers } from "@/lib/squad";
import { getEvents, Event } from "@/lib/events";
import { getTactics, TacticData } from "@/lib/tactics";
import { MatchDayDashboard } from "@/components/MatchDayDashboard";

interface Message {
  _id: string;
  createdAt: string;
}

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
    title: "Nachrichten",
    description: "Interne Nachrichten und Datei-Austausch für alle Teams.",
    icon: MessageSquare,
    href: "/messages",
    color: "bg-brand/10 text-brand",
  },
  {
    title: "Statistiken",
    description: "Tore, Vorlagen und Einsätze aller Spieler verwalten.",
    icon: Activity,
    href: "/stats",
    color: "bg-brand/10 text-brand",
  },
  {
    title: "Einstellungen",
    description: "Club-Konfiguration und Berechtigungen verwalten.",
    icon: Settings,
    href: "/settings",
    color: "bg-brand/10 text-brand",
    key: "settings"
  },
];

const NotificationBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10"
    >
      {count > 9 ? "9+" : count}
    </motion.div>
  );
};

import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [stats, setStats] = useState({ players: 0, events: 0 });
  const [matchDayEvent, setMatchDayEvent] = useState<Event | null>(null);
  const [showKabinenModus, setShowKabinenModus] = useState(true);
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { players } = await getPlayers();
        const { events } = await getEvents();
        const { tactics } = await getTactics();
        const msgRes = await fetch("/api/messages");
        const { messages } = await msgRes.json();

        setStats({
          players: players?.length || 0,
          events: events?.length || 0
        });

        // Calculate badges
        const getNewCount = (items: any[], storageKey: string) => {
          const lastSeen = localStorage.getItem(storageKey);
          if (!lastSeen) return items?.length || 0;
          const lastSeenDate = new Date(lastSeen);
          return items?.filter(item => new Date(item.createdAt) > lastSeenDate).length || 0;
        };

        setBadgeCounts({
          "/squad": getNewCount(players || [], "lastSeen_squad"),
          "/calendar": getNewCount(events || [], "lastSeen_calendar"),
          "/tactics": getNewCount(tactics || [], "lastSeen_tactics"),
          "/messages": getNewCount(messages || [], "lastSeen_messages"),
        });

        // Detect if there's a match today
        const today = new Date().toISOString().split('T')[0];
        const todayMatch = events?.find((e: Event) =>
          e.type === 'Match' && e.date.startsWith(today)
        );

        if (todayMatch) {
          setMatchDayEvent(todayMatch);
        }
      } catch (error) {
        console.error("Dashboard load error:", error);
      }
    };
    loadDashboardData();
  }, []);

  // Filter features based on role
  const filteredFeatures = features.filter(f => {
    if (f.title === "Einstellungen") return isAdmin;
    return true;
  });

  if (matchDayEvent && showKabinenModus) {
    return (
      <MatchDayDashboard
        event={matchDayEvent}
        onClose={() => setShowKabinenModus(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top Navigation / Logout */}
      <div className="absolute top-8 right-8 z-10">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand hover:border-brand/20 hover:shadow-xl hover:shadow-brand/5 transition-all active:scale-95 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Abmelden
        </button>
      </div>

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
              Angemeldet als: <span className="ml-1.5 font-black uppercase text-[10px]">{session?.user?.name} ({isAdmin ? 'Admin' : 'Spieler'})</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-7xl text-brand mb-4">
              Verwaltungstool <br /> Schulfussball KGS-Pattensen.
            </h1>
            <p className="mt-8 text-xl leading-8 text-slate-600 max-w-2xl mx-auto font-medium">
              Verwalten der 1. und 2. Mannschaft der KGS Pattensen mit einem professionellen System für Kader,
              Taktik und Performance.
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

            {matchDayEvent && !showKabinenModus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 flex justify-center"
              >
                <button
                  onClick={() => setShowKabinenModus(true)}
                  className="group flex items-center gap-3 bg-brand/10 hover:bg-brand/20 border border-brand/20 px-6 py-3 rounded-2xl transition-all"
                >
                  <Trophy className="w-5 h-5 text-brand animate-bounce" />
                  <span className="text-xs font-black uppercase tracking-widest text-brand">Kabinen-Modus aktivieren</span>
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Grid */}
          <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={feature.href}
                  className="group flex flex-col h-full rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-brand/5 hover:border-brand/20 transition-all active:scale-[0.98] relative"
                >
                  <NotificationBadge count={badgeCounts[feature.href] || 0} />
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
