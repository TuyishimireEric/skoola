// constants/filterOptions.ts

export const GRADE_OPTIONS = [
  { id: "all", name: "All Grades", gradeNumber: 0 },
  { id: "1", name: "Grade 1", gradeNumber: 1 },
  { id: "2", name: "Grade 2", gradeNumber: 2 },
  { id: "3", name: "Grade 3", gradeNumber: 3 },
  { id: "4", name: "Grade 4", gradeNumber: 4 },
  { id: "5", name: "Grade 5", gradeNumber: 5 },
  { id: "6", name: "Grade 6", gradeNumber: 6 },
];

export const SUBJECT_OPTIONS = [
  { id: "all", name: "All Subjects" },
  { id: "mathematics", name: "Mathematics" },
  { id: "science", name: "Science" },
  { id: "english", name: "English" },
  { id: "history", name: "History" },
  { id: "art", name: "Art" },
  { id: "physical-education", name: "Physical Education" },
];

export const DATE_RANGE_OPTIONS = [
  { label: "Last 7 Days", value: "7d", days: 7 },
  { label: "Last 30 Days", value: "30d", days: 30 },
  { label: "Last 3 Months", value: "3m", days: 90 },
  { label: "Last 6 Months", value: "6m", days: 180 },
  { label: "This Year", value: "1y", days: 365 },
];

// Helper functions
export const getGradeNameById = (gradeId: string): string => {
  const grade = GRADE_OPTIONS.find((g) => g.id === gradeId);
  return grade?.name || "All Grades";
};

export const getSubjectNameById = (subject: string): string => {
  const Subject = SUBJECT_OPTIONS.find((s) => s.id === subject);
  return Subject?.name || "All Subjects";
};

export const getDateRangeLabelByValue = (value: string): string => {
  const range = DATE_RANGE_OPTIONS.find((r) => r.value === value);
  return range?.label || "Last 7 Days";
};
