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
import { cn } from "@/lib/utils";
import { getPlayers, Player } from "@/lib/squad";
import { getTactics, createTactic, deleteTactic, TacticData } from "@/lib/tactics";

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
        (p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex-shrink-0">
                <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold flex items-center gap-3">
                            <LayoutDashboard className="w-5 h-5 text-brand" />
                            Taktik-Board
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 mr-2">
                            <button
                                onClick={() => setMode("futsal")}
                                className={cn(
                                    "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                    mode === "futsal" ? "bg-brand-dark text-white" : "text-slate-400 hover:text-white"
                                )}
                            >
                                Futsal
                            </button>
                            <button
                                onClick={() => setMode("football")}
                                className={cn(
                                    "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                    mode === "football" ? "bg-brand-dark text-white" : "text-slate-400 hover:text-white"
                                )}
                            >
                                Fußball
                            </button>
                        </div>

                        <button
                            onClick={() => setShowLoadModal(true)}
                            className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Taktik laden"
                        >
                            <Download className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => setShowSaveModal(true)}
                            className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Speichern
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Players */}
                <aside className="w-72 border-r border-slate-800 bg-slate-950/50 flex flex-col hidden lg:flex">
                    <div className="p-4 border-b border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Spieler suchen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-red-500/50 shadow-inner"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Kader</h3>
                        {filteredAvailable.map(player => (
                            <button
                                key={player._id}
                                onClick={() => addPlayerToPitch(player)}
                                className="w-full group flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800 rounded-xl hover:bg-slate-800/60 hover:border-brand/30 transition-all text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white",
                                        player.position === "Torwart" ? "bg-yellow-600" : "bg-slate-700"
                                    )}>
                                        {player.number}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold truncate max-w-[120px]">{player.firstName} {player.lastName}</p>
                                        <p className="text-[10px] text-slate-500">{player.position}</p>
                                    </div>
                                </div>
                                <Plus className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Center: Pitch */}
                <div className="flex-1 relative flex flex-col items-center justify-center p-4 lg:p-8 bg-slate-900/20">
                    <div
                        className="absolute mb-4 top-4 flex gap-2 z-50 bg-slate-950/80 backdrop-blur border border-slate-800 p-2 rounded-2xl shadow-2xl"
                    >
                        <button
                            onClick={() => setIsDrawMode(false)}
                            className={cn(
                                "p-2.5 rounded-xl transition-all",
                                !isDrawMode ? "bg-brand text-white shadow-lg" : "text-slate-400 hover:bg-slate-800"
                            )}
                            title="Bewegen"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsDrawMode(true)}
                            className={cn(
                                "p-2.5 rounded-xl transition-all",
                                isDrawMode ? "bg-brand text-white shadow-lg" : "text-slate-400 hover:bg-slate-800"
                            )}
                            title="Zeichnen"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                        <div className="w-px bg-slate-800 mx-1" />
                        <button
                            onClick={() => setPaths([])}
                            className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-800 transition-all"
                            title="Zeichnungen löschen"
                        >
                            <Eraser className="w-5 h-5" />
                        </button>
                        <button
                            onClick={resetPitch}
                            className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-800 transition-all"
                            title="Alles leeren"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>

                    <div
                        ref={constraintsRef}
                        className={cn(
                            "relative bg-[#14532d] rounded-3xl border-[12px] border-white/10 overflow-hidden shadow-2xl",
                            mode === "futsal" ? "aspect-[2/3] h-full" : "aspect-[3/4] h-full"
                        )}
                        style={{
                            backgroundImage: `
                                linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                            `,
                            backgroundSize: '20px 20px'
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
                                        "absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 border-white flex flex-col items-center justify-center shadow-xl select-none z-30 transition-transform overflow-visible",
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
                                        <div className="w-full h-full rounded-full overflow-hidden">
                                            <img
                                                src={player.photoUrl}
                                                alt={player.name}
                                                className="w-full h-full object-cover"
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
                                    {!isDrawMode && (
                                        <button
                                            onClick={() => removePlayerFromPitch(player.id)}
                                            className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-2.5 h-2.5 text-white" />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Sidebar: Colors & Tactic Info */}
                <aside className="w-64 border-l border-slate-800 bg-slate-950/50 p-6 space-y-8 hidden xl:block">
                    {isDrawMode && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Farbe wählen</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#ffffff", "#000000"].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setDrawColor(c)}
                                        className={cn(
                                            "w-full aspect-square rounded-lg border-2 transition-all",
                                            drawColor === c ? "border-white scale-110 shadow-lg" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Info</h3>
                        <div className="space-y-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Auf Feld</span>
                                <span className="text-sm font-bold text-red-500">{playersOnPitch.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Torhüter</span>
                                <span className="text-sm font-bold text-yellow-500">
                                    {playersOnPitch.filter(p => p.color === "bg-yellow-500").length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <p className="text-[10px] text-slate-600 leading-relaxed italic">
                            💡 Tipp: Ziehe Spieler aus der linken Liste aufs Feld. Aktiviere das Stift-Tool für Laufwege.
                        </p>
                    </div>
                </aside>
            </main>

            {/* Modals */}
            <AnimatePresence>
                {showSaveModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSaveModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Taktik speichern</h2>
                                <button onClick={() => setShowSaveModal(false)} className="p-2 hover:bg-slate-800 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Taktik-Name</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={tacticName}
                                        onChange={(e) => setTacticName(e.target.value)}
                                        placeholder="z.B. Power-Play corner"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50"
                                    />
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 text-[10px] text-slate-500 space-y-1">
                                    <p>● Modus: {mode === "futsal" ? "Futsal" : "Fußball"}</p>
                                    <p>● Spieler: {playersOnPitch.length}</p>
                                    <p>● Zeichnungen: {paths.length > 0 ? "Ja" : "Nein"}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        disabled={isSaving || !tacticName}
                                        onClick={handleSaveTactic}
                                        className="flex-1 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? "Speichert..." : <><Check className="w-4 h-4" /> Speichern</>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {showLoadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLoadModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl max-h-[80vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                                <h2 className="text-2xl font-bold">Gespeicherte Taktiken</h2>
                                <button onClick={() => setShowLoadModal(false)} className="p-2 hover:bg-slate-800 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {savedTactics.length === 0 ? (
                                    <div className="text-center py-10 text-slate-600">
                                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Download className="w-6 h-6" />
                                        </div>
                                        <p>Noch keine Taktiken gespeichert.</p>
                                    </div>
                                ) : (
                                    savedTactics.map(t => (
                                        <div
                                            key={t._id}
                                            onClick={() => loadTactic(t)}
                                            className="group flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl hover:bg-slate-800/30 hover:border-brand/30 cursor-pointer transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs p-2 text-center",
                                                    t.mode === "futsal" ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                                                )}>
                                                    {t.mode === "futsal" ? "Futsal" : "11v11"}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm">{t.name}</h3>
                                                    <p className="text-[10px] text-slate-500">
                                                        {t.players.length} Spieler • {new Date(t.createdAt!).toLocaleDateString('de-DE')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => deleteSavedTactic(t._id!, e)}
                                                    className="p-2 hover:bg-brand/10 hover:text-brand rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <ChevronRight className="w-5 h-5 text-slate-700" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
        </div>
    );
}
