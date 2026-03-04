import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { createUser, deleteUser } from "@/app/actions/user";
import { CreateCenterForm } from "@/components/CreateCenterForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UsersPage() {
    const session = await getServerSession(authOptions);

    // Strict Access Control
    if (session?.user?.email !== "csc@srivarshan") {
        return (
            <div className="flex h-[50vh] items-center justify-center text-slate-500">
                Unauthorized: Only Super Admin can access this page.
            </div>
        );
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


    async function remove(id: string) {
        "use server";
        await deleteUser(id);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-foreground">Center Management</h2>
                    <div className="h-1 w-20 bg-primary rounded-full mt-1" />
                    <p className="text-xs text-slate-500 mt-2 uppercase tracking-wider">Super Admin Control</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Create User Form */}
                <CreateCenterForm />

                {/* Users List */}
                <Card className="border-primary/10 shadow-card">
                    <CardContent className="p-0">
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-500">
                                <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Center Details</th>
                                        <th className="px-6 py-4 text-center">Registered Students</th>
                                        <th className="px-6 py-4 text-center">Role</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
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
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                                                    {user.email === "csc@srivarshan" ? "Super Admin" : "Branch Admin"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                                                {user.email !== "csc@srivarshan" && (
                                                    <form action={remove.bind(null, user.id)}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </form>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
