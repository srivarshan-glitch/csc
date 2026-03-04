"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { Home, Users, CreditCard, FileText, ClipboardList, BookOpen } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className="w-64 glass-dark border-r border-primary/10 text-foreground flex flex-col h-screen shrink-0">
            <div className="p-6 border-b border-primary/10">
                <Link href="/dashboard" className="flex flex-col items-center gap-2 group">
                    <div className="relative w-20 h-20 rounded-full border-4 border-primary/20 p-1 bg-white shadow-sm overflow-hidden group-hover:border-primary/40 transition-all duration-300">
                        <img
                            src="/logo.jpg"
                            alt="CSC Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="text-center">
                        <h1 className="text-lg font-semibold text-foreground leading-tight group-hover:text-primary transition-colors tracking-tight">
                            CSC COMPUTER SOFTWARE COLLEGE
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.1em] text-primary font-medium mt-1">Management Core v4.1.0</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 p-6 space-y-1">
                {(session?.user?.email === "csc@srivarshan" ? [
                    { href: "/dashboard", icon: Home, label: "Terminal" },
                    { href: "/dashboard/branch-reports", icon: FileText, label: "Branch Overview" },
                    { href: "/dashboard/reports", icon: ClipboardList, label: "Analytics" },
                    { href: "/dashboard/users", icon: Users, label: "Centers" }
                ] : [
                    { href: "/dashboard", icon: Home, label: "Terminal" },
                    { href: "/dashboard/students", icon: Users, label: "Records" },
                    { href: "/dashboard/payments", icon: CreditCard, label: "Transactions" },
                    { href: "/dashboard/invoices", icon: FileText, label: "Archive" },
                    { href: "/dashboard/courses", icon: BookOpen, label: "Modules" },
                    { href: "/dashboard/reports", icon: ClipboardList, label: "Analytics" }
                ]).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-cyber"
                                    : "text-slate-500 hover:text-primary hover:bg-primary/5"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-primary" : "text-slate-400")} />
                            <span className="text-xs font-medium uppercase tracking-wider">{item.label}</span>
                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-full" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 mt-auto border-t border-primary/10">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                >
                    <LogOut className="h-5 w-5" /> <span className="font-bold uppercase tracking-wider text-xs">Logout</span>
                </button>
            </div>
        </aside>
    );
}
