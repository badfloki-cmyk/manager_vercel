"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Ungültige E-Mail oder Passwort.");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch {
            setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(212,0,109,0.08),transparent)] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative"
            >
                <div className="text-center mb-12">
                    <Image
                        src="/logo_new.png"
                        alt="Logo"
                        width={300}
                        height={60}
                        className="mx-auto h-16 w-auto mb-8 drop-shadow-sm"
                        priority
                    />
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Schulfussball Management</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Bitte melden Sie sich an, um fortzufahren</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 blur-2xl" />

                    <form onSubmit={handleSubmit} className="space-y-6 relative">
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 block px-1">Email Adresse</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@beispiel.de"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-brand/30 focus:bg-white transition-all font-medium shadow-inner"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 block px-1">Passwort</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-brand/30 focus:bg-white transition-all font-medium shadow-inner"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-bold text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl shadow-brand/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Anmelden
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-12 text-center text-[10px] text-slate-300 font-black uppercase tracking-widest">
                    &copy; 2026 ERS Pattensen • Alle Rechte vorbehalten
                </p>
            </motion.div>
        </div>
    );
}
