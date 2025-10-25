import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Mail,
  BookOpen,
  Check,
  Clock,
  GraduationCap,
} from "lucide-react";
import { PiChalkboardTeacherFill } from "react-icons/pi";
import StatsCard from "../dashboard/StatsCard";
import { useTeachers } from "@/hooks/teacher/useTeachers";
import { TeacherData } from "@/types/teacher";
import TeacherCard from "./TeacherCard";
import TeacherCardSkeleton from "./TeacherCardSkeleton";
import FilterDropdown from "./FilterDropdown";
import InviteTeacherModal from "./InviteTeacherModal";

const TeacherManagement: React.FC = () => {
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [gradeFilter, setGradeFilter] = useState("All Grades");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data: teachers, isLoading } = useTeachers();

  // Filter options
  const statusOptions = [
    "All Status",
    "Active",
    "On Leave",
    "Invitation Pending",
  ];
  const subjectOptions = [
    "All Subjects",
    "Mathematics",
    "Science",
    "English Language Arts",
    "Physical Education",
    "Art",
    "Music",
  ];
  const gradeOptions = [
    "All Grades",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
  ];

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter teachers based on search and filters
  useEffect(() => {
    if (!teachers) return;

    const filtered = teachers.filter((teacher) => {
      const matchesSearch =
        teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All Status" || teacher.status === statusFilter;
      const matchesSubject =
        subjectFilter === "All Subjects" || teacher.subject === subjectFilter;
      const matchesGrade =
        gradeFilter === "All Grades" || teacher.grade === gradeFilter;

      return matchesSearch && matchesStatus && matchesSubject && matchesGrade;
    });

    setFilteredTeachers(filtered);
  }, [teachers, searchTerm, statusFilter, subjectFilter, gradeFilter]);

  const handleViewTeacher = (teacher: TeacherData) => {
    // Implement view teacher logic
    console.log(`Viewing ${teacher.fullName}'s profile`);
  };

  const handleEditTeacher = (teacher: TeacherData) => {
    // Implement edit teacher logic
    console.log(`Editing ${teacher.fullName}'s information`);
  };

  const handleDeleteTeacher = (id: string) => {
    const teacher = teachers?.find((t) => t.id === id);
    const action =
      teacher?.status === "Invitation Pending"
        ? "cancel this invitation"
        : "remove this teacher";

    if (confirm(`Are you sure you want to ${action}?`)) {
      // Implement delete logic here
      console.log(`Deleting teacher with id: ${id}`);
    }
  };

  // Calculate stats
  const activeTeachers =
    teachers?.filter((t) => t.status === "Active").length || 0;
  const onLeaveTeachers =
    teachers?.filter((t) => t.status === "On Leave").length || 0;
  const pendingInvitations =
    teachers?.filter((t) => t.status === "Invitation Pending").length || 0;

  // Show loading state with skeletons
  if (isLoading || !mounted) {
    return (
      <div className="flex flex-col gap-2 w-full h-full p-4 lg:p-6 min-h-screen">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-200 "
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl lg:rounded-3xl p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="h-10 bg-gray-200 rounded-xl w-full lg:max-w-md" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-200 rounded-xl w-32"
                />
              ))}
            </div>
            <div className="h-12 bg-gray-200 rounded-xl w-40" />
          </div>
        </div>

        {/* Teachers Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <TeacherCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full h-full p-4 lg:p-6 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <StatsCard
          label="Total Teachers"
          value={`${teachers?.length || 0}`}
          icon={PiChalkboardTeacherFill}
          color="border-purple-300"
          isLoading={false}
        />

        <StatsCard
          label="Active Teachers"
          value={`${activeTeachers}`}
          icon={Check}
          color="border-green-300"
          isLoading={false}
        />

        <StatsCard
          label="On Leave Teachers"
          value={`${onLeaveTeachers}`}
          icon={Clock}
          color="border-yellow-300"
          isLoading={false}
        />

        <StatsCard
          label="Pending invitations"
          value={`${pendingInvitations}`}
          icon={Mail}
          color="border-blue-300"
          isLoading={false}
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl lg:rounded-3xl p-4 mb-4  relative z-50">
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-primary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-comic text-lg"
            />
          </div>

          <div className="">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-primary-600" />
                <span className="text-base font-bold text-primary-700 font-comic">
                  Filters:
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
                <FilterDropdown
                  label="Status"
                  value={statusFilter}
                  options={statusOptions}
                  onChange={setStatusFilter}
                  icon={Check}
                />

                <FilterDropdown
                  label="Subject"
                  value={subjectFilter}
                  options={subjectOptions}
                  onChange={setSubjectFilter}
                  icon={BookOpen}
                />

                <FilterDropdown
                  label="Grade"
                  value={gradeFilter}
                  options={gradeOptions}
                  onChange={setGradeFilter}
                  icon={GraduationCap}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors font-comic font-bold flex items-center justify-center lg:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Invite Teacher
          </button>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="flex-1 relative">
        {filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 lg:p-12 text-center shadow-lg border-2 border-primary-200">
            <PiChalkboardTeacherFill className="w-16 h-16 lg:w-20 lg:h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg lg:text-xl font-bold text-gray-500 mb-2 font-comic">
              No Teachers Found
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {searchTerm ||
              statusFilter !== "All Status" ||
              subjectFilter !== "All Subjects" ||
              gradeFilter !== "All Grades"
                ? "Try adjusting your search criteria or filters"
                : "Get started by inviting your first teacher to the system"}
            </p>
            {!searchTerm &&
              statusFilter === "All Status" &&
              subjectFilter === "All Subjects" &&
              gradeFilter === "All Grades" && (
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors font-comic font-bold"
                >
                  Invite First Teacher
                </button>
              )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                onView={handleViewTeacher}
                onEdit={handleEditTeacher}
                onDelete={handleDeleteTeacher}
              />
            ))}
          </div>
        )}
      </div>

      {/* Results Summary */}
      {filteredTeachers.length > 0 && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 border-2 border-primary-200 mt-4 shadow-lg">
          <p className="text-sm text-center text-primary-700 font-comic">
            Showing <span className="font-bold">{filteredTeachers.length}</span>{" "}
            of <span className="font-bold">{teachers?.length || 0}</span>{" "}
            teachers
            {(searchTerm ||
              statusFilter !== "All Status" ||
              subjectFilter !== "All Subjects" ||
              gradeFilter !== "All Grades") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All Status");
                  setSubjectFilter("All Subjects");
                  setGradeFilter("All Grades");
                }}
                className="ml-2 text-primary-600 hover:text-primary-800 underline font-bold transition-colors"
              >
                Clear all filters
              </button>
            )}
          </p>
        </div>
      )}

      <InviteTeacherModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};

export default TeacherManagement;
