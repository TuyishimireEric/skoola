import { motion } from "framer-motion";
import { CheckCircle, Key, BookOpen, User, MailIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../form/Input";
import { Select } from "../form/Select";
import { MdKeyboardBackspace } from "react-icons/md";
import { ClassesI } from "@/types/Classes";
import { getAge } from "@/utils/functions";
import { useRegisterStudents } from "@/hooks/user/useRegisterStudents";
import { useSession } from "next-auth/react";
import Alert, { AlertType } from "../alerts/Alert";

interface FormdataI {
  studentName: string;
  classLevel: number | null;
  birthday: string;
}

interface ParentFlowProps {
  setStep: (step: number) => void;
  filteredClasses: ClassesI[];
}

export const ParentFlow = ({ setStep, filteredClasses }: ParentFlowProps) => {
  const [formData, setFormData] = useState<FormdataI>({
    studentName: "",
    classLevel: null,
    birthday: "",
  });
  const [formErrors, setFormErrors] = useState({
    studentName: "",
    classLevel: "",
    birthday: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    mutate: addStudents,
    isPending,
    isSuccess,
    data: onSuccessData,
  } = useRegisterStudents();
  const { data: session, update } = useSession();

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [field]: "",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (
      formData.studentName.trim() === "" ||
      formData.birthday.trim() === "" ||
      formData.classLevel === null
    ) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const birthDate = new Date(formData.birthday);
    const fullName = formData.studentName;
    const dateOfBirth = formData.birthday;
    const parentName = session?.user?.name || "";
    const parentEmail = session?.user?.email || "";

    const today = new Date();
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 3);
    const maxAgeDate = new Date();
    maxAgeDate.setFullYear(today.getFullYear() + 18);

    if (birthDate > minAgeDate) {
      setErrorMessage("The student must be at least 3 years old.");
      return;
    }

    if (getAge(birthDate) > 18) {
      setErrorMessage("The student must be at most 18 years old.");
      return;
    }

    addStudents({
      Students: [
        {
          fullName,
          dateOfBirth,
          parentName,
          parentEmail,
        },
      ],
      grade: formData.classLevel,
    });
  };

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      update({ force: true });
    }
  }, [isSuccess]);

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-3xl shadow-xl w-full overflow-hidden relative font-comic">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full opacity-20 -mr-10 -mt-10"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-200 rounded-full opacity-20 -ml-20 -mb-20"></div>

      <div className="relative z-10 p-5">
        {!showSuccess ? (
          <div className="relative px-6 py-4 bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-indigo-100 animate__animated animate__fadeIn">
            <div
              onClick={() => setStep(1)}
              className=" top-2 left-2 flex items-center text-indigo-700 hover:text-indigo-900 transition-colors font-medium group cursor-pointer mb-2"
            >
              <div className="flex items-center gap-1 bg-purple-200/50 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-x-1">
                <MdKeyboardBackspace className="text-lg" />
                <span>Back</span>
              </div>
            </div>

            {errorMessage && (
              <div className="w-full">
                <Alert
                  alertType={AlertType.DANGER}
                  title={errorMessage}
                  close={() => setErrorMessage("")}
                  timeOut={2000}
                />
              </div>
            )}

            <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Input
                  label="Student Name"
                  value={formData.studentName}
                  onChange={(e) =>
                    handleInputChange("studentName", e.target.value)
                  }
                  placeholder="Enter student's full name"
                  icon="👦"
                  valid={formData.studentName.trim().length > 0}
                  errorMessage={"Student name is required"}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Select
                  label="Class Level"
                  value={formData.classLevel?.toString() || ""}
                  onChange={(e) => handleInputChange("classLevel", e)}
                  icon="🎓"
                  valid={formData.classLevel !== null}
                  errorMessage={"Class is required"}
                  options={filteredClasses.map((cls) => ({
                    value: cls.Id.toString(),
                    label: cls.Name,
                  }))}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Input
                  label="Birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) =>
                    handleInputChange("birthday", e.target.value)
                  }
                  icon="🎂"
                  valid={formData.birthday.trim().length > 0}
                  errorMessage={"Birthday is required"}
                  showValidIcon={false}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <button
                  type="submit"
                  disabled={isPending}
                  className={`w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white rounded-xl font-bold font-comic text-lg shadow-lg transition-all duration-300 border-b-4 border-indigo-800 hover:border-indigo-700 transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center gap-2
                          ${
                            !isPending
                              ? "hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500"
                              : "opacity-70 cursor-not-allowed"
                          }`}
                >
                  {isPending ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🎉</span>
                      <span>Create Student Account!</span>
                      <span className="text-xl">🎉</span>
                    </>
                  )}
                </button>
              </motion.div>

              <div className="flex items-center justify-center mt-4 text-sm text-indigo-600">
                <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    Student accounts help track progress and achievements!
                  </span>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border-3 border-green-200 shadow-xl mx-auto relative overflow-hidden animate__animated animate__fadeIn">
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-green-100 rounded-full opacity-50"></div>
            <div className="absolute bottom-10 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 text-9xl opacity-10 text-green-300">
              🎓
            </div>

            <div className="relative">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg animate__animated animate__bounceIn">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <h3 className="text-2xl font-bold text-green-600 mb-1 text-center">
                    {onSuccessData?.message ||
                      "Student Account Created Successfully!"}
                  </h3>
                  <p className="text-green-500 text-center mb-4">
                    Ready to start learning!
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  style={{ width: "100%" }}
                >
                  <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200 relative mb-4">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full font-bold shadow-md">
                      LOGIN DETAILS
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="text-gray-500 flex items-center gap-2">
                        <User className="h-4 w-4 text-indigo-400" />
                        <span>Name:</span>
                      </div>
                      <div className="font-semibold text-indigo-700">
                        {formData.studentName}
                      </div>
                      <div className="text-gray-500 flex items-center gap-2">
                        <Key className="h-4 w-4 text-indigo-400" />
                        <span>Login Code:</span>
                      </div>
                      <div className="font-semibold text-indigo-700 rounded-md inline-block">
                        {onSuccessData?.row[0].LoginCode}
                      </div>
                      <div className="text-gray-500 flex items-center gap-2">
                        <MailIcon className="h-4 w-4 text-indigo-400" />
                        <span>Parent Email:</span>
                      </div>
                      <div className="font-semibold text-indigo-700">
                        {onSuccessData?.row[0].ParentEmail}
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg mt-4 flex items-start gap-2">
                      <span className="text-xl mt-0.5">💡</span>
                      <p className="text-sm text-yellow-700">
                        Please keep these details safe. Your child will use them
                        to log in.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => {
                      setShowSuccess(false);
                      setFormData({
                        studentName: "",
                        classLevel: null,
                        birthday: "",
                      });
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold shadow-md transition-all duration-300 border-b-3 border-indigo-700 hover:border-indigo-600 transform hover:-translate-y-1"
                  >
                    ➕ Add Another Student
                  </button>

                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-bold shadow-md transition-all duration-300 border-b-3 border-blue-700 hover:border-blue-600 transform hover:-translate-y-1"
                  >
                    🏠 Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
