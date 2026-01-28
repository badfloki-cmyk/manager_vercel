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
        <div className="min-h-screen bg-white text-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-4xl px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-900">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Image src="/logo_new.png" alt="Logo" width={100} height={25} className="h-8 w-auto object-contain rounded shadow-sm" />
                        <h1 className="text-2xl font-black text-brand tracking-tight flex items-center gap-3">
                            <Settings className="w-6 h-6" />
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
                    className="bg-white border border-slate-100 rounded-[2.5rem] p-10 mb-12 relative overflow-hidden shadow-2xl shadow-slate-200/50"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="relative flex items-center gap-8">
                        <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-center overflow-hidden shadow-inner">
                            <Image
                                src="/logo_new.png"
                                alt="ERS Logo"
                                width={80}
                                height={80}
                                className="object-contain rounded-lg"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">ERS Pattensen</h2>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Eintracht Rot-Schwarz Pattensen</p>
                            <div className="flex items-center gap-4 mt-4">
                                <span className="text-[10px] bg-brand text-white px-3 py-1 rounded-lg font-black uppercase tracking-widest shadow-lg shadow-brand/20">
                                    2 Mannschaften
                                </span>
                                <a
                                    href="https://erspattensen.de"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-slate-400 hover:text-brand transition-all flex items-center gap-1.5 font-black uppercase tracking-widest"
                                >
                                    erspattensen.de
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Settings Sections */}
                <div className="space-y-4">
                    {settingSections.map((section, index) => (
                        <motion.button
                            key={section.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setActiveSection(activeSection === section.title ? null : section.title)}
                            className={cn(
                                "w-full flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-xl hover:shadow-slate-200/40 transition-all group text-left",
                                activeSection === section.title && "border-brand/40 shadow-xl shadow-brand/5 ring-4 ring-brand/5"
                            )}
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-brand/5 group-hover:border-brand/10 transition-colors">
                                    <section.icon className="w-6 h-6 text-slate-400 group-hover:text-brand transition-colors" />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-black text-slate-900 tracking-tight">{section.title}</h3>
                                        {section.badge && (
                                            <span className="text-[10px] bg-slate-100 text-slate-400 px-3 py-1 rounded-lg font-black uppercase tracking-widest leading-none border border-slate-200 shadow-sm">
                                                {section.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">{section.description}</p>
                                </div>
                            </div>
                            <ChevronRight className={cn(
                                "w-5 h-5 text-slate-200 transition-all group-hover:text-brand",
                                activeSection === section.title && "rotate-90 text-brand"
                            )} />
                        </motion.button>
                    ))}
                </div>

                {/* App Info */}
                <div className="mt-20 pt-12 border-t border-slate-100">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <Settings className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Club Manager</p>
                        <p className="text-slate-300 text-[10px] font-bold mt-2">Version 2.0.7 • Powered by Next.js & Vercel</p>
                        <div className="flex justify-center gap-8 mt-8">
                            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors">Impressum</a>
                            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors">Datenschutz</a>
                            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors">Support</a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
