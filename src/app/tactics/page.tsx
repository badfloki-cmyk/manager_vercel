"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Save,
    RotateCcw,
    LayoutDashboard,
    Plus,
    Pencil,
    Eraser,
    Trash2,
    Download,
    X,
    Check,
    ChevronRight,
    Search
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPlayers, Player } from "@/lib/squad";
import { getTactics, createTactic, deleteTactic, TacticData } from "@/lib/tactics";
import { useSession } from "next-auth/react";

type GameMode = "football" | "futsal";

interface PlayerPos {
    id: string;
    name: string;
    number: number;
    x: number;
    y: number;
    color: string;
    photoUrl?: string;
}

interface Path {
    id: number;
    points: { x: number; y: number }[];
    color: string;
    width: number;
}

export default function TacticsPage() {
    // Mode & State
    const [mode, setMode] = useState<GameMode>("futsal");
    const [playersOnPitch, setPlayersOnPitch] = useState<PlayerPos[]>([]);
    const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
    const [savedTactics, setSavedTactics] = useState<TacticData[]>([]);

    // UI State
    const [isSaving, setIsSaving] = useState(false);
    const [isDrawMode, setIsDrawMode] = useState(false);
    const [tacticName, setTacticName] = useState("");
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [teamFilter, setTeamFilter] = useState<"All" | "1. Mannschaft" | "2. Mannschaft">("All");

    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";

    // Drawing Logic
    const [paths, setPaths] = useState<Path[]>([]);
    const [currentPath, setCurrentPath] = useState<Path | null>(null);
    const [drawColor, setDrawColor] = useState("#d4006d"); // KGS Pink

    const constraintsRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Initial Load
    useEffect(() => {
        const init = async () => {
            try {
                const { players } = await getPlayers();
                setAvailablePlayers(players || []);
                const { tactics } = await getTactics();
                setSavedTactics(tactics || []);
            } catch (err) {
                console.error("Init error:", err);
            }
        };
        init();
    }, []);

    // Drawing Handlers
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawMode || !svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

        setCurrentPath({
            id: Date.now(),
            points: [{ x, y }],
            color: drawColor,
            width: 3
        });
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!currentPath || !svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

        setCurrentPath(prev => ({
            ...prev!,
            points: [...prev!.points, { x, y }]
        }));
    };

    const stopDrawing = () => {
        if (currentPath) {
            setPaths(prev => [...prev, currentPath]);
            setCurrentPath(null);
        }
    };

    // Tactic Actions
    const handleSaveTactic = async () => {
        if (!tacticName) return;
        setIsSaving(true);
        try {
            const data: TacticData = {
                name: tacticName,
                mode,
                formation: "Custom",
                players: playersOnPitch,
                drawingData: JSON.stringify(paths)
            };
            await createTactic(data);
            const { tactics } = await getTactics();
            setSavedTactics(tactics);
            setShowSaveModal(false);
            setTacticName("");
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const loadTactic = (tactic: TacticData) => {
        setMode(tactic.mode);
        setPlayersOnPitch(tactic.players);
        setPaths(tactic.drawingData ? JSON.parse(tactic.drawingData) : []);
        setShowLoadModal(false);
    };

    const deleteSavedTactic = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Taktik wirklich löschen?")) return;
        try {
            await deleteTactic(id);
            setSavedTactics(prev => prev.filter(t => t._id !== id));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const addPlayerToPitch = (player: Player) => {
        if (playersOnPitch.find(p => p.id === player._id)) return;

        const newPlayer: PlayerPos = {
            id: player._id,
            name: `${player.firstName} ${player.lastName[0]}.`,
            number: player.number,
            x: 50,
            y: 50,
            color: player.position === "Torwart" ? "bg-yellow-500" : "bg-brand",
            photoUrl: player.photoUrl
        };
        setPlayersOnPitch(prev => [...prev, newPlayer]);
    };

    const removePlayerFromPitch = (id: string) => {
        setPlayersOnPitch(prev => prev.filter(p => p.id !== id));
    };

    const resetPitch = () => {
        if (confirm("Spielfeld wirklich leeren?")) {
            setPlayersOnPitch([]);
            setPaths([]);
        }
    };

    const filteredAvailable = availablePlayers.filter(p =>
        !playersOnPitch.find(pitchP => pitchP.id === p._id) &&
        (teamFilter === "All" || p.team === teamFilter) &&
        (p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md flex-shrink-0">
                <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-900">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Image src="/logo_new.png" alt="Logo" width={100} height={25} className="h-8 w-auto object-contain rounded shadow-sm" />
                        <h1 className="text-xl font-black text-brand tracking-tight">
                            Taktik-Board
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100 mr-2 shadow-inner">
                            <button
                                onClick={() => setMode("futsal")}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all",
                                    mode === "futsal" ? "bg-brand text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                Futsal
                            </button>
                            <button
                                onClick={() => setMode("football")}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all",
                                    mode === "football" ? "bg-brand text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                Fußball
                            </button>
                        </div>

                        <button
                            onClick={() => setShowLoadModal(true)}
                            className="p-2 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-slate-400 hover:text-brand"
                            title="Taktik laden"
                        >
                            <Download className="w-4 h-4" />
                        </button>

                        {isAdmin && (
                            <button
                                onClick={() => setShowSaveModal(true)}
                                className="px-6 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-brand/20"
                            >
                                <Save className="w-4 h-4" />
                                Speichern
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Players */}
                <aside className="w-72 border-r border-slate-100 bg-slate-50 flex flex-col hidden lg:flex">
                    <div className="p-6 border-b border-slate-100">
                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Spieler suchen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand/30 shadow-inner font-medium placeholder:text-slate-300"
                            />
                        </div>
                        <div className="flex bg-white rounded-xl p-1 border border-slate-100 shadow-inner">
                            {(["All", "1. Mannschaft", "2. Mannschaft"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTeamFilter(t)}
                                    className={cn(
                                        "flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                        teamFilter === t ? "bg-brand text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {t === "All" ? "Alle" : t === "1. Mannschaft" ? "1.M" : "2.M"}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Kader</h3>
                        {filteredAvailable.map(player => (
                            <button
                                key={player._id}
                                onClick={() => addPlayerToPitch(player)}
                                className="w-full group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:shadow-lg hover:shadow-brand/5 hover:border-brand/20 transition-all text-left shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white",
                                        player.position === "Torwart" ? "bg-yellow-500" : "bg-brand"
                                    )}>
                                        {player.number}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 truncate max-w-[120px] tracking-tight">{player.firstName} {player.lastName}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{player.position}</p>
                                    </div>
                                </div>
                                <Plus className="w-4 h-4 text-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Center: Pitch */}
                <div className="flex-1 relative flex flex-col items-center justify-center p-4 lg:p-8 bg-slate-100/30">
                    <div
                        className="absolute mb-4 top-8 flex gap-2 z-50 bg-white/90 backdrop-blur border border-slate-100 p-2.5 rounded-[2rem] shadow-2xl shadow-slate-200"
                    >
                        <button
                            onClick={() => setIsDrawMode(false)}
                            className={cn(
                                "p-3 rounded-2xl transition-all",
                                !isDrawMode ? "bg-brand text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                            )}
                            title="Bewegen"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => setIsDrawMode(true)}
                                className={cn(
                                    "p-3 rounded-2xl transition-all",
                                    isDrawMode ? "bg-brand text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                                )}
                                title="Zeichnen"
                            >
                                <Pencil className="w-5 h-5" />
                            </button>
                        )}
                        <div className="w-px bg-slate-100 mx-2" />
                        {/* Only admins clear drawings/pitch */}
                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => setPaths([])}
                                    className="p-3 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all hover:text-brand"
                                    title="Zeichnungen löschen"
                                >
                                    <Eraser className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={resetPitch}
                                    className="p-3 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all hover:text-brand"
                                    title="Alles leeren"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>

                    <div
                        ref={constraintsRef}
                        className={cn(
                            "relative bg-emerald-900 rounded-[3rem] border-[16px] border-white/20 overflow-hidden shadow-2xl shadow-slate-900/20",
                            mode === "futsal" ? "aspect-[2/3] h-full" : "aspect-[3/4] h-full"
                        )}
                        style={{
                            backgroundImage: `
                                linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                            `,
                            backgroundSize: '24px 24px'
                        }}
                    >
                        {/* Static Markings (SVG for better control) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
                            <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="0.5" />
                            <circle cx="50" cy="50" r="0.8" fill="white" />
                            {/* Penalty boxes */}
                            <rect x="25" y="0" width="50" height="15" fill="none" stroke="white" strokeWidth="0.5" />
                            <rect x="25" y="85" width="50" height="15" fill="none" stroke="white" strokeWidth="0.5" />
                        </svg>

                        {/* Drawing Layer */}
                        <svg
                            ref={svgRef}
                            className={cn(
                                "absolute inset-0 w-full h-full z-20 transition-all cursor-crosshair",
                                !isDrawMode && "pointer-events-none cursor-default"
                            )}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        >
                            <AnimatePresence>
                                {paths.map(path => (
                                    <motion.path
                                        key={path.id}
                                        d={`M ${path.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
                                        fill="none"
                                        stroke={path.color}
                                        strokeWidth={path.width}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                    />
                                ))}
                                {currentPath && (
                                    <path
                                        d={`M ${currentPath.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
                                        fill="none"
                                        stroke={currentPath.color}
                                        strokeWidth={currentPath.width}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                )}
                            </AnimatePresence>
                        </svg>

                        {/* Players */}
                        <AnimatePresence>
                            {playersOnPitch.map((player) => (
                                <motion.div
                                    key={player.id}
                                    drag={!isDrawMode}
                                    dragConstraints={constraintsRef}
                                    dragElastic={0}
                                    dragMomentum={false}
                                    initial={{ left: `${player.x}%`, top: `${player.y}%` }}
                                    className={cn(
                                        "absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 border-white flex flex-col items-center justify-center shadow-xl select-none z-30 transition-transform overflow-visible group",
                                        !isDrawMode ? "cursor-grab active:cursor-grabbing hover:scale-110" : "cursor-default",
                                        player.color
                                    )}
                                    onDragEnd={(_, info) => {
                                        const rect = constraintsRef.current!.getBoundingClientRect();
                                        const x = ((info.point.x - rect.left) / rect.width) * 100;
                                        const y = ((info.point.y - rect.top) / rect.height) * 100;
                                        setPlayersOnPitch(prev => prev.map(p =>
                                            p.id === player.id ? { ...p, x, y } : p
                                        ));
                                    }}
                                >
                                    {player.photoUrl ? (
                                        <div className="w-full h-full rounded-full overflow-hidden relative">
                                            <Image
                                                src={player.photoUrl}
                                                alt={player.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-[10px] font-black leading-none">{player.number}</span>
                                            <span className="text-[8px] font-bold truncate max-w-[40px] leading-tight">{player.name}</span>
                                        </>
                                    )}

                                    <div className="absolute top-14 whitespace-nowrap bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-bold text-white border border-white/20">
                                        {player.name}
                                    </div>

                                    {/* Delete indicator */}
                                    <button
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removePlayerFromPitch(player.id);
                                        }}
                                        className="absolute -top-3 -right-3 w-8 h-8 bg-brand border-2 border-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-[100] shadow-xl hover:scale-110 active:scale-95"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Sidebar: Colors & Tactic Info / List */}
                <aside className="w-80 border-l border-slate-100 bg-slate-50 flex flex-col hidden xl:flex">
                    {/* Tactics List for non-admins or admins who want to see it */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Gespeicherte Taktiken
                            </h3>
                            <button
                                onClick={() => setShowLoadModal(true)}
                                className="text-brand hover:text-brand-dark transition-colors"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {savedTactics.map(t => (
                                <div
                                    key={t._id}
                                    onClick={() => loadTactic(t)}
                                    className="group relative bg-white border border-slate-100 rounded-2xl p-4 cursor-pointer hover:shadow-lg hover:shadow-brand/5 hover:border-brand/20 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={cn(
                                            "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wide",
                                            t.mode === "futsal" ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500"
                                        )}>
                                            {t.mode === "futsal" ? "Futsal" : "11v11"}
                                        </span>
                                        {isAdmin && (
                                            <button
                                                onClick={(e) => deleteSavedTactic(t._id!, e)}
                                                className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">{t.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {new Date(t.createdAt!).toLocaleDateString('de-DE')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 border-t border-slate-100 bg-white">
                        {isDrawMode && isAdmin && (
                            <div className="space-y-4 mb-8">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Farbe wählen</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#ffffff", "#000000"].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setDrawColor(c)}
                                            className={cn(
                                                "w-full aspect-square rounded-xl border-4 transition-all shadow-sm",
                                                drawColor === c ? "border-brand scale-110 shadow-lg" : "border-white"
                                            )}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Team Info</h3>
                            <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auf Feld</span>
                                    <span className="text-xl font-black text-brand tracking-tight">{playersOnPitch.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Torhüter</span>
                                    <span className="text-xl font-black text-yellow-500 tracking-tight">
                                        {playersOnPitch.filter(p => p.color === "bg-yellow-500").length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50">
                        <p className="text-[10px] text-slate-400 leading-relaxed italic font-medium">
                            {isAdmin
                                ? "💡 Tipp: Zeichne Laufwege, speichere Formationen und verwalte Taktiken."
                                : "💡 Info: Du kannst Taktiken ansehen und laden, aber nicht bearbeiten."}
                        </p>
                    </div>
                </aside>
            </main >

            {/* Modals */}
            <AnimatePresence>
                {
                    showSaveModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowSaveModal(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-md bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-3xl font-black text-brand tracking-tight">Taktik speichern</h2>
                                    <button onClick={() => setShowSaveModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Taktik-Name</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={tacticName}
                                            onChange={(e) => setTacticName(e.target.value)}
                                            placeholder="z.B. Power-Play corner"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm font-medium shadow-inner"
                                        />
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-[10px] text-slate-400 font-black uppercase tracking-widest space-y-2 shadow-inner">
                                        <p className="flex justify-between"><span>Modus</span> <span className="text-slate-900">{mode === "futsal" ? "Futsal" : "Fußball"}</span></p>
                                        <p className="flex justify-between"><span>Spieler</span> <span className="text-slate-900">{playersOnPitch.length}</span></p>
                                        <p className="flex justify-between"><span>Zeichnungen</span> <span className="text-slate-900">{paths.length > 0 ? "Ja" : "Nein"}</span></p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            disabled={isSaving || !tacticName}
                                            onClick={handleSaveTactic}
                                            className="flex-1 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand/20 active:scale-95"
                                        >
                                            {isSaving ? "Speichert..." : <><Check className="w-5 h-5" /> Speichern</>}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }

                {
                    showLoadModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowLoadModal(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-xl bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl max-h-[80vh] flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-8 flex-shrink-0">
                                    <h2 className="text-3xl font-black text-brand tracking-tight">Alle Taktiken</h2>
                                    <button onClick={() => setShowLoadModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                    {savedTactics.length === 0 ? (
                                        <div className="text-center py-16 text-slate-300">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                                <Download className="w-8 h-8" />
                                            </div>
                                            <p className="font-black uppercase text-[10px] tracking-widest">Noch keine Taktiken gespeichert.</p>
                                        </div>
                                    ) : (
                                        savedTactics.map(t => (
                                            <div
                                                key={t._id}
                                                onClick={() => loadTactic(t)}
                                                className="group flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 cursor-pointer transition-all shadow-sm"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-[10px] p-2 text-center shadow-inner uppercase tracking-tighter",
                                                        t.mode === "futsal" ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500"
                                                    )}>
                                                        {t.mode === "futsal" ? "Futsal" : "11v11"}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-slate-900 text-lg tracking-tight">{t.name}</h3>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                            {t.players.length} Spieler • {new Date(t.createdAt!).toLocaleDateString('de-DE')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={(e) => deleteSavedTactic(t._id!, e)}
                                                        className="p-3 bg-white border border-slate-100 shadow-sm hover:bg-brand hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-brand transition-colors" />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
            `}</style>
        </div >
    );
}
