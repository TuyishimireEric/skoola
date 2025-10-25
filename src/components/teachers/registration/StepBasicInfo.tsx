"use client";

import { useRef, useState } from "react";
import { Upload, Check, Sparkles } from "lucide-react";
import { uploadImage } from "@/server/actions";
import { StepProps, SUBJECT_OPTIONS } from "@/types/teacher";

export const StepBasicInfo: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  onNext,
  isLoading,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBoxClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    fileInputRef.current?.click();
  };

  const handleProfilePictureUpload = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;

    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const result = await uploadImage(form);

      if (result.success && result.image) {
        setFormData({
          ...formData,
          profilePicture: result.image.secure_url,
          profilePicturePreview: URL.createObjectURL(file),
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleProfilePictureUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.subjects.length === 0) {
      newErrors.subjects = "Please select at least one subject";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-amber-900 mb-2">
            Complete Your Profile
          </h2>
          <p className="text-lg text-amber-700">
            Tell us about your teaching expertise
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-amber-900 mb-2">
            Subject(s) You Teach <span className="text-orange-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SUBJECT_OPTIONS.map((subject) => (
              <label
                key={subject.value}
                className={`flex items-center space-x-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.subjects.includes(subject.value)
                    ? "border-orange-400 bg-orange-50"
                    : "border-amber-200 hover:border-orange-300"
                }`}
              >
                <input
                  type="checkbox"
                  value={subject.value}
                  checked={formData.subjects.includes(subject.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        subjects: [...formData.subjects, subject.value],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        subjects: formData.subjects.filter(
                          (s) => s !== subject.value
                        ),
                      });
                    }
                  }}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                    formData.subjects.includes(subject.value)
                      ? "bg-orange-500 border-orange-500"
                      : "border-amber-300"
                  }`}
                >
                  {formData.subjects.includes(subject.value) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-amber-900">
                  {subject.label}
                </span>
              </label>
            ))}
          </div>
          {errors.subjects && (
            <p className="text-red-600 text-sm mt-1">{errors.subjects}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-amber-900 mb-2">
            About Me (Optional)
          </label>
          <textarea
            value={formData.aboutMe}
            onChange={(e) =>
              setFormData({ ...formData, aboutMe: e.target.value })
            }
            placeholder="Tell students and parents about your teaching experience..."
            rows={4}
            className="w-full p-4 rounded-xl border-2 border-amber-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none bg-white/80 backdrop-blur-sm text-amber-900 resize-none"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-amber-900 mb-3">
            Upload Profile Picture (Optional)
          </label>
          <div
            className={`relative border-3 border-dashed rounded-3xl p-8 transition-all duration-300 ${
              dragActive
                ? "border-orange-400 bg-orange-50 shadow-lg"
                : "border-amber-300 hover:border-orange-400 hover:bg-orange-50"
            } ${
              uploadingImage
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={!uploadingImage ? handleBoxClick : undefined}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProfilePictureUpload(file);
              }}
              className="hidden"
              disabled={uploadingImage}
            />

            {uploadingImage ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-300 border-t-orange-500 mx-auto mb-4"></div>
                <p className="text-amber-700">Uploading image...</p>
              </div>
            ) : formData.profilePicturePreview ? (
              <div className="text-center">
                <img
                  src={formData.profilePicturePreview}
                  alt="Profile preview"
                  className="w-32 h-32 object-cover mx-auto mb-4 rounded-full shadow-md"
                />
                <p className="text-sm text-green-700 font-medium mb-3">
                  ✨ Profile picture uploaded successfully!
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData({
                      ...formData,
                      profilePicture: undefined,
                      profilePicturePreview: undefined,
                    });
                  }}
                  className="text-red-500 text-sm hover:text-red-700 font-medium transition-colors"
                >
                  Remove Picture
                </button>
              </div>
            ) : (
              <div className="text-center pointer-events-none">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-amber-800 font-medium mb-2">
                  Drag & drop your photo here, or{" "}
                  <span className="text-orange-600 font-semibold underline">
                    browse files
                  </span>
                </p>
                <p className="text-xs text-amber-600">
                  PNG, JPG, or GIF up to 5MB
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={formData.subjects.length === 0 || isLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-5 px-8 rounded-2xl text-lg font-bold hover:from-orange-600 hover:to-amber-700 transform hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md"
        >
          <span className="flex items-center justify-center">
            Continue to Location
            <Sparkles className="w-5 h-5 ml-2" />
          </span>
        </button>
      </div>
    </div>
  );
};
