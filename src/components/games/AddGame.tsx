import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ImageUploader from "../images/AddImage";
import { subjects } from "@/utils/Constants";
import { GameDataI } from "@/types/Course";
import { useSession } from "next-auth/react";
import Modal from "../Modal/Modal";
import { useTestPrompt } from "@/hooks/courses/useTestPrompt";
import Loading from "../loader/Loading";
import { useUpdateGame } from "@/hooks/games/useUpdateGame";
import { useGameTypes } from "@/hooks/courses/useGameTypes";
import { useCreateGame } from "@/hooks/games/useCreateGame";

interface FormError {
  target: string;
  message: string;
}

const initialFormData: GameDataI = {
  Title: "",
  Description: "",
  Topic: "",
  ImageUrl: "",
  Type: "Selection",
  GameLevel: 0,
  Status: "Draft",
  SingleResponse: false,
  PassScore: 0,
  Retakes: 0,
  NumberOfQuestions: 0,
  NumberOfLevels: 0,
  QuestionsPerPage: 0,
  Tags: "",
  Prompt: "",
  Subject: "",
  OrganizationId: "",
};

interface CourseFormProps {
  onClose: () => void;
  show: boolean;
  selectedFilter?: string;
  course?: GameDataI;
  isEditing?: boolean;
}

const AddGameForm = ({
  onClose,
  show,
  course,
  isEditing = false,
}: CourseFormProps) => {
  const { data: session } = useSession();
  const organizationId = session?.user.organizations?.[0].OrganizationId ?? "";

  const { data: courseTypes } = useGameTypes();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<FormError>({ target: "", message: "" });
  const [formData, setFormData] = useState<GameDataI>(
    isEditing && course ? course : initialFormData
  );
  const [testPrompt, setTestPrompt] = useState(false);

  const {
    onSubmit: createGame,
    isPending: isCreating,
    onSuccess: createSuccess,
  } = useCreateGame();

  const {
    onSubmit: updateCourse,
    isPending: isUpdating,
    onSuccess: updateSuccess,
  } = useUpdateGame();

  const isPending = isCreating || isUpdating;
  const onSuccess = isEditing ? updateSuccess : createSuccess;

  const { data: promptOutput, isLoading: testingPrompt } = useTestPrompt(
    formData.Prompt ?? "",
    testPrompt
  );

  const getResponseType = (courseType: string): string => {
    const courseTypeData = courseTypes?.find(
      (type) => type.Name === courseType
    );
    return courseTypeData?.gameFormat ?? "No defined format";
  };

  useEffect(() => {
    if (organizationId && !isEditing) {
      setFormData((prevData) => ({
        ...prevData,
        OrganizationId: organizationId,
      }));
    }
  }, [organizationId, isEditing]);

  useEffect(() => {
    if (onSuccess) {
      if (!isEditing) {
        setFormData(initialFormData);
      }
      setStep(1);
      onClose();
    }
  }, [onSuccess, isEditing, onClose]);

  // Reset form when course prop changes
  useEffect(() => {
    if (isEditing && course) {
      setFormData(course);
    } else if (!isEditing) {
      setFormData(initialFormData);
    }
  }, [course, isEditing]);

  const validateStep1 = () => {
    if (!formData.ImageUrl.trim()) {
      setError({
        target: "ImageUrl",
        message: "Add a cool picture for your course!",
      });
      return false;
    }
    if (!formData.Title.trim()) {
      setError({
        target: "Title",
        message: "Please give your course a fun name!",
      });
      return false;
    }
    if (!formData.Subject?.trim()) {
      setError({
        target: "Subject",
        message: "Tell us the course subject!",
      });
      return false;
    }
    if (!formData.Description?.trim()) {
      setError({
        target: "Description",
        message: "Tell us what your course is about!",
      });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    // Add any validation for step 2 if needed
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setError({ target: "", message: "" });
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      setError({ target: "", message: "" });
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError({ target: "", message: "" });
    }
  };

  const handleTestPrompt = async () => {
    if (!formData.Prompt?.trim()) {
      setError({
        target: "Prompt",
        message: "Please enter a prompt to test!",
      });
      return;
    }
    setTestPrompt(true);
    setTimeout(() => {
      setTestPrompt(false);
    }, 2000);
  };

  const handleSubmit = () => {
    console.log("Form Data", formData);
    console.log("isEditing", isEditing);

    if (isEditing && formData.Id && course) {
      updateCourse(formData as GameDataI, formData.Id);
    } else {
      // When creating a new course, ensure formData is valid
      createGame(formData as GameDataI);
    }
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      size="2xl"
      title={isEditing ? "Edit Game" : "Add Games 🎮"}
      subTitle={
        isEditing
          ? "Let's update this course! 🌟"
          : "Let's Create a new course! 🌟"
      }
    >
      <div className="">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-comic text-lg ${
                      step >= stepNumber
                        ? "bg-primary-400 text-white"
                        : "bg-primary-100 text-primary-400"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-16 h-1 ${
                        step > stepNumber ? "bg-primary-500" : "bg-primary-100"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form className="px-2">
            {step === 1 && (
              /* Step 1: Basic Information */
              <div
                className="overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 280px)" }}
              >
                <div className=" flex justify-between gap-8 p-2">
                  <div className="w-2/5 h-full">
                    <label className="font-comic text-lg text-primary-600  block">
                      Course Image <span className="text-red-500">*</span>
                    </label>
                    <ImageUploader
                      onImageUploaded={(img: string) => {
                        setFormData({ ...formData, ImageUrl: img });
                      }}
                      initialUrl={formData.ImageUrl}
                    />
                    {error.target === "ImageUrl" && (
                      <p className="text-red-500 font-comic mt-1">
                        {error.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col w-3/5 h-full">
                    <div>
                      <label className="font-comic text-lg text-primary-600 mb-2 block">
                        Course Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.Title}
                        onChange={(e) => {
                          setError({ target: "", message: "" });
                          setFormData({ ...formData, Title: e.target.value });
                        }}
                        className={`w-full px-4 py-2 rounded-2xl border-4 bg-white ${
                          error.target === "Title"
                            ? "border-red-300"
                            : "border-primary-200"
                        } focus:border-primary-400 font-comic text-lg outline-none`}
                        placeholder="Enter a fun course name!"
                      />
                      {error.target === "Title" && (
                        <p className="text-red-500 font-comic mt-2">
                          {error.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="font-comic text-lg text-primary-600 mb-2 block">
                        Course Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.Subject || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            Subject: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 bg-white rounded-2xl border-4 ${
                          error.target === "Subject"
                            ? "border-red-300"
                            : "border-primary-200"
                        } focus:border-primary-400 font-comic text-lg outline-none`}
                      >
                        <option value="" disabled>
                          Select a subject
                        </option>
                        {subjects.map((sub, index) => (
                          <option key={index} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                      {error.target === "Subject" && (
                        <p className="text-red-500 font-comic mt-2">
                          {error.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="font-comic text-lg  text-primary-600 mb-2 block">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.Description || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            Description: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2 rounded-2xl bg-white border-4 ${
                          error.target === "Description"
                            ? "border-red-300"
                            : "border-primary-200"
                        } focus:border-primary-400 font-comic text-lg outline-none`}
                        rows={4}
                        placeholder="What's this course all about?"
                      />
                      {error.target === "Description" && (
                        <p className="text-red-500 font-comic mt-2">
                          {error.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              /* Step 2: Course Details */
              <div
                className="space-y-6 mb-4 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 300px)" }}
              >
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="font-comic text-xl text-primary-600 mb-2 block">
                      Course Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.Type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          Type: e.target.value as GameDataI["Type"],
                        })
                      }
                      className="w-full px-4 py-3 bg-white rounded-2xl border-4 border-primary-200 focus:border-primary-400 font-comic text-lg outline-none"
                    >
                      <option value="" disabled>
                        Select a type
                      </option>
                      {courseTypes?.map((type, index) => (
                        <option key={index} value={type.Name}>
                          {type.Name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-comic text-xl text-primary-600 mb-2 block">
                      Select Grade
                    </label>
                    <select
                      value={formData.GameLevel || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          GameLevel: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 bg-white rounded-2xl border-4 border-primary-200 focus:border-primary-400 font-comic text-lg outline-none"
                    >
                      <option value={0}>Select a class</option>
                      {[1, 2, 3, 4, 5, 6].map((grade, index) => (
                        <option key={index} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-comic text-xl text-primary-600 mb-2 block">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={formData.Duration || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          Duration: parseInt(e.target.value) || undefined,
                        })
                      }
                      className="w-full px-4 py-3 bg-white rounded-2xl border-4 border-primary-200 focus:border-primary-400 font-comic text-lg outline-none"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="font-comic text-xl text-primary-600 mb-2 block">
                      Number of questions
                    </label>
                    <input
                      type="number"
                      value={formData.NumberOfQuestions || ""}
                      min={1}
                      max={20}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          NumberOfQuestions:
                            parseInt(e.target.value) || undefined,
                        })
                      }
                      className="w-full px-4 py-3 bg-white rounded-2xl border-4 border-primary-200 focus:border-primary-400 font-comic text-lg outline-none"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="font-comic text-xl text-primary-600 mb-2 block">
                      Number of Levels
                    </label>
                    <input
                      type="number"
                      value={formData.NumberOfLevels || ""}
                      min={1}
                      max={20}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          NumberOfLevels: parseInt(e.target.value) || undefined,
                        })
                      }
                      className="w-full px-4 py-3 bg-white rounded-2xl border-4 border-primary-200 focus:border-primary-400 font-comic text-lg outline-none"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="font-comic text-xl text-primary-600 mb-2 block">
                      Questions per page
                    </label>
                    <input
                      type="number"
                      value={formData.QuestionsPerPage || ""}
                      min={1}
                      max={6}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          QuestionsPerPage:
                            parseInt(e.target.value) || undefined,
                        })
                      }
                      className="w-full px-4 py-3 bg-white rounded-2xl border-4 border-primary-200 focus:border-primary-400 font-comic text-lg outline-none"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="font-comic text-xl text-primary-600 mb-2 block">
                      Pass Marks
                    </label>
                    <input
                      type="number"
                      value={formData.PassScore || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          PassScore: parseInt(e.target.value) || undefined,
                        })
                      }
                      className="w-full px-4 py-3 bg-white rounded-2xl border-4 border-primary-200 focus:border-primary-400 font-comic text-lg outline-none"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="font-comic text-xl text-primary-600 mb-2 block">
                      Tutorial Video
                    </label>
                    <input
                      type="text"
                      value={formData.TutorialVideo || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          TutorialVideo: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-white rounded-2xl border-4 border-primary-200 focus:border-primary-400 font-comic text-lg outline-none"
                      placeholder="Video URL"
                    />
                  </div>
                  <div>
                    <label className="font-comic text-xl text-primary-600 mb-2 block">
                      Status
                    </label>
                    <select
                      value={formData.Status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          Status: e.target.value as GameDataI["Status"],
                        })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-white border-4 border-primary-200 focus:border-primary-400 font-comic text-lg outline-none"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              /* Step 3: Course Prompt */
              <div
                className="space-y-6 mb-4 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 300px)" }}
              >
                <div className="w-full h-full flex gap-4 justify-between">
                  <div className="w-1/2 h-full">
                    <label className="font-comic text-xl text-primary-600 mb-2 block">
                      Course Prompt <span className="text-red-500">*</span>
                    </label>
                    <p className="text-gray-600 font-comic mb-2">
                      Write a detailed prompt that will be used to generate
                      content for your course. Be specific about the topics,
                      learning outcomes, and target audience.
                    </p>
                    <textarea
                      value={formData.Prompt || ""}
                      onChange={(e) => {
                        setError({ target: "", message: "" });
                        setFormData({
                          ...formData,
                          Prompt: e.target.value,
                        });
                      }}
                      disabled={isPending}
                      className={`w-full px-4 py-3 rounded-2xl border-4 ${
                        error.target === "Prompt"
                          ? "border-red-300"
                          : "border-primary-200"
                      } focus:border-primary-400 font-comic bg-white text-lg outline-none`}
                      rows={6}
                      placeholder="Create a course about [subject] that teaches students how to [skills]. Include concepts like [concept1], [concept2], etc. Target audience is [age/level]."
                    />
                    {error.target === "Prompt" && (
                      <p className="text-red-500 font-comic mt-2">
                        {error.message}
                      </p>
                    )}

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleTestPrompt}
                        disabled={
                          testingPrompt || !formData.Prompt?.trim() || isPending
                        }
                        className="px-6 py-2 rounded-full bg-primary-400 text-white font-comic text-lg hover:bg-secondary-600 transition-all"
                      >
                        {testingPrompt ? "Testing..." : "Test Prompt 🧪"}
                      </button>
                    </div>
                  </div>

                  <div className="w-1/2 h-full">
                    <label className="font-comic text-xl text-primary-600 mb-2 block">
                      Prompt Test Results
                    </label>
                    <p className="text-gray-600 font-comic mb-2">
                      This shows a preview of what the AI might generate based
                      on your prompt. The results may match the following
                      format:
                      <br />
                      <span className="text-primary-500 font-bold">
                        {" "}
                        {getResponseType(formData.Type ?? "")}
                      </span>
                    </p>

                    <div className="w-full h-52 p-2 rounded-2xl border-4 border-green-200 bg-green-50 font-comic text-gray-700 whitespace-pre-line overflow-y-auto">
                      {testingPrompt && (
                        <div className="flex items-center justify-center h-full relative">
                          <Loading
                            overlay={true}
                            fullScreen={false}
                            size="sm"
                          />
                        </div>
                      )}
                      {!testingPrompt && !promptOutput && "No results yet!"}
                      {promptOutput}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isPending}
                  className="px-10 py-3 rounded-full border-4 border-primary-300 text-primary-600 font-comic text-xl hover:bg-primary-50 transition-all"
                >
                  ← Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={isPending}
                className="ml-auto px-20 py-3 rounded-full bg-primary-500 text-white font-comic text-xl hover:bg-primary-600 transition-all"
              >
                {isPending
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : step === 3
                  ? isEditing
                    ? "Update Course! 🚀"
                    : "Create Course! 🚀"
                  : "Next →"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </Modal>
  );
};

export default AddGameForm;
