import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    IndianRupee,
    CreditCard,
    BarChart3,
    FileText
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns"; // Added date helpers
import { DashboardFilter } from "@/components/DashboardFilter";

import { getServerSession } from "next-auth"; // For role check
import { authOptions } from "@/lib/auth";

async function getDashboardMetrics(branchId?: string) {
    // ... existing logic but using argument instead of searchParams
    const whereUser = branchId ? { userId: branchId } : {};
    const whereStudent = branchId ? { student: { userId: branchId } } : {};

    const totalStudents = await db.student.count({
        where: whereUser
    });

    const totalRevenue = await db.payment.aggregate({
        where: whereStudent,
        _sum: { amount: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRevenue = await db.payment.aggregate({
        where: {
            ...whereStudent,
            date: {
                gte: today,
            },
        },
        _sum: { amount: true },
    });

    // Monthly Revenue
    const startMonth = startOfMonth(new Date());
    const monthlyRevenue = await db.payment.aggregate({
        where: {
            ...whereStudent,
            date: {
                gte: startMonth,
            },
        },
        _sum: { amount: true },
    });

    const recentInvoices = await db.invoice.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        where: branchId ? { student: { userId: branchId } } : {},
        include: {
            student: {
                include: {
                    user: true
                }
            },
            payment: true,
        },
    });

    return {
        totalStudents,
        totalRevenue: totalRevenue._sum.amount || 0,
        todayRevenue: todayRevenue._sum.amount || 0,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        recentInvoices
    };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ branchId?: string }> }) {
    const session = await getServerSession(authOptions);
    const isSuperAdmin = session?.user?.email === "csc@srivarshan";

    const resolvedParams = await searchParams;
    const branchId = isSuperAdmin ? resolvedParams?.branchId : session?.user?.id;

    // Pass strictly the ID we determined
    const metrics = await getDashboardMetrics(branchId);

    // Only fetch branches if super admin
    let branches: { id: string; name: string; }[] = [];
    if (isSuperAdmin) {
        branches = await db.user.findMany({
            select: { id: true, name: true },
            where: { email: { not: "csc@srivarshan" } }
        });
    }

    const cards = [
        {
            title: "Total Students",
            value: metrics.totalStudents,
            icon: Users,
            color: "bg-primary",
        },
        {
            title: "Total Revenue",
            value: `₹${metrics.totalRevenue.toLocaleString()}`,
            icon: IndianRupee,
            color: "bg-green-500",
        },
        {
            title: "Monthly Revenue",
            value: `₹${metrics.monthlyRevenue.toLocaleString()}`,
            icon: BarChart3,
            color: "bg-blue-500",
        },
        {
            title: "Today's Collection",
            value: `₹${metrics.todayRevenue.toLocaleString()}`,
            icon: CreditCard,
            color: "bg-primary/80",
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold text-foreground">
                        Dashboard Overview
                    </h2>
                    <div className="h-1 w-20 bg-primary rounded-full" />
                </div>
                <div>
                    {isSuperAdmin && branches.length > 0 && (
                        <DashboardFilter branches={branches} />
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <Card key={card.title} className="group hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                                {card.title}
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <card.icon className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent className="mt-2">
                            <div className="text-3xl font-semibold text-foreground tracking-tight">{card.value}</div>
                            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 font-medium uppercase tracking-wider">
                                <span className="w-1 h-1 rounded-full bg-primary" /> {branchId ? "Branch Active" : "System Active"}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>


            <div className="grid gap-6 md:grid-cols-1">
                <Card className="border-primary/10 shadow-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Recent Admissions</CardTitle>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Transaction Stream v4.0.1</p>
                        </div>
                    </CardHeader>
                    <CardContent className="mt-4">
                        {metrics.recentInvoices.length > 0 ? (
                            <div className="relative overflow-x-auto rounded-lg border border-slate-100">
                                <table className="w-full text-left text-sm text-slate-500">
                                    <thead className="bg-slate-50 text-[10px] uppercase text-primary/80 font-black tracking-[0.15em]">
                                        <tr>
                                            <th className="px-6 py-4 border-b border-slate-100">Branch</th>
                                            <th className="px-6 py-4 border-b border-slate-100">Enrollment ID</th>
                                            <th className="px-6 py-4 border-b border-slate-100">Name</th>
                                            <th className="px-6 py-4 border-b border-slate-100">Credit IDR</th>
                                            <th className="px-6 py-4 border-b border-slate-100">Timestamp</th>
                                            <th className="px-6 py-4 border-b border-slate-100">Verification</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {metrics.recentInvoices.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-primary/5 transition-colors group">
                                                <td className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">
                                                    {inv.student.user.name}
                                                </td>
                                                <td className="px-6 py-4 text-primary group-hover:text-primary font-mono font-bold text-lg tracking-wider uppercase">
                                                    {inv.student.enrollmentId || "--"}
                                                </td>
                                                <td className="px-6 py-4 text-foreground font-medium uppercase text-base tracking-tight">{inv.student.name}</td>
                                                <td className="px-6 py-4 font-semibold text-foreground text-xl tracking-tight">₹{inv.payment.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-400 tracking-wider whitespace-nowrap">{format(inv.date, "dd.MM.yyyy")}</td>
                                                <td className="px-6 py-4">
                                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] uppercase tracking-wide text-emerald-600 border border-emerald-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Finalized
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500 text-xs uppercase tracking-widest bg-white/5 rounded-lg border border-dashed border-white/10">
                                No records found in current ledger archive
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
