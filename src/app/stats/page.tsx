"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Trophy,
    Target,
    Users,
    ArrowLeft,
    Medal,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPlayers, Player } from "@/lib/squad";

type StatCategory = "goals" | "assists" | "appearances";

export default function StatsPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [category, setCategory] = useState<StatCategory>("goals");
    const [team, setTeam] = useState<"all" | "1. Mannschaft" | "2. Mannschaft">("all");

    const loadPlayers = useCallback(async () => {
        setIsLoading(true);
        try {
            const { players: fetchedPlayers } = await getPlayers();
            setPlayers(fetchedPlayers || []);
        } catch (error) {
            console.error("Failed to load players:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPlayers();
    }, [loadPlayers]);

    const filteredPlayers = team === "all" 
        ? players 
        : players.filter(p => p.team === team);

    const sortedPlayers = [...filteredPlayers].sort((a, b) => 
        b.stats[category] - a.stats[category]
    );

    const topThree = sortedPlayers.slice(0, 3);
    const rest = sortedPlayers.slice(3, 10);

    const teamStats = {
        "1. Mannschaft": players.filter(p => p.team === "1. Mannschaft"),
        "2. Mannschaft": players.filter(p => p.team === "2. Mannschaft"),
    };

    const getTeamTotal = (teamPlayers: Player[], stat: StatCategory) => 
        teamPlayers.reduce((sum, p) => sum + p.stats[stat], 0);

    const categoryLabels: Record<StatCategory, string> = {
        goals: "Tore",
        assists: "Assists",
        appearances: "Einsätze"
    };

    const categoryIcons: Record<StatCategory, typeof Trophy> = {
        goals: Target,
        assists: TrendingUp,
        appearances: Users
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
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-red-500" />
                            Statistiken
                        </h1>
                    </div>
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                        {["all", "1. Mannschaft", "2. Mannschaft"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTeam(t as typeof team)}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                    team === t ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                                )}
                            >
                                {t === "all" ? "Alle" : t}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-12">
                {/* Category Tabs */}
                <div className="flex gap-3 mb-10">
                    {(Object.keys(categoryLabels) as StatCategory[]).map((cat) => {
                        const Icon = categoryIcons[cat];
                        return (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                                    category === cat 
                                        ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {categoryLabels[cat]}
                            </button>
                        );
                    })}
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
                    </div>
                ) : (
                    <>
                        {/* Top 3 Podium */}
                        <div className="grid grid-cols-3 gap-6 mb-12">
                            {[1, 0, 2].map((idx) => {
                                const player = topThree[idx];
                                if (!player) return <div key={idx} />;
                                
                                const position = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                                const heights = { 1: "h-48", 2: "h-40", 3: "h-32" };
                                const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
                                
                                return (
                                    <motion.div
                                        key={player._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex flex-col items-center"
                                    >
                                        <div className="relative mb-4">
                                            <div className={cn(
                                                "w-20 h-20 rounded-full border-4 flex items-center justify-center overflow-hidden",
                                                position === 1 ? "border-yellow-500" : position === 2 ? "border-slate-400" : "border-amber-700"
                                            )}>
                                                {player.photoUrl ? (
                                                    <Image
                                                        src={player.photoUrl}
                                                        alt={`${player.firstName} ${player.lastName}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-2xl font-bold text-slate-500">{player.number}</span>
                                                )}
                                            </div>
                                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl">
                                                {medals[position as 1 | 2 | 3]}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-center">
                                            {player.firstName} {player.lastName}
                                        </h3>
                                        <p className="text-slate-500 text-sm">{player.position}</p>
                                        <div className={cn(
                                            "mt-4 w-full rounded-t-2xl flex items-end justify-center pb-4",
                                            position === 1 ? "bg-gradient-to-t from-yellow-500/20 to-transparent" :
                                            position === 2 ? "bg-gradient-to-t from-slate-500/20 to-transparent" :
                                            "bg-gradient-to-t from-amber-700/20 to-transparent",
                                            heights[position as 1 | 2 | 3]
                                        )}>
                                            <span className="text-4xl font-black">{player.stats[category]}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Rest of Leaderboard */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden mb-12">
                            <div className="p-4 border-b border-slate-800">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Medal className="w-5 h-5 text-red-500" />
                                    Leaderboard - {categoryLabels[category]}
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-800">
                                {rest.map((player, idx) => (
                                    <motion.div
                                        key={player._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-sm font-bold text-slate-400">
                                                {idx + 4}
                                            </span>
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden relative">
                                                {player.photoUrl ? (
                                                    <Image
                                                        src={player.photoUrl}
                                                        alt={`${player.firstName} ${player.lastName}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-bold text-slate-500">{player.number}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{player.firstName} {player.lastName}</p>
                                                <p className="text-xs text-slate-500">{player.team}</p>
                                            </div>
                                        </div>
                                        <span className="text-xl font-bold">{player.stats[category]}</span>
                                    </motion.div>
                                ))}
                                {rest.length === 0 && (
                                    <div className="p-8 text-center text-slate-500">
                                        Keine weiteren Spieler vorhanden.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Team Comparison */}
                        <h3 className="text-xl font-bold mb-6">Team-Vergleich</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(["1. Mannschaft", "2. Mannschaft"] as const).map((teamName) => (
                                <div key={teamName} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                    <h4 className="font-bold text-lg mb-4">{teamName}</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <p className="text-3xl font-black text-red-500">
                                                {getTeamTotal(teamStats[teamName], "goals")}
                                            </p>
                                            <p className="text-xs text-slate-500 uppercase font-bold">Tore</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-3xl font-black text-red-500">
                                                {getTeamTotal(teamStats[teamName], "assists")}
                                            </p>
                                            <p className="text-xs text-slate-500 uppercase font-bold">Assists</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-3xl font-black text-red-500">
                                                {teamStats[teamName].length}
                                            </p>
                                            <p className="text-xs text-slate-500 uppercase font-bold">Spieler</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
