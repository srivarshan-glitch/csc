import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function InvoicesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const session = await getServerSession(authOptions);
    const { q } = await searchParams;
    const query = q || "";

    const isSuperAdmin = session?.user?.email === "csc@srivarshan";

    // Strict Filter: If not super admin, ONLY show invoices from students user owns
    const whereCondition = {
        OR: [
            { number: { contains: query } },
            { student: { name: { contains: query } } },
        ],
        ...(isSuperAdmin ? {} : {
            student: {
                userId: session?.user?.id
            }
        })
    };

    const invoices = await db.invoice.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
        include: {
            student: true,
            payment: true,
        },
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-foreground uppercase tracking-tight">
                    Invoice Archive
                </h2>
                <div className="h-1 w-20 bg-primary rounded-full mt-2" />
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium mt-4">Document Records v2.4.0</p>
            </div>

            <Card className="border-primary/10 overflow-hidden shadow-card">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-primary/50" />
                        <form>
                            <Input
                                name="q"
                                placeholder="Search by Invoice No or Student Name..."
                                className="pl-10 bg-white border-slate-200 transition-all focus:border-primary/50"
                                defaultValue={query}
                            />
                        </form>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-500">
                            <thead className="bg-slate-50 text-[10px] uppercase text-primary/80 font-bold tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Invoice No</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-primary group-hover:text-primary font-medium tracking-wider uppercase">{inv.number}</td>
                                        <td className="px-6 py-4 text-xs uppercase text-slate-400 font-medium tracking-widest">{format(inv.date, "dd.MM.yyyy")}</td>
                                        <td className="px-6 py-4 font-semibold text-lg text-foreground uppercase tracking-tight">{inv.student.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors tracking-tight">
                                                ₹{inv.payment.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/dashboard/invoices/${inv.id}`}
                                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary hover:text-white transition-colors bg-primary/5 hover:bg-primary px-3 py-1.5 rounded-full border border-primary/10"
                                            >
                                                View Invoice
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {invoices.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-xs uppercase tracking-widest">
                                            No archival records found
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
