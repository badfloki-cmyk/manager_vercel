"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar as CalendarIcon,
    Plus,
    MapPin,
    Clock,
    Users,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Trophy
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getEvents, createEvent, Event } from "@/lib/events";

export default function CalendarPage() {
    const [team, setTeam] = useState<"1. Mannschaft" | "2. Mannschaft" | "Both">("Both");
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Event Form State
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        type: "Training" as const,
        date: "",
        location: "KGS Pattensen",
        team: "Both" as const,
    });

    const loadEvents = async () => {
        setIsLoading(true);
        try {
            const { events: fetchedEvents } = await getEvents(team === "Both" ? undefined : team);
            setEvents(fetchedEvents || []);
        } catch (error) {
            console.error("Failed to load events:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, [team]);

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createEvent(newEvent);
            setIsModalOpen(false);
            setNewEvent({
                title: "",
                description: "",
                type: "Training",
                date: "",
                location: "KGS Pattensen",
                team: "Both",
            });
            loadEvents();
        } catch (error) {
            console.error("Error creating event:", error);
            alert("Fehler beim Erstellen des Termins.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case "Training": return "bg-blue-500/10 text-blue-500 ring-blue-500/20";
            case "Match": return "bg-red-500/10 text-red-500 ring-red-500/20";
            case "Event": return "bg-purple-500/10 text-purple-500 ring-purple-500/20";
            default: return "bg-slate-500/10 text-slate-500 ring-slate-500/20";
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold">Terminkalender</h1>
                    </div>
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                        {["Both", "1. Mannschaft", "2. Mannschaft"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTeam(t as any)}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                    team === t ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                                )}
                            >
                                {t === "Both" ? "Alle" : t}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-6 py-12">
                {/* Actions Bar */}
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <CalendarIcon className="w-6 h-6 text-red-500" />
                        Anstehende Termine
                    </h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-red-600/10"
                    >
                        <Plus className="w-4 h-4" />
                        Neuer Termin
                    </button>
                </div>

                {/* Event List */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence mode="popLayout">
                            {events.map((event, index) => (
                                <motion.div
                                    key={event._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="group relative flex gap-6 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:bg-slate-800/40 transition-all overflow-hidden"
                                >
                                    {/* Left: Date Box */}
                                    <div className="flex-shrink-0 w-20 h-24 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
                                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                                            {new Date(event.date).toLocaleDateString('de-DE', { month: 'short' })}
                                        </span>
                                        <span className="text-3xl font-black mt-1">
                                            {new Date(event.date).getDate()}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                                            {new Date(event.date).toLocaleDateString('de-DE', { weekday: 'short' })}
                                        </span>
                                    </div>

                                    {/* Right: Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold ring-1 ring-inset",
                                                    getTypeStyles(event.type)
                                                )}>
                                                    {event.type}
                                                </span>
                                                <h3 className="text-xl font-bold">{event.title}</h3>
                                            </div>
                                        </div>

                                        <p className="text-slate-400 text-sm mb-4 line-clamp-1">
                                            {event.description || "Keine Beschreibung vorhanden."}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-red-500" />
                                                {new Date(event.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-red-500" />
                                                {event.location}
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                                                <Users className="w-3.5 h-3.5 text-red-500" />
                                                {event.team}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decorative Gradient */}
                                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none" />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {events.length === 0 && (
                            <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                                <CalendarIcon className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Bisher keine Termine geplant.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Add Event Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold mb-6 italic">Neuer Termin</h2>
                            <form onSubmit={handleAddEvent} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Titel</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Spielfreies Training / Auswärtsspiel..."
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500/50 transition-colors text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase px-1">Typ</label>
                                        <select
                                            value={newEvent.type}
                                            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500/50 transition-colors text-sm"
                                        >
                                            <option value="Training">Training</option>
                                            <option value="Match">Spiel</option>
                                            <option value="Event">Event</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase px-1">Team</label>
                                        <select
                                            value={newEvent.team}
                                            onChange={(e) => setNewEvent({ ...newEvent, team: e.target.value as any })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500/50 transition-colors text-sm"
                                        >
                                            <option value="Both">Beide Teams</option>
                                            <option value="1. Mannschaft">1. Mannschaft</option>
                                            <option value="2. Mannschaft">2. Mannschaft</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Datum & Uhrzeit</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500/50 transition-colors text-sm color-white"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Ort</label>
                                    <input
                                        required
                                        type="text"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500/50 transition-colors text-sm"
                                    />
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 transition-colors font-medium text-sm text-slate-400"
                                    >
                                        Abbrechen
                                    </button>
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-red-600/10 text-sm disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Wird erstellt..." : "Termin anlegen"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
