"use client";

import { useState } from "react";
import { createUser } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CreateCenterForm() {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            const result = await createUser(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Center created successfully!");
                // Optional: Reset form or router refresh handled by server action revalidatePath
                const form = document.querySelector('form') as HTMLFormElement;
                if (form) form.reset();
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="border-primary/10 shadow-card h-fit">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
                    <UserPlus className="h-4 w-4" /> Register New Center
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-slate-500">Center Name</label>
                        <Input name="name" placeholder="e.g. CSC Maraimalai Nagar" required className="bg-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-slate-500">Username / Email</label>
                        <Input name="email" type="text" placeholder="e.g. csc@branch or branch@gmail.com" required className="bg-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-slate-500">Password</label>
                        <Input name="password" type="password" placeholder="••••••" required minLength={6} className="bg-white" />
                    </div>
                    <Button type="submit" className="w-full bg-primary font-bold" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                            </>
                        ) : (
                            "Create Center Login"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
