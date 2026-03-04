"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

interface ReportsClientProps {
    revenueData: { month: string; amount: number }[];
    modeData: { name: string; value: number }[];
}

const COLORS = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa"];

export default function ReportsClient({ revenueData, modeData }: ReportsClientProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="border-primary/10 overflow-hidden text-foreground">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-400">Monthly Revenue Stream</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(29, 78, 216, 0.1)" />
                                    <XAxis
                                        dataKey="month"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: 'rgba(100, 116, 139, 0.6)' }}
                                    />
                                    <YAxis
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₹${value}`}
                                        tick={{ fill: 'rgba(100, 116, 139, 0.6)' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(29, 78, 216, 0.05)' }}
                                        formatter={(value: any) => [`₹${value}`, 'Amount']}
                                        contentStyle={{
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(12px)',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.1)'
                                        }}
                                        itemStyle={{ color: '#1d4ed8' }}
                                    />
                                    <Bar dataKey="amount" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-primary/10 overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-400">Payment Mode Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={modeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="white"
                                        strokeWidth={2}
                                    >
                                        {modeData.map((entry, index) => {
                                            let color = "#cbd5e1"; // Default Slate
                                            const name = entry.name.toUpperCase();
                                            if (name === "UPI") color = "#34d399"; // Smoother/Pastel Green
                                            if (name === "CASH") color = "#60a5fa"; // Smoother/Pastel Blue

                                            return <Cell key={`cell-${index}`} fill={color} fillOpacity={1} />;
                                        })}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(12px)',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(29, 78, 216, 0.2)',
                                            color: '#020617',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.1)'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value) => <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{value}</span>}
                                        iconType="circle"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
