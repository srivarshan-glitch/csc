import { db } from "@/lib/db";
import { getCourses } from "@/app/actions/course";
import { CourseManager } from "@/components/CourseManager";

export default async function CoursesPage() {
    const courses = await getCourses();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-foreground">
                    Course Management
                </h2>
                <div className="h-1 w-20 bg-primary rounded-full" />
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mt-2">Module Registry v1.3.0</p>
            </div>

            <CourseManager initialCourses={courses} />
        </div>
    );
}
