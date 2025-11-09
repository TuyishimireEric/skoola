





// @/app/(dashboard)/courses/[id]/performance/manage/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
    Search,
    Save,
    ArrowLeft,
    Loader2,
    AlertTriangle,
    RefreshCw,
    Filter,
    BookOpen,
    Award,
    TrendingUp,
    CheckCircle,
    Calculator,
    Download,
    ChevronDown,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useStudents } from "@/hooks/user/useStudents";
import { useQuery } from "@tanstack/react-query";
import { CoursePerformanceDataI } from "@/types/Course";

interface PerformanceRecord {
    studentId: string;
    assignment1: number | null;
    assignment2: number | null;
    cat: number | null;
    exam: number | null;
    total: number | null;
    grade: string | null;
    remarks: string;
    recordId?: string;
}

interface Student {
    id: string;
    fullName: string;
    grade: string;
    avatar?: string;
}

const ManagePerformancePage: React.FC = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const courseId = params.id as string;

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedGrade, setSelectedGrade] = useState<string>("all");
    const [showFilters, setShowFilters] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState<string>(
        searchParams.get("term") || "Term 1"
    );
    const [selectedYear, setSelectedYear] = useState<string>(
        searchParams.get("year") || "2024/2025"
    );

    // Refs for tracking
    const isInitialMount = useRef(true);
    const previousTermRef = useRef<string>(selectedTerm);
    const previousYearRef = useRef<string>(selectedYear);

    const [page] = useState<number>(1);
    const [pageSize] = useState<number>(100);
    const [sortBy] = useState<string>("name");
    const [sortOrder] = useState<string>("asc");
    const [activeOnly] = useState<boolean>(true);

    // Fetch course details
    const {
        data: courseData,
        isLoading: isLoadingCourse,
        isError: isCourseError,
    } = useQuery({
        queryKey: ["course", courseId],
        queryFn: async () => {
            const response = await fetch(`/api/games/${courseId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch course");
            }
            return response.json();
        },
        enabled: !!courseId,
    });

    const course = courseData?.data;
    const courseGrade = course?.Grade || "";

    // Fetch students for this grade
    const {
        data: studentsData,
        isLoading: isLoadingStudents,
        isError: isStudentsError,
        refetch: refetchStudents,
    } = useStudents({
        page,
        pageSize,
        searchText: searchQuery,
        sort: sortBy,
        order: sortOrder,
        activeOnly,
        grade: "",
    });

    // Fetch existing performance
    const {
        data: performanceData,
        isLoading: isLoadingPerformance,
        isError: isPerformanceError,
        refetch: refetchPerformance,
        isFetching: isFetchingPerformance,
    } = useQuery({
        queryKey: ["coursePerformance", courseId, selectedTerm, selectedYear],
        queryFn: async () => {
            const params = new URLSearchParams({
                term: selectedTerm,
                academicYear: selectedYear,
            });

            const response = await fetch(
                `/api/courses/${courseId}/performance?${params.toString()}`
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch performance");
            }

            return response.json();
        },
        staleTime: 30000,
        enabled: !!courseId && !!selectedTerm && !!selectedYear,
    });

    // FIXED: Performance state with correct syntax
    const [performanceRecords, setPerformanceRecords] = useState<Map<string, PerformanceRecord>>(new Map());

    const students: Student[] = studentsData?.students || [];
    const existingPerformance: CoursePerformanceDataI[] = performanceData?.data || [];

    const grades = [
        "all",
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
    ];
    const terms = ["Term 1", "Term 2", "Term 3"];
    const academicYears = ["2024/2025", "2023/2024", "2022/2023"];

    // Remove duplicate students
    const uniqueStudents = useMemo(() => {
        if (!students || students.length === 0) return [];

        const studentMap = new Map<string, Student>();

        students.forEach((student) => {
            if (!studentMap.has(student.id)) {
                studentMap.set(student.id, student);
            }
        });

        return Array.from(studentMap.values());
    }, [students]);

    // Filter students
    const filteredStudents = useMemo(() => {
        return uniqueStudents.filter((student) => {
            const matchesSearch = student.fullName
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [uniqueStudents, searchQuery]);

    // Load existing performance records
    useEffect(() => {
        const termChanged = previousTermRef.current !== selectedTerm;
        const yearChanged = previousYearRef.current !== selectedYear;

        if (termChanged || yearChanged) {
            previousTermRef.current = selectedTerm;
            previousYearRef.current = selectedYear;
        }

        if (isLoadingPerformance || isFetchingPerformance) {
            return;
        }

        if (isInitialMount.current) {
            isInitialMount.current = false;

            if (existingPerformance && existingPerformance.length > 0) {
                const newRecords = new Map<string, PerformanceRecord>();

                existingPerformance.forEach((record) => {
                    newRecords.set(record.StudentId, {
                        studentId: record.StudentId,
                        assignment1: record.Assignment1 ?? null,
                        assignment2: record.Assignment2 ?? null,
                        cat: record.CAT ?? null,
                        exam: record.Exam ?? null,
                        total: record.Total ?? null,
                        grade: record.Grade ?? null,
                        remarks: record.Remarks || "",
                        recordId: record.Id,
                    });
                });

                setPerformanceRecords(newRecords);
                setHasUnsavedChanges(false);
            }
            return;
        }

        const newRecords = new Map<string, PerformanceRecord>();

        if (existingPerformance && existingPerformance.length > 0) {
            existingPerformance.forEach((record) => {
                newRecords.set(record.StudentId, {
                    studentId: record.StudentId,
                    assignment1: record.Assignment1 ?? null,
                    assignment2: record.Assignment2 ?? null,
                    cat: record.CAT ?? null,
                    exam: record.Exam ?? null,
                    total: record.Total ?? null,
                    grade: record.Grade ?? null,
                    remarks: record.Remarks || "",
                    recordId: record.Id,
                });
            });
        }

        const recordsChanged =
            newRecords.size !== performanceRecords.size ||
            Array.from(newRecords.keys()).some((key) => {
                const newRecord = newRecords.get(key);
                const oldRecord = performanceRecords.get(key);
                return (
                    !oldRecord ||
                    oldRecord.assignment1 !== newRecord?.assignment1 ||
                    oldRecord.assignment2 !== newRecord?.assignment2 ||
                    oldRecord.cat !== newRecord?.cat ||
                    oldRecord.exam !== newRecord?.exam
                );
            });

        if (recordsChanged) {
            setPerformanceRecords(newRecords);
            setHasUnsavedChanges(false);
        }
    }, [
        existingPerformance,
        selectedTerm,
        selectedYear,
        isLoadingPerformance,
        isFetchingPerformance,
        performanceRecords,
    ]);

    // Helper functions
    const getInitials = (name: string): string => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Calculate total and grade
    const calculatePerformance = (
        assignment1: number | null,
        assignment2: number | null,
        cat: number | null,
        exam: number | null
    ): { total: number | null; grade: string | null } => {
        const scores = [assignment1, assignment2, cat, exam].filter(
            (score): score is number => score !== null && score !== undefined
        );

        if (scores.length === 0) {
            return { total: null, grade: null };
        }

        const total = scores.reduce((sum, score) => sum + score, 0) / scores.length;

        let grade = "F";
        if (total >= 90) grade = "A";
        else if (total >= 80) grade = "B";
        else if (total >= 70) grade = "C";
        else if (total >= 60) grade = "D";
        else if (total >= 50) grade = "E";

        return { total: Math.round(total * 100) / 100, grade };
    };

    // Update performance score
    const updateScore = (
        studentId: string,
        field: "assignment1" | "assignment2" | "cat" | "exam",
        value: string
    ) => {
        const newRecords = new Map(performanceRecords);
        const existing: PerformanceRecord = newRecords.get(studentId) || {
            studentId,
            assignment1: null,
            assignment2: null,
            cat: null,
            exam: null,
            total: null,
            grade: null,
            remarks: "",
        };

        const numValue = value === "" ? null : parseFloat(value);

        // Validate score is between 0 and 100
        if (numValue !== null && (numValue < 0 || numValue > 100)) {
            return;
        }

        const updated: PerformanceRecord = { ...existing, [field]: numValue };

        // Calculate total and grade
        const { total, grade } = calculatePerformance(
            updated.assignment1,
            updated.assignment2,
            updated.cat,
            updated.exam
        );

        updated.total = total;
        updated.grade = grade;

        newRecords.set(studentId, updated);
        setPerformanceRecords(newRecords);
        setHasUnsavedChanges(true);
    };

    // Update remarks
    const updateRemarks = (studentId: string, remarks: string) => {
        const newRecords = new Map(performanceRecords);
        const existing: PerformanceRecord = newRecords.get(studentId) || {
            studentId,
            assignment1: null,
            assignment2: null,
            cat: null,
            exam: null,
            total: null,
            grade: null,
            remarks: "",
        };

        newRecords.set(studentId, { ...existing, remarks });
        setPerformanceRecords(newRecords);
        setHasUnsavedChanges(true);
    };

    // Get performance for a student
    const getPerformance = (studentId: string): PerformanceRecord => {
        return (
            performanceRecords.get(studentId) || {
                studentId,
                assignment1: null,
                assignment2: null,
                cat: null,
                exam: null,
                total: null,
                grade: null,
                remarks: "",
            }
        );
    };

    // Get grade color
    const getGradeColor = (grade: string | null): string => {
        switch (grade) {
            case "A":
                return "text-green-600 bg-green-50";
            case "B":
                return "text-blue-600 bg-blue-50";
            case "C":
                return "text-yellow-600 bg-yellow-50";
            case "D":
                return "text-orange-600 bg-orange-50";
            case "E":
                return "text-red-600 bg-red-50";
            case "F":
                return "text-red-700 bg-red-100";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    // Calculate statistics
    const stats = useMemo(() => {
        const total = filteredStudents.length;
        let recorded = 0;
        let avgTotal = 0;
        const gradeDistribution: Record<string, number> = {
            A: 0,
            B: 0,
            C: 0,
            D: 0,
            E: 0,
            F: 0,
        };

        filteredStudents.forEach((student) => {
            const performance = getPerformance(student.id);
            if (
                performance.assignment1 !== null ||
                performance.assignment2 !== null ||
                performance.cat !== null ||
                performance.exam !== null
            ) {
                recorded++;
                if (performance.total !== null) {
                    avgTotal += performance.total;
                }
                if (performance.grade && performance.grade in gradeDistribution) {
                    gradeDistribution[performance.grade]++;
                }
            }
        });

        return {
            total,
            recorded,
            unrecorded: total - recorded,
            avgTotal: recorded > 0 ? Math.round((avgTotal / recorded) * 100) / 100 : 0,
            gradeDistribution,
        };
    }, [filteredStudents, performanceRecords]);

    // Save performance
    const handleSavePerformance = async () => {
        if (stats.recorded === 0) {
            alert("Please record performance for at least one student");
            return;
        }

        setIsSaving(true);

        const performances = Array.from(performanceRecords.values())
            .filter(
                (record: PerformanceRecord) =>
                    record.assignment1 !== null ||
                    record.assignment2 !== null ||
                    record.cat !== null ||
                    record.exam !== null
            )
            .map((record: PerformanceRecord) => ({
                StudentId: record.studentId,
                Assignment1: record.assignment1,
                Assignment2: record.assignment2,
                CAT: record.cat,
                Exam: record.exam,
                Remarks: record.remarks || undefined,
            }));

        const payload = {
            Term: selectedTerm,
            AcademicYear: selectedYear,
            Performances: performances,
        };

        try {
            const response = await fetch(`/api/courses/${courseId}/performance`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to save performance");
            }

            alert(result.message || "Performance saved successfully!");
            setHasUnsavedChanges(false);

            // Refresh performance data
            await refetchPerformance();
        } catch (error) {
            console.error("Error saving performance:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to save performance. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    };

    // Handle term/year change
    const handleTermYearChange = (): boolean => {
        if (hasUnsavedChanges) {
            if (
                !confirm(
                    "You have unsaved changes. Are you sure you want to change the term/year?"
                )
            ) {
                return false;
            }
        }
        refetchPerformance();
        return true;
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = [
            "Student Name",
            "Grade",
            "Assignment 1",
            "Assignment 2",
            "CAT",
            "Exam",
            "Total",
            "Grade",
            "Remarks",
        ];

        const rows = filteredStudents.map((student) => {
            const performance = getPerformance(student.id);
            return [
                student.fullName,
                student.grade || "",
                performance.assignment1 !== null ? performance.assignment1.toString() : "",
                performance.assignment2 !== null ? performance.assignment2.toString() : "",
                performance.cat !== null ? performance.cat.toString() : "",
                performance.exam !== null ? performance.exam.toString() : "",
                performance.total !== null ? performance.total.toString() : "",
                performance.grade || "",
                performance.remarks || "",
            ];
        });

        const csvContent = [
            headers.join(","),
            ...rows.map((row) =>
                row.map((cell) => `"${cell}"`).join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `${course?.Title}_${selectedTerm}_${selectedYear}_Performance.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Quick fill all scores
    const fillAllScores = (
        field: "assignment1" | "assignment2" | "cat" | "exam",
        value: number
    ) => {
        const newRecords = new Map(performanceRecords);

        filteredStudents.forEach((student) => {
            const existing: PerformanceRecord = newRecords.get(student.id) || {
                studentId: student.id,
                assignment1: null,
                assignment2: null,
                cat: null,
                exam: null,
                total: null,
                grade: null,
                remarks: "",
            };

            const updated: PerformanceRecord = { ...existing, [field]: value };

            // Calculate total and grade
            const { total, grade } = calculatePerformance(
                updated.assignment1,
                updated.assignment2,
                updated.cat,
                updated.exam
            );

            updated.total = total;
            updated.grade = grade;

            newRecords.set(student.id, updated);
        });

        setPerformanceRecords(newRecords);
        setHasUnsavedChanges(true);
    };

    // Clear all performance
    const clearAllPerformance = () => {
        setPerformanceRecords(new Map());
        setHasUnsavedChanges(true);
    };

    const isLoading = isLoadingCourse || isLoadingStudents || isLoadingPerformance;
    const isError = isCourseError || isStudentsError || isPerformanceError;

    // Quick Actions Component
    const QuickActions: React.FC = () => {
        const [showActions, setShowActions] = useState<boolean>(false);
        const [fillField, setFillField] = useState<"assignment1" | "assignment2" | "cat" | "exam">("assignment1");
        const [fillValue, setFillValue] = useState<number>(0);

        return (
            <div className="relative">
                <button
                    onClick={() => setShowActions(!showActions)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Quick Actions
                    <ChevronDown
                        className={`w-4 h-4 transition-transform ${showActions ? "rotate-180" : ""
                            }`}
                    />
                </button>

                {showActions && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowActions(false)}
                        />
                        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                Bulk Fill
                            </h4>

                            <div className="space-y-3 mb-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Field
                                    </label>
                                    <select
                                        value={fillField}
                                        onChange={(e) =>
                                            setFillField(
                                                e.target.value as "assignment1" | "assignment2" | "cat" | "exam"
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="assignment1">Assignment 1</option>
                                        <option value="assignment2">Assignment 2</option>
                                        <option value="cat">CAT</option>
                                        <option value="exam">Exam</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Value (0-100)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={fillValue}
                                        onChange={(e) =>
                                            setFillValue(parseFloat(e.target.value) || 0)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        fillAllScores(fillField, fillValue);
                                        setShowActions(false);
                                    }}
                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                >
                                    Fill All Students
                                </button>
                            </div>

                            <div className="pt-3 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        if (
                                            confirm(
                                                "Are you sure you want to clear all performance data?"
                                            )
                                        ) {
                                            clearAllPerformance();
                                            setShowActions(false);
                                        }
                                    }}
                                    className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    // Rest of the component (UI) remains exactly the same...
    // [Continue with the JSX from the previous version]

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Failed to load data
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        {isCourseError
                            ? "Failed to load course"
                            : isStudentsError
                                ? "Failed to load students"
                                : "Failed to load performance"}
                    </p>
                    <button
                        onClick={() => {
                            refetchStudents();
                            refetchPerformance();
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen max-w-7xl mx-auto">
            <div className="mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <Link
                            href={`/courses/${courseId}`}
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Course
                        </Link>
                        <div>
                            <p className="text-base text-gray-600 mt-1 font-bold">
                                {course?.Title} - {course?.Grade}
                            </p>
                        </div>

                        {/* Term and Year Selectors */}
                        <div className="flex items-center gap-3">
                            <div>
                                <select
                                    value={selectedTerm}
                                    onChange={(e) => {
                                        const canChange = handleTermYearChange();
                                        if (canChange) {
                                            setSelectedTerm(e.target.value);
                                        }
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    {terms.map((term) => (
                                        <option key={term} value={term}>
                                            {term}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => {
                                        const canChange = handleTermYearChange();
                                        if (canChange) {
                                            setSelectedYear(e.target.value);
                                        }
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    {academicYears.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => refetchPerformance()}
                                disabled={isFetchingPerformance}
                                className=" p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw
                                    className={`w-4 h-4 text-gray-600 ${isFetchingPerformance ? "animate-spin" : ""
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {hasUnsavedChanges && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-800">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="text-sm">
                                You have unsaved changes. Don't forget to save!
                            </span>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Recorded</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.recorded}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Unrecorded</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {stats.unrecorded}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                                <Calculator className="w-6 h-6 text-yellow-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Average</p>
                                <p className="text-text-2xl font-bold text-purple-600">
                                    {stats.avgTotal}%
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grade Distribution */}
                {stats.recorded > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Grade Distribution
                        </h3>
                        <div className="grid grid-cols-6 gap-3">
                            {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                                <div
                                    key={grade}
                                    className={`p-3 rounded-lg text-center ${getGradeColor(grade)}`}
                                >
                                    <p className="text-2xl font-bold">{count}</p>
                                    <p className="text-xs font-medium">Grade {grade}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="relative flex-1 w-full lg:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search students by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                                {selectedGrade !== "all" && (
                                    <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                        1
                                    </span>
                                )}
                            </button>

                            <QuickActions />

                            <button
                                onClick={exportToCSV}
                                disabled={filteredStudents.length === 0}
                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>

                            <button
                                onClick={handleSavePerformance}
                                disabled={
                                    isSaving || stats.recorded === 0 || !hasUnsavedChanges
                                }
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Performance
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Grade
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {grades.map((gradeOption) => (
                                    <button
                                        key={gradeOption}
                                        onClick={() => setSelectedGrade(gradeOption)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectedGrade === gradeOption
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {gradeOption === "all" ? "All Grades" : gradeOption}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">
                            {isLoadingCourse
                                ? "Loading course..."
                                : isLoadingPerformance
                                    ? "Loading performance records..."
                                    : "Loading students..."}
                        </p>
                    </div>
                )}

                {/* Performance Table */}
                {!isLoading && (
                    <div className="max-w-7xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                        <table className="w-full max-w-7xl">
                            <thead className=" bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left p-4 text-xs font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[160px]">
                                        Student Name
                                    </th>
                                    <th className="text-center p-4 text-xs font-semibold text-gray-700 min-w-[100px]">
                                        Assignment 1
                                        <br />
                                    </th>
                                    <th className="text-center p-4 text-xs font-semibold text-gray-700 min-w-[100px]">
                                        Assignment 2
                                        <br />
                                    </th>
                                    <th className="text-center p-4 text-xs font-semibold text-gray-700 min-w-[100px]">
                                        CAT
                                        <br />
                                    </th>
                                    <th className="text-center p-4 text-xs font-semibold text-gray-700 min-w-[100px]">
                                        Exam
                                        <br />
                                    </th>
                                    <th className="text-center p-4 text-xs font-semibold text-gray-700 min-w-[100px]">
                                        Total
                                    </th>
                                    <th className="text-center p-4 text-xs font-semibold text-gray-700 min-w-[80px]">
                                        Grade
                                    </th>
                                    <th className="text-left p-4 text-xs font-semibold text-gray-700 min-w-[140px]">
                                        Remarks
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredStudents.map((student) => {
                                    const performance = getPerformance(student.id);
                                    const displayAvatar =
                                        student.avatar || getInitials(student.fullName);

                                    return (
                                        <tr
                                            key={student.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="p-4 sticky left-0 bg-white z-10">
                                                <div className="flex items-center gap-3">
                                                    {student.avatar ? (
                                                        <img
                                                            src={student.avatar}
                                                            alt={student.fullName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                                                            {displayAvatar}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-sm text-gray-900">
                                                            {student.fullName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {student.grade || "No Grade"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Assignment 1 */}
                                            <td className="p-4">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={
                                                        performance.assignment1 !== null
                                                            ? performance.assignment1
                                                            : ""
                                                    }
                                                    onChange={(e) =>
                                                        updateScore(
                                                            student.id,
                                                            "assignment1",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="0-100"
                                                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </td>

                                            {/* Assignment 2 */}
                                            <td className="p-4">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={
                                                        performance.assignment2 !== null
                                                            ? performance.assignment2
                                                            : ""
                                                    }
                                                    onChange={(e) =>
                                                        updateScore(
                                                            student.id,
                                                            "assignment2",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="0-100"
                                                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </td>

                                            {/* CAT */}
                                            <td className="p-4">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={
                                                        performance.cat !== null ? performance.cat : ""
                                                    }
                                                    onChange={(e) =>
                                                        updateScore(student.id, "cat", e.target.value)
                                                    }
                                                    placeholder="0-100"
                                                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </td>

                                            {/* Exam */}
                                            <td className="p-4">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={
                                                        performance.exam !== null ? performance.exam : ""
                                                    }
                                                    onChange={(e) =>
                                                        updateScore(student.id, "exam", e.target.value)
                                                    }
                                                    placeholder="0-100"
                                                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </td>

                                            {/* Total */}
                                            <td className="p-4 text-center">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {performance.total !== null
                                                        ? `${performance.total}%`
                                                        : "-"}
                                                </span>
                                            </td>

                                            {/* Grade */}
                                            <td className="p-4 text-center">
                                                {performance.grade ? (
                                                    <span
                                                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${getGradeColor(
                                                            performance.grade
                                                        )}`}
                                                    >
                                                        {performance.grade}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>

                                            {/* Remarks */}
                                            <td className="p-4">
                                                <input
                                                    type="text"
                                                    value={performance.remarks}
                                                    onChange={(e) =>
                                                        updateRemarks(student.id, e.target.value)
                                                    }
                                                    placeholder="Add remarks..."
                                                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredStudents.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No students found
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search or filters
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedGrade("all");
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Help Text */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-900">
                            <p className="font-medium mb-1">Grading System</p>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
                                <div>
                                    <span className="font-semibold">A:</span> 90-100%
                                </div>
                                <div>
                                    <span className="font-semibold">B:</span> 80-89%
                                </div>
                                <div>
                                    <span className="font-semibold">C:</span> 70-79%
                                </div>
                                <div>
                                    <span className="font-semibold">D:</span> 60-69%
                                </div>
                                <div>
                                    <span className="font-semibold">E:</span> 50-59%
                                </div>
                                <div>
                                    <span className="font-semibold">F:</span> Below 50%
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-blue-700">
                                Total is calculated as the average of all entered scores. You
                                can enter any combination of scores. Use Quick Actions to fill
                                all students with the same value.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagePerformancePage;