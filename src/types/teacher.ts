export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface TeacherData {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  image: string | null;
  subject: string | null;
  grade: string | null;
  joinDate: string;
  status: string;
  studentsCount: number;
  rating: number;
  likes: number;
}

export interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: Address;
}

export interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  profilePicture?: string;
  profilePicturePreview?: string;
  aboutMe: string;
  subjects: string[];
  address: Address;
  teachingMode: "school" | "independent" | "";
  schoolCode: string;
  selectedPlan?: string;
  paymentData: PaymentData;
}

export interface FormErrors {
  [key: string]: string;
}

export interface StepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export interface OrganizationInfo {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  logo: string | null;
  address: unknown;
  type: "School" | "NGO" | "Public";
}

export interface TeacherInvitation {
  id: string;
  token: string;
  email: string;
  status: "Active" | "Inactive" | "Pending" | "Suspended";
  expiresAt: Date;
  organization: OrganizationInfo | null;
}

export interface ApiResponse<T> {
  status: "Success" | "Error";
  data: T | null;
  message: string;
}

export const SUBJECT_OPTIONS = [
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "english", label: "English" },
  { value: "french", label: "French" },
  { value: "history", label: "History" },
  { value: "geography", label: "Geography" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "computer_science", label: "Computer Science" },
  { value: "art", label: "Art" },
  { value: "music", label: "Music" },
  { value: "physical_education", label: "Physical Education" },
  { value: "social_studies", label: "Social Studies" },
  { value: "kinyarwanda", label: "Kinyarwanda" },
];

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const formatCardNumber = (value: string) => {
  return value
    .replace(/\s/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
};

export const validateEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return passwordRegex.test(password);
};

export const validateFullName = (name: string): boolean => {
  return name.trim().split(" ").length >= 2 && name.length >= 5;
};
