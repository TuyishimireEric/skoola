import Modal from "../Modal/Modal";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { InputElement } from "../form/InputElement";
import Alert, { AlertType } from "../alerts/Alert";
import { PickClass } from "./PickClass";
import { useRegisterStudents } from "@/hooks/user/useRegisterStudents";
import { StudentData } from "@/types";
import { DateOfBirthInput } from "../form/DateOfBirthInput";

interface AddStudentsProps {
  isOpen: boolean;
  onClose: () => void;
  myClassId: number | null;
}

interface ExcelRowData {
  fullName?: string;
  dateOfBirth?: string | number | Date;
  parentName?: string;
  parentEmail?: string;
  [key: string]: unknown;
}

interface ValidationError {
  field: string;
  message: string;
}

interface StudentDataWithValidation extends StudentData {
  errors: ValidationError[];
  isValid: boolean;
}

export const AddStudents = ({
  isOpen,
  onClose,
  myClassId,
}: AddStudentsProps) => {
  const [activeTab, setActiveTab] = useState<"single" | "excel">("single");

  const { mutate: addStudents, isPending, isSuccess } = useRegisterStudents();

  // State for single student form
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [showParsedData, setShowParsedData] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedClass, setSelectedClass] = useState<number | null>(myClassId);

  // State for Excel upload and parsed data
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<StudentDataWithValidation[]>([]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateDateOfBirth = (
    dateString: string
  ): { isValid: boolean; message?: string } => {
    if (!dateString) {
      return { isValid: false, message: "Date of birth is required" };
    }

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return { isValid: false, message: "Invalid date format" };
    }

    const today = new Date();
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 3);
    const maxAgeDate = new Date();
    maxAgeDate.setFullYear(today.getFullYear() - 18);

    if (date > minAgeDate) {
      return {
        isValid: false,
        message: "Student must be at least 3 years old",
      };
    }

    if (date < maxAgeDate) {
      return {
        isValid: false,
        message: "Student must be at most 18 years old",
      };
    }

    return { isValid: true };
  };

  const validateStudentData = (student: StudentData): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validate full name (required)
    if (!student.fullName || student.fullName.trim() === "") {
      errors.push({ field: "fullName", message: "Full name is required" });
    }

    // Validate date of birth (required)
    const dobValidation = validateDateOfBirth(student.dateOfBirth);
    if (!dobValidation.isValid) {
      errors.push({
        field: "dateOfBirth",
        message: dobValidation.message || "Invalid date",
      });
    }

    // Validate parent email (optional, but if provided must be valid)
    if (student.parentEmail && !validateEmail(student.parentEmail)) {
      errors.push({ field: "parentEmail", message: "Invalid email format" });
    }

    return errors;
  };

  // Handle Excel file upload
  const handleExcelUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!excelFile) {
      setErrorMessage("Please select an Excel file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelRowData>(sheet);

        if (jsonData.length > 50) {
          setErrorMessage(
            "The file contains more than 50 students. Please upload a file with 50 students or fewer."
          );
          return;
        }

        if (jsonData.length === 0) {
          setErrorMessage(
            "The file is empty. Please upload a file with student data."
          );
          return;
        }

        // Process and validate the data
        const processedData: StudentDataWithValidation[] = jsonData
          .map((row: ExcelRowData) => {
            // Process date of birth
            const dateOfBirthValue = row.dateOfBirth;
            let processedDateOfBirth = "";

            if (typeof dateOfBirthValue === "number") {
              // Convert Excel serial date to JavaScript Date
              const excelDate = new Date(
                (dateOfBirthValue - 25569) * 86400 * 1000
              );
              processedDateOfBirth = excelDate.toISOString().split("T")[0];
            } else if (dateOfBirthValue instanceof Date) {
              // Convert Date object to string
              processedDateOfBirth = dateOfBirthValue
                .toISOString()
                .split("T")[0];
            } else if (typeof dateOfBirthValue === "string") {
              // Try to parse and format the string date
              const parsedDate = new Date(dateOfBirthValue);
              if (!isNaN(parsedDate.getTime())) {
                processedDateOfBirth = parsedDate.toISOString().split("T")[0];
              } else {
                processedDateOfBirth = dateOfBirthValue; // Keep original for error display
              }
            }

            const studentData: StudentData = {
              fullName:
                typeof row.fullName === "string" ? row.fullName.trim() : "",
              dateOfBirth: processedDateOfBirth,
              parentName:
                typeof row.parentName === "string" ? row.parentName.trim() : "",
              parentEmail:
                typeof row.parentEmail === "string"
                  ? row.parentEmail.trim()
                  : "",
            };

            // Validate the data
            const errors = validateStudentData(studentData);
            const isValid = errors.length === 0;

            return {
              ...studentData,
              errors,
              isValid,
            };
          })
          .filter((_, index) => index < 50); // Ensure we don't exceed 50 students

        setParsedData(processedData);
        setShowParsedData(true);
      } catch (error) {
        setErrorMessage(
          "Error reading the Excel file. Please check the file format."
        );
        console.error("Excel parsing error:", error);
      }
    };
    reader.readAsBinaryString(excelFile);
  };

  // Handle row removal
  const handleRemoveRow = (index: number) => {
    const newData = parsedData.filter((_, i) => i !== index);
    setParsedData(newData);
  };

  // Handle field changes with validation
  const handleFieldChange = (
    index: number,
    field: keyof StudentData,
    value: string
  ) => {
    const newData = [...parsedData];
    newData[index][field] = value;

    // Re-validate the updated row
    const studentData: StudentData = {
      fullName: newData[index].fullName,
      dateOfBirth: newData[index].dateOfBirth,
      parentName: newData[index].parentName,
      parentEmail: newData[index].parentEmail,
    };

    const errors = validateStudentData(studentData);
    newData[index].errors = errors;
    newData[index].isValid = errors.length === 0;

    setParsedData(newData);
  };

  // Check for duplicates based on fullName and parentEmail combination
  const getDuplicateIndices = (): number[] => {
    const seen = new Map<string, number>();
    const duplicates: number[] = [];

    parsedData.forEach((row, index) => {
      const key = `${row.fullName.toLowerCase()}-${row.parentEmail.toLowerCase()}`;
      if (seen.has(key)) {
        duplicates.push(index);
        if (!duplicates.includes(seen.get(key)!)) {
          duplicates.push(seen.get(key)!);
        }
      } else {
        seen.set(key, index);
      }
    });

    return duplicates;
  };

  // Check if all data is valid
  const isAllDataValid = (): boolean => {
    return parsedData.every((row) => row.isValid) && parsedData.length > 0;
  };

  // Get validation summary
  const getValidationSummary = () => {
    const totalRows = parsedData.length;
    const validRows = parsedData.filter((row) => row.isValid).length;
    const duplicateIndices = getDuplicateIndices();

    return {
      totalRows,
      validRows,
      invalidRows: totalRows - validRows,
      duplicates: duplicateIndices.length,
    };
  };

  // Handle continue button click
  const handleContinue = () => {
    setErrorMessage("");

    if (parsedData.length === 0) {
      setErrorMessage("No students to add.");
      return;
    }

    if (parsedData.length > 50) {
      setErrorMessage("Cannot add more than 50 students at once.");
      return;
    }

    const duplicateIndices = getDuplicateIndices();
    if (duplicateIndices.length > 0) {
      setErrorMessage(
        "Please remove or fix duplicate students before continuing."
      );
      return;
    }

    if (!isAllDataValid()) {
      setErrorMessage("Please fix all validation errors before continuing.");
      return;
    }

    if (!selectedClass) {
      setErrorMessage("Please select a class");
      return;
    }

    // Convert to the format expected by the API
    const studentsToAdd = parsedData.map((row) => ({
      fullName: row.fullName,
      dateOfBirth: row.dateOfBirth,
      parentName: row.parentName || "",
      parentEmail: row.parentEmail || "",
    }));

    addStudents({
      Students: studentsToAdd,
      grade: selectedClass,
    });
  };

  // Handle single student form submission
  const handleSingleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (fullName.trim() === "" || dateOfBirth.trim() === "") {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const dobValidation = validateDateOfBirth(dateOfBirth);
    if (!dobValidation.isValid) {
      setErrorMessage(dobValidation.message || "Invalid date of birth");
      return;
    }

    if (parentEmail && !validateEmail(parentEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!selectedClass) {
      setErrorMessage("Please select a class");
      return;
    }

    addStudents({
      Students: [
        {
          fullName: fullName.trim(),
          dateOfBirth: dateOfBirth,
          parentName: parentName.trim() || "",
          parentEmail: parentEmail.trim() || "",
        },
      ],
      grade: selectedClass,
    });
  };

  useEffect(() => {
    if (isSuccess) {
      setFullName("");
      setDateOfBirth("");
      setParentName("");
      setParentEmail("");
      setErrorMessage("");
      setExcelFile(null);
      setParsedData([]);
      onClose();
      setShowParsedData(false);
    }
  }, [isSuccess]);

  // Handle template download
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        fullName: "John Doe",
        dateOfBirth: "2015-01-15",
        parentName: "Jane Doe (Optional)",
        parentEmail: "parent@example.com (Optional)",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    // Generate and download the file
    XLSX.writeFile(workbook, "Student_Template.xlsx");
  };

  const validationSummary = getValidationSummary();
  const duplicateIndices = getDuplicateIndices();

  return (
    <Modal
      title="Add Student"
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showCloseButton={true}
    >
      <div className="p-4 w-full h-full font-comic">
        <div className="flex space-x-4 border-b mb-4 border-primary-300">
          <button
            onClick={() => setActiveTab("single")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "single"
                ? "border-b-2 border-primary-500 text-primary-500"
                : "text-primary-400 hover:text-primary-500"
            }`}
          >
            Add Single Student
          </button>
          <button
            onClick={() => setActiveTab("excel")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "excel"
                ? "border-b-2 border-primary-500 text-primary-500"
                : "text-primary-400 hover:text-primary-500"
            }`}
          >
            Upload Excel File
          </button>
        </div>

        {/* Class Selection */}
        {myClassId == null && (
          <PickClass
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
          />
        )}

        {/* Tab Content */}
        {activeTab === "single" ? (
          <form onSubmit={handleSingleStudentSubmit}>
            <div className="space-y-4">
              <InputElement
                label="Full Name *"
                value={fullName}
                onChange={(e) => {
                  setFullName(e);
                  setErrorMessage("");
                }}
                placeholder="Enter student's full name"
              />
              <DateOfBirthInput
                dateOfBirth={dateOfBirth}
                setDateOfBirth={(date) => setDateOfBirth(date)}
              />
              <InputElement
                label="Parent Name (Optional)"
                value={parentName}
                onChange={(e) => {
                  setParentName(e);
                  setErrorMessage("");
                }}
                placeholder="Enter parent's name"
              />
              <InputElement
                label="Parent Email (Optional)"
                value={parentEmail}
                onChange={(e) => {
                  setParentEmail(e);
                  setErrorMessage("");
                }}
                placeholder="Enter parent's email"
              />
              {errorMessage && (
                <div className="w-full">
                  <Alert
                    alertType={AlertType.DANGER}
                    title={errorMessage}
                    close={() => setErrorMessage("")}
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary-400 text-white py-2 px-4 rounded-3xl hover:bg-primary-300 disabled:bg-primary-300 disabled:cursor-not-allowed"
              >
                {isPending ? "Adding Student..." : "Add Student"}
              </button>
            </div>
          </form>
        ) : (
          <div>
            {!showParsedData ? (
              <div className="space-y-4">
                <form onSubmit={handleExcelUpload}>
                  <div className="space-y-4">
                    {errorMessage && (
                      <div className="w-full">
                        <Alert
                          alertType={AlertType.DANGER}
                          title={errorMessage}
                          close={() => setErrorMessage("")}
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex flex-col w-full mt-2">
                        <label className="text-xs font-bold text-primary-500 pl-2 mb-1">
                          Upload Excel File
                        </label>
                        <div className="relative w-full h-16 border-2 border-dashed border-primary-400 rounded-full bg-white/60 hover:bg-primary-50 transition-colors duration-200 cursor-pointer">
                          <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setExcelFile(e.target.files[0]);
                                setErrorMessage("");
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            required
                          />
                          <div className="flex items-center justify-center h-full">
                            <span className="text-sm text-primary-500 font-medium">
                              {excelFile
                                ? excelFile.name
                                : "Drag & drop or click to upload"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 px-2">
                        Required columns: <strong>fullName, dateOfBirth</strong>
                        <br />
                        Optional columns:{" "}
                        <strong>parentName, parentEmail</strong>
                        <br />
                        Maximum 50 students per upload.
                      </p>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary-400 text-white py-2 px-4 rounded-full hover:bg-primary-300"
                    >
                      Upload and Preview Students
                    </button>
                  </div>
                </form>

                {/* Download Template Button */}
                <button
                  onClick={handleDownloadTemplate}
                  className="mt-4 w-full bg-primary-300 text-white py-2 px-4 rounded-full hover:bg-primary-400"
                >
                  Download Template
                </button>
              </div>
            ) : (
              <div>
                {/* Validation Summary */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">
                    Upload Summary:
                  </h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Total Students:</span>
                      <span className="font-medium">
                        {validationSummary.totalRows}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valid Students:</span>
                      <span className="font-medium text-green-600">
                        {validationSummary.validRows}
                      </span>
                    </div>
                    {validationSummary.invalidRows > 0 && (
                      <div className="flex justify-between">
                        <span>Invalid Students:</span>
                        <span className="font-medium text-red-600">
                          {validationSummary.invalidRows}
                        </span>
                      </div>
                    )}
                    {validationSummary.duplicates > 0 && (
                      <div className="flex justify-between">
                        <span>Duplicate Students:</span>
                        <span className="font-medium text-orange-600">
                          {validationSummary.duplicates}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Display Parsed Data */}
                {parsedData.length > 0 ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-bold text-lg">
                        Student Data Preview
                      </h2>
                      <span className="text-sm text-gray-600">
                        * Required fields
                      </span>
                    </div>
                    <div className="overflow-y-auto max-h-96">
                      <table className="w-full border-collapse border border-primary-300">
                        <thead className="sticky top-0 bg-white">
                          <tr className="bg-primary-300 text-left">
                            <th className="border border-primary-300 p-1 px-2">
                              #
                            </th>
                            <th className="border border-primary-300 p-1 px-2">
                              Full Name *
                            </th>
                            <th className="border border-primary-300 p-1 px-2">
                              Date of Birth *
                            </th>
                            <th className="border border-primary-300 p-1 px-2">
                              Parent Name
                            </th>
                            <th className="border border-primary-300 p-1 px-2">
                              Parent Email
                            </th>
                            <th className="border border-primary-300 p-1 px-2">
                              Status
                            </th>
                            <th className="border border-primary-300 p-1 px-2">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData.map((row, index) => {
                            const isDuplicate =
                              duplicateIndices.includes(index);
                            const hasErrors = row.errors.length > 0;

                            return (
                              <tr
                                key={index}
                                className={`hover:bg-primary-100 ${
                                  isDuplicate
                                    ? "bg-orange-100"
                                    : hasErrors
                                    ? "bg-red-50"
                                    : "bg-white"
                                }`}
                              >
                                <td className="border border-primary-300 p-1 px-2">
                                  {index + 1}
                                </td>
                                <td className="border border-primary-300">
                                  <input
                                    type="text"
                                    value={row.fullName}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        index,
                                        "fullName",
                                        e.target.value
                                      )
                                    }
                                    className={`w-full p-1 px-2 bg-white/40 ${
                                      row.errors.some(
                                        (e) => e.field === "fullName"
                                      )
                                        ? "border-red-300 bg-red-50"
                                        : ""
                                    }`}
                                    placeholder="Required"
                                  />
                                </td>
                                <td className="border border-primary-300">
                                  <input
                                    type="date"
                                    value={row.dateOfBirth}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        index,
                                        "dateOfBirth",
                                        e.target.value
                                      )
                                    }
                                    className={`w-full p-1 bg-white/40 ${
                                      row.errors.some(
                                        (e) => e.field === "dateOfBirth"
                                      )
                                        ? "border-red-300 bg-red-50"
                                        : ""
                                    }`}
                                  />
                                </td>
                                <td className="border border-primary-300">
                                  <input
                                    type="text"
                                    value={row.parentName}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        index,
                                        "parentName",
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-1 bg-white/40"
                                    placeholder="Optional"
                                  />
                                </td>
                                <td className="border border-primary-300">
                                  <input
                                    type="email"
                                    value={row.parentEmail}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        index,
                                        "parentEmail",
                                        e.target.value
                                      )
                                    }
                                    className={`w-full p-1 bg-white/40 ${
                                      row.errors.some(
                                        (e) => e.field === "parentEmail"
                                      )
                                        ? "border-red-300 bg-red-50"
                                        : ""
                                    }`}
                                    placeholder="Optional"
                                  />
                                </td>
                                <td className="border border-primary-300 p-1 px-2 text-center">
                                  {isDuplicate ? (
                                    <span className="text-xs text-orange-600 font-medium">
                                      Duplicate
                                    </span>
                                  ) : hasErrors ? (
                                    <div className="text-xs text-red-600">
                                      {row.errors.map((error, i) => (
                                        <div key={i} className="mb-1">
                                          {error.message}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-green-600 font-medium">
                                      Valid
                                    </span>
                                  )}
                                </td>
                                <td className="border border-primary-300 p-1 px-2 text-center">
                                  <button
                                    onClick={() => handleRemoveRow(index)}
                                    className="bg-red-500 text-white py-1 px-2 text-xs rounded hover:bg-red-600"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {errorMessage && (
                      <div className="w-full mt-4">
                        <Alert
                          alertType={AlertType.DANGER}
                          title={errorMessage}
                          close={() => setErrorMessage("")}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-4 gap-4">
                      <button
                        onClick={() => {
                          setShowParsedData(false);
                          setExcelFile(null);
                          setParsedData([]);
                          setErrorMessage("");
                        }}
                        className="w-full bg-primary-100 text-primary-500 shadow-md py-2 px-4 rounded-full hover:bg-primary-200"
                      >
                        Back to Upload
                      </button>
                      <button
                        onClick={handleContinue}
                        disabled={
                          isPending ||
                          !isAllDataValid() ||
                          duplicateIndices.length > 0
                        }
                        className="w-full bg-primary-400 text-white shadow-md py-2 px-4 rounded-full hover:bg-green-600 disabled:bg-primary-300 disabled:cursor-not-allowed"
                      >
                        {isPending
                          ? "Adding Students..."
                          : `Add ${validationSummary.validRows} Student${
                              validationSummary.validRows !== 1 ? "s" : ""
                            }`}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      No valid student data found.
                    </p>
                    <button
                      onClick={() => {
                        setShowParsedData(false);
                        setExcelFile(null);
                        setParsedData([]);
                        setErrorMessage("");
                      }}
                      className="bg-primary-100 text-primary-500 shadow-md py-2 px-4 rounded-full hover:bg-primary-200"
                    >
                      Back to Upload
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
