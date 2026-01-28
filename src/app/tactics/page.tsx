"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Save,
    Trash2,
    RotateCcw,
    LayoutDashboard,
    Users
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const INITIAL_PLAYERS = [
    { id: 1, name: "TW", x: 50, y: 90, color: "bg-yellow-500" },
    { id: 2, name: "IV", x: 35, y: 75, color: "bg-red-600" },
    { id: 3, name: "IV", x: 65, y: 75, color: "bg-red-600" },
    { id: 4, name: "LV", x: 15, y: 70, color: "bg-red-600" },
    { id: 5, name: "RV", x: 85, y: 70, color: "bg-red-600" },
    { id: 6, name: "ZM", x: 50, y: 55, color: "bg-red-600" },
    { id: 7, name: "ZM", x: 30, y: 50, color: "bg-red-600" },
    { id: 8, name: "ZM", x: 70, y: 50, color: "bg-red-600" },
    { id: 9, name: "ST", x: 50, y: 25, color: "bg-red-600" },
    { id: 10, name: "LA", x: 25, y: 30, color: "bg-red-600" },
    { id: 11, name: "RA", x: 75, y: 30, color: "bg-red-600" },
];

export default function TacticsPage() {
    const [players, setPlayers] = useState(INITIAL_PLAYERS);
    const constraintsRef = useRef(null);

    const resetFormation = () => setPlayers(INITIAL_PLAYERS);

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <LayoutDashboard className="w-6 h-6 text-red-500" />
                            Taktik-Board
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={resetFormation}
                            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                        <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all active:scale-95 flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Speichern
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 lg:p-12 flex flex-col items-center">
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Pitch Area */}
                    <div className="lg:col-span-3">
                        <div
                            ref={constraintsRef}
                            className="relative aspect-[3/4] max-h-[80vh] w-full bg-[#14532d] rounded-3xl border-8 border-white/20 overflow-hidden shadow-2xl"
                            style={{
                                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px),
                  linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)
                `,
                                backgroundSize: '10% 10%'
                            }}
                        >
                            {/* Pitch Markings */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4">
                                <div className="h-full border-2 border-white/20 rounded-lg relative">
                                    {/* Center Line */}
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20" />
                                    {/* Center Circle */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-white/20 rounded-full" />
                                    {/* Goal Areas */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-20 border-b-2 border-x-2 border-white/20" />
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-20 border-t-2 border-x-2 border-white/20" />
                                </div>
                            </div>

                            {/* Draggable Players */}
                            {players.map((player) => (
                                <motion.div
                                    key={player.id}
                                    drag
                                    dragConstraints={constraintsRef}
                                    dragElastic={0}
                                    dragMomentum={false}
                                    initial={{ left: `${player.x}%`, top: `${player.y}%` }}
                                    className={cn(
                                        "absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 border-white flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg select-none z-10",
                                        player.color
                                    )}
                                >
                                    <span className="text-[10px] font-black">{player.name}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Tools */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-red-500" />
                                Kader-Auswahl
                            </h3>
                            <p className="text-slate-500 text-sm mb-6">
                                Ziehe Spieler auf das Feld, um die Startelf zu planen.
                            </p>

                            <div className="space-y-3">
                                {["L. Schmidt", "M. Müller", "T. Kroos", "J. Musiala"].map((name) => (
                                    <div key={name} className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm flex items-center justify-between group hover:border-red-500/30 transition-colors">
                                        <span>{name}</span>
                                        <button className="p-1 hover:bg-red-500/10 rounded-md text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Formation</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {["4-3-3", "4-4-2", "3-5-2", "5-4-1"].map(f => (
                                    <button key={f} className="py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold hover:bg-red-600 hover:border-red-600 transition-all">
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
