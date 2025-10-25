"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Upload,
  Users,
  Mail,
  Building,
  Sparkles,
  Check,
  X,
  Globe,
  Crown,
  Zap,
  Shield,
  Star,
  BookOpen,
  Headphones,
  UserCheck,
  TrendingUp,
  CreditCard,
  Lock,
} from "lucide-react";
import { Input } from "../form/Input";
import { motion } from "framer-motion";
import PhoneInputElement from "../form/PhoneInput";
import { SelectOptions } from "../form/SelectOptions";
import { COUNTRIES } from "@/utils/countries";
import { uploadImage } from "@/server/actions";
import { useSubscriptions } from "@/hooks/subscriptions/useSubscriptions";
import { useCreateOrganization } from "@/hooks/organizations/useCreateOrganization";
import { useSubscribe } from "@/hooks/subscriptions/useSubscribe";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface FormData {
  schoolName: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string;
  logoPreview?: string;
  address: Address;
  estimatedTeachers: number;
  description?: string;
  selectedPlan?: string;
  paymentData: PaymentData;
}

interface FormErrors {
  [key: string]: string;
}

const SchoolRegistrationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const { data: plans } = useSubscriptions();

  const [formData, setFormData] = useState<FormData>({
    schoolName: "",
    email: "",
    phone: "",
    website: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    estimatedTeachers: 0,
    description: "",
    selectedPlan: "",
    paymentData: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      billingAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [currentView, setCurrentView] = useState<string>("cards");
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const createOrganizationMutation = useCreateOrganization({
    setOrgId: setOrganizationId,
  });
  const subscribe = useSubscribe();

  const handleBoxClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent click if clicked on a button (like remove)
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    fileInputRef.current?.click();
  };

  // Validation helpers
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const websiteRegex = /^https?:\/\/.+\..+/;

  const isNameValid = formData.schoolName.length >= 3;
  const isEmailValid = emailRegex.test(formData.email);
  const isWebsiteValid =
    !formData.website || websiteRegex.test(formData.website);

  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;
    if (file && file.type.startsWith("image/")) {
      const form = new FormData();
      form.append("file", file);

      const result = await uploadImage(form);

      if (result.success && result.image) {
        setFormData({
          ...formData,
          logo: result.image.secure_url,
          logoPreview: URL.createObjectURL(file),
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleLogoUpload(files[0]);
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

  const validateBasicInfo = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = "School name is required";
    } else if (formData.schoolName.length < 3) {
      newErrors.schoolName = "Name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isEmailValid) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!isPhoneValid) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (formData.website && !isWebsiteValid) {
      newErrors.website = "Please enter a valid website URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePlan = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.selectedPlan) {
      newErrors.selectedPlan = "Please select a subscription plan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.paymentData.cardNumber.replace(/\s/g, "")) {
      newErrors.cardNumber = "Card number is required";
    } else if (formData.paymentData.cardNumber.replace(/\s/g, "").length < 16) {
      newErrors.cardNumber = "Please enter a valid card number";
    }

    if (!formData.paymentData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    }

    if (!formData.paymentData.cvv) {
      newErrors.cvv = "CVV is required";
    } else if (formData.paymentData.cvv.length < 3) {
      newErrors.cvv = "CVV must be at least 3 digits";
    }

    if (!formData.paymentData.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBasicInfoSubmit = () => {
    if (validateBasicInfo()) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(2);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePlanSubmit = () => {
    if (validatePlan()) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(4);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleRegister = async () => {
    const organizationData = {
      Name: formData.schoolName,
      Email: formData.email,
      Phone: formData.phone,
      Logo: formData.logo,
      Address: formData.address,
      Type: "School" as const,
    };

    createOrganizationMutation.mutate(organizationData);
  };

  const handlePaymentSubmit = async () => {
    if (!validatePayment()) return;
    if (!organizationId) return;

    if (formData.selectedPlan && selectedPlanData) {
      setIsLoading(true);

      try {
        return;
        // const subscriptionData = {
        //   organizationId,
        //   subscriptionPlanId: Number(formData.selectedPlan),
        //   paymentMethod: "bank",
        //   paymentAmount: Number(selectedPlanData.AnnualPrice),
        //   paymentCurrency: "USD",
        //   paymentReceipt: "",
        //   billingCycle: "annual",
        //   autoRenew: true,
        // };

        // subscribe.mutate(subscriptionData);
      } catch (error) {
        console.error("Error processing payment:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (createOrganizationMutation.isSuccess) {
      setTimeout(() => {
        setCurrentStep(3);
        setIsAnimating(false);
      }, 300);
    }
  }, [createOrganizationMutation.isSuccess]);

  useEffect(() => {
    if (subscribe.isSuccess) {
      setTimeout(() => {
        setCurrentStep(5);
        setIsAnimating(false);
      }, 300);
    }
  }, [subscribe.isSuccess]);

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const selectedPlanData = plans?.find(
    (plan) => plan.Id.toString() === formData.selectedPlan
  );

  const countryOptions = COUNTRIES.map((country) => ({
    value: country.code,
    label: country.name,
  }));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="space-y-4 col-span-6">
              <div className="text-center lg:text-left">
                <h1 className="text-5xl font-bold text-amber-900 mb-2 leading-tight">
                  Join Ganzaa
                </h1>
                <p className="text-lg text-amber-700 leading-relaxed">
                  Shape tomorrow’s leaders through smart, engaging learning
                  experiences.
                </p>
              </div>

              <div className="grid gap-4">
                <Input
                  label="School Name"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      schoolName: e.target.value || "",
                    })
                  }
                  placeholder="Enter your school name"
                  icon="🏫"
                  valid={isNameValid}
                  errorMessage={errors.schoolName}
                  required
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="admin@yourschool.com"
                    icon={<Mail className="w-5 h-5 text-amber-600" />}
                    valid={isEmailValid}
                    errorMessage={errors.email}
                    showValidIcon={false}
                    required
                  />

                  <PhoneInputElement
                    label=" Phone Number"
                    value={formData.phone}
                    setValue={(e) => setFormData({ ...formData, phone: e })}
                    disabled={isLoading}
                    isValid={isPhoneValid}
                    setIsValid={(value) => setIsPhoneValid(value)}
                    placeholder="Enter Phone Number"
                  />
                </div>

                <Input
                  label="Website (Optional)"
                  name="website"
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://yourschool.com"
                  icon={<Globe className="w-5 h-5 text-amber-600" />}
                  valid={isWebsiteValid}
                  errorMessage={errors.website}
                />
              </div>
            </div>

            <div className="space-y-8 col-span-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-amber-900 tracking-wide">
                  Upload School Logo (Optional)
                </label>
                <div
                  className={`relative border-3 border-dashed rounded-3xl p-8 transition-all duration-300 ${
                    dragActive
                      ? "border-orange-400 bg-orange-50 shadow-lg"
                      : "border-amber-300 hover:border-orange-400 hover:bg-orange-50"
                  }`}
                  onClick={handleBoxClick}
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
                      if (file) handleLogoUpload(file);
                    }}
                    className="hidden"
                  />

                  {formData.logoPreview ? (
                    <div className="text-center">
                      <img
                        src={formData.logoPreview}
                        alt="Logo preview"
                        className="w-32 h-32 object-contain mx-auto mb-4 rounded-2xl shadow-md"
                      />
                      <p className="text-sm text-green-700 font-medium mb-3">
                        ✨ Logo uploaded successfully!
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent parent click
                          setFormData({
                            ...formData,
                            logo: undefined,
                            logoPreview: undefined,
                          });
                        }}
                        className="text-red-500 text-sm hover:text-red-700 font-medium transition-colors"
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <div className="text-center relative pointer-events-none">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-amber-600" />
                      </div>
                      <p className="text-amber-800 font-medium mb-2">
                        Drag & drop your logo here, or{" "}
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
                onClick={handleBasicInfoSubmit}
                disabled={!isNameValid || !isEmailValid || !isPhoneValid}
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

      case 2:
        return (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <div className="text-center lg:text-left">
                <h2 className="text-4xl font-bold text-amber-900 mb-4">
                  School Location
                </h2>
                <p className="text-lg text-amber-700">
                  Help us locate your school on the global map 🌍
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
                  errorMessage="Please select a country"
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
                    placeholder="123 Education Street"
                    icon={<Building className="w-5 h-5 text-amber-600" />}
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
                <div className="text-9xl animate-pulse">🌍</div>
                <h3 className="text-xl font-bold text-amber-900">
                  Global Education Network
                </h3>
                <p className="text-amber-700 leading-relaxed">
                  Join thousands of schools worldwide using Ganzaa to
                  revolutionize education
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 flex gap-4">
              <button
                onClick={handleBack}
                className="px-8 py-5 bg-amber-100 text-amber-800 rounded-2xl font-bold hover:bg-amber-200 transition-all duration-300 flex items-center"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                onClick={handleRegister}
                disabled={
                  !formData.address.street ||
                  !formData.address.city ||
                  !formData.address.country ||
                  createOrganizationMutation.isPending
                }
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-5 px-8 rounded-2xl text-lg font-bold hover:from-orange-600 hover:to-amber-700 transform hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {createOrganizationMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Registering your school...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Save & Continue
                    <Sparkles className="w-5 h-5 ml-2" />
                  </span>
                )}
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900 mb-4">
                Choose Your Perfect Plan
              </h2>
              <p className="text-xl text-amber-700 max-w-2xl mx-auto leading-relaxed">
                Select the plan that matches your school&apos;s needs and unlock
                the future of education 🌟
              </p>
            </div>

            {/* Plan Comparison Toggle */}
            <div className="flex justify-center">
              <div className="bg-amber-100 rounded-full p-1 inline-flex">
                <button
                  className={`px-6 py-3 rounded-full font-bold transition-all ${
                    currentView === "cards"
                      ? "bg-white text-orange-600 shadow-md"
                      : "text-amber-700"
                  }`}
                  onClick={() => setCurrentView("cards")}
                >
                  Plan Cards
                </button>
                <button
                  className={`px-6 py-3 rounded-full font-bold transition-all ${
                    currentView === "comparison"
                      ? "bg-white text-orange-600 shadow-md"
                      : "text-amber-700"
                  }`}
                  onClick={() => setCurrentView("comparison")}
                >
                  Feature Comparison
                </button>
              </div>
            </div>

            {currentView === "cards" ? (
              <div className="grid lg:grid-cols-3 gap-8 px-8">
                {plans?.map((plan) => {
                  const isSelected =
                    formData.selectedPlan === plan.Id.toString();
                  const isPopular = plan.PlanType === "professional";
                  const isEnterprise = plan.PlanType === "enterprise";

                  return (
                    <div
                      key={plan.Id}
                      className={`relative rounded-3xl p-8 pt-16 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                        isSelected
                          ? "bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-orange-400 shadow-xl"
                          : "bg-white border-2 border-amber-200 hover:border-orange-300 shadow-lg hover:shadow-xl"
                      } ${
                        isEnterprise ? "lg:transform lg:hover:scale-110" : ""
                      }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          selectedPlan: plan.Id.toString(),
                        })
                      }
                    >
                      {isPopular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            Most Popular
                          </div>
                        </div>
                      )}

                      {isEnterprise && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-yellow-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                            <Zap className="w-4 h-4 mr-1" />
                            Premium
                          </div>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <h3 className="text-2xl truncate font-bold text-amber-900 mb-2">
                          {plan.PlanName}
                        </h3>
                        <p className="text-amber-700 text-sm leading-relaxed mb-4">
                          {plan.Description}
                        </p>
                        <div className="text-6xl my-4 font-bold text-orange-600 mb-1">
                          ${plan.AnnualPrice}
                          <span className="text-lg text-amber-600 font-normal">
                            /year
                          </span>
                        </div>
                        <p className="text-sm text-amber-500">
                          {plan.MaxStudents ? (
                            <>For schools up to {plan.MaxStudents} students</>
                          ) : (
                            <>Unlimited students</>
                          )}
                        </p>
                      </div>

                      {/* Plan Highlights */}
                      <div className="mb-6">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          <div className="flex-1 border-t border-amber-200"></div>
                          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                            Key Features
                          </span>
                          <div className="flex-1 border-t border-amber-200"></div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Users className="w-5 h-5 text-amber-600 mr-2" />
                            <span className="text-sm text-amber-800">
                              {plan.MaxTeachers || "Unlimited"} Teachers
                            </span>
                          </div>
                          <div className="flex items-center">
                            <UserCheck className="w-5 h-5 text-amber-600 mr-2" />
                            <span className="text-sm text-amber-800">
                              {plan.MaxAdminAccounts || "Unlimited"} Admin
                              Accounts
                            </span>
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="w-5 h-5 text-amber-600 mr-2" />
                            <span className="text-sm text-amber-800">
                              Full Library Access
                            </span>
                          </div>
                          {plan.PlanFeatures.advanced_analytics && (
                            <div className="flex items-center">
                              <TrendingUp className="w-5 h-5 text-amber-600 mr-2" />
                              <span className="text-sm text-amber-800">
                                Advanced Analytics
                              </span>
                            </div>
                          )}
                          {plan.PlanFeatures.dedicated_manager && (
                            <div className="flex items-center">
                              <Headphones className="w-5 h-5 text-amber-600 mr-2" />
                              <span className="text-sm text-amber-800">
                                Dedicated Support
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-8">
                        <button
                          className={`w-full py-3 rounded-xl font-bold transition-all ${
                            isSelected
                              ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                        >
                          {isSelected ? (
                            <span className="flex items-center justify-center">
                              <Check className="w-5 h-5 mr-2" />
                              Selected
                            </span>
                          ) : (
                            "Select Plan"
                          )}
                        </button>
                      </div>

                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border-2 border-amber-200 shadow-lg overflow-hidden">
                <div className="grid grid-cols-4 gap-0">
                  {/* Feature Names Column */}
                  <div className="bg-amber-50 p-6 border-r border-amber-200">
                    <h3 className="font-bold text-amber-900 mb-6 text-lg">
                      Features
                    </h3>
                    <div className="space-y-6">
                      <div className="font-medium text-amber-800">
                        Students Capacity
                      </div>
                      <div className="font-medium text-amber-800">
                        Teachers Capacity
                      </div>
                      <div className="font-medium text-amber-800">
                        Admin Accounts
                      </div>
                      <div className="font-medium text-amber-800">
                        Library Access
                      </div>
                      <div className="font-medium text-amber-800">
                        Content Upload
                      </div>
                      <div className="font-medium text-amber-800">
                        Basic Analytics
                      </div>
                      <div className="font-medium text-amber-800">
                        Advanced Analytics
                      </div>
                      <div className="font-medium text-amber-800">
                        School Branding
                      </div>
                      <div className="font-medium text-amber-800">
                        Custom Domain
                      </div>
                      <div className="font-medium text-amber-800">
                        Parent Portal
                      </div>
                      <div className="font-medium text-amber-800">
                        API Access
                      </div>
                      <div className="font-medium text-amber-800">
                        Support Response
                      </div>
                      <div className="font-medium text-amber-800">
                        Dedicated Manager
                      </div>
                    </div>
                  </div>

                  {/* Plan Columns */}
                  {plans?.map((plan) => (
                    <div
                      key={plan.Id}
                      className={`p-6 ${
                        formData.selectedPlan === plan.Id.toString()
                          ? "bg-orange-50"
                          : ""
                      }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          selectedPlan: plan.Id.toString(),
                        })
                      }
                    >
                      <div className="flex flex-col h-full">
                        <h3 className="font-bold text-amber-900 mb-2">
                          {plan.PlanName}
                        </h3>
                        <p className="text-orange-600 font-bold mb-4">
                          ${plan.AnnualPrice}/year
                        </p>

                        <div className="space-y-6 flex-grow">
                          <div>{plan.MaxStudents || "Unlimited"}</div>
                          <div>{plan.MaxTeachers || "Unlimited"}</div>
                          <div>{plan.MaxAdminAccounts || "Unlimited"}</div>
                          <div className="text-green-600">
                            <Check className="w-5 h-5" />
                          </div>
                          <div className="text-green-600">
                            <Check className="w-5 h-5" />
                          </div>
                          <div className="text-green-600">
                            <Check className="w-5 h-5" />
                          </div>
                          <div>
                            {plan.PlanFeatures.advanced_analytics ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <X className="w-5 h-5 text-amber-400" />
                            )}
                          </div>
                          <div>
                            {plan.PlanFeatures.school_branding === "full"
                              ? "Full Branding"
                              : plan.PlanFeatures.school_branding ===
                                "logo_only"
                              ? "Logo Only"
                              : "None"}
                          </div>
                          <div>
                            {plan.PlanFeatures.custom_domain ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <X className="w-5 h-5 text-amber-400" />
                            )}
                          </div>
                          <div>
                            {plan.PlanFeatures.parent_portal ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <X className="w-5 h-5 text-amber-400" />
                            )}
                          </div>
                          <div>
                            {plan.PlanFeatures.api_access ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <X className="w-5 h-5 text-amber-400" />
                            )}
                          </div>
                          <div>
                            {plan.PlanFeatures.support_response_time === "4h"
                              ? "4 Hours"
                              : plan.PlanFeatures.support_response_time ===
                                "24h"
                              ? "24 Hours"
                              : "Standard"}
                          </div>
                          <div>
                            {plan.PlanFeatures.dedicated_manager ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <X className="w-5 h-5 text-amber-400" />
                            )}
                          </div>
                        </div>

                        <button
                          className={`mt-6 w-full py-2 rounded-lg font-bold transition-all ${
                            formData.selectedPlan === plan.Id.toString()
                              ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                        >
                          {formData.selectedPlan === plan.Id.toString()
                            ? "Selected"
                            : "Select"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.selectedPlan && (
              <div className="text-center">
                <p className="text-red-600 font-medium flex items-center justify-center">
                  <X className="w-5 h-5 mr-2" />
                  {errors.selectedPlan}
                </p>
              </div>
            )}

            <div className="flex gap-4 max-w-md mx-auto">
              <button
                onClick={handleBack}
                className="px-8 py-5 bg-amber-100 text-amber-800 rounded-2xl font-bold hover:bg-amber-200 transition-all duration-300 flex items-center"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                onClick={handlePlanSubmit}
                disabled={!formData.selectedPlan}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-5 px-8 rounded-2xl text-lg font-bold hover:from-orange-600 hover:to-amber-700 transform hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="flex items-center justify-center">
                  Continue to Payment
                  <Sparkles className="w-5 h-5 ml-2" />
                </span>
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CreditCard className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900 mb-4">
                Secure Payment
              </h2>
              <p className="text-lg text-amber-700">
                Complete your registration with our secure payment system 🔒
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Payment Form */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-6 border-2 border-orange-200">
                  <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Payment Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-amber-900 mb-2">
                        Cardholder Name{" "}
                        <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.paymentData.cardholderName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentData: {
                              ...formData.paymentData,
                              cardholderName: e.target.value,
                            },
                          })
                        }
                        placeholder="John Doe"
                        className="w-full p-4 rounded-xl border-2 border-amber-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none bg-white/80 backdrop-blur-sm text-amber-900"
                      />
                      {errors.cardholderName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.cardholderName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-amber-900 mb-2">
                        Card Number <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.paymentData.cardNumber}
                        onChange={(e) => {
                          const formatted = formatCardNumber(
                            e.target.value.slice(0, 19)
                          );
                          setFormData({
                            ...formData,
                            paymentData: {
                              ...formData.paymentData,
                              cardNumber: formatted,
                            },
                          });
                        }}
                        placeholder="1234 5678 9012 3456"
                        className="w-full p-4 rounded-xl border-2 border-amber-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none bg-white/80 backdrop-blur-sm text-amber-900"
                      />
                      {errors.cardNumber && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-2">
                          Expiry Date <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.paymentData.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.length >= 2) {
                              value =
                                value.substring(0, 2) +
                                "/" +
                                value.substring(2, 4);
                            }
                            setFormData({
                              ...formData,
                              paymentData: {
                                ...formData.paymentData,
                                expiryDate: value,
                              },
                            });
                          }}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full p-4 rounded-xl border-2 border-amber-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none bg-white/80 backdrop-blur-sm text-amber-900"
                        />
                        {errors.expiryDate && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.expiryDate}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-2">
                          CVV <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.paymentData.cvv}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);
                            setFormData({
                              ...formData,
                              paymentData: {
                                ...formData.paymentData,
                                cvv: value,
                              },
                            });
                          }}
                          placeholder="123"
                          maxLength={4}
                          className="w-full p-4 rounded-xl border-2 border-amber-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none bg-white/80 backdrop-blur-sm text-amber-900"
                        />
                        {errors.cvv && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.cvv}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-4 border-2 border-green-200">
                  <div className="flex items-center text-green-800">
                    <Shield className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">
                      Your payment is secured with 256-bit SSL encryption
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-lg">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">
                    Order Summary
                  </h3>

                  {selectedPlanData && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-amber-900">
                            {selectedPlanData.PlanName} Plan
                          </h4>
                          <p className="text-sm text-amber-700">
                            {selectedPlanData.Description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-600">
                            ${selectedPlanData.AnnualPrice}
                          </div>
                          <div className="text-sm text-amber-600">per year</div>
                        </div>
                      </div>

                      <div className="border-t border-amber-200 pt-4">
                        <div className="flex justify-between text-sm text-amber-800 mb-2">
                          <span>School:</span>
                          <span className="font-medium">
                            {formData.schoolName}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-amber-800 mb-2">
                          <span>Teachers:</span>
                          <span className="font-medium">
                            {formData.estimatedTeachers}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-amber-800">
                          <span>Billing Cycle:</span>
                          <span className="font-medium">Annual</span>
                        </div>
                      </div>

                      <div className="border-t border-amber-200 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-amber-900">
                            Total:
                          </span>
                          <span className="text-3xl font-bold text-orange-600">
                            ${selectedPlanData.AnnualPrice}
                          </span>
                        </div>
                        <p className="text-xs text-amber-600 mt-1">
                          Billed annually • Cancel anytime
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-6 border-2 border-orange-200">
                  <h4 className="font-bold text-amber-900 mb-3">
                    What happens next?
                  </h4>
                  <div className="space-y-2 text-sm text-amber-800">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <span>Instant account activation</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <span>Welcome email with setup guide</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <span>Access to your dashboard</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 max-w-md mx-auto">
              <button
                onClick={handleBack}
                className="px-8 py-5 bg-amber-100 text-amber-800 rounded-2xl font-bold hover:bg-amber-200 transition-all duration-300 flex items-center"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={subscribe.isPending}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 px-8 rounded-2xl text-lg font-bold hover:from-green-600 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {subscribe.isPending ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Processing Payment...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Complete Registration
                    <Lock className="w-5 h-5 ml-2" />
                  </span>
                )}
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-10 max-w-4xl mx-auto">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                <Check className="w-20 h-20 text-white" />
              </div>
              <div className="absolute -top-4 -right-4 text-4xl animate-bounce">
                🎉
              </div>
              <div className="absolute -bottom-4 -left-4 text-4xl animate-bounce delay-200">
                ✨
              </div>
            </div>

            <div>
              <h1 className="text-6xl font-bold text-amber-900 mb-6 leading-tight">
                Welcome to Ganzaa!
              </h1>
              <p className="text-2xl text-amber-700 mb-4">
                🎊 {formData.schoolName} is now part of the digital education
                revolution!
              </p>
              <p className="text-lg text-amber-600">
                Your journey to transforming education starts now
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-orange-200 rounded-3xl p-8 transform hover:scale-105 transition-all duration-300">
                <div className="text-5xl mb-4">📧</div>
                <h3 className="text-xl font-bold text-amber-900 mb-3">
                  Check Your Inbox
                </h3>
                <p className="text-amber-700 leading-relaxed">
                  We&apos;ve sent verification instructions and setup guides to{" "}
                  <strong>{formData.email}</strong>
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-3xl p-8 transform hover:scale-105 transition-all duration-300">
                <div className="text-5xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-amber-900 mb-3">
                  Ready to Launch
                </h3>
                <p className="text-green-700 leading-relaxed">
                  Your {selectedPlanData?.PlanName} plan is activated and ready
                  for your team to explore
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-amber-200 rounded-3xl p-8 transform hover:scale-105 transition-all duration-300">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-amber-900 mb-3">
                  Expert Support
                </h3>
                <p className="text-orange-700 leading-relaxed">
                  Our education specialists are standing by to help you succeed
                  from day one
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-orange-200 rounded-3xl p-10">
              <h3 className="text-2xl font-bold text-amber-900 mb-6">
                🎯 Your Next Steps to Success
              </h3>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="text-3xl">✅</div>
                  <p className="text-amber-800 font-medium">
                    Verify your email address
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="text-3xl">👥</div>
                  <p className="text-amber-800 font-medium">
                    Invite your teaching team
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div className="text-3xl">📚</div>
                  <p className="text-amber-800 font-medium">
                    Upload your first content
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div className="text-3xl">🎉</div>
                  <p className="text-amber-800 font-medium">
                    Launch and celebrate!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full max-w-md mx-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 px-8 rounded-2xl text-lg font-bold hover:from-green-600 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-300 shadow-xl">
                <span className="flex items-center justify-center">
                  🎯 Access Your Dashboard
                  <Sparkles className="w-5 h-5 ml-2" />
                </span>
              </button>

              <p className="text-sm text-amber-600">
                Need help? Our support team is available 24/7 at
                support@ganzaa.org
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-20 relative overflow-hidden font-comic">
      {/* Enhanced Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-40 h-40 bg-orange-200 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-amber-200 rounded-full opacity-20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-yellow-200 rounded-full opacity-15 blur-2xl animate-pulse delay-500" />
        <div className="absolute top-1/3 left-1/3 text-8xl opacity-5">🏫</div>
        <div className="absolute bottom-1/4 right-1/3 text-6xl opacity-5">
          📚
        </div>
        <div className="absolute top-1/4 right-1/4 text-5xl opacity-5">✨</div>
        <div className="absolute bottom-1/3 left-1/4 text-4xl opacity-5">
          🌍
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 container mx-auto px-6 py-10">
        {/* Step Content */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border-4 border-green-200 p-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -top-8 left-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-base sm:text-xl font-comic font-bold py-3 px-6 rounded-full shadow-lg border-4 border-white"
            >
              🏫 School Registration
            </motion.div>
            <div
              className={`transition-all duration-500 ${
                isAnimating
                  ? "opacity-0 transform translate-y-8"
                  : "opacity-100 transform translate-y-0"
              }`}
            >
              {/* Progress Bar */}
              <div className="flex justify-center mb-12">
                <div className="flex space-x-3">
                  {[1, 2, 3, 4, 5].map((step) => {
                    const isActive = step <= currentStep;
                    const isCurrent = step === currentStep;

                    return (
                      <div
                        key={step}
                        className={`relative transition-all duration-500 ${
                          isActive
                            ? "w-6 h-6 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full shadow-lg"
                            : "w-4 h-4 bg-amber-300 rounded-full"
                        } ${
                          isCurrent ? "scale-125 ring-4 ring-orange-200" : ""
                        }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolRegistrationForm;
