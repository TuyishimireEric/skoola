"use client";

import { ChevronLeft, MapPin, Sparkles } from "lucide-react";
import { Input } from "@/components/form/Input";
import { SelectOptions } from "@/components/form/SelectOptions";
import { COUNTRIES } from "@/utils/countries";
import { StepProps } from "@/types/teacher";
import { useUpdateTeacher } from "@/hooks/teacher/useUpdateTeacherProfile";
import { useEffect } from "react";
import { useClientSession } from "@/hooks/user/useClientSession";

export const StepAddress: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  onNext,
  onBack,
}) => {
  const updateTeacherProfile = useUpdateTeacher();

  const { userId } = useClientSession();

  const countryOptions = COUNTRIES.map((country) => ({
    value: country.code,
    label: country.name,
  }));

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.address.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!formData.address.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.address.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const teacherData = {
      AboutMe: formData.aboutMe,
      Address: JSON.stringify(formData.address),
      ImageUrl: formData.profilePicture,
      Id: userId,
    };

    updateTeacherProfile.mutate(teacherData);
  };

  useEffect(() => {
    if (updateTeacherProfile.isSuccess) {
      onNext();
    }
  }, [updateTeacherProfile.isSuccess, onNext]);

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-4">
        <div className="text-center lg:text-left">
          <h2 className="text-4xl font-bold text-amber-900 mb-4">
            Your Location
          </h2>
          <p className="text-lg text-amber-700">
            Help us connect you with students in your area 📍
          </p>
        </div>

        <div className="grid gap-4">
          <SelectOptions
            label="Country"
            value={formData.address.country}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: {
                  ...formData.address,
                  country: e,
                },
              })
            }
            options={countryOptions}
            placeholder="Select your country"
            icon="🌍"
            valid={!!formData.address.country}
            errorMessage={errors.country}
            searchable={true}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="State/Province"
              name="state"
              value={formData.address.state}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, state: e.target.value },
                })
              }
              placeholder="State/Province"
              icon="🗺️"
            />

            <Input
              label="City"
              name="city"
              value={formData.address.city}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value },
                })
              }
              placeholder="Your City"
              icon="🏙️"
              errorMessage={errors.city}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Street Address"
              name="street"
              value={formData.address.street}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: {
                    ...formData.address,
                    street: e.target.value,
                  },
                })
              }
              placeholder="123 Main Street"
              icon={<MapPin className="w-5 h-5 text-amber-600" />}
              errorMessage={errors.street}
              required
            />

            <Input
              label="ZIP/Postal Code"
              name="zipCode"
              value={formData.address.zipCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: {
                    ...formData.address,
                    zipCode: e.target.value,
                  },
                })
              }
              placeholder="12345"
              icon="📮"
            />
          </div>
        </div>
      </div>

      <div className="flex items-end justify-center">
        <div className="text-center space-y-6 bg-gradient-to-br from-amber-50 to-orange-100 p-12 rounded-3xl border-2 border-orange-200">
          <div className="text-9xl animate-pulse">🎓</div>
          <h3 className="text-xl font-bold text-amber-900">
            Connect Globally, Teach Locally
          </h3>
          <p className="text-amber-700 leading-relaxed">
            Your location helps us provide relevant content and connect you with
            nearby opportunities
          </p>
        </div>
      </div>

      <div className="lg:col-span-2 flex gap-4">
        <button
          onClick={onBack}
          className="px-8 py-5 bg-amber-100 text-amber-800 rounded-2xl font-bold hover:bg-amber-200 transition-all duration-300 flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            !formData.address.street ||
            !formData.address.city ||
            !formData.address.country ||
            updateTeacherProfile.isPending
          }
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-5 px-8 rounded-2xl text-lg font-bold hover:from-orange-600 hover:to-amber-700 transform hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {updateTeacherProfile.isPending ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Updating...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              Continue
              <Sparkles className="w-5 h-5 ml-2" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
