import { db } from "@/lib/db";
import InvoiceView from "@/components/InvoiceView";
import { notFound } from "next/navigation";
import { getStudentBalance } from "@/app/actions/payment";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const invoice = await db.invoice.findUnique({
        where: { id: parseInt(id) },
        include: {
            student: true,
            payment: true,
        },
    });

    if (!invoice) {
        notFound();
    }

    const balanceInfo = await getStudentBalance(invoice.studentId);

    return <InvoiceView invoice={invoice} balance={balanceInfo?.balance || 0} />;
}
