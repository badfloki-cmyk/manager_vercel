"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Trash2,
    UserPlus,
    Search,
    ArrowLeft,
    Camera,
    Upload,
    Armchair,
    ArrowUpFromLine,
    ArrowDownToLine
} from "lucide-react";
import { useCallback, useRef } from "react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPlayers, createPlayer, deletePlayer, updatePlayer, Player } from "@/lib/squad";

export default function SquadPage() {
    const [team, setTeam] = useState<"1. Mannschaft" | "2. Mannschaft">("1. Mannschaft");
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showBench, setShowBench] = useState(true);

    // New Player Form State
    const [newPlayer, setNewPlayer] = useState<{
        firstName: string;
        lastName: string;
        number: string;
        position: string;
        status: 'Active' | 'Injured' | 'Away';
        role: 'Captain' | 'Regular';
        photoUrl?: string;
    }>({
        firstName: "",
        lastName: "",
        number: "",
        position: "Sturm",
        status: "Active",
        role: "Regular",
        photoUrl: "",
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadPlayers = useCallback(async () => {
        setIsLoading(true);
        try {
            const { players: fetchedPlayers } = await getPlayers(team);
            setPlayers(fetchedPlayers || []);
        } catch (error) {
            console.error("Failed to load players:", error);
        } finally {
            setIsLoading(false);
        }
    }, [team]);

    useEffect(() => {
        loadPlayers();
    }, [loadPlayers]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleAddPlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let photoUrl = "";
            if (selectedFile) {
                console.log("Starting upload for:", selectedFile.name);
                const response = await fetch(`/api/upload?filename=${selectedFile.name}`, {
                    method: 'POST',
                    body: selectedFile,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Upload failed with status ${response.status}`);
                }

                const blob = await response.json();
                console.log("Upload successful, URL:", blob.url);
                photoUrl = blob.url;
            }

            console.log("Creating player with data:", { ...newPlayer, photoUrl });
            await createPlayer({
                ...newPlayer,
                number: parseInt(newPlayer.number || "0"),
                team: team,
                photoUrl: photoUrl,
                onBench: false,
                stats: { goals: 0, assists: 0, appearances: 0 }
            });
            setIsModalOpen(false);
            setNewPlayer({ firstName: "", lastName: "", number: "", position: "Sturm", status: "Active", role: "Regular", photoUrl: "" });
            setSelectedFile(null);
            setPreviewUrl(null);
            loadPlayers();
        } catch (error) {
            console.error("Error creating player:", error);
            alert("Fehler beim Erstellen des Spielers.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePlayer = async (id: string) => {
        if (!confirm("Spieler wirklich löschen?")) return;
        try {
            await deletePlayer(id);
            loadPlayers();
        } catch (error) {
            console.error("Error deleting player:", error);
            alert("Fehler beim Löschen des Spielers.");
        }
    };

    const toggleBench = async (player: Player) => {
        try {
            await updatePlayer(player._id, { onBench: !player.onBench });
            loadPlayers();
        } catch (error) {
            console.error("Error updating player:", error);
        }
    };

    const filteredPlayers = players.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activePlayers = filteredPlayers.filter(p => !p.onBench);
    const benchPlayers = filteredPlayers.filter(p => p.onBench);

    const PlayerCard = ({ player, index }: { player: Player; index: number }) => (
        <motion.div
            key={player._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className={cn(
                "group relative bg-slate-900/40 border p-6 rounded-2xl hover:bg-slate-800/40 transition-all",
                player.onBench ? "border-slate-700/50 opacity-75" : "border-slate-800 hover:border-red-500/30"
            )}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-xl font-bold text-red-500 overflow-hidden relative border border-slate-700">
                        {player.photoUrl ? (
                            <Image
                                src={player.photoUrl}
                                alt={`${player.firstName} ${player.lastName}`}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            player.number
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-snug">
                            {player.firstName} <br /> {player.lastName}
                        </h3>
                        <p className="text-slate-500 text-sm uppercase tracking-wider font-semibold">
                            {player.position}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                    <div className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                        player.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                    )}>
                        {player.status}
                    </div>
                    {player.onBench && (
                        <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-slate-700 text-slate-400">
                            Bank
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/50">
                <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Tore</p>
                    <p className="font-bold">{player.stats.goals}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Assists</p>
                    <p className="font-bold">{player.stats.assists}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Einsätze</p>
                    <p className="font-bold">{player.stats.appearances}</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                    onClick={() => toggleBench(player)}
                    className={cn(
                        "p-2 rounded-lg transition-all",
                        player.onBench
                            ? "hover:bg-emerald-500/10 hover:text-emerald-500"
                            : "hover:bg-orange-500/10 hover:text-orange-500"
                    )}
                    title={player.onBench ? "Auf Feld setzen" : "Auf Bank setzen"}
                >
                    {player.onBench ? (
                        <ArrowUpFromLine className="w-4 h-4" />
                    ) : (
                        <ArrowDownToLine className="w-4 h-4" />
                    )}
                </button>
                <button
                    onClick={() => handleDeletePlayer(player._id)}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold">Kaderverwaltung</h1>
                    </div>
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                        <button
                            onClick={() => setTeam("1. Mannschaft")}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                team === "1. Mannschaft" ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            )}
                        >
                            1. Mannschaft
                        </button>
                        <button
                            onClick={() => setTeam("2. Mannschaft")}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                team === "2. Mannschaft" ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            )}
                        >
                            2. Mannschaft
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-12">
                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Spieler suchen (Name, Position...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-red-600/10"
                    >
                        <UserPlus className="w-4 h-4" />
                        Neuer Spieler
                    </button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <p className="text-slate-500 text-sm mb-1">Gesamter Kader</p>
                        <h3 className="text-2xl font-bold">{players.length} Spieler</h3>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <p className="text-slate-500 text-sm mb-1">Aktive Spieler</p>
                        <h3 className="text-2xl font-bold text-emerald-400">{activePlayers.length}</h3>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <p className="text-slate-500 text-sm mb-1">Auf Bank</p>
                        <h3 className="text-2xl font-bold text-orange-400">{benchPlayers.length}</h3>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <p className="text-slate-500 text-sm mb-1">Verfügbarkeit</p>
                        <h3 className="text-2xl font-bold text-emerald-400">Bereit</h3>
                    </div>
                </div>

                {/* Player List */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
                    </div>
                ) : (
                    <>
                        {/* Active Players */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-red-500" />
                                Aktive Spieler ({activePlayers.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {activePlayers.map((player, index) => (
                                        <PlayerCard key={player._id} player={player} index={index} />
                                    ))}
                                </AnimatePresence>
                            </div>
                            {activePlayers.length === 0 && (
                                <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                                    <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-500">Keine aktiven Spieler.</p>
                                </div>
                            )}
                        </div>

                        {/* Bench Section */}
                        <div>
                            <button
                                onClick={() => setShowBench(!showBench)}
                                className="w-full flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl mb-4 hover:bg-slate-800/50 transition-colors"
                            >
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Armchair className="w-5 h-5 text-orange-500" />
                                    Wechselbank ({benchPlayers.length})
                                </h2>
                                <span className="text-slate-500 text-sm">
                                    {showBench ? "Ausblenden" : "Anzeigen"}
                                </span>
                            </button>

                            <AnimatePresence>
                                {showBench && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    >
                                        {benchPlayers.map((player, index) => (
                                            <PlayerCard key={player._id} player={player} index={index} />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {showBench && benchPlayers.length === 0 && (
                                <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                                    <Armchair className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-500">Keine Spieler auf der Bank.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Add Player Modal */}
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
                            <h2 className="text-2xl font-bold mb-6">Neuer Spieler ({team})</h2>
                            <form onSubmit={handleAddPlayer} className="space-y-6">
                                {/* Photo Upload */}
                                <div className="flex justify-center">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative w-24 h-24 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-red-500/50 transition-all cursor-pointer group flex items-center justify-center overflow-hidden"
                                    >
                                        {previewUrl ? (
                                            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                        ) : (
                                            <div className="text-center group-hover:scale-110 transition-transform">
                                                <Camera className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Foto</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Upload className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase px-1">Vorname</label>
                                        <input
                                            required
                                            type="text"
                                            value={newPlayer.firstName}
                                            onChange={(e) => setNewPlayer({ ...newPlayer, firstName: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500/50 transition-colors text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase px-1">Nachname</label>
                                        <input
                                            required
                                            type="text"
                                            value={newPlayer.lastName}
                                            onChange={(e) => setNewPlayer({ ...newPlayer, lastName: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500/50 transition-colors text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase px-1">Nummer</label>
                                        <input
                                            required
                                            type="number"
                                            value={newPlayer.number}
                                            onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500/50 transition-colors text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase px-1">Position</label>
                                        <select
                                            value={newPlayer.position}
                                            onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500/50 transition-colors text-sm"
                                        >
                                            <option>Torwart</option>
                                            <option>Abwehr</option>
                                            <option>Mittelfeld</option>
                                            <option>Sturm</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase px-1">Status</label>
                                        <select
                                            value={newPlayer.status}
                                            onChange={(e) => setNewPlayer({ ...newPlayer, status: e.target.value as 'Active' | 'Injured' | 'Away' })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500/50 transition-colors text-sm"
                                        >
                                            <option value="Active">Aktiv</option>
                                            <option value="Injured">Verletzt</option>
                                            <option value="Away">Abwesend</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase px-1">Rolle</label>
                                        <select
                                            value={newPlayer.role}
                                            onChange={(e) => setNewPlayer({ ...newPlayer, role: e.target.value as 'Captain' | 'Regular' })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500/50 transition-colors text-sm"
                                        >
                                            <option value="Regular">Normal</option>
                                            <option value="Captain">Kapitän</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 transition-colors font-medium text-sm"
                                    >
                                        Abbrechen
                                    </button>
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-red-600/10 text-sm disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Wird gespeichert..." : "Speichern"}
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
