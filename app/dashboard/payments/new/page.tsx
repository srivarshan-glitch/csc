"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, Search, Check, X, IndianRupee } from "lucide-react";
import { createPayment, searchStudents, getStudentBalance } from "@/app/actions/payment";
import { useFormStatus } from "react-dom";

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] h-12 shadow-glow"
            disabled={pending || disabled}
        >
            {pending ? "Executing Core Ops..." : "Finalize Transaction"}
        </Button>
    );
}

// Student Type based on Prisma selection - Minimal for search
type Student = {
    id: number;
    name: string;
    phone: string;
    course: string;
    enrollmentId?: string;
};

// Balance Type
type BalanceInfo = {
    totalFee: number;
    paidAmount: number;
    balance: number;
    studentName: string;
} | null;

export default function NewPaymentPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [amount, setAmount] = useState("");
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            setIsSearching(true);
            const data = await searchStudents(query);
            setResults(data);
            setIsSearching(false);
        }, 300);

        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [query]);

    const handleSelect = async (student: Student) => {
        setSelectedStudent(student);
        setQuery("");
        setResults([]);
        // Fetch Balance
        const info = await getStudentBalance(student.id);
        setBalanceInfo(info);
    };

    const clearSelection = () => {
        setSelectedStudent(null);
        setBalanceInfo(null);
        setQuery("");
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-5xl font-semibold text-foreground uppercase italic px-2 tracking-tight">
                        TRANSACTION<span className="text-primary tracking-normal font-medium not-italic ml-2">ENTRY</span>
                    </h2>
                    <p className="text-xs text-primary/60 uppercase tracking-[0.2em] font-medium px-2 mt-2">Terminal Node: Payment.v3</p>
                </div>
                <Link href="/dashboard/payments">
                    <Button variant="outline" size="sm" className="border-primary/20 text-primary hover:bg-primary/5">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Form */}
                <div className="md:col-span-2">
                    <Card className="glass border border-primary/10">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-6">
                            <CardTitle className="text-2xl font-black uppercase tracking-tight text-slate-800">Transaction Matrix</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 pt-0">
                            <form action={async (formData) => { await createPayment(formData) }} className="space-y-6">
                                {/* Student Search Section */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Find Student</label>

                                    {!selectedStudent ? (
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Search by Name, Phone, or Enrollment ID..."
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                className="pl-9"
                                            />
                                            {results.length > 0 && (
                                                <div className="absolute z-20 mt-2 w-full glass rounded-xl border border-slate-200 shadow-cyber max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                                    <ul className="divide-y divide-slate-100">
                                                        {results.map((student) => (
                                                            <li
                                                                key={student.id}
                                                                onClick={() => handleSelect(student)}
                                                                className="flex cursor-pointer flex-col p-4 hover:bg-primary/5 transition-colors"
                                                            >
                                                                <span className="font-bold text-lg text-foreground uppercase tracking-tight">
                                                                    {student.name}
                                                                    {student.enrollmentId && <span className="ml-2 text-primary/60 text-xs text-glow">({student.enrollmentId})</span>}
                                                                </span>
                                                                <span className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                                                                    {student.phone} <span className="mx-2 text-primary/30">|</span> {student.course}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {isSearching && (
                                                <div className="absolute right-3 top-2.5 text-xs text-slate-400">Searching...</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between rounded-lg border border-primary/10 bg-primary/5 p-5 group hover:bg-primary/10 transition-colors">
                                            <div>
                                                <div className="font-semibold text-xl text-foreground uppercase tracking-tight">{selectedStudent.name}</div>
                                                <div className="text-xs text-primary/60 uppercase tracking-widest font-medium mt-2">
                                                    ID: {selectedStudent.id.toString().padStart(6, '0')} <span className="mx-3 opacity-30">|</span> {selectedStudent.phone}
                                                </div>
                                                <input type="hidden" name="studentId" value={selectedStudent.id} />
                                            </div>
                                            <Button type="button" variant="ghost" size="sm" onClick={clearSelection} className="hover:bg-rose-500/20">
                                                <X className="h-4 w-4 text-rose-400" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Fields */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Amount to Pay (₹)</label>
                                        <Input
                                            type="number"
                                            name="amount"
                                            placeholder="0.00"
                                            min="0"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Payment Mode</label>
                                        <select
                                            name="mode"
                                            className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-300"
                                            value={paymentMode}
                                            onChange={(e) => setPaymentMode(e.target.value)}
                                            required
                                        >
                                            <option value="Cash">Cash</option>
                                            <option value="UPI">UPI</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Next Payment Due Date (Optional)</label>
                                        <Input
                                            type="date"
                                            name="nextPaymentDate"
                                            className="w-full h-11"
                                        />
                                    </div>
                                </div>

                                {/* UPI QR Code Section */}
                                {paymentMode === "UPI" && amount && parseFloat(amount) > 0 && (
                                    <div className="flex flex-col items-center justify-center p-8 glass rounded-2xl border border-primary/10 animate-in fade-in zoom-in duration-500 shadow-cyber">
                                        <div className="relative group p-2">
                                            <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full group-hover:bg-primary/10 transition-all duration-700" />
                                            <div className="relative bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=srivarshanabmg2008-1@okaxis&pn=CSC&am=${amount}&cu=INR`)}`}
                                                    alt="UPI QR Code"
                                                    className="w-44 h-44"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-center space-y-2 mt-6">
                                            <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">Ready for Verification</p>
                                            <p className="text-2xl font-black text-foreground">₹{parseFloat(amount).toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-500 font-bold italic">Merchant ID: srivarshanabmg2008-1@okaxis</p>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <SubmitButton disabled={!selectedStudent} />
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: EMI Info */}
                <div className="md:col-span-1">
                    {balanceInfo && (
                        <Card className="glass border-2 border-primary/20 shadow-[0_0_150px_-30px_rgba(29,78,216,0.5)] sticky top-6 overflow-hidden transition-all duration-700">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                            <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
                                <CardTitle className="text-foreground flex items-center gap-2 text-sm tracking-widest">
                                    <IndianRupee className="h-4 w-4 text-primary shadow-glow" />
                                    LEDGER SUMMARY
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-8">
                                <div className="space-y-1">
                                    <div className="text-sm uppercase tracking-widest text-slate-400 font-medium mb-1">Total Course Fee</div>
                                    <div className="text-4xl font-medium text-foreground tracking-tight">₹{balanceInfo.totalFee.toLocaleString()}</div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-bold">Recovered Assets</p>
                                    <p className="text-2xl font-black text-primary">₹{balanceInfo.paidAmount.toLocaleString()}</p>
                                </div>
                                <div className="pt-6 border-t border-slate-100">
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-black">Balance Due</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-foreground text-glow text-primary/80">₹{balanceInfo.balance.toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-500 font-bold ml-2">IDR.v4</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {!balanceInfo && selectedStudent && (
                        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                            Loading Fee Info...
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
