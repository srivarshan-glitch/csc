import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PaymentsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return redirect("/login");

    const payments = await db.payment.findMany({
        where: {
            student: {
                userId: session.user.id,
            },
        },
        orderBy: { createdAt: "desc" },
        include: {
            student: true,
            invoice: true,
        },
        take: 50,
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold text-foreground">
                        Payment Ledger
                    </h2>
                    <div className="h-1 w-20 bg-primary rounded-full" />
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mt-2">Transaction Log v3.1.2</p>
                </div>
                <Link href="/dashboard/payments/new">
                    <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-11">
                        <Plus className="mr-2 h-4 w-4" /> New Payment
                    </Button>
                </Link>
            </div>

            <Card className="border-primary/10 overflow-hidden shadow-card">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold">Recent Payments</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-50 text-[10px] uppercase text-primary/80 font-bold tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">Course</th>
                                    <th className="px-6 py-4 text-center">Mode</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4 text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payments.map((payment: any) => (
                                    <tr key={payment.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-4 text-xs text-slate-500 font-medium tracking-wider">{format(payment.date, "dd.MM.yyyy")}</td>
                                        <td className="px-6 py-4 font-semibold text-foreground text-lg tracking-tight uppercase">{payment.student.name}</td>
                                        <td className="px-6 py-4 text-sm font-medium uppercase text-slate-400 tracking-wider whitespace-nowrap">{payment.course || payment.student?.course || "N/A"}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-500 border border-slate-100">
                                                {payment.mode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors tracking-tight">
                                                ₹{payment.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {payment.invoice ? (
                                                <Link href={`/dashboard/invoices/${payment.invoice.id}`} className="text-primary hover:text-white text-xs hover:underline decoration-primary underline-offset-4 font-medium">
                                                    {payment.invoice.number}
                                                </Link>
                                            ) : (
                                                <span className="text-slate-600 font-medium whitespace-nowrap">NO_INV</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-xs uppercase tracking-widest">
                                            No transaction records found
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
