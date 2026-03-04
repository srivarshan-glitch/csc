"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const UserSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function createUser(formData: FormData) {
    const session = await getServerSession(authOptions);

    // Only ADMIN can create users (simplification: assume logged in user with 'ADMIN' role is Super Admin)
    // Realistically, all centers might be 'ADMIN' role currently. 
    // We might want to restrict this to specifically 'csc@mmnagar' or add a 'SUPER_ADMIN' role.
    // For now, I'll allow any logged in user to create others (peer-to-peer) or check email.
    if (session?.user?.email !== "csc@srivarshan") {
        return { error: "Unauthorized. Only Super Admin can create centers." };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = UserSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { error: "Invalid input data" };
    }

    const { name, email, password } = validatedFields.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "ADMIN", // All centers are admins of their own data
            },
        });
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        return { error: "Failed to create user. Email might already exist." };
    }
}

export async function deleteUser(id: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.email !== "csc@srivarshan") {
        return { error: "Unauthorized" };
    }

    try {
        await db.user.delete({ where: { id } });
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete user" };
    }
}
