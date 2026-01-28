"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Shield,
    Calendar,
    Activity,
    Target,
    Footprints,
    Plus,
    Trash2,
    Shirt,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPlayers, updatePlayer, Player } from "@/lib/squad";

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const isAdmin = session?.user?.role === "admin";

    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                const { players } = await getPlayers();
                const found = players.find((p: Player) => p._id === id);
                if (found) {
                    setPlayer(found);
                } else {
                    router.push("/squad");
                }
            } catch (error) {
                console.error("Failed to fetch player:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayer();
    }, [id, router]);

    const handleAddNote = async () => {
        if (!newNote.trim() || !player) return;
        setIsSavingNote(true);
        try {
            const updatedNotes = [...(player.notes || []), newNote];
            await updatePlayer(player._id, { notes: updatedNotes });
            setPlayer({ ...player, notes: updatedNotes });
            setNewNote("");
        } catch (error) {
            console.error("Failed to add note", error);
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleDeleteNote = async (index: number) => {
        if (!player || !confirm("Notiz wirklich löschen?")) return;
        try {
            const updatedNotes = player.notes?.filter((_, i) => i !== index);
            await updatePlayer(player._id, { notes: updatedNotes });
            setPlayer({ ...player, notes: updatedNotes });
        } catch (error) {
            console.error("Failed to delete note", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            </div>
        );
    }

    if (!player) return null;

    return (
        <div className="min-h-screen bg-white text-slate-900 pb-20">
            {/* Header Image / Pattern */}
            <div className="h-48 md:h-64 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(212,0,109,0.3),transparent)]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

                <div className="absolute top-6 left-6 z-10">
                    <Link
                        href="/squad"
                        className="bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all flex items-center gap-2 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-10">
                {/* Profile Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 mb-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar */}
                        <div className="relative">
                            <div className={cn(
                                "w-32 h-32 md:w-40 md:h-40 rounded-[2rem] flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-white",
                                player.position === "Torwart" ? "bg-yellow-500 shadow-yellow-500/20" : "bg-brand shadow-brand/20"
                            )}>
                                {player.photoUrl ? (
                                    <Image
                                        src={player.photoUrl}
                                        alt={player.lastName}
                                        fill
                                        className="object-cover rounded-[1.8rem]"
                                    />
                                ) : (
                                    <span>{player.number}</span>
                                )}
                            </div>
                            <div className="absolute -bottom-3 -right-3 bg-white px-3 py-1 rounded-full shadow-lg border border-slate-100 flex items-center gap-1.5">
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    player.status === "Active" ? "bg-green-500" :
                                        player.status === "Injured" ? "bg-red-500" : "bg-yellow-500"
                                )} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{player.status}</span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 pt-2">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-2">
                                        {player.firstName} <br /> {player.lastName}
                                    </h1>
                                    <div className="flex items-center gap-3 text-slate-500 font-medium">
                                        <span className="flex items-center gap-1 text-sm bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                            <Shirt className="w-4 h-4" />
                                            {player.position}
                                        </span>
                                        <span className="flex items-center gap-1 text-sm bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                            <Shield className="w-4 h-4" />
                                            {player.team}
                                        </span>
                                        {player.role === "Captain" && (
                                            <span className="flex items-center gap-1 text-sm bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full border border-yellow-100 font-bold uppercase tracking-wide">
                                                Captain
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Trikotnummer</div>
                                    <div className="text-5xl font-black text-slate-200">#{player.number}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <Target className="w-6 h-6 text-brand mb-2" />
                        <div className="text-3xl font-black text-slate-900">{player.stats?.goals || 0}</div>
                        <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Tore</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <Activity className="w-6 h-6 text-blue-500 mb-2" />
                        <div className="text-3xl font-black text-slate-900">{player.stats?.assists || 0}</div>
                        <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Vorlagen</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <Footprints className="w-6 h-6 text-slate-500 mb-2" />
                        <div className="text-3xl font-black text-slate-900">{player.stats?.appearances || 0}</div>
                        <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Spiele</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <Calendar className="w-6 h-6 text-green-500 mb-2" />
                        <div className="text-3xl font-black text-slate-900">
                            {Math.round(((player.stats?.goals || 0) + (player.stats?.assists || 0)) / Math.max(1, player.stats?.appearances || 1) * 10) / 10}
                        </div>
                        <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Score / Spiel</div>
                    </div>
                </div>

                {/* Admin Notes */}
                {isAdmin && (
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Admin Notizen</h2>
                                <p className="text-sm text-slate-400">Interne Anmerkungen, Verletzungen oder Beobachtungen.</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            {(player.notes && player.notes.length > 0) ? (
                                player.notes.map((note, idx) => (
                                    <div key={idx} className="group flex items-start justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-sm font-medium text-slate-600 leading-relaxed">{note}</p>
                                        <button
                                            onClick={() => handleDeleteNote(idx)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-sm font-medium bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    Noch keine Notizen vorhanden.
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 items-start">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Neue Notiz hinzufügen..."
                                className="flex-1 bg-slate-50 border-0 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand/20 resize-none min-h-[80px]"
                            />
                            <button
                                onClick={handleAddNote}
                                disabled={!newNote.trim() || isSavingNote}
                                className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-brand transition-colors disabled:opacity-50 disabled:hover:bg-slate-900"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
