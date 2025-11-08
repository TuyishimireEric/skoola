import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { OrganizationUser, User } from "@/server/db/schema";
import { v4 as uuidv4 } from "uuid";
import { and, eq, max, or } from "drizzle-orm";
import { getUserToken } from "@/utils/getToken";
import { getStudentList } from "@/server/queries/students";
import bcrypt from "bcryptjs";

interface StudentInput {
  fullName: string;
  parentEmail?: string | null;
  parentName?: string | null;
  dateOfBirth?: Date | null;
  grade?: string | null;
}

// Using the exact types from the schema
type InsertUser = typeof User.$inferInsert;
type InsertOrganizationUser = typeof OrganizationUser.$inferInsert;

// Define valid sortable fields that match the query expectations
const SORTABLE_FIELDS = {
  fullName: "fullName",
  email: "email",
  createdOn: "createdOn",
  stars: "stars",
  averageScore: "averageScore",
  totalCourses: "totalCourses",
  currentStreak: "currentStreak",
} as const;

type SortableFieldKey = keyof typeof SORTABLE_FIELDS;
type SortableFieldValue = (typeof SORTABLE_FIELDS)[SortableFieldKey];

interface CreatedStudent {
  id: string;
  fullName: string;
  userNumber: number;
  userName: string;
  grade: string | null;
  parentName: string | null | undefined;
  parentEmail: string | null | undefined;
  defaultPassword: string;
}

interface DuplicateStudent {
  fullName: string;
  parentEmail: string | null | undefined;
  existingUserNumber: number | null;
  message: string;
}

interface CreateStudentsResponse {
  created: CreatedStudent[];
  duplicates: DuplicateStudent[];
}

export async function POST(req: NextRequest) {
  try {
    const { userId, organizationId, userOrganizationId, userRoleId } =
      await getUserToken(req);

    if (!userId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized, Please Login!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    if (!organizationId || !userOrganizationId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "User not associated with any organization",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const { Students, grade } = await req.json();

    // Handle both single student and array of students
    const studentsArray: StudentInput[] = Array.isArray(Students)
      ? Students
      : [Students];

    if (studentsArray.length === 0) {
      return NextResponse.json(
        {
          status: "Error",
          message: "No students provided",
          data: null,
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Validate required fields for each student
    for (const student of studentsArray) {
      if (!student.fullName || student.fullName.trim() === "") {
        return NextResponse.json(
          {
            status: "Error",
            message: "Student full name is required",
            data: null,
          },
          { status: HttpStatusCode.BadRequest }
        );
      }
    }

    const newStudents: InsertUser[] = [];
    const newOrganizationUsers: InsertOrganizationUser[] = [];
    const now = new Date();
    const defaultPassword = "1234";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Get the last user number to generate unique user numbers
    const result = await db
      .select({
        lastUserNumber: max(User.UserNumber),
      })
      .from(User);

    const lastUserNumber = result[0]?.lastUserNumber || 0;

    // Process each student and create records
    interface StudentRecord {
      studentId: string;
      fullName: string;
      dateOfBirth: string | null;
      parentName: string | null;
      parentEmail: string | null;
      grade: string | null;
      userNumber: number;
      userName: string;
    }

    const studentRecords: StudentRecord[] = studentsArray.map(
      (student: StudentInput, index: number) => {
        const userNumber = lastUserNumber + 1 + index;
        return {
          studentId: uuidv4(),
          fullName: student.fullName.trim(),
          dateOfBirth: student.dateOfBirth
            ? new Date(student.dateOfBirth).toISOString().split("T")[0] // Format as YYYY-MM-DD for date field
            : null,
          parentName: student.parentName?.trim() || null,
          parentEmail: student.parentEmail?.toLowerCase().trim() || null,
          grade: student.grade || grade || null,
          userNumber: userNumber,
          userName: `user${userNumber.toString().padStart(6, "0")}`, // e.g., user000001, user000002
        };
      }
    );

    console.log("================================");

    console.log("Student Records to Process:", studentRecords);

    console.log("================================");

    // Check for existing students based on fullName and parentEmail combination
    const existingStudentsQuery =
      studentsArray.length > 0
        ? await db
            .select({
              Id: User.Id,
              FullName: User.FullName,
              ParentEmail: User.ParentEmail,
              UserNumber: User.UserNumber,
            })
            .from(User)
            .where(
              or(
                ...studentRecords.map((record) =>
                  and(eq(User.FullName, record.fullName))
                )
              )
            )
        : [];

    // Create a map for efficient duplicate checking
    const existingStudentMap = new Map(
      existingStudentsQuery.map((student) => [
        `${student.FullName.toLowerCase()}-${
          student.ParentEmail?.toLowerCase() || ""
        }`,
        student,
      ])
    );

    const duplicateStudents: DuplicateStudent[] = [];
    const validStudents: StudentRecord[] = [];

    // Separate valid students from duplicates
    for (const record of studentRecords) {
      const studentKey = `${record.fullName.toLowerCase()}-${
        record.parentEmail || ""
      }`;
      const existingStudent = existingStudentMap.get(studentKey);

      if (existingStudent) {
        duplicateStudents.push({
          fullName: record.fullName,
          parentEmail: record.parentEmail,
          existingUserNumber: existingStudent.UserNumber,
          message: "Student already exists",
        });
      } else {
        validStudents.push(record);
      }
    }

    // If all students are duplicates, return error
    if (validStudents.length === 0) {
      return NextResponse.json(
        {
          status: "Error",
          message:
            duplicateStudents.length === 1
              ? "Student already exists"
              : "All students already exist",
          data: null,
        },
        { status: HttpStatusCode.Conflict }
      );
    }

    // Prepare records for insertion
    for (const record of validStudents) {
      newStudents.push({
        Id: record.studentId,
        FullName: record.fullName,
        UserNumber: record.userNumber,
        Password: hashedPassword,
        DateOfBirth: record.dateOfBirth,
        ParentName: record.parentName,
        ParentEmail: record.parentEmail,
        IsVerified: true,
        Status: "Active",
        CreatedOn: now,
        UpdatedOn: now,
      });

      newOrganizationUsers.push({
        UserId: record.studentId,
        OrganizationId: organizationId,
        RoleId: 2, // Student role
        Grade: record.grade,
        Status: "Active",
        CreatedOn: now,
        UpdatedOn: now,
      });
    }

    // Insert all records in a single transaction
    await db.transaction(async (trx) => {
      if (newStudents.length > 0) {
        await trx.insert(User).values(newStudents);
        await trx.insert(OrganizationUser).values(newOrganizationUsers);
      }

      // Update user role if needed (from role 5 to 6)
      if (userRoleId === 5) {
        await trx
          .update(OrganizationUser)
          .set({
            RoleId: 6,
            UpdatedOn: now,
          })
          .where(eq(OrganizationUser.Id, userOrganizationId));
      }
    });

    // Prepare response data
    const responseData: CreateStudentsResponse = {
      created: newStudents.map(
        (student, index): CreatedStudent => ({
          id: student.Id!,
          fullName: student.FullName!,
          userNumber: student.UserNumber!,
          userName: validStudents[index].userName,
          grade: validStudents[index].grade,
          parentName: student.ParentName,
          parentEmail: student.ParentEmail,
          defaultPassword: defaultPassword,
        })
      ),
      duplicates: duplicateStudents,
    };

    const message =
      duplicateStudents.length > 0
        ? `${newStudents.length} student(s) created successfully. ${duplicateStudents.length} duplicate(s) skipped.`
        : `${newStudents.length} student(s) created successfully`;

    return NextResponse.json(
      {
        status: "Success",
        message: message,
        data: responseData,
      },
      { status: HttpStatusCode.Created }
    );
  } catch (error) {
    console.error("Error creating students:", error);
    const err = error as Error;
    return NextResponse.json(
      {
        status: "Error",
        message: err?.message || "Failed to register students",
        data: null,
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId, organizationId } = await getUserToken(req);
    if (!userId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized, Please Login!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "User not associated with any organization",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const searchText = searchParams.get("searchText") || "";
    const sort = searchParams.get("sort") || "stars";
    const sortOrder = searchParams.get("order") || "desc";
    const activeOnly = searchParams.get("activeOnly") === "true";

    // Enhanced grade parameter handling
    const gradeParam = searchParams.get("grade");
    const grade = gradeParam ? gradeParam.trim() : null;

    // Validate and get sortColumn with proper typing
    const isSortableField = (field: string): field is SortableFieldKey => {
      return field in SORTABLE_FIELDS;
    };

    const sortField: SortableFieldKey = isSortableField(sort) ? sort : "stars";
    const sortColumnValue: SortableFieldValue = SORTABLE_FIELDS[sortField];

    // Validate sort order
    const validSortOrder = sortOrder === "asc" ? "asc" : "desc";

    const payload = {
      page,
      pageSize,
      searchText,
      organizationId,
      sortColumn: sortColumnValue,
      sortOrder: validSortOrder,
      activeOnly,
      grade,
    };

    const studentsData = await getStudentList(payload);

    return NextResponse.json(
      {
        status: "Success",
        message: "Students fetched successfully",
        data: studentsData,
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    console.error("Error fetching students:", error);
    const err = error as Error;
    return NextResponse.json(
      {
        status: "Error",
        message: err?.message || "Failed to fetch students",
        data: null,
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
