import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DeleteStudentButton } from "@/components/DeleteStudentButton";
import { WhatsAppReminderButton } from "@/components/WhatsAppReminderButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StudentsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return redirect("/login");

    const { q } = await searchParams;
    const query = q || "";

    const students = await db.student.findMany({
        where: {
            userId: session.user.id,
            OR: [
                { name: { contains: query } },
                { phone: { contains: query } },
            ],
        },
        orderBy: { createdAt: "desc" },
        include: {
            payments: true,
        },
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-3xl font-bold text-foreground">
                            Student Registry
                        </h2>
                        <div className="h-1 w-20 bg-primary rounded-full" />
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mt-2">Database Index v4.0.5</p>
                    </div>
                </div>
                <Link href="/dashboard/students/new">
                    <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-11">
                        <Plus className="mr-2 h-4 w-4" /> New Admission
                    </Button>
                </Link>
            </div>

            <Card className="border-primary/10 overflow-hidden shadow-card">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-primary/50" />
                            <form>
                                <Input
                                    name="q"
                                    placeholder="Search by name or phone..."
                                    className="pl-10 bg-white border-slate-200 transition-all focus:border-primary/50"
                                    defaultValue={query}
                                />
                            </form>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-500">
                            <thead className="bg-slate-50 text-sm text-slate-700 font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">ID / Name</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Course</th>
                                    <th className="px-6 py-4">Fee Status</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.map((student) => {
                                    const totalPaid = student.payments.reduce((sum, p) => sum + p.amount, 0);
                                    const balance = Math.max(0, student.totalFee - totalPaid);
                                    const isPaid = balance === 0;

                                    return (
                                        <tr key={student.id} className="hover:bg-primary/5 transition-colors group">
                                            <td className="px-6 py-4 text-slate-600 font-medium text-base">
                                                <div className="flex flex-col">
                                                    <span className="text-foreground font-semibold capitalize">{student.name.toLowerCase()}</span>
                                                    <span className="text-xs text-slate-400">#{student.id.toString().padStart(4, '0')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-base font-medium text-slate-600">{student.phone}</td>
                                            <td className="px-6 py-4 text-base font-medium text-slate-600 capitalize">{student.course}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-slate-500">Due: <span className={balance > 0 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>₹{balance.toLocaleString()}</span></span>
                                                    <span className="text-[10px] text-slate-400">Paid: ₹{totalPaid.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {student.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 items-center">
                                                    {balance > 0 && (
                                                        <WhatsAppReminderButton
                                                            studentName={student.name}
                                                            phone={student.phone}
                                                            balance={balance}
                                                            totalFee={student.totalFee}
                                                            paidAmount={totalPaid}
                                                            course={student.course}
                                                        />
                                                    )}
                                                    <DeleteStudentButton id={student.id} studentName={student.name} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-xs uppercase tracking-widest">
                                            No entities found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
