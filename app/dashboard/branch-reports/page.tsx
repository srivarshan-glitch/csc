import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BranchReportsPage() {
    const session = await getServerSession(authOptions);

    if (session?.user?.email !== "csc@srivarshan") {
        return <div className="p-8 text-center text-slate-500">Unauthorized Access</div>;
    }

    const usersData = await db.user.findMany({
        where: {
            email: { not: "csc@srivarshan" }
        },
        orderBy: { createdAt: "desc" },
        include: {
            students: {
                include: {
                    payments: true
                }
            }
        }
    });

    const users = usersData.map((user: any) => {
        let totalFees = 0;
        let collectedFees = 0;
        let pendingFees = 0;
        let pendingStudentsCount = 0;

        user.students.forEach((student: any) => {
            const courseFee = student.totalFee || 0;
            const paid = student.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
            const balance = courseFee - paid;

            totalFees += courseFee;
            collectedFees += paid;
            if (balance > 1) { // Tolerance for floating point
                pendingFees += balance;
                pendingStudentsCount++;
            }
        });

        return {
            ...user,
            stats: {
                totalStudents: user.students.length,
                totalFees,
                collectedFees,
                pendingFees,
                pendingStudentsCount
            }
        };
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-foreground">
                    Branch Performance
                </h2>
                <div className="h-1 w-20 bg-primary rounded-full" />
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mt-2">Financial Overview v2.0</p>
            </div>

            <Card className="border-primary/10 shadow-card">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Active Centers Financials</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-500">
                            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Branch Name</th>
                                    <th className="px-6 py-4 text-center">Admissions</th>
                                    <th className="px-6 py-4 text-right">Total Business</th>
                                    <th className="px-6 py-4 text-right text-emerald-600">Collected</th>
                                    <th className="px-6 py-4 text-right text-rose-600">Pending</th>
                                    <th className="px-6 py-4 text-center">Defaulters</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((user: any) => (
                                    <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground">{user.name}</div>
                                            <div className="text-xs text-slate-400 font-mono">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                                                {user.stats.totalStudents}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-600">
                                            ₹{user.stats.totalFees.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                            ₹{user.stats.collectedFees.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-rose-600">
                                            ₹{user.stats.pendingFees.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.stats.pendingStudentsCount > 0 && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider border border-rose-100">
                                                    {user.stats.pendingStudentsCount} Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/dashboard/users/${user.id}`}>
                                                <Button variant="outline" size="sm" className="h-8 text-xs border-primary/20 text-primary hover:bg-primary/5">
                                                    Audit Log
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
