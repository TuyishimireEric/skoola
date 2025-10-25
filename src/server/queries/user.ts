import { db } from "@/server/db";
import { NewUserInterface, UpdateUserInterface } from "@/types/User";
import {
  and,
  eq,
  ilike,
  count,
  desc,
  asc,
  gt,
  aliasedTable,
} from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import {
  Classes,
  Organization,
  OrganizationUser,
  ParentStudent,
  Role,
  Session,
  User,
  VerificationToken,
  ClassStudent,
  ParentStudentInvite,
} from "@/server/db/schema";
import { v4 as uuidv4 } from "uuid";
import {
  newOrganizationUserI,
  updateOrganizationUserI,
  UserOrgI,
} from "@/types";
import { DB } from "./classes";

export const addNewUser = async (formData: NewUserInterface, tx: DB = db) => {
  const user = await tx.insert(User).values(formData).returning({
    Id: User.Id,
    UserNumber: User.UserNumber,
  });
  return user;
};

export const updateUser = async (
  formData: UpdateUserInterface,
  UserId: string,
  tx: DB = db
) => {
  const updatedUser = await tx
    .update(User)
    .set(formData)
    .where(eq(User.Id, UserId))
    .returning({
      Id: User.Id,
    });
  return updatedUser;
};

export const getUserById = async (Id: string) => {
  const User = await db.query.User.findFirst({
    where: (user) => eq(user.Id, Id),
    columns: {
      Id: true,
      FullName: true,
      Email: true,
      ImageUrl: true,
      ParentEmail: true,
      IsVerified: true,
      LoginCode: true,
    },
  });
  return User;
};

export const getUserProfile = async (Id: string) => {
  // Create alias for parent user (since parents are also in the User table)
  const ParentUser = aliasedTable(User, "ParentUser");

  // Get user data with potential parent connection
  const userWithParent = await db
    .select({
      // User fields
      Id: User.Id,
      FullName: User.FullName,
      Email: User.Email,
      ImageUrl: User.ImageUrl,
      IsVerified: User.IsVerified,
      LoginCode: User.LoginCode,
      Address: User.Address,
      CreatedOn: User.CreatedOn,
      DateOfBirth: User.DateOfBirth,
      Gender: User.Gender,
      UserNumber: User.UserNumber,
      Phone: User.Phone,
      // Parent fields from the connected parent user (will be null if no parent connected)
      ParentName: ParentUser.FullName,
      ParentImage: ParentUser.ImageUrl,
      ParentEmail: ParentUser.Email,
    })
    .from(User)
    .leftJoin(ParentStudent, eq(ParentStudent.StudentId, User.Id))
    .leftJoin(ParentUser, eq(ParentStudent.ParentId, ParentUser.Id))
    .where(eq(User.Id, Id))
    .limit(1);

  if (!userWithParent || userWithParent.length === 0) {
    return null;
  }

  return userWithParent[0];
};

export const userAlreadyExist = async (Email: string) => {
  const user = await db.query.User.findFirst({
    where: (user) => eq(user.Email, Email),
    columns: {
      Id: true,
    },
  });
  return user;
};

export const getUserByEmail = async (Email: string) => {
  const user = await db.query.User.findFirst({
    where: (user) => eq(user.Email, Email),
    columns: {
      Id: true,
      Email: true,
      Password: true,
      FullName: true,
      ImageUrl: true,
      IsVerified: true,
      DateOfBirth: true,
    },
  });
  return user;
};

export const getUserByUserName = async (userName: string) => {
  const firstDigitIndex = userName.search(/\d/);
  if (firstDigitIndex === -1) {
    throw new Error("Invalid username format: no number part found.");
  }

  const firstName = userName.substring(0, firstDigitIndex);
  const userNumberString = userName.substring(firstDigitIndex);
  const userNumber = parseInt(userNumberString, 10);

  if (isNaN(userNumber)) {
    throw new Error("Invalid username format: number part is invalid.");
  }

  const user = await db.query.User.findFirst({
    where: (user) =>
      and(
        ilike(user.FullName, `${firstName}%`),
        eq(user.UserNumber, userNumber)
      ),
    columns: {
      Id: true,
      Email: true,
      Password: true,
      FullName: true,
      ImageUrl: true,
      IsVerified: true,
      DateOfBirth: true,
    },
  });

  return user;
};

export const getUserByLoginCode = async (LoginCode: string) => {
  const users = await db.query.User.findMany({
    where: (user) => eq(user.LoginCode, LoginCode),
    columns: {
      Id: true,
      Email: true,
      Password: true,
      FullName: true,
      ImageUrl: true,
      LoginCode: true,
      IsVerified: true,
    },
  });
  return users;
};

export const getUserOrganizations = async (
  UserId: string
): Promise<UserOrgI[]> => {
  try {
    const organization = await db
      .select({
        Id: OrganizationUser.Id,
        Status: OrganizationUser.Status,
        Type: Organization.Type,
        Name: Organization.Name,
        Logo: Organization.Logo,
        RoleId: OrganizationUser.RoleId,
        Role: Role.Name,
        OrganizationId: Organization.Id,
      })
      .from(OrganizationUser)
      .leftJoin(
        Organization,
        eq(OrganizationUser.OrganizationId, Organization.Id)
      )
      .leftJoin(Role, eq(OrganizationUser.RoleId, Role.Id))
      .where(eq(OrganizationUser.UserId, UserId));

    return organization || [];
  } catch (error) {
    console.error("Failed to fetch user organization:", error);
    throw new Error("Failed to fetch user organization");
  }
};

export const updateOrganizationUser = async (
  formData: updateOrganizationUserI
) => {
  const { Id, RoleId, Status } = formData;
  const updatedUser = await db
    .update(OrganizationUser)
    .set({
      RoleId,
      Status,
    })
    .where(eq(OrganizationUser.Id, Id));
  return updatedUser;
};

export const addParentStudent = async ({
  ParentId,
  StudentId,
}: {
  ParentId: string;
  StudentId: string;
}) => {
  const parentStudent = await db.insert(ParentStudent).values({
    ParentId,
    StudentId,
  });
  return parentStudent;
};

export const getStudentIdsByParentId = async (
  parentId: string
): Promise<string[]> => {
  const result = await db
    .select({ StudentId: ParentStudent.StudentId })
    .from(ParentStudent)
    .where(eq(ParentStudent.ParentId, parentId));

  return result.map((row) => row.StudentId);
};

export const addOrganizationUser = async (
  formData: newOrganizationUserI,
  tx: DB = db
) => {
  const { UserId, OrganizationId, RoleId } = formData;

  if (UserId) {
    console.log("Creating a user Organization");
  }

  const user = await tx
    .insert(OrganizationUser)
    .values({
      UserId,
      OrganizationId,
      RoleId,
    })
    .returning({
      Id: OrganizationUser.Id,
      Status: OrganizationUser.Status,
      RoleId: OrganizationUser.RoleId,
    });

  return user;
};

export const updateLastLogin = async (UserId: string) => {
  const updatedUser = await db
    .update(User)
    .set({
      LastLogin: new Date(),
    })
    .where(eq(User.Id, UserId));
  return updatedUser;
};

export const updatePassword = async ({
  UserId,
  Password,
}: {
  UserId: string;
  Password: string;
}) => {
  const updatedUser = await db
    .update(User)
    .set({
      Password,
      UpdatedOn: new Date(),
    })
    .where(eq(User.Id, UserId))
    .returning({
      Id: User.Id,
    });
  return updatedUser;
};

export const saveSession = async (UserId: string) => {
  const session = await db.insert(Session).values({
    SessionToken: uuidv4(),
    UserId,
    Expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  return session;
};

export const getUserSession = async (tokenId: string) => {
  const existingSession = await db
    .select()
    .from(Session)
    .where(eq(Session.SessionToken, tokenId));
  return existingSession;
};

export const verifyUser = async (UserId: string) => {
  const updatedUser = await db
    .update(User)
    .set({
      IsVerified: true,
    })
    .where(eq(User.Id, UserId));
  return updatedUser;
};

export const getStudentList = async (data: {
  page: number;
  pageSize: number;
  searchText: string;
  sortColumn: PgColumn;
  sortOrder: string;
  organizationId?: string | null;
  activeOnly?: boolean;
  studentClass: number | null;
}) => {
  const conditions = [
    eq(Role.Name, "Student"),
    data.searchText ? ilike(User.FullName, `%${data.searchText}%`) : undefined,
    data.organizationId
      ? eq(OrganizationUser.OrganizationId, data.organizationId)
      : undefined,
    data.activeOnly ? eq(OrganizationUser.Status, "Active") : undefined,
    data.studentClass ? eq(ClassStudent.ClassId, data.studentClass) : undefined,
  ].filter(Boolean);

  const studentsQuery = db
    .select({
      Id: User.Id,
      CreatedOn: OrganizationUser.CreatedOn,
      UpdatedOn: OrganizationUser.UpdatedOn,
      FullName: User.FullName,
      Email: User.Email,
      Phone: User.Phone,
      ImageUrl: User.ImageUrl,
      Role: Role.Name,
      IsVerified: User.IsVerified,
      ParentName: User.ParentName,
      ParentEmail: User.ParentEmail,
      LoginCode: User.LoginCode,
      CurrentClass: {
        id: ClassStudent.ClassId,
        name: Classes.Name,
      },
      LastLogin: User.LastLogin,
      DateOfBirth: User.DateOfBirth,
      Organization: {
        id: Organization.Id,
        name: Organization.Name,
      },
      Status: User.Status,
    })
    .from(OrganizationUser)
    .innerJoin(User, eq(OrganizationUser.UserId, User.Id))
    .innerJoin(Role, eq(OrganizationUser.RoleId, Role.Id))
    .innerJoin(
      Organization,
      eq(OrganizationUser.OrganizationId, Organization.Id)
    )
    .leftJoin(
      ClassStudent,
      and(
        eq(ClassStudent.UserId, User.Id),
        eq(ClassStudent.IsCurrentClass, true)
      )
    )
    .leftJoin(Classes, eq(ClassStudent.ClassId, Classes.Id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(
      data.sortOrder === "asc" ? asc(data.sortColumn) : desc(data.sortColumn)
    )
    .limit(data.pageSize)
    .offset((data.page - 1) * data.pageSize);

  const countQuery = db
    .select({
      total: count(),
    })
    .from(OrganizationUser)
    .innerJoin(User, eq(OrganizationUser.UserId, User.Id))
    .innerJoin(Role, eq(OrganizationUser.RoleId, Role.Id))
    .leftJoin(
      ClassStudent,
      and(
        eq(ClassStudent.UserId, User.Id),
        eq(ClassStudent.IsCurrentClass, true)
      )
    )

    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const [students, countResult] = await Promise.all([
    studentsQuery,
    countQuery,
  ]);

  return { students, total: countResult[0].total || 0 };
};

export const getUserList = async (data: {
  page: number;
  pageSize: number;
  searchText: string;
  sortColumn: PgColumn;
  sortOrder: string;
}) => {
  const conditions = [
    data.searchText ? ilike(User.FullName, `%${data.searchText}%`) : undefined,
  ].filter(Boolean);

  const usersList = db
    .select({
      Id: User.Id,
      CreatedOn: OrganizationUser.CreatedOn,
      UpdatedOn: OrganizationUser.UpdatedOn,
      FullName: User.FullName,
      Email: User.Email,
      Phone: User.Phone,
      ImageUrl: User.ImageUrl,
      Role: Role.Name,
      IsVerified: User.IsVerified,
      ParentName: User.ParentName,
      ParentEmail: User.ParentEmail,
      LoginCode: User.LoginCode,
      LastLogin: User.LastLogin,
      DateOfBirth: User.DateOfBirth,
    })
    .from(OrganizationUser)
    .innerJoin(User, eq(OrganizationUser.UserId, User.Id))
    .innerJoin(Role, eq(OrganizationUser.RoleId, Role.Id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(
      data.sortOrder === "asc" ? asc(data.sortColumn) : desc(data.sortColumn)
    )
    .limit(data.pageSize)
    .offset((data.page - 1) * data.pageSize);
  const countQuery = db
    .select({
      total: count(),
    })
    .from(OrganizationUser)
    .innerJoin(User, eq(OrganizationUser.UserId, User.Id))
    .innerJoin(Role, eq(OrganizationUser.RoleId, Role.Id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const [users, countResult] = await Promise.all([usersList, countQuery]);
  return { users, total: countResult[0].total || 0 };
};

export const getVerificationToken = async (UserId: string) => {
  const currentTime = new Date();

  const token = await db.query.VerificationToken.findFirst({
    where: (token) =>
      and(
        eq(token.UserId, UserId),
        eq(token.Valid, true),
        gt(token.Expires, currentTime)
      ),
    columns: {
      Id: true,
      Token: true,
      Expires: true,
    },
  });

  return token;
};

export const invalidateVerificationToken = async (UserId: string) => {
  const token = await db
    .update(VerificationToken)
    .set({ Valid: false })
    .where(eq(VerificationToken.UserId, UserId));
  return token;
};

export const addVerificationToken = async (UserId: string, Token: string) => {
  await invalidateVerificationToken(UserId);

  const token = await db.insert(VerificationToken).values({
    UserId,
    Token,
    Valid: true,
    Expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiration
  });

  return token;
};

export const updateVerifiedUser = async (UserId: string) => {
  const updatedUser = await db
    .update(User)
    .set({
      IsVerified: true,
    })
    .where(eq(User.Id, UserId));
  return updatedUser;
};

export const generateParentInviteCode = async (
  StudentId: string,
  tx: DB = db
): Promise<{ InviteCode: string; ExpiresAt: Date }> => {
  // Deactivate all active codes for this student
  await tx
    .update(ParentStudentInvite)
    .set({ IsUsed: true })
    .where(
      and(
        eq(ParentStudentInvite.StudentId, StudentId),
        eq(ParentStudentInvite.IsUsed, false)
      )
    );

  // Generate code (1 letter + 4 digits)
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const letter = letters.charAt(Math.floor(Math.random() * letters.length));
  let numbers = "";
  for (let i = 0; i < 4; i++) {
    numbers += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  const inviteCode = letter + numbers;

  // Set expiration to 1 hour from now
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const result = await tx
    .insert(ParentStudentInvite)
    .values({
      StudentId,
      InviteCode: inviteCode,
      ExpiresAt: expiresAt,
      IsUsed: false,
    })
    .returning({
      InviteCode: ParentStudentInvite.InviteCode,
      ExpiresAt: ParentStudentInvite.ExpiresAt,
    });

  return result[0];
};

/**
 * Validate parent invite code and create relationship
 * Deactivates all codes for that student if validated
 */
export const validateParentInviteCode = async (
  InviteCode: string,
  ParentId: string,
  tx: DB = db
): Promise<{ StudentId: string; StudentName: string } | null> => {
  const currentTime = new Date();

  // Find valid invite code using direct select instead of query builder
  const inviteResult = await tx
    .select({
      StudentId: ParentStudentInvite.StudentId,
    })
    .from(ParentStudentInvite)
    .where(
      and(
        eq(ParentStudentInvite.InviteCode, InviteCode),
        eq(ParentStudentInvite.IsUsed, false),
        gt(ParentStudentInvite.ExpiresAt, currentTime)
      )
    )
    .limit(1);

  if (!inviteResult || inviteResult.length === 0) return null;

  const invite = inviteResult[0];

  // Get student info
  const studentResult = await tx
    .select({
      Id: User.Id,
      FullName: User.FullName,
    })
    .from(User)
    .where(eq(User.Id, invite.StudentId))
    .limit(1);

  if (!studentResult || studentResult.length === 0) return null;

  const student = studentResult[0];

  // Check if parent-student relationship already exists
  const existingRelationship = await tx
    .select({
      Id: ParentStudent.Id,
    })
    .from(ParentStudent)
    .where(
      and(
        eq(ParentStudent.ParentId, ParentId),
        eq(ParentStudent.StudentId, invite.StudentId)
      )
    )
    .limit(1);

  if (existingRelationship && existingRelationship.length > 0) {
    // Mark the invite as used even if relationship exists
    await tx
      .update(ParentStudentInvite)
      .set({ IsUsed: true })
      .where(
        and(
          eq(ParentStudentInvite.StudentId, invite.StudentId),
          eq(ParentStudentInvite.IsUsed, false)
        )
      );

    return null; // Relationship already exists
  }

  // Create parent-student relationship and deactivate all codes for this student
  await Promise.all([
    tx.insert(ParentStudent).values({
      ParentId,
      StudentId: invite.StudentId,
    }),
    tx
      .update(ParentStudentInvite)
      .set({ IsUsed: true })
      .where(
        and(
          eq(ParentStudentInvite.StudentId, invite.StudentId),
          eq(ParentStudentInvite.IsUsed, false)
        )
      ),
  ]);

  return {
    StudentId: student.Id,
    StudentName: student.FullName,
  };
};
