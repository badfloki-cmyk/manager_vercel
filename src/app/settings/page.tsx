"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Settings,
    ArrowLeft,
    Building2,
    Users,
    Palette,
    Bell,
    Shield,
    Database,
    ExternalLink,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SettingSection {
    title: string;
    description: string;
    icon: typeof Settings;
    href?: string;
    badge?: string;
}

const settingSections: SettingSection[] = [
    {
        title: "Club-Profil",
        description: "Name, Logo und Vereinsinformationen bearbeiten",
        icon: Building2,
    },
    {
        title: "Benutzer & Rollen",
        description: "Trainer, Spieler und Berechtigungen verwalten",
        icon: Users,
        badge: "Bald"
    },
    {
        title: "Erscheinungsbild",
        description: "Farben, Theme und Anzeige anpassen",
        icon: Palette,
    },
    {
        title: "Benachrichtigungen",
        description: "E-Mail und Push-Benachrichtigungen konfigurieren",
        icon: Bell,
        badge: "Bald"
    },
    {
        title: "Datenschutz",
        description: "Privatsphäre und Sicherheitseinstellungen",
        icon: Shield,
    },
    {
        title: "Daten & Export",
        description: "Backup erstellen oder Daten exportieren",
        icon: Database,
        badge: "Bald"
    },
];

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-4xl px-6 h-20 flex items-center">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Settings className="w-6 h-6 text-red-500" />
                            Einstellungen
                        </h1>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-6 py-12">
                {/* Club Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 mb-10 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
                    <div className="relative flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden">
                            <Image
                                src="https://erspattensen.de/wp-content/uploads/2023/02/ERS-1024x208.jpg"
                                alt="ERS Logo"
                                width={80}
                                height={80}
                                className="object-contain brightness-0 invert"
                            />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">ERS Pattensen</h2>
                            <p className="text-slate-400">Eintracht Rot-Schwarz Pattensen</p>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded font-bold">
                                    2 Mannschaften
                                </span>
                                <a
                                    href="https://erspattensen.de"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1"
                                >
                                    erspattensen.de
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Settings Sections */}
                <div className="space-y-3">
                    {settingSections.map((section, index) => (
                        <motion.button
                            key={section.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setActiveSection(activeSection === section.title ? null : section.title)}
                            className={cn(
                                "w-full flex items-center justify-between p-5 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-800/50 hover:border-slate-700 transition-all group text-left",
                                activeSection === section.title && "border-red-500/30 bg-slate-800/50"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                    <section.icon className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold">{section.title}</h3>
                                        {section.badge && (
                                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                                {section.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500">{section.description}</p>
                                </div>
                            </div>
                            <ChevronRight className={cn(
                                "w-5 h-5 text-slate-600 transition-transform",
                                activeSection === section.title && "rotate-90"
                            )} />
                        </motion.button>
                    ))}
                </div>

                {/* App Info */}
                <div className="mt-12 pt-8 border-t border-slate-800">
                    <div className="text-center">
                        <p className="text-slate-600 text-sm">Club Manager</p>
                        <p className="text-slate-700 text-xs mt-1">Version 2.0.7 • Powered by Next.js & Vercel</p>
                        <div className="flex justify-center gap-4 mt-4">
                            <a href="#" className="text-xs text-slate-600 hover:text-red-500 transition-colors">Impressum</a>
                            <a href="#" className="text-xs text-slate-600 hover:text-red-500 transition-colors">Datenschutz</a>
                            <a href="#" className="text-xs text-slate-600 hover:text-red-500 transition-colors">Support</a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
