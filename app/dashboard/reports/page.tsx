import { db } from "@/lib/db";
import ReportsClient from "@/components/ReportsClient";
import { format, subMonths } from "date-fns";
import { DashboardFilter } from "@/components/DashboardFilter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getReportsData(branchId?: string) {
    // Determine filter condition
    const whereStudent = branchId ? { student: { userId: branchId } } : {};

    // Mock aggregation for SQLite (Prisma doesn't support thorough GroupBy locally easily for dates without raw query, keeping it simple)
    // Fetch all payments and aggregate in JS for simplicity unless huge simple app
    const payments = await db.payment.findMany({
        select: { amount: true, date: true, mode: true },
        where: {
            date: {
                gte: subMonths(new Date(), 6)
            },
            ...whereStudent
        }
    });

    // Monthly Revenue
    const revenueMap = new Map<string, number>();
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        revenueMap.set(format(d, "MMM yyyy"), 0);
    }

    payments.forEach(p => {
        const key = format(p.date, "MMM yyyy");
        if (revenueMap.has(key)) {
            revenueMap.set(key, revenueMap.get(key)! + p.amount);
        }
    });

    const revenueData = Array.from(revenueMap.entries()).map(([month, amount]) => ({
        month,
        amount
    }));

    // Payment Modes
    const modeMap = new Map<string, number>();
    payments.forEach(p => {
        modeMap.set(p.mode, (modeMap.get(p.mode) || 0) + 1);
    });

    const modeData = Array.from(modeMap.entries()).map(([name, value]) => ({
        name,
        value
    }));

    return { revenueData, modeData };
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ branchId?: string }> }) {
    const session = await getServerSession(authOptions);
    const isSuperAdmin = session?.user?.email === "csc@srivarshan";

    // If super admin, check params. If regular user, force THEIR id.
    const resolvedParams = await searchParams;
    const branchId = isSuperAdmin ? resolvedParams?.branchId : session?.user?.id;

    const { revenueData, modeData } = await getReportsData(branchId);

    // Only fetch branches if super admin
    let branches: { id: string; name: string; }[] = [];
    if (isSuperAdmin) {
        branches = await db.user.findMany({
            select: { id: true, name: true },
            where: { email: { not: "csc@srivarshan" } }
        });
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold text-foreground">
                        Analytics & Reports
                    </h2>
                    <div className="h-1 w-20 bg-primary rounded-full" />
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mt-2">Business Intelligence v1.0.4</p>
                </div>
                <div>
                    {isSuperAdmin && branches.length > 0 && (
                        <DashboardFilter branches={branches} />
                    )}
                </div>
            </div>
            <ReportsClient revenueData={revenueData} modeData={modeData} />
        </div>
    );
}
