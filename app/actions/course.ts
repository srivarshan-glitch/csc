"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const CourseSchema = z.object({
    name: z.string().min(1, "Course name is required").transform(val => val.trim()),
    fees: z.number().min(0, "Fees must be at least 0"),
    duration: z.string().optional().transform(val => val?.trim() || ""),
});

export async function createCourse(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const rawData = {
        name: formData.get("name"),
        fees: parseFloat(formData.get("fees") as string || "0"),
        duration: formData.get("duration"),
    };

    const validated = CourseSchema.safeParse(rawData);

    if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors };
    }

    try {
        await db.course.create({
            data: {
                name: validated.data.name,
                fees: validated.data.fees,
                duration: validated.data.duration,
                userId: session.user.id,
            },
        });
    } catch (error: any) {
        console.error("CREATE_COURSE_ERROR:", error);
        if (error.code === 'P2002') {
            return { error: "A course with this name already exists in your branch. Please use a unique name." };
        }
        if (error.code === 'P2003') {
            return { error: "Session expired or database reset. Please Log Out and Log In again to continue." };
        }
        return { error: "An unexpected error occurred while creating the course." };
    }

    revalidatePath("/dashboard/courses");
    revalidatePath("/dashboard/students/new");
}

export async function updateCourse(id: number, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const rawData = {
        name: formData.get("name"),
        fees: parseFloat(formData.get("fees") as string || "0"),
        duration: formData.get("duration"),
    };

    const validated = CourseSchema.safeParse(rawData);

    if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors };
    }

    try {
        await db.course.update({
            where: { id, userId: session.user.id },
            data: {
                name: validated.data.name,
                fees: validated.data.fees,
                duration: validated.data.duration,
            },
        });
    } catch (error: any) {
        console.error("UPDATE_COURSE_ERROR:", error);
        if (error.code === 'P2002') {
            return { error: "Another course with this name already exists in your branch." };
        }
        return { error: "An unexpected error occurred while updating the course." };
    }

    revalidatePath("/dashboard/courses");
    revalidatePath("/dashboard/students/new");
}

export async function deleteCourse(id: number) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        await db.course.delete({
            where: {
                id,
                userId: session.user.id
            }
        });
        revalidatePath("/dashboard/courses");
        revalidatePath("/dashboard/students/new");
    } catch (error) {
        console.error("DELETE_COURSE_ERROR:", error);
        return { error: "An unexpected error occurred while deleting the course." };
    }
}

export async function getCourses() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return [];
    }

    try {
        return await db.course.findMany({
            where: { userId: session.user.id },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("GET_COURSES_ERROR:", error);
        return [];
    }
}
