import { Sidebar } from "@/components/Sidebar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { GET } from "@/app/api/auth/[...nextauth]/route";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(GET);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative z-10 mx-auto max-w-7xl">{children}</div>
            </main>
        </div>
    );
}
