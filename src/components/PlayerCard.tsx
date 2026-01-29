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
            bg: "from-[#FBF2C4] via-[#F6D242] to-[#D4AF37]",
            border: "border-[#D4AF37]",
            text: "text-[#4D3F1E]",
            accent: "bg-[#4D3F1E]/10"
        };
        if (rating >= 75) return {
            bg: "from-[#F3F4F6] via-[#D1D5DB] to-[#9CA3AF]",
            border: "border-[#9CA3AF]",
            text: "text-[#1F2937]",
            accent: "bg-[#1F2937]/10"
        };
        return {
            bg: "from-[#E3A678] via-[#CD7F32] to-[#8B4513]",
            border: "border-[#8B4513]",
            text: "text-[#2D1B0E]",
            accent: "bg-[#2D1B0E]/10"
        };
    };

    const theme = getThemeColors(stats.rating);

    return (
        <motion.div
            whileHover={{
                scale: 1.05,
                rotateY: 10,
                transition: { duration: 0.4, ease: "easeOut" }
            }}
            style={{
                clipPath: "polygon(10% 0, 90% 0, 100% 15%, 100% 88%, 50% 100%, 0 88%, 0 15%)"
            }}
            className={cn(
                "group relative w-64 h-[380px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 bg-gradient-to-br",
                theme.bg,
                className
            )}
        >
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none mix-blend-overlay" />

            {/* Radial Shine */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.4)_0%,transparent_70%)] pointer-events-none" />

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
                            WebkitMaskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
                            maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)"
                        }}
                    >
                        {player.photoUrl ? (
                            <Image
                                src={player.photoUrl}
                                alt={player.lastName}
                                fill
                                className="object-cover object-top drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] contrast-110 saturate-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-20">
                                <Users className="w-24 h-24" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Name Plate */}
                <div className="mt-[170px] relative z-20">
                    <h3 className={cn(
                        "text-3xl font-black uppercase tracking-tighter truncate italic drop-shadow-sm",
                        theme.text
                    )}>
                        {player.lastName}
                    </h3>
                </div>

                {/* Divider */}
                <div className={cn("h-[2px] w-4/5 mx-auto my-2 opacity-20", theme.text === "text-[#F3E5AB]" ? "bg-white" : "bg-black")} />

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
                        <span className="text-[10px] font-black tracking-widest uppercase">E.R.S. Team</span>
                    </div>
                </div>
            </div>

            {/* Reflection Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 pointer-events-none" />
        </motion.div>
    );
};
