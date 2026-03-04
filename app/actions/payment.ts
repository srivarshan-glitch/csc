"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const PaymentSchema = z.object({
    studentId: z.coerce.number().min(1, "Student is required"),
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),
    mode: z.string().min(1, "Payment mode is required"),
    nextPaymentDate: z.string().optional(),
});

export async function getStudentBalance(studentId: number) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    const student = await db.student.findFirst({
        where: {
            id: studentId,
            userId: session.user.id
        },
        include: { payments: true },
    });

    if (!student) return null;

    const totalFee = student.totalFee || 0;
    const paidAmount = student.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalFee - paidAmount;

    return {
        totalFee,
        paidAmount,
        balance: balance > 0 ? balance : 0,
        studentName: student.name
    };
}

export async function createPayment(formData: FormData) {
    const rawData = {
        studentId: formData.get("studentId"),
        amount: formData.get("amount"),
        mode: formData.get("mode"),
        nextPaymentDate: formData.get("nextPaymentDate"),
    };

    const validatedFields = PaymentSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { studentId, amount, mode } = validatedFields.data;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    // Verify student belongs to user
    const studentExists = await db.student.findFirst({
        where: {
            id: studentId,
            userId: session.user.id
        }
    });

    if (!studentExists) {
        return { error: "Student not found or unauthorized." };
    }

    // 1. Generate Invoice Number
    const currentYear = new Date().getFullYear();
    const lastInvoice = await db.invoice.findFirst({
        where: {
            number: { startsWith: `INV-${currentYear}` },
        },
        orderBy: { id: "desc" },
    });

    let nextSequence = 1;
    if (lastInvoice) {
        const parts = lastInvoice.number.split("-");
        const lastSeq = parseInt(parts[2], 10);
        if (!isNaN(lastSeq)) {
            nextSequence = lastSeq + 1;
        }
    }

    const invoiceNumber = `INV-${currentYear}-${String(nextSequence).padStart(3, "0")}`;

    let newInvoiceId: number | null = null;

    try {
        // Transaction to ensure Payment + Invoice creation
        await db.$transaction(async (tx) => {
            // 2. Create Payment
            const payment = await tx.payment.create({
                data: {
                    amount,
                    mode,
                    studentId,
                    date: new Date(), // Transaction Date
                    status: "Paid",
                },
            });

            // 3. Create Invoice
            const invoice = await tx.invoice.create({
                data: {
                    number: invoiceNumber,
                    paymentId: payment.id,
                    studentId,
                    date: new Date(),
                },
            });

            // 4. Update Student Due Date if provided
            if (validatedFields.data.nextPaymentDate) {
                await tx.student.update({
                    where: { id: studentId },
                    data: {
                        nextPaymentDate: new Date(validatedFields.data.nextPaymentDate)
                    }
                });
            }
            newInvoiceId = invoice.id;
        });

    } catch (error) {
        console.error("Payment Error:", error);
        return { error: "Failed to process payment." };
    }

    // 4. Trigger WhatsApp (TODO)
    // await sendWhatsAppMessage(studentId, invoiceNumber, amount);

    revalidatePath("/dashboard/payments");
    // Redirect to invoice view
    if (newInvoiceId) {
        redirect(`/dashboard/invoices/${newInvoiceId}`);
    } else {
        redirect("/dashboard/payments");
    }
}

export async function searchStudents(query: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !query || query.length < 2) return [];

    return await db.student.findMany({
        where: {
            userId: session.user.id,
            OR: [
                { name: { contains: query } },
                { phone: { contains: query } },
                { enrollmentId: { contains: query } },
            ],
        },
        take: 5,
        select: { id: true, name: true, phone: true, course: true, enrollmentId: true }, // Select minimal fields
    });
}
