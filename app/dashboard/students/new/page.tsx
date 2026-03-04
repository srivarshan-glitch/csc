"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStudent } from "@/app/actions/student";
import { getCourses } from "@/app/actions/course";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useEffect, useState, useActionState } from "react";
import { motion } from "framer-motion";
import { DateInput } from "@/components/DateInput";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12" disabled={pending}>
            {pending ? "Submitting..." : "Register Student"}
        </Button>
    );
}

// Reusable Section Header
const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-4 mb-6 mt-10 first:mt-0">
        <h3 className="text-sm font-black uppercase tracking-widest text-primary whitespace-nowrap">
            {title}
        </h3>
        <div className="h-px w-full bg-primary/10" />
    </div>
);

export default function NewStudentPage() {
    const [state, formAction] = useActionState(createStudent, {
        error: null,
        success: false,
        validationErrors: {} as Record<string, string[]>
    });
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedFee, setSelectedFee] = useState<number | string>("");

    useEffect(() => {
        getCourses().then(setCourses).catch(console.error);
    }, []);

    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const courseName = e.target.value;
        const course = courses.find(c => c.name === courseName);
        if (course) {
            setSelectedFee(course.fees);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-5xl mx-auto pb-10"
        >
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-5xl font-semibold text-foreground uppercase tracking-tight">
                        Student <span className="text-primary font-medium">Admission</span>
                    </h2>
                    <p className="text-sm text-slate-400 uppercase tracking-widest font-medium mt-2">Registry Core v2.1.0</p>
                </div>
                <Link href="/dashboard/students">
                    <Button variant="outline" size="sm" className="border-primary/20 text-primary hover:bg-primary/5">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Return to Records
                    </Button>
                </Link>
            </div>

            {/* Global Error Message */}
            {state?.error && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center"
                >
                    <span className="font-bold mr-2">Error:</span> {state.error}
                </motion.div>
            )}

            {/* No Courses Warning */}
            {courses.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-4 rounded-md flex items-center justify-between">
                    <div>
                        <span className="font-bold">Notice:</span> No courses found. You must add a course before admitting a student.
                    </div>
                    <Link href="/dashboard/courses">
                        <Button variant="outline" size="sm" className="bg-white border-yellow-300 text-yellow-900 hover:bg-yellow-100">
                            Add Course
                        </Button>
                    </Link>
                </div>
            )}

            <Card className="border border-primary/10">
                <CardHeader className="bg-slate-50 border-b border-primary/10 py-8">
                    <CardTitle className="text-xl font-bold">Registration Form</CardTitle>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Input protocol: Fill mandatory fields marked with *</p>
                </CardHeader>
                <CardContent className="p-10">
                    <form action={formAction}>

                        {/* Personal Details */}
                        <SectionHeader title="Personal Details" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Student Name *</Label>
                                <Input name="name" placeholder="Full Name" className="h-11 focus-visible:ring-primary font-bold" required />
                                {state?.validationErrors?.name && <p className="text-xs text-red-500">{state.validationErrors.name[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Enrollment ID</Label>
                                <Input name="enrollmentId" placeholder="ENR-2024-XXX" className="h-11 focus-visible:ring-primary" />
                                {state?.validationErrors?.enrollmentId && <p className="text-xs text-red-500">{state.validationErrors.enrollmentId[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Father's Name *</Label>
                                <Input name="fatherName" placeholder="Father's Name" className="h-11 focus-visible:ring-violet-500" required />
                                {state?.validationErrors?.fatherName && <p className="text-xs text-red-500">{state.validationErrors.fatherName[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Father's Occupation</Label>
                                <Input name="fatherOccupation" placeholder="Occupation" className="h-11 focus-visible:ring-violet-500" />
                            </div>
                            <div className="space-y-2">
                                <Label>Date of Birth (DD/MM/YYYY) *</Label>
                                <DateInput name="dob" className="h-11 focus-visible:ring-violet-500" required />
                                {state?.validationErrors?.dob && <p className="text-xs text-red-500">{state.validationErrors.dob[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Gender *</Label>
                                <select name="gender" className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-300" required>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Aadhar Number *</Label>
                                <Input name="aadhar" placeholder="12 Digit Aadhar" maxLength={12} className="h-11 focus-visible:ring-primary" required />
                                {state?.validationErrors?.aadhar && <p className="text-xs text-red-500">{state.validationErrors.aadhar[0]}</p>}
                            </div>
                        </div>

                        {/* Contact Details */}
                        <SectionHeader title="Contact Details" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Mobile Number *</Label>
                                <Input name="phone" placeholder="10 Digit Mobile" maxLength={10} className="h-11 focus-visible:ring-primary" required />
                                {state?.validationErrors?.phone && <p className="text-xs text-red-500">{state.validationErrors.phone[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>WhatsApp Number</Label>
                                <Input name="whatsapp" placeholder="10 Digit WhatsApp" maxLength={10} className="h-11 focus-visible:ring-primary" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input name="email" type="email" placeholder="student@example.com" className="h-11 focus-visible:ring-primary" />
                                {state?.validationErrors?.email && <p className="text-xs text-red-500">{state.validationErrors.email[0]}</p>}
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label>Address *</Label>
                                <textarea
                                    name="address"
                                    rows={2}
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                                    placeholder="Full Residential Address"
                                    required
                                />
                                {state?.validationErrors?.address && <p className="text-xs text-red-500">{state.validationErrors.address[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Pincode *</Label>
                                <Input name="pincode" placeholder="6 Digit Pincode" maxLength={6} className="h-11 focus-visible:ring-violet-500" required />
                                {state?.validationErrors?.pincode && <p className="text-xs text-red-500">{state.validationErrors.pincode[0]}</p>}
                            </div>
                        </div>

                        {/* Social & Qualification */}
                        <SectionHeader title="Background Details" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Religion *</Label>
                                <select name="religion" className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-300" required>
                                    <option value="">Select Religion</option>
                                    <option value="Hindu">Hindu</option>
                                    <option value="Christian">Christian</option>
                                    <option value="Muslim">Muslim</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Community *</Label>
                                <select name="community" className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-300" required>
                                    <option value="">Select Community</option>
                                    <option value="BC">BC</option>
                                    <option value="MBC">MBC</option>
                                    <option value="SC">SC</option>
                                    <option value="ST">ST</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Qualification *</Label>
                                <Input name="qualification" placeholder="e.g. 10th, 12th, B.Sc" className="h-11 focus-visible:ring-violet-500" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Are You *</Label>
                                <select name="employmentStatus" className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-300" required>
                                    <option value="">Select Status</option>
                                    <option value="Student">Student</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Unemployed">Unemployed</option>
                                    <option value="Housewife">Housewife</option>
                                    <option value="Businessman">Businessman</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Family Income (Monthly) *</Label>
                                <Input name="income" type="number" placeholder="0.00" min="0" className="h-11 focus-visible:ring-violet-500" required />
                            </div>
                        </div>

                        {/* Course & Fees */}
                        <SectionHeader title="Course & Admission Details" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Select Course *</Label>
                                <select
                                    name="course"
                                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-300"
                                    required
                                    onChange={handleCourseChange}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select a Course</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                                {state?.validationErrors?.course && <p className="text-xs text-red-500">{state.validationErrors.course[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Total Course Fees (₹) *</Label>
                                <Input
                                    name="totalFee"
                                    type="number"
                                    placeholder="Total Fees"
                                    min="0"
                                    className="h-11 focus-visible:ring-primary font-bold text-primary bg-primary/5 border-primary/20"
                                    required
                                    value={selectedFee}
                                    onChange={(e) => setSelectedFee(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                {/* Placeholder for future use, maybe batch timing */}
                            </div>

                            <div className="space-y-2">
                                <Label>Why this Computer Course? *</Label>
                                <select name="reason" className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-300" required>
                                    <option value="">Select Reason</option>
                                    <option value="For a job">For a job</option>
                                    <option value="For additional qualification">For additional qualification</option>
                                    <option value="For gaining knowledge">For gaining knowledge</option>
                                    <option value="Sponsored by a company">Sponsored by a company</option>
                                    <option value="None">None</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>How did you know about CSC? *</Label>
                                <select name="source" className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-300" required>
                                    <option value="">Select Source</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="YouTube">YouTube</option>
                                    <option value="Television">Television</option>
                                    <option value="None">None</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-8">
                            <SubmitButton />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
