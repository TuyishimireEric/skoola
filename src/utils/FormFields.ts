import { MdOutlineAlternateEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaUserTie } from "react-icons/fa";
import { RegisterOptions } from "react-hook-form";

export interface FormField {
  name?: string;
  type: string;
  label?: string;
  icon?: React.ReactNode;
  placeholder: string;
  validation: RegisterOptions;
}

export const Fields = {
  email: {
    type: "email",
    label: "Email",
    icon: MdOutlineAlternateEmail,
    placeholder: "Enter your Email",
    validation: {
      required: "Email is required",
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Invalid email address",
      },
    },
  },
  password: {
    type: "password",
    label: "Password",
    icon: RiLockPasswordFill,
    placeholder: "Enter your password",
    validation: {
      required: "Password is required",
      minLength: {
        value: 3,
        message: "Password must be at least 3 characters long",
      },
      pattern: {
        value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{3,}$/,
        message: "Please provide a strong password, example: Abc123@#$",
      },
    },
  },
  fullName: {
    type: "text",
    label: "Full Name",
    icon: FaUserTie,
    placeholder: "Enter your Full Name",
    validation: {
      required: "Name is required",
      minLength: {
        value: 3,
        message: "Name must be at least 3 characters",
      },
      maxLength: {
        value: 30,
        message: "Name must be lower than 30 characters",
      },
    },
  },
  courseName: {
    type: "text",
    label: "Course Name",
    icon: FaUserTie,
    placeholder: "Enter the course name",
    validation: {
      required: "The course name is required",
      minLength: {
        value: 3,
        message: "The course name must be at least 3 characters",
      },
      maxLength: {
        value: 30,
        message: "The course name must be lower than 30 characters",
      },
    },
  },
  description: {
    type: "textArea",
    label: "Course description",
    icon: FaUserTie,
    placeholder: "Enter the course description",
    validation: {
      required: "The course description is required",
      minLength: {
        value: 3,
        message: "The course description must be at least 10 characters",
      },
      maxLength: {
        value: 30,
        message: "The course description must be lower than 2000 characters",
      },
    },
  },
  ageGroup: {
    type: "dropdown",
    label: "Age group",
    icon: FaUserTie,
    placeholder: "5-7",
    validation: {
      required: "The course age group is required",
    },
  },
  languages: {
    type: "dropdown",
    label: "Course language",
    icon: FaUserTie,
    placeholder: "Select the course languages",
    validation: {
      required: "The course language is required",
    },
  },
  moderator: {
    type: "dropdown",
    label: "Course language",
    icon: FaUserTie,
    placeholder: "Select the course languages",
    validation: {
      required: "The course language is required",
    },
  }
} as const;

export const formFields = {
  login: ["email", "password"] as const,
  register: ["fullName", "email", "password"] as const,
  addCourse: ["courseName", "description", "ageGroup", "languages", "moderator"] as const,
};

export type LoginFormFields = (typeof formFields.login)[number];
export type RegisterFormFields = (typeof formFields.register)[number];
export type AddCourseFormFields = (typeof formFields.addCourse)[number];

export function getFieldConfig(field: LoginFormFields | RegisterFormFields| AddCourseFormFields) {
  return Fields[field];
}
