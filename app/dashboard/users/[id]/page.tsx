
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { format } from "date-fns";

export default async function BranchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    // 1. Strict Access Control (Super Admin Only)
    // In a real app, use a middleware or robust permission system.
    if (session?.user?.email !== "csc@srivarshan") {
        return (
            <div className="flex h-[50vh] items-center justify-center text-slate-500">
                Unauthorized: Only Super Admin can access this page.
            </div>
        );
    }

    const { id } = await params;

    // 2. Fetch Center Data
    const center = await db.user.findUnique({
        where: { id },
        include: {
            students: {
                include: {
                    payments: true
                },
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!center) {
        return <div className="p-8">Center not found</div>;
    }

    // 3. Process Data for Verification
    const students = center.students.map((student: any) => {
        const totalFee = student.totalFee || 0;
        const paid = student.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
        const balance = totalFee - paid;

        let status = "Pending";
        let statusColor = "text-rose-600 bg-rose-50 border-rose-100";

        if (balance <= 0 && totalFee > 0) {
            status = "Paid";
            statusColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
        } else if (paid > 0) {
            status = "Partial";
            statusColor = "text-amber-600 bg-amber-50 border-amber-100";
        }

        return {
            ...student,
            stats: {
                totalFee,
                paid,
                balance,
                status,
                statusColor
            }
        };
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dashboard/branch-reports" className="flex items-center text-xs text-slate-400 hover:text-primary mb-2 transition-colors">
                        <ArrowLeft className="h-3 w-3 mr-1" /> Back to Branch Overview
                    </Link>
                    <h2 className="text-3xl font-bold text-foreground max-w-2xl truncate">
                        {center.name} <span className="text-slate-300 font-light mx-2">|</span> <span className="text-primary text-xl uppercase tracking-wider">Audit Log</span>
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="px-3 py-1 bg-slate-100 rounded-md text-xs font-mono text-slate-500 border border-slate-200">
                            ID: {center.id}
                        </div>
                        <div className="px-3 py-1 bg-slate-100 rounded-md text-xs font-mono text-slate-500 border border-slate-200">
                            {center.email}
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border-primary/10 shadow-card">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Student Ledger Entry</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Check Success
                            </div>
                            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 ml-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Pending Action
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-500">
                            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Enrollment ID</th>
                                    <th className="px-6 py-4">Student Identity</th>
                                    <th className="px-6 py-4">Course Module</th>
                                    <th className="px-6 py-4 text-right">Total Invoice</th>
                                    <th className="px-6 py-4 text-right">Paid</th>
                                    <th className="px-6 py-4 text-right text-rose-600">Balance Due</th>
                                    <th className="px-6 py-4 text-center">Next Due Date</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-xs uppercase tracking-widest">
                                            No student records found in this branch partition.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student: any) => (
                                        <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-base font-bold text-slate-700">
                                                {student.enrollmentId || <span className="text-slate-300 text-sm font-normal">--</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-foreground text-sm">{student.name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                    PHONE: {student.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600 border border-slate-200">
                                                    {student.course}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-700">
                                                ₹{student.stats.totalFee.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-emerald-600">
                                                ₹{student.stats.paid.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-rose-600 font-mono">
                                                {student.stats.balance > 0 ? `₹${student.stats.balance.toLocaleString()}` : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-center text-xs font-medium text-slate-500">
                                                {student.nextPaymentDate ? (
                                                    <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                                        {format(new Date(student.nextPaymentDate), "dd MMM yyyy")}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 italic">--</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${student.stats.statusColor}`}>
                                                    {student.stats.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
