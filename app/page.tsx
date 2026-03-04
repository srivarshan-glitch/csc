import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { GET } from "@/app/api/auth/[...nextauth]/route";

export default async function Home() {
    const session = await getServerSession(GET);

    if (session) {
        redirect("/dashboard");
    } else {
        redirect("/login");
    }
}
