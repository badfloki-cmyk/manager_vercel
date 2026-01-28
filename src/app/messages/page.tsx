"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    MessageSquare,
    ArrowLeft,
    Send,
    Bell,
    Users,
    Pin
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
        <div className="min-h-screen bg-white text-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-4xl px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-900">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Image src="/logo_new.png" alt="Logo" width={100} height={25} className="h-8 w-auto object-contain rounded shadow-sm" />
                        <h1 className="text-2xl font-black text-brand tracking-tight flex items-center gap-3">
                            <MessageSquare className="w-6 h-6" />
                            Kommunikation
                        </h1>
                    </div>
                    <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100 shadow-inner">
                        <button
                            onClick={() => setFilter("all")}
                            className={cn(
                                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                filter === "all" ? "bg-brand text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Alle
                        </button>
                        <button
                            onClick={() => setFilter("announcements")}
                            className={cn(
                                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                filter === "announcements" ? "bg-brand text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
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
                <div className="grid grid-cols-3 gap-6 mb-12">
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 text-center shadow-xl shadow-slate-200/50 group hover:border-brand/20 transition-all">
                        <MessageSquare className="w-8 h-8 text-brand mx-auto mb-3" />
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{messages.length}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Nachrichten</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 text-center shadow-xl shadow-slate-200/50 group hover:border-brand/20 transition-all">
                        <Bell className="w-8 h-8 text-brand mx-auto mb-3" />
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{messages.filter(m => m.type === "announcement").length}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Ankündigungen</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 text-center shadow-xl shadow-slate-200/50 group hover:border-brand/20 transition-all">
                        <Pin className="w-8 h-8 text-brand mx-auto mb-3" />
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{messages.filter(m => m.pinned).length}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Angepinnt</p>
                    </div>
                </div>

                {/* Messages List */}
                <div className="space-y-6 mb-12">
                    {filteredMessages.map((message, index) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "bg-white border rounded-[2rem] p-8 transition-all hover:shadow-2xl hover:shadow-brand/5 hover:border-brand/20 shadow-xl shadow-slate-200/50",
                                message.pinned ? "border-brand/30 bg-brand/5" : "border-slate-100"
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-sm font-black text-white shadow-lg shadow-brand/20">
                                        {message.author.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-lg tracking-tight">{message.author}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">{formatTime(message.timestamp)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {message.pinned && (
                                        <Pin className="w-4 h-4 text-brand" />
                                    )}
                                    {message.type === "announcement" && (
                                        <span className="px-3 py-1 bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest rounded-lg ring-1 ring-inset ring-brand/20">
                                            Wichtig
                                        </span>
                                    )}
                                    {message.team && (
                                        <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 border border-slate-100">
                                            <Users className="w-3.5 h-3.5" />
                                            {message.team}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed font-medium">{message.content}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Compose Box (Demo) */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 relative">
                    <div className="flex gap-6">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Nachricht schreiben..."
                            className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand/30 focus:bg-white transition-all font-medium shadow-inner placeholder:text-slate-300"
                        />
                        <button
                            className="px-10 py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-brand/20"
                            onClick={() => alert("Demo-Modus: Nachrichten werden nicht gespeichert.")}
                        >
                            <Send className="w-4 h-4" />
                            Senden
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-6 text-center font-black uppercase tracking-widest">
                        ℹ️ Dies ist eine Demo-Ansicht. Vollständige Messaging-Funktionen in Entwicklung.
                    </p>
                </div>
            </main>
        </div>
    );
}
