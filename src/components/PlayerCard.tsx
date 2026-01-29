"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface PlayerCardProps {
    player: {
        firstName: string;
        lastName: string;
        number: number;
        position: string;
        role?: 'Captain' | 'Regular' | 'Admin' | 'Trainer';
        photoUrl?: string;
        fifaStats?: {
            pac: number;
            sho: number;
            pas: number;
            dri: number;
            def: number;
            phy: number;
            rating: number;
        };
    };
    className?: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, className }) => {
    const stats = player.fifaStats || {
        pac: 50,
        sho: 50,
        pas: 50,
        dri: 50,
        def: 50,
        phy: 50,
        rating: 50,
    };

    const getThemeColors = (rating: number) => {
        if (rating >= 85 || player.role === 'Admin') return {
            bg: player.role === 'Admin' ? "from-[#1a1a1a] via-[#2a2a2a] to-[#000000]" : "from-[#d4006d] via-[#a00052] to-[#1e1b4b]",
            text: "text-white",
            accent: "bg-white/20",
            border: player.role === 'Admin' ? "bg-brand/60" : "bg-white/40"
        };
        if (rating >= 75) return {
            bg: "from-[#1e1b4b] via-[#312e81] to-[#4338ca]",
            text: "text-white",
            accent: "bg-white/10",
            border: "bg-white/30"
        };
        return {
            bg: "from-white via-slate-50 to-slate-200",
            text: "text-[#1e1b4b]",
            accent: "bg-[#d4006d]/10",
            border: "bg-[#d4006d]/40"
        };
    };

    const theme = getThemeColors(stats.rating);
    const shieldPath = "polygon(10% 0, 90% 0, 100% 15%, 100% 88%, 50% 100%, 0 88%, 0 15%)";

    return (
        <motion.div
            whileHover={{
                scale: 1.05,
                rotateY: 10,
                transition: { duration: 0.4, ease: "easeOut" }
            }}
            className={cn("relative w-52 h-[310px] drop-shadow-2xl", className)}
        >
            {/* Outer "Border" Card */}
            <div
                style={{ clipPath: shieldPath }}
                className={cn("absolute inset-0 p-[2px]", theme.border)}
            >
                {/* Inner Content Card */}
                <div
                    style={{ clipPath: shieldPath }}
                    className={cn(
                        "relative h-full w-full overflow-hidden bg-gradient-to-br",
                        theme.bg
                    )}
                >
                    {/* Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none mix-blend-overlay" />

                    {/* Radial Shine */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.2)_0%,transparent_70%)] pointer-events-none" />

                    {/* Content Container */}
                    <div className="relative h-full flex flex-col pt-12 px-4 text-center">
                        {/* Captain / Trainer Badge */}
                        {player.role === 'Captain' && (
                            <div className="absolute top-6 right-6 z-30 transform rotate-12">
                                <div className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded shadow-lg border border-black/10">
                                    CAPTAIN
                                </div>
                            </div>
                        )}
                        {player.role === 'Admin' && (
                            <div className="absolute top-6 right-6 z-30 transform rotate-12">
                                <div className="bg-brand text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg border border-white/20">
                                    TRAINER
                                </div>
                            </div>
                        )}

                        {/* Header: Rating & Position */}
                        <div className={cn(
                            "absolute left-4 top-8 flex flex-col items-center gap-0 z-20 font-black",
                            theme.text
                        )}>
                            <span className="text-3xl tracking-tighter leading-none">{stats.rating}</span>
                            <span className="text-sm uppercase tracking-tight opacity-70 border-t border-current w-full mt-1 pt-1">
                                {player.position.substring(0, 3)}
                            </span>
                        </div>

                        {/* Player Photo Container */}
                        <div className="absolute right-[-5px] top-4 w-36 h-48 z-10">
                            <div
                                className="relative w-full h-full"
                                style={{
                                    WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 95%)",
                                    maskImage: "radial-gradient(ellipse at center, black 40%, transparent 95%)"
                                }}
                            >
                                {player.photoUrl ? (
                                    <Image
                                        src={player.photoUrl}
                                        alt={player.lastName}
                                        fill
                                        className="object-cover object-top drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)] contrast-[1.05] saturate-[1.1]"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-20">
                                        <Users className="w-24 h-24" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name Plate */}
                        <div className="mt-[135px] relative z-20">
                            <h3 className={cn(
                                "text-xl font-black uppercase tracking-tighter truncate italic drop-shadow-sm",
                                theme.text
                            )}>
                                {player.lastName}
                            </h3>
                        </div>

                        {/* Divider */}
                        <div className={cn("h-[1px] w-4/5 mx-auto my-1.5 opacity-20", player.role === 'Admin' ? 'bg-brand' : (theme.text.includes("white") ? "bg-white" : "bg-black"))} />


                        {/* Stats Grid - Hidden for Admins */}
                        {player.role !== 'Admin' ? (
                            <div className={cn(
                                "grid grid-cols-2 gap-x-4 gap-y-0.5 px-3 text-[10px] font-black mb-2",
                                theme.text
                            )}>
                                <div className="flex flex-col items-start gap-0.5">
                                    <div className="flex justify-between w-full">
                                        <span className="opacity-60">PAC</span>
                                        <span>{stats.pac}</span>
                                    </div>
                                    <div className="flex justify-between w-full">
                                        <span className="opacity-60">SHO</span>
                                        <span>{stats.sho}</span>
                                    </div>
                                    <div className="flex justify-between w-full">
                                        <span className="opacity-60">PAS</span>
                                        <span>{stats.pas}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start gap-0.5 border-l border-current/10 pl-3">
                                    <div className="flex justify-between w-full">
                                        <span className="opacity-60">DRI</span>
                                        <span>{stats.dri}</span>
                                    </div>
                                    <div className="flex justify-between w-full">
                                        <span className="opacity-60">DEF</span>
                                        <span>{stats.def}</span>
                                    </div>
                                    <div className="flex justify-between w-full">
                                        <span className="opacity-60">PHY</span>
                                        <span>{stats.phy}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-12 flex items-center justify-center">
                                <span className={cn("text-[10px] font-black uppercase tracking-widest opacity-40", theme.text)}>
                                    Coach / Staff
                                </span>
                            </div>
                        )}

                        {/* Bottom Section */}
                        <div className="mt-auto pb-6 flex flex-col items-center opacity-60">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn("text-[8px] font-black tracking-widest uppercase", theme.text)}>
                                    {player.role === 'Admin' ? 'Trainer' : 'E.R.S. Team'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Reflection Shine Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 pointer-events-none" />
                </div>
            </div>
        </motion.div>
    );
};
