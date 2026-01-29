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
        if (rating >= 85) return {
            bg: "from-[#d4006d] via-[#a00052] to-[#1e1b4b]",
            text: "text-white",
            accent: "bg-white/20",
            border: "bg-white/40"
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
            className={cn("relative w-64 h-[380px] drop-shadow-2xl", className)}
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

                        {/* Header: Rating & Position */}
                        <div className={cn(
                            "absolute left-4 top-10 flex flex-col items-center gap-0 z-20 font-black",
                            theme.text
                        )}>
                            <span className="text-5xl tracking-tighter leading-none">{stats.rating}</span>
                            <span className="text-lg uppercase tracking-tight opacity-70 border-t border-current w-full mt-1 pt-1">
                                {player.position.substring(0, 3)}
                            </span>
                        </div>

                        {/* Player Photo Container */}
                        <div className="absolute right-[-10px] top-6 w-48 h-64 z-10">
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
                        <div className="mt-[180px] relative z-20">
                            <h3 className={cn(
                                "text-3xl font-black uppercase tracking-tighter truncate italic drop-shadow-sm",
                                theme.text
                            )}>
                                {player.lastName}
                            </h3>
                        </div>

                        {/* Divider */}
                        <div className={cn("h-[2px] w-4/5 mx-auto my-2 opacity-20", theme.text.includes("white") ? "bg-white" : "bg-black")} />

                        {/* Stats Grid */}
                        <div className={cn(
                            "grid grid-cols-2 gap-x-8 gap-y-1 px-4 text-xs font-black mb-4",
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
                            <div className="flex flex-col items-start gap-0.5 border-l border-current/10 pl-4">
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

                        {/* Bottom Section */}
                        <div className="mt-auto pb-6 flex flex-col items-center opacity-60">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn("text-[10px] font-black tracking-widest uppercase", theme.text)}>E.R.S. Team</span>
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
