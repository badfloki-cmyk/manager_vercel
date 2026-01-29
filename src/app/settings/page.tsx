"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings,
    ArrowLeft,
    Building2,
    Users,
    Palette,
    Bell,
    Shield,
    Database,
    ChevronRight,
    UserPlus,
    UserCircle,
    ShieldAlert,
    Loader2,
    Save,
    Trash2,
    Plus
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface SettingSection {
    title: string;
    description: string;
    icon: typeof Settings;
    href?: string;
    badge?: string;
}

const settingSections: SettingSection[] = [
    {
        title: "Mein Profil",
        description: "Dein Name und Profilbild anpassen",
        icon: UserCircle,
    },
    {
        title: "Club-Profil",
        description: "Name, Logo und Vereinsinformationen bearbeiten",
        icon: Building2,
    },
    {
        title: "Benutzer & Rollen",
        description: "Admins, Spieler und Berechtigungen verwalten",
        icon: Users,
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
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";

    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // New User form
    const [newUserName, setNewUserName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserRole, setNewUserRole] = useState<"player" | "admin" | string>("player");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Profile state
    const [profileName, setProfileName] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const fetchUsers = useCallback(async () => {
        if (!isAdmin) return;
        setIsLoadingUsers(true);
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(data.users || []);
        } catch (_err) {
            console.error("Fetch users error:", _err);
        } finally {
            setIsLoadingUsers(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (activeSection === "Benutzer & Rollen") {
            fetchUsers();
        }
    }, [activeSection, fetchUsers]);

    useEffect(() => {
        if (session?.user) {
            setProfileName(session.user.name || "");
            setProfileImage(session.user.image || "");
        }
    }, [session]);

    const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const res = await fetch(`/api/upload?filename=${file.name}`, {
                method: 'POST',
                body: file,
            });
            const blob = await res.json();
            setProfileImage(blob.url);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Fehler beim Hochladen.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!session?.user?.id) return;
        setIsSaving(true);
        setSaveStatus(null);
        try {
            const res = await fetch(`/api/users/${session.user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: profileName,
                    image: profileImage
                }),
            });

            if (res.ok) {
                setSaveStatus({ type: 'success', message: "Profil aktualisiert! Bitte lade die Seite neu, um die Änderungen überall zu sehen." });
            } else {
                const data = await res.json();
                setSaveStatus({ type: 'error', message: data.error || "Fehler beim Speichern." });
            }
        } catch {
            setSaveStatus({ type: 'error', message: "Verbindungsfehler." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus(null);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newUserName,
                    email: newUserEmail,
                    password: newUserPassword,
                    role: newUserRole
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setSaveStatus({ type: 'success', message: "Benutzer erfolgreich erstellt!" });
                setNewUserName("");
                setNewUserEmail("");
                setNewUserPassword("");
                fetchUsers();
            } else {
                setSaveStatus({ type: 'error', message: data.error || "Fehler beim Erstellen." });
            }
        } catch {
            setSaveStatus({ type: 'error', message: "Verbindungsfehler." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Bist du sicher, dass du diesen Account löschen möchtest?")) return;
        try {
            const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
            const data = await res.json();
            if (res.ok) {
                fetchUsers();
            } else {
                alert(data.error || "Fehler beim Löschen.");
            }
        } catch (_err) {
            console.error("Delete user error:", _err);
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <ShieldAlert className="w-16 h-16 text-brand mb-6" />
                <h1 className="text-2xl font-black text-slate-900 mb-2">Zugriff verweigert</h1>
                <p className="text-slate-500 font-medium">Nur Admins können diese Seite aufrufen.</p>
                <Link href="/" className="mt-8 px-8 py-3 bg-brand text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-brand/20">
                    Zurück zum Dashboard
                </Link>
            </div>
        );
    }

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
                                    Admin Bereich
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Settings Sections */}
                <div className="space-y-4">
                    {settingSections.map((section, index) => (
                        <div key={section.title} className="space-y-4">
                            <motion.button
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

                            <AnimatePresence>
                                {activeSection === "Mein Profil" && section.title === "Mein Profil" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden px-2"
                                    >
                                        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 space-y-8">
                                            <div className="flex flex-col md:flex-row items-center gap-8">
                                                <div className="relative group">
                                                    <div className="w-32 h-32 rounded-[2rem] bg-white border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
                                                        {profileImage ? (
                                                            <Image src={profileImage} alt="Profile" width={128} height={128} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                                                <UserCircle className="w-16 h-16" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[2rem]">
                                                        <input type="file" className="hidden" onChange={handleProfileUpload} accept="image/*" />
                                                        {isUploading ? (
                                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                                        ) : (
                                                            <Plus className="w-8 h-8 text-white" />
                                                        )}
                                                    </label>
                                                </div>
                                                <div className="flex-1 space-y-4 w-full">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Anzeigename</label>
                                                        <input
                                                            value={profileName}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileName(e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-brand/30 outline-none transition-all"
                                                            placeholder="Dein Name"
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4 pt-2">
                                                        {saveStatus && (
                                                            <span className={cn(
                                                                "text-[10px] font-black uppercase tracking-widest",
                                                                saveStatus.type === 'success' ? "text-emerald-500" : "text-brand"
                                                            )}>
                                                                {saveStatus.message}
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={handleSaveProfile}
                                                            disabled={isSaving || isUploading}
                                                            className="bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-brand/10 transition-all flex items-center gap-2 disabled:opacity-50 ml-auto"
                                                        >
                                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                            Speichern
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === "Benutzer & Rollen" && section.title === "Benutzer & Rollen" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden px-2"
                                    >
                                        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 space-y-10">
                                            {/* Create User Form */}
                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                                    <UserPlus className="w-3 h-3" />
                                                    Neuen Account anlegen
                                                </h4>
                                                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vollständiger Name</label>
                                                        <input
                                                            required
                                                            value={newUserName}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserName(e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-brand/30 outline-none transition-all"
                                                            placeholder="z.B. Max Mustermann"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Adresse</label>
                                                        <input
                                                            required
                                                            type="email"
                                                            value={newUserEmail}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserEmail(e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-brand/30 outline-none transition-all"
                                                            placeholder="max@beispiel.de"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Passwort</label>
                                                        <input
                                                            required
                                                            type="password"
                                                            value={newUserPassword}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserPassword(e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-brand/30 outline-none transition-all"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rolle</label>
                                                        <select
                                                            value={newUserRole}
                                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewUserRole(e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest focus:border-brand/30 outline-none transition-all appearance-none cursor-pointer"
                                                        >
                                                            <option value="player">Spieler (Lesen)</option>
                                                            <option value="admin">Admin (Vollzugriff)</option>
                                                        </select>
                                                    </div>
                                                    <div className="md:col-span-2 flex items-center justify-between gap-4">
                                                        {saveStatus && (
                                                            <span className={cn(
                                                                "text-[10px] font-black uppercase tracking-widest",
                                                                saveStatus.type === 'success' ? "text-emerald-500" : "text-brand"
                                                            )}>
                                                                {saveStatus.message}
                                                            </span>
                                                        )}
                                                        <button
                                                            disabled={isSaving}
                                                            type="submit"
                                                            className="bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-brand/10 transition-all flex items-center gap-2 disabled:opacity-50 ml-auto"
                                                        >
                                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                            Account Erstellen
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>

                                            {/* Users List */}
                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Existierende Benutzer</h4>
                                                <div className="space-y-3">
                                                    {isLoadingUsers ? (
                                                        <div className="flex justify-center py-6">
                                                            <Loader2 className="w-6 h-6 animate-spin text-slate-200" />
                                                        </div>
                                                    ) : users.map((user: User) => (
                                                        <div key={user._id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                                    <UserCircle className="w-6 h-6" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-slate-900 text-sm">{user.name}</p>
                                                                    <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className={cn(
                                                                    "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ring-1 ring-inset",
                                                                    user.role === 'admin' ? "bg-brand/5 text-brand ring-brand/20" : "bg-slate-100 text-slate-400 ring-slate-200"
                                                                )}>
                                                                    {user.role}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleDeleteUser(user._id)}
                                                                    className="p-2 text-slate-300 hover:text-brand hover:bg-brand/5 rounded-xl transition-all"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* App Info */}
                <div className="mt-20 pt-12 border-t border-slate-100">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <Settings className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Club Manager</p>
                        <p className="text-slate-300 text-[10px] font-bold mt-2">Version 2.0.8 • Powered by Next.js & Vercel</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
