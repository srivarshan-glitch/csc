"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const StudentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    enrollmentId: z.string().optional(),
    fatherName: z.string().min(1, "Father Name is required"),
    fatherOccupation: z.string().optional(),
    dob: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "DOB must be DD/MM/YYYY"),
    address: z.string().min(1, "Address is required"),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
    phone: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    caste: z.string().optional(), // Kept for back-compat
    whatsapp: z.string().optional(),
    course: z.string().min(1, "Course is required"),
    gender: z.enum(["Male", "Female", "Others"]),
    aadhar: z.string().regex(/^\d{12}$/, "Aadhar must be 12 digits"),
    religion: z.string().min(1, "Religion is required"),
    community: z.string().min(1, "Community is required"),
    qualification: z.string().min(1, "Qualification is required"),
    employmentStatus: z.string().min(1, "Status is required"),
    income: z.coerce.number().min(0, "Income must be a number"),
    reason: z.string().min(1, "Reason is required"),
    source: z.string().min(1, "Source is required"),
    totalFee: z.coerce.number().min(0, "Total Fee must be positive"),
});

export async function createStudent(prevState: any, formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());

    const validatedFields = StudentSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            error: null,
            validationErrors: validatedFields.error.flatten().fieldErrors,
            success: false
        };
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { error: "Unauthorized", success: false };
    }

    try {
        const data = validatedFields.data;
        await db.student.create({
            data: {
                name: data.name,
                enrollmentId: data.enrollmentId || null,
                phone: data.phone,
                email: data.email || null,
                course: data.course,
                // New Fields
                fatherName: data.fatherName,
                fatherOccupation: data.fatherOccupation || null,
                dob: data.dob,
                address: data.address,
                pincode: data.pincode,
                gender: data.gender,
                aadhar: data.aadhar,
                religion: data.religion,
                community: data.community,
                qualification: data.qualification,
                employmentStatus: data.employmentStatus,
                income: data.income,
                reason: data.reason,
                source: data.source,
                totalFee: data.totalFee,
                userId: session.user.id,
            },
        });
    } catch (error) {
        console.error("Database Error:", error);
        // Check for unique constraint violation (Prisma error code P2002)
        if ((error as any).code === 'P2002') {
            return { error: "A student with this Phone Number or Enrollment ID already exists in your branch.", success: false };
        }
        return { error: "Failed to create student. Please try again.", success: false };
    }

    revalidatePath("/dashboard/students");
    redirect("/dashboard/students");
}

export async function deleteStudent(id: number) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await db.student.deleteMany({ // deleteMany allows checking multiple conditions vs findUnique
            where: {
                id,
                userId: session.user.id
            },
        });
        revalidatePath("/dashboard/students");
    } catch (error) {
        return { error: "Failed to delete student" };
    }
}
