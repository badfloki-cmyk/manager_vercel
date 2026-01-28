"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Save,
    RotateCcw,
    LayoutDashboard,
    Users,
    Plus,
    Minus
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type GameMode = "football" | "futsal";

interface PlayerPosition {
    id: number;
    name: string;
    x: number;
    y: number;
    color: string;
}

const FOOTBALL_FORMATION: PlayerPosition[] = [
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

const FUTSAL_FORMATION: PlayerPosition[] = [
    { id: 1, name: "TW", x: 50, y: 88, color: "bg-yellow-500" },
    { id: 2, name: "FIX", x: 50, y: 65, color: "bg-red-600" },
    { id: 3, name: "ALA", x: 25, y: 50, color: "bg-red-600" },
    { id: 4, name: "ALA", x: 75, y: 50, color: "bg-red-600" },
    { id: 5, name: "PIV", x: 50, y: 30, color: "bg-red-600" },
];

const FUTSAL_BENCH: PlayerPosition[] = [
    { id: 6, name: "TW2", x: 0, y: 0, color: "bg-yellow-500/70" },
    { id: 7, name: "W1", x: 0, y: 0, color: "bg-slate-600" },
    { id: 8, name: "W2", x: 0, y: 0, color: "bg-slate-600" },
    { id: 9, name: "W3", x: 0, y: 0, color: "bg-slate-600" },
    { id: 10, name: "W4", x: 0, y: 0, color: "bg-slate-600" },
];

const FOOTBALL_BENCH: PlayerPosition[] = [
    { id: 12, name: "TW2", x: 0, y: 0, color: "bg-yellow-500/70" },
    { id: 13, name: "W1", x: 0, y: 0, color: "bg-slate-600" },
    { id: 14, name: "W2", x: 0, y: 0, color: "bg-slate-600" },
    { id: 15, name: "W3", x: 0, y: 0, color: "bg-slate-600" },
    { id: 16, name: "W4", x: 0, y: 0, color: "bg-slate-600" },
    { id: 17, name: "W5", x: 0, y: 0, color: "bg-slate-600" },
    { id: 18, name: "W6", x: 0, y: 0, color: "bg-slate-600" },
];

const FUTSAL_FORMATIONS = ["1-2-1", "2-2", "1-1-2", "3-1"];
const FOOTBALL_FORMATIONS = ["4-3-3", "4-4-2", "3-5-2", "5-4-1"];

export default function TacticsPage() {
    const [mode, setMode] = useState<GameMode>("futsal");
    const [players, setPlayers] = useState(FUTSAL_FORMATION);
    const [bench, setBench] = useState(FUTSAL_BENCH);
    const [selectedFormation, setSelectedFormation] = useState("1-2-1");
    const constraintsRef = useRef(null);

    const switchMode = (newMode: GameMode) => {
        setMode(newMode);
        if (newMode === "futsal") {
            setPlayers(FUTSAL_FORMATION);
            setBench(FUTSAL_BENCH);
            setSelectedFormation("1-2-1");
        } else {
            setPlayers(FOOTBALL_FORMATION);
            setBench(FOOTBALL_BENCH);
            setSelectedFormation("4-3-3");
        }
    };

    const resetFormation = () => {
        if (mode === "futsal") {
            setPlayers(FUTSAL_FORMATION);
            setBench(FUTSAL_BENCH);
        } else {
            setPlayers(FOOTBALL_FORMATION);
            setBench(FOOTBALL_BENCH);
        }
    };

    const formations = mode === "futsal" ? FUTSAL_FORMATIONS : FOOTBALL_FORMATIONS;

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
                        {/* Mode Toggle */}
                        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 ml-4">
                            <button
                                onClick={() => switchMode("futsal")}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                    mode === "futsal" ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                                )}
                            >
                                Futsal (5)
                            </button>
                            <button
                                onClick={() => switchMode("football")}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                    mode === "football" ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                                )}
                            >
                                Fußball (11)
                            </button>
                        </div>
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

            <main className="flex-1 p-6 lg:p-8 flex flex-col items-center">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Pitch Area */}
                    <div className="lg:col-span-3">
                        <div
                            ref={constraintsRef}
                            className={cn(
                                "relative w-full bg-[#14532d] rounded-3xl border-8 border-white/20 overflow-hidden shadow-2xl",
                                mode === "futsal" ? "aspect-[2/3]" : "aspect-[3/4]"
                            )}
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
                                    <div className={cn(
                                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white/20 rounded-full",
                                        mode === "futsal" ? "w-24 h-24" : "w-40 h-40"
                                    )} />
                                    {/* Goal Areas */}
                                    <div className={cn(
                                        "absolute top-0 left-1/2 -translate-x-1/2 border-b-2 border-x-2 border-white/20",
                                        mode === "futsal" ? "w-1/3 h-12" : "w-1/2 h-20"
                                    )} />
                                    <div className={cn(
                                        "absolute bottom-0 left-1/2 -translate-x-1/2 border-t-2 border-x-2 border-white/20",
                                        mode === "futsal" ? "w-1/3 h-12" : "w-1/2 h-20"
                                    )} />
                                </div>
                            </div>

                            {/* Mode Badge */}
                            <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 rounded-full text-xs font-bold uppercase tracking-wider">
                                {mode === "futsal" ? "⚽ Futsal 5v5" : "⚽ Fußball 11v11"}
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
                                        "absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 border-white flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg select-none z-10 hover:scale-110 transition-transform",
                                        player.color
                                    )}
                                >
                                    <span className="text-[10px] font-black">{player.name}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Bench */}
                        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    <Users className="w-4 h-4 text-red-500" />
                                    Wechselbank ({bench.length} Spieler)
                                </h3>
                                <span className="text-xs text-slate-500">Ziehe Spieler aufs Feld</span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {bench.map((player) => (
                                    <motion.div
                                        key={player.id}
                                        whileHover={{ scale: 1.1 }}
                                        className={cn(
                                            "flex-shrink-0 w-14 h-14 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center cursor-grab active:cursor-grabbing select-none hover:border-red-500/50 transition-colors",
                                            player.color
                                        )}
                                    >
                                        <span className="text-[10px] font-bold">{player.name}</span>
                                    </motion.div>
                                ))}
                                <button className="flex-shrink-0 w-14 h-14 rounded-xl border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-600 hover:border-slate-700 hover:text-slate-500 transition-colors">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Tools */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Formation</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {formations.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setSelectedFormation(f)}
                                        className={cn(
                                            "py-2.5 rounded-lg text-xs font-bold transition-all",
                                            selectedFormation === f
                                                ? "bg-red-600 border-red-600 text-white"
                                                : "bg-slate-800 border border-slate-700 hover:bg-red-600 hover:border-red-600"
                                        )}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Info</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Modus</span>
                                    <span className="font-medium">{mode === "futsal" ? "Futsal" : "Fußball"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Spieler</span>
                                    <span className="font-medium">{players.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Auf Bank</span>
                                    <span className="font-medium">{bench.length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Legende</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-yellow-500" />
                                    <span className="text-slate-400">Torwart</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-red-600" />
                                    <span className="text-slate-400">Feldspieler</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-slate-600" />
                                    <span className="text-slate-400">Wechselspieler</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
