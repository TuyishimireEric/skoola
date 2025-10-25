export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  userType: string;
}


export interface FormErrors {
  email?: string;
  password?: string;
  verificationCode?: string;
  age?: string;
  fullName?: string;
}