"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar as CalendarIcon,
    Plus,
    MapPin,
    Clock,
    Users,
    ArrowLeft,
    Edit,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    List
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { getEvents, createEvent, updateEvent, deleteEvent, Event } from "@/lib/events";

export default function CalendarPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";
    const [team, setTeam] = useState<"1. Mannschaft" | "2. Mannschaft" | "Both">("Both");
    const [viewMode, setViewMode] = useState<"list" | "month" | "year">("list");
    const [viewDate, setViewDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    // New Event Form State
    const [newEvent, setNewEvent] = useState<{
        title: string;
        description: string;
        type: "Training" | "Match" | "Event";
        date: string;
        location: string;
        meetingPoint: string;
        meetingTime: string;
        notes: string;
        team: "1. Mannschaft" | "2. Mannschaft" | "Both";
    }>({
        title: "",
        description: "",
        type: "Training",
        date: "",
        location: "KGS Pattensen",
        meetingPoint: "",
        meetingTime: "",
        notes: "",
        team: "Both",
    });

    const loadEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const currentYear = viewDate.getFullYear();
            const startDate = `${currentYear}-01-01`;
            const endDate = `${currentYear}-12-31`;

            const { events: fetchedEvents } = await getEvents(
                team === "Both" ? undefined : team,
                startDate,
                endDate
            );
            setEvents(fetchedEvents || []);
        } catch (error) {
            console.error("Failed to load events:", error);
        } finally {
            setIsLoading(false);
        }
    }, [team, viewDate]);

    useEffect(() => {
        loadEvents();
        localStorage.setItem("lastSeen_calendar", new Date().toISOString());
    }, [loadEvents]);

    const handleSubmitEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingEventId) {
                await updateEvent(editingEventId, newEvent);
            } else {
                await createEvent(newEvent);
            }

            setIsModalOpen(false);
            setEditingEventId(null);
            setNewEvent({
                title: "",
                description: "",
                type: "Training",
                date: "",
                location: "KGS Pattensen",
                meetingPoint: "",
                meetingTime: "",
                notes: "",
                team: "Both",
            });
            loadEvents();
        } catch (error) {
            console.error("Error saving event:", error);
            alert("Fehler beim Speichern des Termins.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm("Bist du sicher, dass du diesen Termin löschen möchtest?")) return;
        try {
            await deleteEvent(id);
            loadEvents();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Fehler beim Löschen.");
        }
    };

    const openEditModal = (event: Event) => {
        setEditingEventId(event._id);
        setNewEvent({
            title: event.title,
            description: event.description || "",
            type: event.type,
            date: new Date(event.date).toISOString().slice(0, 16),
            location: event.location,
            meetingPoint: event.meetingPoint || "",
            meetingTime: event.meetingTime || "",
            notes: event.notes || "",
            team: event.team,
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingEventId(null);
        setNewEvent({
            title: "",
            description: "",
            type: "Training",
            date: "",
            location: "KGS Pattensen",
            meetingPoint: "",
            meetingTime: "",
            notes: "",
            team: "Both",
        });
        setIsModalOpen(true);
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case "Training": return "bg-blue-500/10 text-blue-500 ring-blue-500/20";
            case "Match": return "bg-brand/10 text-brand ring-brand/20";
            case "Event": return "bg-purple-500/10 text-purple-500 ring-purple-500/20";
            default: return "bg-slate-500/10 text-slate-500 ring-slate-500/20";
        }
    };

    const nextDate = () => {
        const d = new Date(viewDate);
        if (viewMode === "month") d.setMonth(d.getMonth() + 1);
        else if (viewMode === "year") d.setFullYear(d.getFullYear() + 1);
        setViewDate(d);
    };

    const prevDate = () => {
        const d = new Date(viewDate);
        if (viewMode === "month") d.setMonth(d.getMonth() - 1);
        else if (viewMode === "year") d.setFullYear(d.getFullYear() - 1);
        setViewDate(d);
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    return (
        <div className="min-h-screen bg-white text-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-900">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Image src="/logo_new.png" alt="Logo" width={100} height={25} className="h-8 w-auto object-contain rounded shadow-sm" />
                        <h1 className="text-2xl font-black text-brand tracking-tight">Terminkalender</h1>
                    </div>

                    <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100 shadow-inner">
                        {(["list", "month", "year"] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setViewMode(m)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    viewMode === m ? "bg-brand text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {m === "list" && <List className="w-3 h-3" />}
                                {m === "month" && <CalendarIcon className="w-3 h-3" />}
                                {m === "year" && <CalendarIcon className="w-3 h-3" />}
                                {m === "list" ? "Liste" : m === "month" ? "Monat" : "Jahr"}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-white rounded-xl p-1 border border-slate-100 shadow-inner">
                        {(["Both", "1. Mannschaft", "2. Mannschaft"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTeam(t)}
                                className={cn(
                                    "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                    team === t ? "bg-brand text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {t === "Both" ? "Alle" : t}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-12">
                {/* Actions Bar & Navigation */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-6">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <CalendarIcon className="w-6 h-6 text-brand" />
                            {viewMode === "list" ? "Anstehende Termine" :
                                viewMode === "month" ? viewDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' }) :
                                    viewDate.getFullYear()}
                        </h2>
                        {viewMode !== "list" && (
                            <div className="flex items-center gap-2">
                                <button onClick={prevDate} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={nextDate} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewDate(new Date())}
                                    className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand hover:bg-brand/5 rounded-lg transition-all"
                                >
                                    Heute
                                </button>
                            </div>
                        )}
                    </div>
                    {isAdmin && (
                        <button
                            onClick={openAddModal}
                            className="bg-brand hover:bg-brand-dark text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-brand/20"
                        >
                            <Plus className="w-5 h-5" />
                            Termin anlegen
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {viewMode === "list" && (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >
                                {(Array.from(new Set(events.map((e: Event) => {
                                    const d = new Date(e.date);
                                    return `${d.toLocaleString('de-DE', { month: 'long' })} ${d.getFullYear()}`;
                                }))) as string[]).map((monthGroup: string) => (
                                    <div key={monthGroup} className="space-y-6">
                                        <h3 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-4">
                                            <span className="bg-slate-100 h-px flex-1" />
                                            {monthGroup}
                                            <span className="bg-slate-100 h-px flex-1" />
                                        </h3>
                                        <div className="space-y-6">
                                            <AnimatePresence mode="popLayout">
                                                {events
                                                    .filter((e: Event) => {
                                                        const d = new Date(e.date);
                                                        return `${d.toLocaleString('de-DE', { month: 'long' })} ${d.getFullYear()}` === monthGroup;
                                                    })
                                                    .map((event: Event, index: number) => (
                                                        <motion.div
                                                            key={event._id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                                            className="group relative flex gap-6 bg-white border border-slate-100 p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-brand/5 hover:border-brand/20 transition-all"
                                                        >
                                                            {/* Left: Date Box */}
                                                            <div className="flex-shrink-0 w-20 h-24 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center shadow-inner">
                                                                <span className="text-xs font-black text-brand uppercase tracking-widest">
                                                                    {new Date(event.date).toLocaleDateString('de-DE', { month: 'short' })}
                                                                </span>
                                                                <span className="text-4xl font-black mt-1 text-slate-900 tracking-tighter">
                                                                    {new Date(event.date).getDate()}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-black uppercase mt-1">
                                                                    {new Date(event.date).toLocaleDateString('de-DE', { weekday: 'short' })}
                                                                </span>
                                                            </div>

                                                            {/* Right: Info */}
                                                            <div className="flex-1">
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={cn(
                                                                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ring-1 ring-inset",
                                                                            getTypeStyles(event.type)
                                                                        )}>
                                                                            {event.type}
                                                                        </span>
                                                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{event.title}</h3>
                                                                    </div>
                                                                    {isAdmin && (
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => openEditModal(event)}
                                                                                className="p-2 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-xl transition-all"
                                                                            >
                                                                                <Edit className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteEvent(event._id)}
                                                                                className="p-2 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-xl transition-all"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {event.description && (
                                                                    <p className="text-slate-500 text-sm mb-6 line-clamp-1 group-hover:line-clamp-none transition-all font-medium leading-relaxed">
                                                                        {event.description}
                                                                    </p>
                                                                )}

                                                                <div className="flex flex-wrap gap-6 text-xs font-black uppercase tracking-wider text-slate-400">
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="w-4 h-4 text-brand" />
                                                                        <span className="text-slate-600 font-bold tracking-tight lowercase">{new Date(event.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} uhr</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <MapPin className="w-4 h-4 text-brand" />
                                                                        <span className="text-slate-600 font-bold tracking-tight">{event.location}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-inner">
                                                                        <Users className="w-4 h-4 text-brand" />
                                                                        <span className="text-brand font-black text-[10px]">{event.team}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Hover Details */}
                                                                <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-60 group-hover:opacity-100 transition-all duration-500 ease-in-out">
                                                                    <div className="pt-6 mt-6 border-t border-slate-50 grid grid-cols-2 gap-8">
                                                                        {(event.meetingTime || event.meetingPoint) && (
                                                                            <div className="space-y-3">
                                                                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Treffpunkt</p>
                                                                                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                                                                    <Clock className="w-4 h-4 text-brand/50" />
                                                                                    <span>{event.meetingTime ? `${event.meetingTime} Uhr` : "Keine Zeit"}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                                                                    <MapPin className="w-4 h-4 text-brand/50" />
                                                                                    <span>{event.meetingPoint || "Kein Ort"}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {event.notes && (
                                                                            <div className="space-y-3">
                                                                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Notizen</p>
                                                                                <p className="text-sm text-slate-500 italic leading-relaxed font-medium">&quot;{event.notes}&quot;</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Decorative Gradient */}
                                                            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-brand/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </motion.div>
                                                    ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ))}

                                {events.length === 0 && (
                                    <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                                        <CalendarIcon className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">Bisher keine Termine geplant.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {viewMode === "month" && (
                            <motion.div
                                key="month"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden"
                            >
                                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                                    {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day: string) => (
                                        <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7">
                                    {(() => {
                                        const year = viewDate.getFullYear();
                                        const month = viewDate.getMonth();
                                        const daysInMonth = getDaysInMonth(year, month);
                                        let firstDay = getFirstDayOfMonth(year, month);
                                        // Adjust for Monday start (JS default is Sunday=0)
                                        firstDay = firstDay === 0 ? 6 : firstDay - 1;

                                        const cells = [];
                                        // Empty days
                                        for (let i = 0; i < firstDay; i++) {
                                            cells.push(<div key={`empty-${i}`} className="h-32 border-r border-b border-slate-50 bg-slate-50/20" />);
                                        }

                                        // Days with events
                                        for (let d = 1; d <= daysInMonth; d++) {
                                            const date = new Date(year, month, d);
                                            const dayEvents = events.filter((e: Event) => {
                                                const eventDate = new Date(e.date);
                                                return eventDate.getDate() === d &&
                                                    eventDate.getMonth() === month &&
                                                    eventDate.getFullYear() === year;
                                            });

                                            cells.push(
                                                <div key={d} className="h-32 border-r border-b border-slate-100 p-2 group hover:bg-slate-50/50 transition-colors relative overflow-hidden">
                                                    <span className={cn(
                                                        "text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg mb-1",
                                                        date.toDateString() === new Date().toDateString() ? "bg-brand text-white" : "text-slate-400 group-hover:text-slate-900"
                                                    )}>
                                                        {d}
                                                    </span>
                                                    <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                                                        {dayEvents.map((event: Event) => (
                                                            <div
                                                                key={event._id}
                                                                onClick={() => openEditModal(event)}
                                                                className={cn(
                                                                    "text-[8px] font-black uppercase px-2 py-1 rounded-md border truncate cursor-pointer transition-transform hover:scale-105",
                                                                    event.type === "Match" ? "bg-brand/10 border-brand/20 text-brand" :
                                                                        event.type === "Training" ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                                                                            "bg-purple-500/10 border-purple-500/20 text-purple-500"
                                                                )}
                                                            >
                                                                {event.title}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Fill remaining slots
                                        const remainingSlots = 42 - cells.length;
                                        for (let i = 0; i < remainingSlots; i++) {
                                            cells.push(<div key={`empty-end-${i}`} className="h-32 border-r border-b border-slate-50 bg-slate-50/20" />);
                                        }

                                        return cells;
                                    })()}
                                </div>
                            </motion.div>
                        )}

                        {viewMode === "year" && (
                            <motion.div
                                key="year"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8"
                            >
                                {Array.from({ length: 12 }).map((_, monthIndex) => {
                                    const year = viewDate.getFullYear();
                                    const daysInMonth = getDaysInMonth(year, monthIndex);
                                    let firstDay = getFirstDayOfMonth(year, monthIndex);
                                    firstDay = firstDay === 0 ? 6 : firstDay - 1;

                                    return (
                                        <div
                                            key={monthIndex}
                                            onClick={() => {
                                                const d = new Date(viewDate);
                                                d.setMonth(monthIndex);
                                                setViewDate(d);
                                                setViewMode("month");
                                            }}
                                            className="bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-xl hover:border-brand/20 transition-all cursor-pointer group"
                                        >
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 group-hover:text-brand transition-colors">
                                                {new Date(year, monthIndex).toLocaleString('de-DE', { month: 'long' })}
                                            </h4>
                                            <div className="grid grid-cols-7 gap-1">
                                                {/* Pre-padding */}
                                                {Array.from({ length: firstDay }).map((_, i) => (
                                                    <div key={`pad-${i}`} className="w-full aspect-square" />
                                                ))}
                                                {Array.from({ length: daysInMonth }).map((_, dIndex) => {
                                                    const d = dIndex + 1;
                                                    const hasEvent = events.some((e: Event) => {
                                                        const ed = new Date(e.date);
                                                        return ed.getDate() === d && ed.getMonth() === monthIndex && ed.getFullYear() === year;
                                                    });
                                                    return (
                                                        <div
                                                            key={d}
                                                            className={cn(
                                                                "w-full aspect-square rounded-full flex items-center justify-center text-[8px] font-black",
                                                                hasEvent ? "bg-brand text-white scale-110 shadow-lg shadow-brand/20" : "text-slate-300"
                                                            )}
                                                        >
                                                            {d}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                            className="relative w-full max-w-lg bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-black text-brand tracking-tight">
                                    {editingEventId ? "Termin bearbeiten" : "Neuer Termin"}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmitEvent} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Titel</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Spielfreies Training / Auswärtsspiel..."
                                        value={newEvent.title}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm font-medium shadow-inner"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Typ</label>
                                        <select
                                            value={newEvent.type}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewEvent({ ...newEvent, type: e.target.value as "Training" | "Match" | "Event" })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm font-medium shadow-inner appearance-none cursor-pointer"
                                        >
                                            <option value="Training">Training</option>
                                            <option value="Match">Spiel</option>
                                            <option value="Event">Event</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Team</label>
                                        <select
                                            value={newEvent.team}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewEvent({ ...newEvent, team: e.target.value as "Both" | "1. Mannschaft" | "2. Mannschaft" })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm font-medium shadow-inner appearance-none cursor-pointer"
                                        >
                                            <option value="Both">Beide Teams</option>
                                            <option value="1. Mannschaft">1. Mannschaft</option>
                                            <option value="2. Mannschaft">2. Mannschaft</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Datum & Uhrzeit</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        value={newEvent.date}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, date: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm font-medium shadow-inner"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Treffpunkt Ort</label>
                                        <input
                                            type="text"
                                            placeholder="Parkplatz..."
                                            value={newEvent.meetingPoint}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, meetingPoint: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm font-medium shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Treffpunkt Zeit</label>
                                        <input
                                            type="time"
                                            value={newEvent.meetingTime}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, meetingTime: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm font-medium shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Notizen</label>
                                    <textarea
                                        placeholder="Zusätzliche Infos..."
                                        value={newEvent.notes}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewEvent({ ...newEvent, notes: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm font-medium h-24 resize-none shadow-inner"
                                    />
                                </div>

                                <div className="flex gap-4 pt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-8 py-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all font-black uppercase text-xs tracking-widest text-slate-400"
                                    >
                                        Abbrechen
                                    </button>
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="flex-1 bg-brand hover:bg-brand-dark text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-xl shadow-brand/20 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Wird gespeichert..." : (editingEventId ? "Speichern" : "Termin anlegen")}
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
