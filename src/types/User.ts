export interface NewUserInterface {
  FullName: string;
  Email?: string;
  ParentEmail?: string;
  ParentName?: string;
  LoginCode?: string;
  Password?: string;
  Grade?: string;
  UserRole?: UserType;
  ImageUrl?: string;
  GoogleId?: string;
  DateOfBirth?: string;
  IsVerified?: boolean;
  UserNumber?: number;
}

export interface NewTeacherInterface {
  FullName: string;
  Email: string;
}

export interface UpdateUserInterface {
  Id?: string;
  FullName?: string;
  Email?: string;
  ParentEmail?: string;
  ParentName?: string;
  LoginCode?: string;
  Password?: string;
  Grade?: string;
  Token?: string;
  UserRole?: UserType;
  ImageUrl?: string;
  GoogleId?: string;
  DateOfBirth?: string;
  IsVerified?: boolean;
  UserNumber?: number;
  Address?: string;
  Phone?: string;
  Gender?: string;
  AboutMe?: string;
  CurrentClass?: Record<string, string>;
  AssignedClasses?: string[];
}

export interface UserDataI {
  Id: string;
  FullName: string;
  Email: string;
  ImageUrl: string;
  Role: string;
  IsVerified: boolean;
  LoginCode: string;
  Phone: string;
  CreatedOn: string;
  LastLogin: string;
  Address: string;
  DateOfBirth: string;
  UserNumber: number;
  Gender: string;
  ParentEmail: string;
  ParentName: string;
  ParentImage: string;
}

export interface UserInterface {
  Id: string;
  FullName: string;
  Email: string;
  ImageUrl: string;
  Role: string;
  IsVerified: boolean;
  ParentEmail: string;
  ParentName: string;
  LoginCode: string;
  Phone: string;
  CreatedOn: string;
  UpdatedOn: string;
  LastLogin: string;
  Address: string;
  DateOfBirth: string;
  CurrentClass: Record<string, string>;
  AssignedClasses: string[];
  Organization: Record<string, string>;
}

export interface StudentData {
  fullName: string;
  dateOfBirth: string;
  parentName: string;
  parentEmail: string;
}

export interface StudentResponseI {
  row: {
    Id: string;
    FullName: string;
    LoginCode: string | null;
    ParentEmail: string | null;
  }[];
  message: string;
}

export enum UserType {
  STUDENT = "student",
  PARENT = "parent",
  STAFF = "staff",
  USER = "user",
}

export interface LoginFormI {
  username?: string;
  password: string;
  email: string;
}
