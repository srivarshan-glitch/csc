import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/app/actions/whatsapp";

export async function GET() {
    try {
        // 1. Find students with pending balance
        // This logic is complex because 'pending' isn't a direct field, it's calculated.
        // Ideally we'd store 'balance' on the student record and update it on payments.
        // For now, we'll scan recent students (or all active) and calc balance.

        // Efficiency Note: In a real large app, we maintain a `balance` column.
        // We'll iterate all active students.
        const students = await db.student.findMany({
            where: { status: "Active" },
            include: { payments: true }
        });

        const pendingStudents = students.filter(s => {
            const student = s as any;
            const paid = student.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
            return (student.totalFee || 0) - paid > 0;
        });

        // 2. Identify who needs a reminder
        const results = [];

        for (const s of pendingStudents) {
            const student = s as any;
            const paid = student.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
            const balance = (student.totalFee || 0) - paid;

            // Send Reminder
            if (student.phone) {
                // Using "TOTAL-DUE" as placeholder for invoice number in this context
                await sendWhatsAppMessage(student.phone, "TOTAL-DUE", balance);
                results.push({ name: student.name, balance, status: "Sent" });
            } else {
                results.push({ name: student.name, balance, status: "Skipped (No Phone)" });
            }
        }

        return NextResponse.json({ success: true, count: results.length, details: results });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to process reminders" }, { status: 500 });
    }
}
