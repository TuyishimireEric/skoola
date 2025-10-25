import { PgTransaction } from "drizzle-orm/pg-core";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { PgQueryResultHKT } from "drizzle-orm/pg-core";
import { db } from "../db";
import { Classes, ClassOrganization, ClassStudent } from "../db/schema";
import { eq, and } from "drizzle-orm";

export type DB = typeof db | PgTransaction<
  PgQueryResultHKT,
  Record<string, unknown>,
  ExtractTablesWithRelations<Record<string, unknown>>
>;

// getAllClasses
export const getClasses = async () => {
  const classes = await db
    .select({
      Id: Classes.Id,
      Name: Classes.Name,
      Description: Classes.Description,
      ClassCode: Classes.ClassCode,
      Order: Classes.ClassCode,
      Types: Classes.Type,
    })
    .from(Classes);

  return classes;
};

//verify class from classOrganization
export const getClassByIdFromOrganization = async (
  classId: number,
  organizationId: string
) => {
  const existingClass = await db
    .select()
    .from(ClassOrganization)
    .where(
      and(
        eq(ClassOrganization.ClassId, classId),
        eq(ClassOrganization.OrganizationId, organizationId)
      )
    );
  return existingClass;
};

//  add class to organizaiton
export const addClassToOrganization = async ({
  classId,
  organizationId,
}: {
  classId: number;
  organizationId: string;
}, tx: DB) => {
  await tx.insert(ClassOrganization).values({
    ClassId: classId,
    OrganizationId: organizationId,
  });
};

// add a user to class under an organization
export const addUserToClass = async ({
  classId,
  userId,
  organizationId,
}: {
  classId: number;
  userId: string;
  organizationId: string;
}, tx: DB) => {
  await tx.insert(ClassStudent).values({
    ClassId: classId,
    UserId: userId,
    OrganizationId: organizationId,
    IsCurrentClass: true,
  });
};