"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { sendWhatsAppMessage } from "@/app/actions/whatsapp";

interface InvoiceProps {
    invoice: any;
    balance: number;
}

export default function InvoiceView({ invoice, balance }: InvoiceProps) {
    const invoiceRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!invoiceRef.current) return;
        const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${invoice.number}.pdf`);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-10">
            <div className="flex justify-between items-center print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/payments">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-800">Invoice Details</h2>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleDownload} variant="outline" className="border-primary/20 hover:bg-primary/5 text-primary">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                    <Button
                        onClick={async () => {
                            try {
                                const message = `Hello ${invoice.student.name},\n\nPayment Received Successfully!\n\nHere is your invoice receipt for the ${invoice.student.course} course from CSC Computer Education.\n\nInvoice No: ${invoice.number}\nAmount Paid: ₹${invoice.payment.amount.toLocaleString()}\nTotal Course Fee: ₹${(invoice.student.totalFee || 0).toLocaleString()}\nBalance Amount: ₹${balance.toLocaleString()}\nDate: ${format(new Date(invoice.createdAt), "dd MMM yyyy")}\n\nThank you for your payment.\n\nPlease clear the balance amount on or before the due date to continue uninterrupted access to the course.\n\nFor any queries, feel free to contact us.\n\nThank you,\nCSC Computer Education\nMaraimalai Nagar`;
                                const phone = invoice.student.phone ? invoice.student.phone.replace(/[^0-9]/g, '') : '';

                                if (!invoiceRef.current) return;

                                // 1. Auto-download PDF
                                const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
                                const imgData = canvas.toDataURL("image/png");
                                const pdf = new jsPDF("p", "mm", "a4");
                                const pdfWidth = pdf.internal.pageSize.getWidth();
                                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                                pdf.save(`${invoice.number}.pdf`);

                                // 2. Open WhatsApp with Text
                                const encodedMessage = encodeURIComponent(message);
                                window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');

                                // 3. Notify User
                                // Using simple alert for now as Sonner/Toast might need setup found in layout
                                // Ideally this would be toast.success("Invoice downloaded! Attach it to the chat.");
                            } catch (error) {
                                console.error("Share failed:", error);
                                // Last resort fallback
                                const message = encodeURIComponent(`Hello ${invoice.student.name},\n\nPayment Received Successfully!\n\nHere is your invoice receipt for the ${invoice.student.course} course from CSC Computer Education.\n\nInvoice No: ${invoice.number}\nAmount Paid: ₹${invoice.payment.amount.toLocaleString()}\nTotal Course Fee: ₹${(invoice.student.totalFee || 0).toLocaleString()}\nBalance Amount: ₹${balance.toLocaleString()}\nDate: ${format(new Date(invoice.createdAt), "dd MMM yyyy")}\n\nThank you for your payment.\n\nPlease clear the balance amount on or before the due date.\n\nThank you,\nCSC Computer Education\nMaraimalai Nagar`);
                                const phone = invoice.student.phone ? invoice.student.phone.replace(/[^0-9]/g, '') : '';
                                window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                            }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Share2 className="mr-2 h-4 w-4" /> WhatsApp
                    </Button>
                </div>
            </div>

            {/* Printable Invoice Area - STRICTLY inline styles for html2canvas compatibility */}
            <div ref={invoiceRef} style={{ width: '210mm', minHeight: '297mm', padding: '0', margin: '0 auto', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
                {/* Header */}
                <div style={{ padding: '40px', backgroundColor: '#1d4ed8', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center' }}>
                            <img src="/logo.jpg" alt="CSC Logo" style={{ width: '150px', height: '150px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)' }} />
                        </h1>
                        <p style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 5px 0', color: '#ffffff' }}>COMPUTER SOFTWARE COLLEGE</p>
                        <p style={{ fontSize: '14px', margin: '0', color: '#eff6ff' }}>An ISO 9001:2015 Certified Institution</p>
                        <p style={{ fontSize: '14px', margin: '15px 0 0 0', color: '#eff6ff', lineHeight: '1.5' }}>
                            No.51, Vallal, M.G.R Salai, NH-1<br />
                            Maraimalai Nagar, Pin - 603209<br />
                            Phone: 9003245063
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', color: '#eff6ff', margin: '0' }}>Invoice</h2>
                        <p style={{ fontSize: '24px', fontWeight: '500', margin: '10px 0', color: '#ffffff' }}>{invoice.number}</p>
                        <p style={{ fontSize: '14px', margin: '0', color: '#eff6ff' }}>Date: {format(new Date(invoice.createdAt), "dd MMM yyyy")}</p>
                    </div>
                </div>

                {/* Bill To */}
                <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', margin: '0 0 10px 0' }}>Bill To</h3>
                        <p style={{ fontSize: '24px', fontWeight: '600', color: '#1d4ed8', margin: '0 0 5px 0' }}>{invoice.student.name}</p>
                        <p style={{ fontSize: '16px', color: '#334155', margin: '0 0 5px 0' }}>{invoice.student.address || "Address not provided"}</p>
                        <p style={{ fontSize: '16px', fontWeight: '500', color: '#334155', margin: '0' }}>{invoice.student.phone}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', margin: '0 0 10px 0' }}>Course Details</h3>
                        <p style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 5px 0' }}>{invoice.student.course}</p>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0' }}>Qualification: {invoice.student.qualification || "N/A"}</p>
                    </div>
                </div>

                {/* Table */}
                <div style={{ padding: '40px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ paddingBottom: '15px', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', color: '#64748b' }}>Description</th>
                                <th style={{ paddingBottom: '15px', borderBottom: '2px solid #e2e8f0', textAlign: 'right', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', color: '#64748b' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '20px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <p style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 5px 0', color: '#0f172a' }}>Tuition Fee Payment</p>
                                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0' }}>Payment Mode: {invoice.payment.mode}</p>
                                </td>
                                <td style={{ padding: '20px 0', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontSize: '24px', fontWeight: '500', color: '#0f172a' }}>
                                    ₹{invoice.payment.amount.toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div style={{ padding: '40px', marginTop: 'auto', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '300px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#475569', fontSize: '16px' }}>
                                <span>Current Payment:</span>
                                <span style={{ fontWeight: '800', fontSize: '18px' }}>₹{invoice.payment.amount.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#475569', fontSize: '16px' }}>
                                <span>Total Course Fee:</span>
                                <span>₹{(invoice.student.totalFee || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', borderTop: '2px solid #1d4ed8', color: '#1d4ed8', marginTop: '15px' }}>
                                <span style={{ fontWeight: '600', fontSize: '24px' }}>Balance Due:</span>
                                <span style={{ fontWeight: '500', fontSize: '32px' }}>₹{balance.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '14px', color: '#94a3b8' }}>
                        <p style={{ fontWeight: '500', marginBottom: '5px', color: '#64748b' }}>Terms & Conditions</p>
                        <p style={{ margin: '0' }}>Fees once paid will not be refunded. This is a computer-generated invoice.</p>
                    </div>
                </div>
            </div>
        </div >
    );
}
