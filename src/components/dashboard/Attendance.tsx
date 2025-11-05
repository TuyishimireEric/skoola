// AttendancePage.tsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
    Search,
    Calendar,
    Check,
    X,
    Clock,
    Save,
    ChevronLeft,
    ChevronRight,
    Filter,
    Loader2,
    AlertTriangle,
    RefreshCw,
} from "lucide-react";

import { useStudents } from "@/hooks/user/useStudents";
import { useAttendance } from "@/hooks/attendance/useAttendance";

type AttendanceStatus = "present" | "late" | "absent" | "excused" | null;

interface AttendanceRecord {
    studentId: string;
    status: AttendanceStatus;
    notes: string;
    timestamp: string;
    recordId?: string; // Track if this is an existing record
}

const AttendancePage: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState<string>(today);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedGrade, setSelectedGrade] = useState<string>("all");
    const [showFilters, setShowFilters] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Refs for tracking
    const previousDateRef = useRef<string>(selectedDate);
    const isInitialMount = useRef(true);

    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(100);
    const [sortBy, setSortBy] = useState<string>("name");
    const [sortOrder, setSortOrder] = useState<string>("asc");
    const [activeOnly, setActiveOnly] = useState<boolean>(true);
    const grade = selectedGrade === "all" ? "" : selectedGrade.replace("Grade ", "");

    // Fetch students
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
        grade,
    });

    // Fetch attendance for selected date
    const {
        data: attendanceData,
        isLoading: isLoadingAttendance,
        isError: isAttendanceError,
        refetch: refetchAttendance,
        isFetching: isFetchingAttendance,
    } = useAttendance({
        date: selectedDate,
        grade: grade,
    });

    // Attendance state
    const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceRecord>>(
        new Map()
    );

    const students = studentsData?.students || [];
    const existingAttendance = attendanceData?.data?.attendance || [];
    const attendanceStats = attendanceData?.data?.stats;

    const grades = [
        "all",
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
    ];

    // Remove duplicate students
    const uniqueStudents = useMemo(() => {
        if (!students || students.length === 0) return [];

        const studentMap = new Map();

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

    // Load existing attendance records when data changes
    useEffect(() => {
        // Check if date has changed
        const dateChanged = previousDateRef.current !== selectedDate;

        if (dateChanged) {
            previousDateRef.current = selectedDate;
        }

        // Don't update during loading/fetching
        if (isLoadingAttendance || isFetchingAttendance) {
            return;
        }

        // Skip on initial mount to prevent unnecessary state updates
        if (isInitialMount.current) {
            isInitialMount.current = false;

            // But still load data if exists
            if (existingAttendance && existingAttendance.length > 0) {
                const newRecords = new Map<string, AttendanceRecord>();

                existingAttendance.forEach((record) => {
                    newRecords.set(record.StudentId, {
                        studentId: record.StudentId,
                        status: record.Status,
                        notes: record.Notes || "",
                        timestamp: new Date().toISOString(),
                        recordId: record.Id,
                    });
                });

                setAttendanceRecords(newRecords);
                setHasUnsavedChanges(false);
            }
            return;
        }

        // Update records based on fetched data
        const newRecords = new Map<string, AttendanceRecord>();

        if (existingAttendance && existingAttendance.length > 0) {
            existingAttendance.forEach((record) => {
                newRecords.set(record.StudentId, {
                    studentId: record.StudentId,
                    status: record.Status,
                    notes: record.Notes || "",
                    timestamp: new Date().toISOString(),
                    recordId: record.Id,
                });
            });
        }

        // Only update if records actually changed
        const recordsChanged =
            newRecords.size !== attendanceRecords.size ||
            Array.from(newRecords.keys()).some(key => {
                const newRecord = newRecords.get(key);
                const oldRecord = attendanceRecords.get(key);
                return !oldRecord ||
                    oldRecord.status !== newRecord?.status ||
                    oldRecord.notes !== newRecord?.notes;
            });

        if (recordsChanged) {
            setAttendanceRecords(newRecords);
            setHasUnsavedChanges(false);
        }
    }, [existingAttendance, selectedDate, isLoadingAttendance, isFetchingAttendance]);

    // Helper functions
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const isDateInFuture = (date: string) => {
        return new Date(date) > new Date(today);
    };

    const canEditDate = !isDateInFuture(selectedDate);

    // Update attendance status
    const updateAttendance = (studentId: string, status: AttendanceStatus) => {
        if (!canEditDate) return;

        const newRecords = new Map(attendanceRecords);
        const existing = newRecords.get(studentId);

        newRecords.set(studentId, {
            studentId,
            status,
            notes: existing?.notes || "",
            timestamp: new Date().toISOString(),
            recordId: existing?.recordId,
        });

        setAttendanceRecords(newRecords);
        setHasUnsavedChanges(true);
    };

    // Update attendance notes
    const updateNotes = (studentId: string, notes: string) => {
        if (!canEditDate) return;

        const newRecords = new Map(attendanceRecords);
        const existing = newRecords.get(studentId);

        newRecords.set(studentId, {
            studentId,
            status: existing?.status || null,
            notes,
            timestamp: new Date().toISOString(),
            recordId: existing?.recordId,
        });

        setAttendanceRecords(newRecords);
        setHasUnsavedChanges(true);
    };

    // Get attendance status for a student
    const getAttendanceStatus = (studentId: string): AttendanceStatus => {
        return attendanceRecords.get(studentId)?.status || null;
    };

    // Get notes for a student
    const getNotes = (studentId: string): string => {
        return attendanceRecords.get(studentId)?.notes || "";
    };

    // Get background color based on status
    const getRowBackground = (status: AttendanceStatus) => {
        switch (status) {
            case "present":
                return "bg-green-50";
            case "late":
                return "bg-yellow-50";
            case "absent":
                return "bg-red-50";
            case "excused":
                return "bg-blue-50";
            default:
                return "bg-white hover:bg-gray-50";
        }
    };

    // Calculate stats from current state
    const stats = useMemo(() => {
        const total = filteredStudents.length;
        let present = 0;
        let late = 0;
        let absent = 0;
        let excused = 0;
        let unmarked = 0;

        filteredStudents.forEach((student) => {
            const status = getAttendanceStatus(student.id);
            switch (status) {
                case "present":
                    present++;
                    break;
                case "late":
                    late++;
                    break;
                case "absent":
                    absent++;
                    break;
                case "excused":
                    excused++;
                    break;
                default:
                    unmarked++;
            }
        });

        const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

        return { total, present, late, absent, excused, unmarked, attendanceRate };
    }, [filteredStudents, attendanceRecords]);

    // Save attendance to database
    const handleSaveAttendance = async () => {
        if (!canEditDate) {
            alert("Cannot save attendance for future dates");
            return;
        }

        if (stats.unmarked === stats.total) {
            alert("Please mark attendance for at least one student");
            return;
        }

        setIsSaving(true);

        const attendanceData = {
            date: selectedDate,
            records: Array.from(attendanceRecords.values())
                .filter(record => record.status !== null)
                .map(record => ({
                    studentId: record.studentId,
                    status: record.status as "present" | "late" | "absent" | "excused",
                    notes: record.notes || "",
                })),
        };

        try {
            const response = await fetch("/api/attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(attendanceData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to save attendance");
            }

            alert(result.message || "Attendance saved successfully!");
            setHasUnsavedChanges(false);

            // Refresh attendance data
            await refetchAttendance();
        } catch (error) {
            console.error("Error saving attendance:", error);
            alert(error instanceof Error ? error.message : "Failed to save attendance. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Navigate to previous day
    const goToPreviousDay = () => {
        if (hasUnsavedChanges) {
            if (!confirm("You have unsaved changes. Are you sure you want to change the date?")) {
                return;
            }
        }
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    // Navigate to next day
    const goToNextDay = () => {
        if (hasUnsavedChanges) {
            if (!confirm("You have unsaved changes. Are you sure you want to change the date?")) {
                return;
            }
        }
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateString = nextDate.toISOString().split('T')[0];

        if (!isDateInFuture(nextDateString)) {
            setSelectedDate(nextDateString);
        }
    };

    // Handle date change from input
    const handleDateChange = (newDate: string) => {
        if (hasUnsavedChanges) {
            if (!confirm("You have unsaved changes. Are you sure you want to change the date?")) {
                return;
            }
        }
        setSelectedDate(newDate);
    };

    const isLoading = isLoadingStudents || isLoadingAttendance;
    const isError = isStudentsError || isAttendanceError;

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Failed to load data
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        {isStudentsError ? "Failed to load students" : "Failed to load attendance"}
                    </p>
                    <button
                        onClick={() => {
                            refetchStudents();
                            refetchAttendance();
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
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto pr-4 py-6">
                {/* Header */}
                <div className="mb-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mt-1">
                                {existingAttendance.length > 0
                                    ? `${existingAttendance.length} student(s) recorded`
                                    : "No attendance recorded yet"}
                            </p>
                        </div>

                        {/* Date Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPreviousDay}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                title="Previous day"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>

                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    max={today}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <button
                                onClick={goToNextDay}
                                disabled={selectedDate === today}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Next day"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>

                            <button
                                onClick={() => refetchAttendance()}
                                disabled={isFetchingAttendance}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-5 h-5 text-gray-600 ${isFetchingAttendance ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {!canEditDate && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-800">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="text-sm">Cannot edit attendance for future dates</span>
                        </div>
                    )}

                    {hasUnsavedChanges && canEditDate && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-800">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="text-sm">You have unsaved changes. Don't forget to save!</span>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <p className="text-xs text-gray-600 mb-1">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <p className="text-xs text-gray-600 mb-1">Present</p>
                        <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <p className="text-xs text-gray-600 mb-1">Late</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <p className="text-xs text-gray-600 mb-1">Absent</p>
                        <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <p className="text-xs text-gray-600 mb-1">Excused</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <p className="text-xs text-gray-600 mb-1">Rate</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.attendanceRate}%</p>
                    </div>
                </div>

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

                            <button
                                onClick={handleSaveAttendance}
                                disabled={isSaving || !canEditDate || stats.unmarked === stats.total || !hasUnsavedChanges}
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
                                        Save Attendance
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
                            {isLoadingAttendance ? "Loading attendance records..." : "Loading students..."}
                        </p>
                    </div>
                )}

                {/* Attendance Table */}
                {!isLoading && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-4 text-xs font-semibold text-gray-700">
                                            Student Name
                                        </th>
                                        <th className="text-center p-4 text-xs font-semibold text-gray-700">
                                            Status
                                        </th>
                                        <th className="text-left p-4 text-xs font-semibold text-gray-700">
                                            Notes
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredStudents.map((student) => {
                                        const status = getAttendanceStatus(student.id);
                                        const notes = getNotes(student.id);
                                        const displayAvatar = student.avatar || getInitials(student.fullName);

                                        return (
                                            <tr
                                                key={student.id}
                                                className={`transition-colors ${getRowBackground(status)}`}
                                            >
                                                <td className="p-4">
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

                                                <td className="p-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => updateAttendance(student.id, "present")}
                                                            disabled={!canEditDate}
                                                            className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all ${status === "present"
                                                                ? "border-green-500 bg-green-500 text-white shadow-sm"
                                                                : "border-gray-200 bg-white text-gray-400 hover:border-green-500 hover:bg-green-500 hover:text-white"
                                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            title="Present"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>

                                                        <button
                                                            onClick={() => updateAttendance(student.id, "late")}
                                                            disabled={!canEditDate}
                                                            className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all ${status === "late"
                                                                ? "border-yellow-500 bg-yellow-500 text-white shadow-sm"
                                                                : "border-gray-200 bg-white text-gray-400 hover:border-yellow-500 hover:bg-yellow-500 hover:text-white"
                                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            title="Late"
                                                        >
                                                            <Clock className="w-5 h-5" />
                                                        </button>

                                                        <button
                                                            onClick={() => updateAttendance(student.id, "absent")}
                                                            disabled={!canEditDate}
                                                            className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all ${status === "absent"
                                                                ? "border-red-500 bg-red-500 text-white shadow-sm"
                                                                : "border-gray-200 bg-white text-gray-400 hover:border-red-500 hover:bg-red-500 hover:text-white"
                                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            title="Absent"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>

                                                        <button
                                                            onClick={() => updateAttendance(student.id, "excused")}
                                                            disabled={!canEditDate}
                                                            className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all ${status === "excused"
                                                                ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                                                                : "border-gray-200 bg-white text-gray-400 hover:border-blue-500 hover:bg-blue-500 hover:text-white"
                                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            title="Excused"
                                                        >
                                                            <span className="text-xs font-bold">E</span>
                                                        </button>
                                                    </div>
                                                </td>

                                                <td className="p-4">
                                                    <input
                                                        type="text"
                                                        value={notes}
                                                        onChange={(e) => updateNotes(student.id, e.target.value)}
                                                        disabled={!canEditDate}
                                                        placeholder="Add a note..."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
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
            </div>
        </div>
    );
};

export default AttendancePage;