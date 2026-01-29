"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    ArrowLeft,
    Send,
    Bell,
    Users,
    Pin,
    Loader2,
    Lock,
    Trash2,
    Pencil
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface Message {
    _id: string;
    author: string;
    authorImage?: string;
    content: string;
    createdAt: string;
    type: "announcement" | "general";
    pinned?: boolean;
    team?: "1. Mannschaft" | "2. Mannschaft" | "Alle";
}

export default function MessagesPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";

    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "announcements">("all");
    const [newMessage, setNewMessage] = useState("");
    const [messageType, setMessageType] = useState<"general" | "announcement">("general");
    const [messageTeam, setMessageTeam] = useState<"Alle" | "1. Mannschaft" | "2. Mannschaft">("Alle");
    const [isThinking, setIsThinking] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch("/api/messages");
            const data = await res.json();
            setMessages(data.messages || []);
        } catch {
            console.error("Fetch error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const userEmail = session?.user?.email || '';
        localStorage.setItem(`lastSeen_messages${userEmail ? `_${userEmail}` : ''}`, new Date().toISOString());
    }, [session]);

    const handleSendMessage = async () => {
        if (!newMessage || isThinking) return;
        setIsThinking(true);
        try {
            const method = editingMessageId ? "PUT" : "POST";
            const url = editingMessageId ? `/api/messages/${editingMessageId}` : "/api/messages";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: newMessage,
                    type: messageType,
                    team: messageTeam,
                    pinned: messageType === "announcement"
                }),
            });

            if (res.ok) {
                setNewMessage("");
                setEditingMessageId(null);
                fetchMessages();
            }
        } catch {
            console.error("Operation error");
        } finally {
            setIsThinking(false);
        }
    };

    const handleDeleteMessage = async (id: string) => {
        if (!confirm("Nachricht wirklich löschen?")) return;
        try {
            const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
            if (res.ok) fetchMessages();
        } catch {
            console.error("Delete error");
        }
    };

    const startEditing = (msg: Message) => {
        setNewMessage(msg.content);
        setMessageType(msg.type);
        setMessageTeam(msg.team || "Alle");
        setEditingMessageId(msg._id);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const cancelEditing = () => {
        setNewMessage("");
        setEditingMessageId(null);
    };

    const filteredMessages = filter === "all"
        ? messages
        : messages.filter((m: Message) => m.type === "announcement");

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
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{messages.filter((m: Message) => m.type === "announcement").length}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Ankündigungen</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 text-center shadow-xl shadow-slate-200/50 group hover:border-brand/20 transition-all">
                        <Pin className="w-8 h-8 text-brand mx-auto mb-3" />
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{messages.filter((m: Message) => m.pinned).length}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Angepinnt</p>
                    </div>
                </div>

                {/* Messages List */}
                <div className="space-y-6 mb-12 min-h-[300px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Laden...</p>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Keine Nachrichten vorhanden</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredMessages.map((message: Message, index: number) => (
                                <motion.div
                                    key={message._id}
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
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-sm font-black text-white shadow-lg shadow-brand/20 overflow-hidden">
                                                {message.authorImage ? (
                                                    <Image src={message.authorImage} alt={message.author} width={48} height={48} className="w-full h-full object-cover" />
                                                ) : (
                                                    message.author.split(' ').map((n: string) => n[0]).join('')
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-lg tracking-tight">{message.author}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">{formatTime(message.createdAt)}</p>
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

                                    {isAdmin && (
                                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-50">
                                            <button onClick={() => startEditing(message)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand transition-all">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteMessage(message._id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Compose Box */}
                {
                    isAdmin ? (
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 relative">
                            <div className="space-y-6">
                                <div className="flex gap-4 mb-4">
                                    <select
                                        value={messageType}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMessageType(e.target.value as "general" | "announcement")}
                                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <option value="general">Allgemein</option>
                                        <option value="announcement">Wichtig (Pin)</option>
                                    </select>
                                    <select
                                        value={messageTeam}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMessageTeam(e.target.value as "Alle" | "1. Mannschaft" | "2. Mannschaft")}
                                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <option value="Alle">Alle Teams</option>
                                        <option value="1. Mannschaft">1. Mannschaft</option>
                                        <option value="2. Mannschaft">2. Mannschaft</option>
                                    </select>
                                </div>
                                <div className="flex gap-6">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
                                        placeholder="Nachricht schreiben..."
                                        rows={1}
                                        className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand/30 focus:bg-white transition-all font-medium shadow-inner placeholder:text-slate-300 resize-none min-h-[56px]"
                                    />
                                    <button
                                        className="px-10 py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-brand/20 disabled:opacity-50"
                                        onClick={handleSendMessage}
                                        disabled={!newMessage || isThinking}
                                    >
                                        {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingMessageId ? <Pencil className="w-4 h-4" /> : <Send className="w-4 h-4" />)}
                                        {editingMessageId ? "Aktualisieren" : "Senden"}
                                    </button>
                                    {editingMessageId && (
                                        <button onClick={cancelEditing} className="px-6 py-4 border border-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all text-slate-400">
                                            Abbrechen
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-100 border-dashed rounded-[2.5rem] p-10 text-center">
                            <Lock className="w-8 h-8 text-slate-200 mx-auto mb-4" />
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                Nur Admins können Nachrichten verfassen.
                            </p>
                        </div>
                    )
                }
            </main >
        </div >
    );
}
