"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid credentials");
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 bg-white">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10"
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur opacity-20 transition duration-1000"></div>
                <Card className="w-[450px] glass border-slate-200 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                    <CardHeader className="text-center pb-8 pt-10 px-8">
                        <div className="mx-auto mb-6">
                            <div className="relative flex h-28 w-28 mx-auto items-center justify-center rounded-full bg-white border-4 border-primary/20 shadow-sm overflow-hidden p-1">
                                <img
                                    src="/logo.jpg"
                                    alt="CSC Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                        <h1 className="text-xl font-semibold text-foreground mb-1 uppercase tracking-tight">
                            CSC MANAGEMENT PORTAL
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-medium mt-2">Authorized Access Only</p>
                    </CardHeader>
                    <CardContent className="px-10 pb-12">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400 ml-1 uppercase tracking-wider">Username / ID</label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-white border-slate-200 h-12 focus:ring-primary focus:border-primary transition-all font-mono text-sm tracking-wider text-foreground placeholder:text-slate-300"
                                        required
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400 ml-1 uppercase tracking-wider">Password</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-white border-slate-200 h-12 focus:ring-primary focus:border-primary transition-all font-mono text-foreground placeholder:text-slate-300"
                                    required
                                />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 rounded bg-red-500/10 border border-red-500/20 text-xs font-medium uppercase tracking-widest text-red-500 text-center"
                                >
                                    Access Denied: Invalid Credentials
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold uppercase tracking-widest h-11 transition-all active:scale-95 text-xs"
                            >
                                Sign In to Portal
                            </Button>
                        </form>
                    </CardContent>
                    {/* Footnote decoration */}
                    <div className="h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
                </Card>
            </motion.div>
        </div>
    );
}
