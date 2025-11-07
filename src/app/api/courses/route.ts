// @/app/api/courses/route.ts
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getCourses, createCourse } from "@/server/queries/course";
import { getUserToken } from "@/utils/getToken";
import { courseSchema } from "@/types/Course";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
        const searchText = searchParams.get("searchText") || "";
        const grade = searchParams.get("grade") || "";
        const subject = searchParams.get("subject") || "";
        const status = searchParams.get("status") || "";
        const isActive = searchParams.get("isActive");

        const { organizationId } = await getUserToken(req);

        if (!organizationId) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: "Organization not found",
                },
                { status: HttpStatusCode.Unauthorized }
            );
        }

        const formData = {
            page,
            pageSize,
            searchText,
            grade,
            subject,
            status,
            organizationId,
            isActive: isActive ? isActive === "true" : undefined,
        };

        const { courses, total } = await getCourses(formData);

        return NextResponse.json(
            {
                status: "Success",
                message: "Courses fetched successfully!",
                data: {
                    courses,
                    total,
                    page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize),
                },
            },
            { status: HttpStatusCode.Ok }
        );
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Courses GET error:", error);
        return NextResponse.json(
            { status: "Error", data: null, message: error.message },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId, userRoleId, organizationId } = await getUserToken(req);

        if (!userId || !organizationId) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: "Unauthorized, Please Login!",
                },
                { status: HttpStatusCode.Unauthorized }
            );
        }

        if (userRoleId !== 1 && userRoleId !== 2) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: "You are not authorized to create courses",
                },
                { status: HttpStatusCode.Forbidden }
            );
        }

        const formData = await req.json();

        const validationResult = courseSchema.safeParse(formData);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: validationResult.error.errors
                        .map((err) => `${err.path.join(".")}: ${err.message}`)
                        .join(", "),
                },
                { status: HttpStatusCode.BadRequest }
            );
        }

        const validatedData = {
            ...validationResult.data,
            OrganizationId: organizationId,
        };

        const inserted = await createCourse(validatedData, userId);

        return NextResponse.json(
            {
                status: "Success",
                message: "Course created successfully!",
                data: inserted,
            },
            { status: HttpStatusCode.Created }
        );
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Course POST error:", error);
        return NextResponse.json(
            { status: "Error", data: null, message: error.message },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}