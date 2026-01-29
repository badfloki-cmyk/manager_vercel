"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy,
    MapPin,
    Clock,
    ChevronRight,
    ExternalLink,
    Users,
    LayoutDashboard,
    Shield,
    Navigation,
    Info
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MatchDayDashboardProps {
    event: {
        title: string;
        date: string;
        location: string;
        meetingTime?: string;
        meetingPoint?: string;
    };
    onClose: () => void;
}

export const MatchDayDashboard: React.FC<MatchDayDashboardProps> = ({ event, onClose }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const matchDate = new Date(event.date);

            // If meetingTime is provided, use it for the countdown
            if (event.meetingTime) {
                const [mHours, mMinutes] = event.meetingTime.split(':');
                matchDate.setHours(parseInt(mHours), parseInt(mMinutes), 0);
            }

            const diff = matchDate.getTime() - now.getTime();

            if (diff > 0) {
                setTimeLeft({
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60)
                });
            } else {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            }
        };

        const timer = setInterval(calculateTime, 1000);
        calculateTime();
        return () => clearInterval(timer);
    }, [event]);

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;

    return (
        <div className="fixed inset-0 z-50 bg-[#0A0A0B] text-white overflow-y-auto selection:bg-brand selection:text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative min-h-screen flex flex-col p-6 lg:p-12 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-brand/20 rounded-2xl flex items-center justify-center border border-brand/30">
                            <Trophy className="w-6 h-6 text-brand" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand">Kabinen-Modus</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Match-Day Dashboard</p>
                        </div>
                    </motion.div>

                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Standard-Ansicht
                    </button>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Countdown & Match Info */}
                    <div className="lg:col-span-7 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Clock className="w-32 h-32" />
                            </div>

                            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-8 leading-none">
                                {event.title}
                            </h1>

                            <div className="flex gap-4 lg:gap-8 items-end mb-12">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-brand uppercase tracking-[0.2em]">Stunden</div>
                                    <div className="text-5xl lg:text-7xl font-black font-mono">
                                        {timeLeft.hours.toString().padStart(2, '0')}
                                    </div>
                                </div>
                                <div className="text-5xl lg:text-7xl font-black mb-1 opacity-20">:</div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-brand uppercase tracking-[0.2em]">Minuten</div>
                                    <div className="text-5xl lg:text-7xl font-black font-mono">
                                        {timeLeft.minutes.toString().padStart(2, '0')}
                                    </div>
                                </div>
                                <div className="text-5xl lg:text-7xl font-black mb-1 opacity-20">:</div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-brand uppercase tracking-[0.2em]">Sekunden</div>
                                    <div className="text-5xl lg:text-7xl font-black font-mono text-brand">
                                        {timeLeft.seconds.toString().padStart(2, '0')}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-brand" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase">Treffpunkt-Zeit</p>
                                        <p className="font-black">{event.meetingTime || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                                        <Navigation className="w-5 h-5 text-brand" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase">Treffpunkt</p>
                                        <p className="font-black truncate max-w-[150px]">{event.meetingPoint || event.location}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <motion.a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ y: -5 }}
                                className="bg-brand hover:bg-brand-dark p-8 rounded-[2rem] flex flex-col justify-between group h-48 transition-colors shadow-2xl shadow-brand/20"
                            >
                                <ExternalLink className="w-8 h-8 self-end opacity-40 group-hover:opacity-100 transition-opacity" />
                                <div>
                                    <MapPin className="w-10 h-10 mb-4" />
                                    <h3 className="text-xl font-black uppercase tracking-tight">Anfahrt <br /> Location</h3>
                                </div>
                            </motion.a>

                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-white/5 border border-white/10 p-8 rounded-[2rem] flex flex-col justify-between group h-48 backdrop-blur-sm"
                            >
                                <Info className="w-8 h-8 self-end opacity-40 group-hover:opacity-100 transition-opacity" />
                                <div>
                                    <Shield className="w-10 h-10 mb-4 text-brand" />
                                    <h3 className="text-xl font-black uppercase tracking-tight">Letzte <br /> Infos</h3>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column: Quick Actions & Team */}
                    <div className="lg:col-span-5 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 px-4">Schnellzugriff</h3>

                            <Link href="/tactics">
                                <div className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between group transition-all cursor-pointer">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-[#1A1A1B] rounded-2xl flex items-center justify-center border border-white/5">
                                            <LayoutDashboard className="w-7 h-7 text-brand" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black uppercase tracking-tight">Taktik-Board</h4>
                                            <p className="text-xs text-slate-500 font-bold">Heutige Aufstellung</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-6 h-6 opacity-20 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1" />
                                </div>
                            </Link>

                            <Link href="/squad">
                                <div className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between group transition-all cursor-pointer">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-[#1A1A1B] rounded-2xl flex items-center justify-center border border-white/5">
                                            <Users className="w-7 h-7 text-brand" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black uppercase tracking-tight">Spieler-Kader</h4>
                                            <p className="text-xs text-slate-500 font-bold">Karten & Stats ansehen</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-6 h-6 opacity-20 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1" />
                                </div>
                            </Link>

                            <div className="pt-8 px-4">
                                <div className="h-px bg-white/10 w-full mb-8" />
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Heutiger Kader</h3>
                                    <span className="text-[10px] font-black bg-brand/10 text-brand px-3 py-1 rounded-full uppercase">Bestätigt</span>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden">
                                            <Users className="w-6 h-6 opacity-10" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};
