"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit2, Plus, X, Check } from "lucide-react";
import { deleteCourse, updateCourse, createCourse } from "@/app/actions/course";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Course {
    id: number;
    name: string;
    fees: number;
    duration: string | null;
}

export function CourseManager({ initialCourses }: { initialCourses: Course[] }) {
    const [courses, setCourses] = useState<Course[]>(initialCourses);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ name: "", fees: "", duration: "" });
    const [isAdding, setIsAdding] = useState(false);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this course?")) return;
        const result = await deleteCourse(id) as any;
        if (result?.error) {
            toast.error(result.error);
        } else {
            setCourses(courses.filter(c => c.id !== id));
            toast.success("Course deleted");
        }
    };

    const startEdit = (course: Course) => {
        setEditingId(course.id);
        setEditForm({
            name: course.name,
            fees: course.fees.toString(),
            duration: course.duration || ""
        });
    };

    const handleUpdate = async (id: number) => {
        const formData = new FormData();
        formData.append("name", editForm.name);
        formData.append("fees", editForm.fees);
        formData.append("duration", editForm.duration);

        const result = await updateCourse(id, formData) as any;
        if (result?.error) {
            toast.error(result.error);
        } else {
            setCourses(courses.map(c => c.id === id ? { ...c, ...editForm, fees: parseFloat(editForm.fees) } : c));
            setEditingId(null);
            toast.success("Course updated");
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Add Course Form */}
            <Card className="border-primary/10 h-fit shadow-card">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold">Add New Course</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <form action={async (formData) => {
                        const result = await createCourse(formData) as any;
                        if (result?.error) {
                            toast.error(result.error);
                        } else {
                            // Since createCourse revalidates, we could just refresh or manually update
                            // For simplicity in this demo, let's suggest a refresh or fetch again
                            window.location.reload();
                            toast.success("Course added");
                        }
                    }} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Course Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Java Full Stack" required className="bg-white border-slate-200" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="fees">Course Fees (₹)</Label>
                                <Input id="fees" name="fees" type="number" placeholder="5000" required className="bg-white border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration</Label>
                                <Input id="duration" name="duration" placeholder="e.g. 6 Months" className="bg-white border-slate-200" />
                            </div>
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12">
                            <Plus className="mr-2 h-4 w-4" /> Add Course
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Course List */}
            <Card className="border-primary/10 shadow-card">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold">Active Courses</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {courses.length > 0 ? (
                        <div className="relative overflow-x-auto rounded-lg border border-slate-100">
                            <table className="w-full text-left text-sm text-slate-500">
                                <thead className="bg-slate-50 text-[10px] uppercase text-primary/80 font-bold tracking-wider">
                                    <tr>
                                        <th className="px-4 py-4 border-b border-slate-100">Designation</th>
                                        <th className="px-4 py-4 border-b border-slate-100">IDR Val</th>
                                        <th className="px-4 py-4 border-b border-slate-100">Horizon</th>
                                        <th className="px-4 py-4 border-b border-slate-100 text-right">Ops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-primary/5 transition-colors group">
                                            <td className="px-4 py-4 font-semibold text-foreground text-lg tracking-tight uppercase">
                                                {editingId === course.id ? (
                                                    <Input
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="h-8 text-sm"
                                                    />
                                                ) : (
                                                    course.name
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-primary font-medium text-lg tracking-tight">
                                                {editingId === course.id ? (
                                                    <Input
                                                        type="number"
                                                        value={editForm.fees}
                                                        onChange={(e) => setEditForm({ ...editForm, fees: e.target.value })}
                                                        className="h-8 text-sm w-24"
                                                    />
                                                ) : (
                                                    `₹${course.fees.toLocaleString()}`
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-xs font-medium text-slate-400 tracking-wider uppercase whitespace-nowrap">
                                                {editingId === course.id ? (
                                                    <Input
                                                        value={editForm.duration}
                                                        onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                                                        className="h-8 text-sm"
                                                    />
                                                ) : (
                                                    course.duration || "N/A"
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {editingId === course.id ? (
                                                        <>
                                                            <Button
                                                                onClick={() => handleUpdate(course.id)}
                                                                variant="ghost" size="sm" className="text-green-600 hover:bg-green-50 h-8 w-8 p-0"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => setEditingId(null)}
                                                                variant="ghost" size="sm" className="text-slate-400 hover:bg-slate-50 h-8 w-8 p-0"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                onClick={() => startEdit(course)}
                                                                variant="ghost" size="sm" className="text-blue-400 hover:text-blue-600 h-8 w-8 p-0 rounded-full"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleDelete(course.id)}
                                                                variant="ghost" size="sm" className="text-rose-400 hover:text-rose-600 h-8 w-8 p-0 rounded-full"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500 text-xs uppercase tracking-widest bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            Course registry is currently empty
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
