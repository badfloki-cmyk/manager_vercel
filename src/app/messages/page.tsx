"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    MessageSquare,
    ArrowLeft,
    Send,
    Bell,
    Users,
    Calendar,
    Pin
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    type: "announcement" | "general";
    pinned?: boolean;
    team?: "1. Mannschaft" | "2. Mannschaft" | "Alle";
}

const DEMO_MESSAGES: Message[] = [
    {
        id: "1",
        author: "Trainer Schmidt",
        content: "Training am Donnerstag fällt wegen Platzsperrung aus! Ersatztermin folgt.",
        timestamp: "2026-01-28T10:30:00",
        type: "announcement",
        pinned: true,
        team: "Alle"
    },
    {
        id: "2",
        author: "Mannschaftsrat",
        content: "Erinnerung: Trikotgeld bitte bis Ende Januar überweisen.",
        timestamp: "2026-01-27T18:00:00",
        type: "announcement",
        team: "1. Mannschaft"
    },
    {
        id: "3",
        author: "Co-Trainer Müller",
        content: "Wer kann am Samstag beim Auswärtsspiel fahren? Bitte melden!",
        timestamp: "2026-01-26T14:15:00",
        type: "general",
        team: "2. Mannschaft"
    },
    {
        id: "4",
        author: "Vorstand",
        content: "Jahreshauptversammlung am 15.02. um 19:00 Uhr im Vereinsheim.",
        timestamp: "2026-01-25T09:00:00",
        type: "announcement",
        team: "Alle"
    },
    {
        id: "5",
        author: "Zeugwart Weber",
        content: "Neue Trainingsshirts sind da! Können ab morgen abgeholt werden.",
        timestamp: "2026-01-24T16:45:00",
        type: "general",
        team: "Alle"
    }
];

export default function MessagesPage() {
    const [messages] = useState<Message[]>(DEMO_MESSAGES);
    const [filter, setFilter] = useState<"all" | "announcements">("all");
    const [newMessage, setNewMessage] = useState("");

    const filteredMessages = filter === "all"
        ? messages
        : messages.filter(m => m.type === "announcement");

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return `Heute, ${date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
        if (diffDays === 1) return `Gestern, ${date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-4xl px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-red-500" />
                            Kommunikation
                        </h1>
                    </div>
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                        <button
                            onClick={() => setFilter("all")}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                filter === "all" ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            )}
                        >
                            Alle
                        </button>
                        <button
                            onClick={() => setFilter("announcements")}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                filter === "announcements" ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <Bell className="w-3 h-3" />
                            Ankündigungen
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-6 py-12">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
                        <MessageSquare className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{messages.length}</p>
                        <p className="text-xs text-slate-500 uppercase font-bold">Nachrichten</p>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
                        <Bell className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{messages.filter(m => m.type === "announcement").length}</p>
                        <p className="text-xs text-slate-500 uppercase font-bold">Ankündigungen</p>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
                        <Pin className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{messages.filter(m => m.pinned).length}</p>
                        <p className="text-xs text-slate-500 uppercase font-bold">Angepinnt</p>
                    </div>
                </div>

                {/* Messages List */}
                <div className="space-y-4 mb-8">
                    {filteredMessages.map((message, index) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "bg-slate-900/50 border rounded-2xl p-6 transition-all hover:bg-slate-800/50",
                                message.pinned ? "border-red-500/30" : "border-slate-800"
                            )}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-sm font-bold">
                                        {message.author.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-bold">{message.author}</p>
                                        <p className="text-xs text-slate-500">{formatTime(message.timestamp)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {message.pinned && (
                                        <Pin className="w-4 h-4 text-red-500" />
                                    )}
                                    {message.type === "announcement" && (
                                        <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded ring-1 ring-red-500/20">
                                            Wichtig
                                        </span>
                                    )}
                                    {message.team && (
                                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {message.team}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{message.content}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Compose Box (Demo) */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Nachricht schreiben... (Demo)"
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                        <button
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-all active:scale-95 flex items-center gap-2"
                            onClick={() => alert("Demo-Modus: Nachrichten werden nicht gespeichert.")}
                        >
                            <Send className="w-4 h-4" />
                            Senden
                        </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-3 text-center">
                        ℹ️ Dies ist eine Demo-Ansicht. Vollständige Messaging-Funktionen in Entwicklung.
                    </p>
                </div>
            </main>
        </div>
    );
}
