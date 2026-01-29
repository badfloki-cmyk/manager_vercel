"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

    const getCardTheme = (rating: number) => {
        if (rating >= 85) return "bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#9E7E38] text-[#4D3F1E]";
        if (rating >= 75) return "bg-gradient-to-br from-[#E5E7EB] via-[#D1D5DB] to-[#9CA3AF] text-[#374151]";
        return "bg-gradient-to-br from-[#CD7F32] via-[#A0522D] to-[#8B4513] text-[#F3E5AB]";
    };

    return (
        <motion.div
            whileHover={{ scale: 1.05, rotateY: 5, rotateX: -5 }}
            className={cn(
                "relative w-64 h-96 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm transition-all duration-500 preserve-3d",
                getCardTheme(stats.rating),
                className
            )}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />

            {/* Content Container */}
            <div className="relative h-full flex flex-col p-4">
                {/* Header: Rating & Position */}
                <div className="flex flex-col items-center absolute left-4 top-8">
                    <span className="text-5xl font-black leading-none">{stats.rating}</span>
                    <span className="text-xl font-bold uppercase tracking-tighter opacity-80">{player.position.substring(0, 3)}</span>
                </div>

                {/* Player Photo */}
                <div className="absolute right-0 top-4 w-44 h-56 overflow-hidden">
                    {player.photoUrl ? (
                        <Image
                            src={player.photoUrl}
                            alt={player.lastName}
                            fill
                            className="object-cover object-top filter contrast-125 saturate-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-black/10 flex items-center justify-center">
                            <span className="text-6xl font-black opacity-20">{player.number}</span>
                        </div>
                    )}
                </div>

                {/* Name */}
                <div className="mt-auto mb-20 text-center relative z-10">
                    <div className="h-px w-full bg-current opacity-20 mb-2" />
                    <h3 className="text-2xl font-black uppercase tracking-tight truncate px-2 italic">
                        {player.lastName}
                    </h3>
                    <div className="h-px w-full bg-current opacity-20 mt-2" />
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 px-4 mb-4 font-black">
                    <div className="flex justify-between items-center text-sm">
                        <span className="opacity-70">PAC</span>
                        <span>{stats.pac}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="opacity-70">DRI</span>
                        <span>{stats.dri}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="opacity-70">SHO</span>
                        <span>{stats.sho}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="opacity-70">DEF</span>
                        <span>{stats.def}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="opacity-70">PAS</span>
                        <span>{stats.pas}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="opacity-70">PHY</span>
                        <span>{stats.phy}</span>
                    </div>
                </div>

                {/* Bottom Logo */}
                <div className="flex justify-center mt-auto opacity-40 grayscale group-hover:grayscale-0 transition-all">
                    <Image src="/logo_new.png" alt="Club Logo" width={40} height={40} className="h-6 w-auto object-contain" />
                </div>
            </div>

            {/* Holographic Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-1000" />
        </motion.div>
    );
};
