"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardFilterProps {
    branches: { id: string; name: string }[];
}

export function DashboardFilter({ branches }: DashboardFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentBranch = searchParams.get("branchId") || "all";

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value === "all") {
            params.delete("branchId");
        } else {
            params.set("branchId", value);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">

            <Select value={currentBranch} onValueChange={handleValueChange}>
                <SelectTrigger className="w-[200px] h-8 text-xs font-bold uppercase tracking-wider bg-white">
                    <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all" className="text-xs font-bold uppercase tracking-wider">All Branches</SelectItem>
                    {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id} className="text-xs font-medium uppercase tracking-wider">
                            {branch.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
