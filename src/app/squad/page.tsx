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
    ArrowDownToLine,
    Pencil,
    Trophy
} from "lucide-react";
import { useCallback, useRef } from "react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { getPlayers, createPlayer, deletePlayer, updatePlayer, Player } from "@/lib/squad";
import { PlayerCard as FIFACard } from "@/components/PlayerCard";

export default function SquadPage() {
    const [team, setTeam] = useState<"1. Mannschaft" | "2. Mannschaft">("1. Mannschaft");
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showBench, setShowBench] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // New Player Form State
    const [newPlayer, setNewPlayer] = useState<{
        firstName: string;
        lastName: string;
        number: string;
        position: string;
        status: 'Active' | 'Injured' | 'Away';
        role: 'Captain' | 'Regular' | 'Admin' | 'Trainer';
        photoUrl?: string;
        fifaStats: {
            pac: number;
            sho: number;
            pas: number;
            dri: number;
            def: number;
            phy: number;
            rating: number;
        };
    }>({
        firstName: "",
        lastName: "",
        number: "",
        position: "Sturm",
        status: "Active",
        role: "Regular",
        photoUrl: "",
        fifaStats: {
            pac: 50,
            sho: 50,
            pas: 50,
            dri: 50,
            def: 50,
            phy: 50,
            rating: 50,
        }
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
        const userEmail = session?.user?.email || '';
        localStorage.setItem(`lastSeen_squad${userEmail ? `_${userEmail}` : ''}`, new Date().toISOString());
    }, [loadPlayers, session]);

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
            let photoUrl = newPlayer.photoUrl || "";
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

            console.log("Saving player with data:", { ...newPlayer, photoUrl });

            if (isEditing && editingId) {
                await updatePlayer(editingId, {
                    ...newPlayer,
                    number: parseInt(newPlayer.number || "0"),
                    photoUrl: photoUrl
                });
            } else {
                await createPlayer({
                    ...newPlayer,
                    number: parseInt(newPlayer.number || "0"),
                    team: team,
                    photoUrl: photoUrl,
                    onBench: false,
                    stats: { goals: 0, assists: 0, appearances: 0 }
                });
            }

            setIsModalOpen(false);
            resetForm();
            loadPlayers();
        } catch (error) {
            console.error("Error saving player:", error);
            alert("Fehler beim Speichern des Spielers.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setNewPlayer({
            firstName: "",
            lastName: "",
            number: "",
            position: "Sturm",
            status: "Active",
            role: "Regular",
            photoUrl: "",
            fifaStats: {
                pac: 50,
                sho: 50,
                pas: 50,
                dri: 50,
                def: 50,
                phy: 50,
                rating: 50,
            }
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsEditing(false);
        setEditingId(null);
    };

    const handleEditPlayer = (player: Player) => {
        setNewPlayer({
            firstName: player.firstName,
            lastName: player.lastName,
            number: player.number.toString(),
            position: player.position,
            status: player.status,
            role: player.role,
            photoUrl: player.photoUrl,
            fifaStats: player.fifaStats || {
                pac: 50,
                sho: 50,
                pas: 50,
                dri: 50,
                def: 50,
                phy: 50,
                rating: 50,
            }
        });
        setPreviewUrl(player.photoUrl || null);
        setIsEditing(true);
        setEditingId(player._id);
        setIsModalOpen(true);
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

    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";

    const filteredPlayers = players.filter((p: Player) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activePlayers = filteredPlayers.filter((p: Player) => !p.onBench);
    const benchPlayers = filteredPlayers.filter((p: Player) => p.onBench);

    const SquadPlayerCard = ({ player }: { player: Player }) => (
        <div className="relative group">
            <Link href={`/squad/${player._id}`} className="block">
                <FIFACard player={player} />
            </Link>

            {/* Action Buttons Overlay */}
            {isAdmin && (
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                    <button
                        onClick={() => toggleBench(player)}
                        className={cn(
                            "p-3 rounded-2xl transition-all shadow-xl backdrop-blur-md border border-white/20",
                            player.onBench
                                ? "bg-emerald-500/80 text-white hover:bg-emerald-600"
                                : "bg-orange-500/80 text-white hover:bg-orange-600"
                        )}
                        title={player.onBench ? "Auf Feld setzen" : "Auf Bank setzen"}
                    >
                        {player.onBench ? (
                            <ArrowUpFromLine className="w-5 h-5" />
                        ) : (
                            <ArrowDownToLine className="w-5 h-5" />
                        )}
                    </button>
                    <button
                        onClick={() => handleEditPlayer(player)}
                        className="p-3 bg-white/80 backdrop-blur-md border border-white/20 shadow-xl hover:bg-brand hover:text-white rounded-2xl transition-all text-slate-900"
                    >
                        <Pencil className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleDeletePlayer(player._id)}
                        className="p-3 bg-white/80 backdrop-blur-md border border-white/20 shadow-xl hover:bg-red-500 hover:text-white rounded-2xl transition-all text-slate-900"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-slate-900" style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-900">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Image src="/logo_new.png" alt="Logo" width={100} height={25} className="h-8 w-auto object-contain rounded shadow-sm" />
                        <h1 className="text-2xl font-black text-brand tracking-tight">Kaderverwaltung</h1>
                    </div>
                    <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100 shadow-inner">
                        <button
                            onClick={() => setTeam("1. Mannschaft")}
                            className={cn(
                                "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                                team === "1. Mannschaft" ? "bg-brand text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            1. Mannschaft
                        </button>
                        <button
                            onClick={() => setTeam("2. Mannschaft")}
                            className={cn(
                                "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                                team === "2. Mannschaft" ? "bg-brand text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            2. Mannschaft
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-12">
                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Spieler suchen (Name, Position...)"
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-inner font-medium"
                        />
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => { resetForm(); setIsModalOpen(true); }}
                            className="w-full md:w-auto flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-[0.1em] transition-all active:scale-95 shadow-xl shadow-brand/20"
                        >
                            <UserPlus className="w-4 h-4" />
                            Neuer Spieler
                        </button>
                    )}
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-xl shadow-slate-200/40">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Gesamter Kader</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{players.length} Spieler</h3>
                    </div>
                    <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-xl shadow-slate-200/40">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Aktive Spieler</p>
                        <h3 className="text-3xl font-black text-emerald-500 tracking-tight">{activePlayers.length}</h3>
                    </div>
                    <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-xl shadow-slate-200/40">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Auf Bank</p>
                        <h3 className="text-3xl font-black text-orange-500 tracking-tight">{benchPlayers.length}</h3>
                    </div>
                    <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-xl shadow-slate-200/40">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Verfügbarkeit</p>
                        <h3 className="text-3xl font-black text-emerald-500 tracking-tight">Bereit</h3>
                    </div>
                </div>

                {/* Player List */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
                    </div>
                ) : (
                    <>
                        {/* Management Section */}
                        {players.filter((p: Player) => !p.onBench && (p.role === 'Admin' || p.role === 'Trainer')).length > 0 && (
                            <div className="mb-16">
                                <h2 className="text-lg font-black mb-6 flex items-center gap-3 text-brand uppercase tracking-widest">
                                    <Users className="w-5 h-5" />
                                    Trainer & Coaching
                                </h2>
                                <div className="flex flex-wrap justify-center gap-6">
                                    <AnimatePresence mode="popLayout">
                                        {players
                                            .filter((p: Player) => !p.onBench && (p.role === 'Admin' || p.role === 'Trainer'))
                                            .map((player: Player) => (
                                                <SquadPlayerCard key={player._id} player={player} />
                                            ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {/* Team Sections */}
                        {['1. Mannschaft', '2. Mannschaft'].map((teamName) => (
                            <div key={teamName} className="mb-16">
                                <h2 className="text-lg font-black mb-6 flex items-center gap-3 text-slate-800 uppercase tracking-widest">
                                    <Trophy className="w-5 h-5 text-brand" />
                                    {teamName}
                                </h2>
                                <div className="flex flex-wrap justify-center gap-6">
                                    <AnimatePresence mode="popLayout">
                                        {players
                                            .filter((p: Player) => !p.onBench && p.team === teamName && p.role !== 'Admin' && p.role !== 'Trainer')
                                            .sort((a: Player, b: Player) => {
                                                // Position order for football field layout: GK -> DEF -> MID -> FWD
                                                const positionOrder: { [key: string]: number } = {
                                                    'TW': 1, 'GK': 1,
                                                    'LV': 2, 'IV': 2, 'RV': 2, 'LB': 2, 'CB': 2, 'RB': 2, 'DEF': 2,
                                                    'LM': 3, 'ZM': 3, 'RM': 3, 'DM': 3, 'OM': 3, 'ZDM': 3, 'ZOM': 3, 'MID': 3,
                                                    'LS': 4, 'ST': 4, 'RS': 4, 'LF': 4, 'RF': 4, 'MS': 4, 'FWD': 4
                                                };
                                                const orderA = positionOrder[a.position?.toUpperCase()] || 5;
                                                const orderB = positionOrder[b.position?.toUpperCase()] || 5;
                                                if (orderA !== orderB) return orderA - orderB;
                                                // Within same position group, captains first
                                                if (a.role === 'Captain' && b.role !== 'Captain') return -1;
                                                if (a.role !== 'Captain' && b.role === 'Captain') return 1;
                                                return 0;
                                            })
                                            .map((player: Player) => (
                                                <SquadPlayerCard key={player._id} player={player} />
                                            ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}

                        {/* Bench Section */}
                        <div>
                            <button
                                onClick={() => setShowBench(!showBench)}
                                className="w-full flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl mb-8 hover:bg-slate-100 transition-all font-black text-slate-900 shadow-inner"
                            >
                                <h2 className="text-xl font-black flex items-center gap-3">
                                    <Armchair className="w-6 h-6 text-orange-500" />
                                    Wechselbank ({benchPlayers.length})
                                </h2>
                                <span className="text-[10px] uppercase tracking-widest text-slate-400">
                                    {showBench ? "Ausblenden" : "Anzeigen"}
                                </span>
                            </button>

                            <AnimatePresence>
                                {showBench && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                                    >
                                        {benchPlayers.map((player: Player) => (
                                            <SquadPlayerCard key={player._id} player={player} />
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
                            className="relative w-full max-w-lg bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl"
                        >
                            <h2 className="text-3xl font-black mb-8 text-brand tracking-tight">{isEditing ? "Spieler bearbeiten" : `Neuer Spieler (${team})`}</h2>
                            <form onSubmit={handleAddPlayer} className="space-y-6">
                                {/* Photo Upload */}
                                <div className="flex justify-center mb-8">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative w-28 h-28 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-brand/50 transition-all cursor-pointer group flex items-center justify-center overflow-hidden shadow-inner"
                                    >
                                        {previewUrl ? (
                                            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                        ) : (
                                            <div className="text-center group-hover:scale-110 transition-transform">
                                                <Camera className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-brand/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                            <Upload className="w-6 h-6 text-white" />
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

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vorname</label>
                                        <input
                                            required
                                            type="text"
                                            value={newPlayer.firstName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPlayer({ ...newPlayer, firstName: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm font-medium shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nachname</label>
                                        <input
                                            required
                                            type="text"
                                            value={newPlayer.lastName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPlayer({ ...newPlayer, lastName: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm font-medium shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nummer</label>
                                        <input
                                            required
                                            type="number"
                                            value={newPlayer.number}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm font-medium shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Position</label>
                                        <select
                                            value={newPlayer.position}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm font-medium shadow-inner appearance-none cursor-pointer"
                                        >
                                            <option>Torwart</option>
                                            <option>Abwehr</option>
                                            <option>Mittelfeld</option>
                                            <option>Sturm</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                                        <select
                                            value={newPlayer.status}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewPlayer({ ...newPlayer, status: e.target.value as 'Active' | 'Injured' | 'Away' })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm font-medium shadow-inner appearance-none cursor-pointer"
                                        >
                                            <option value="Active">Aktiv</option>
                                            <option value="Injured">Verletzt</option>
                                            <option value="Away">Abwesend</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Rolle</label>
                                        <select
                                            value={newPlayer.role}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewPlayer({ ...newPlayer, role: e.target.value as 'Captain' | 'Regular' | 'Admin' })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm font-medium shadow-inner appearance-none cursor-pointer"
                                        >
                                            <option value="Regular">Normal</option>
                                            <option value="Captain">Kapitän</option>
                                            <option value="Admin">Trainer</option>
                                        </select>
                                    </div>
                                </div>
                                {newPlayer.role !== 'Admin' && (
                                    <div className="p-6 bg-brand/5 rounded-[2rem] border border-brand/10 space-y-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-brand flex items-center justify-between px-2">
                                            FIFA Stats
                                            <span className="text-2xl">{newPlayer.fifaStats.rating} OVR</span>
                                        </h3>

                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { label: "PAC", key: "pac" },
                                                { label: "SHO", key: "sho" },
                                                { label: "PAS", key: "pas" },
                                                { label: "DRI", key: "dri" },
                                                { label: "DEF", key: "def" },
                                                { label: "PHY", key: "phy" },
                                            ].map((s) => (
                                                <div key={s.key} className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{s.label}</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="99"
                                                        value={newPlayer.fifaStats[s.key as keyof typeof newPlayer.fifaStats]}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            const newVal = parseInt(e.target.value) || 0;
                                                            const newFifaStats = { ...newPlayer.fifaStats, [s.key]: newVal };
                                                            const sum = newFifaStats.pac + newFifaStats.sho + newFifaStats.pas + newFifaStats.dri + newFifaStats.def + newFifaStats.phy;
                                                            newFifaStats.rating = Math.round(sum / 6);
                                                            setNewPlayer({ ...newPlayer, fifaStats: newFifaStats });
                                                        }}
                                                        className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:border-brand/30 transition-all text-xs font-black shadow-inner"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
