import { db } from "@/server/db";
import {
    StudentRecommendation,
    RecommendationReply,
    User,
    OrganizationUser,
} from "@/server/db/schema";
import { eq, desc, sql, inArray } from "drizzle-orm";

export interface RecommendationWithAuthor {
    id: string;
    studentId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        name: string;
        role: string;
        avatar: string | null;
    };
    replies: ReplyWithAuthor[];
}

export interface ReplyWithAuthor {
    id: string;
    recommendationId: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
        role: string;
        avatar: string | null;
    };
}

const getRoleName = (roleId: number): string => {
    switch (roleId) {
        case 1:
            return "Administrator";
        case 2:
            return "Student";
        case 3:
            return "Teacher";
        case 4:
            return "Staff";
        case 5:
            return "Parent (Pending)";
        case 6:
            return "Parent";
        default:
            return "User";
    }
};

export async function getStudentRecommendations(
    studentId: string,
    organizationId: string
): Promise<RecommendationWithAuthor[]> {
    // Fetch all recommendations for the student with author details
    const recommendationsRaw = await db
        .select({
            id: StudentRecommendation.Id,
            studentId: StudentRecommendation.StudentId,
            content: StudentRecommendation.Content,
            createdOn: StudentRecommendation.CreatedOn,
            updatedOn: StudentRecommendation.UpdatedOn,
            authorId: User.Id,
            authorName: User.FullName,
            authorRole: OrganizationUser.RoleId,
            authorAvatar: User.ImageUrl,
        })
        .from(StudentRecommendation)
        .innerJoin(User, eq(StudentRecommendation.AuthorId, User.Id))
        .innerJoin(
            OrganizationUser,
            eq(User.Id, OrganizationUser.UserId)
        )
        .where(
            sql`${StudentRecommendation.StudentId} = ${studentId} AND ${StudentRecommendation.OrganizationId} = ${organizationId}`
        )
        .orderBy(desc(StudentRecommendation.CreatedOn));

    if (recommendationsRaw.length === 0) {
        return [];
    }

    // Get all recommendation IDs
    const recommendationIds = recommendationsRaw.map((r) => r.id);

    // Fetch all replies for these recommendations with author details
    const repliesRaw = await db
        .select({
            id: RecommendationReply.Id,
            recommendationId: RecommendationReply.RecommendationId,
            content: RecommendationReply.Content,
            createdOn: RecommendationReply.CreatedOn,
            authorId: User.Id,
            authorName: User.FullName,
            authorRole: OrganizationUser.RoleId,
            authorAvatar: User.ImageUrl,
        })
        .from(RecommendationReply)
        .innerJoin(User, eq(RecommendationReply.AuthorId, User.Id))
        .innerJoin(
            OrganizationUser,
            eq(User.Id, OrganizationUser.UserId)
        )
        .where(inArray(RecommendationReply.RecommendationId, recommendationIds))
        .orderBy(RecommendationReply.CreatedOn);

    // Group replies by recommendation ID with proper type handling
    const repliesByRecommendation = new Map<string, ReplyWithAuthor[]>();

    repliesRaw.forEach((reply) => {
        if (!repliesByRecommendation.has(reply.recommendationId)) {
            repliesByRecommendation.set(reply.recommendationId, []);
        }

        repliesByRecommendation.get(reply.recommendationId)!.push({
            id: reply.id,
            recommendationId: reply.recommendationId,
            content: reply.content,
            createdAt: reply.createdOn.toISOString(),
            author: {
                id: reply.authorId,
                name: reply.authorName,
                role: getRoleName(reply.authorRole),
                avatar: reply.authorAvatar,
            },
        });
    });

    // Combine recommendations with their replies with proper type handling
    return recommendationsRaw.map((rec) => ({
        id: rec.id,
        studentId: rec.studentId,
        content: rec.content,
        createdAt: rec.createdOn.toISOString(),
        updatedAt: rec.updatedOn.toISOString(),
        author: {
            id: rec.authorId,
            name: rec.authorName,
            role: getRoleName(rec.authorRole),
            avatar: rec.authorAvatar,
        },
        replies: repliesByRecommendation.get(rec.id) || [],
    }));
}

export async function createRecommendation(
    studentId: string,
    organizationId: string,
    authorId: string,
    content: string
): Promise<string> {
    const now = new Date();

    const result = await db
        .insert(StudentRecommendation)
        .values({
            StudentId: studentId,
            OrganizationId: organizationId,
            AuthorId: authorId,
            Content: content,
            CreatedOn: now,
            UpdatedOn: now,
        })
        .returning({ id: StudentRecommendation.Id });

    return result[0].id;
}

export async function createReply(
    recommendationId: string,
    authorId: string,
    content: string
): Promise<string> {
    const now = new Date();

    const result = await db
        .insert(RecommendationReply)
        .values({
            RecommendationId: recommendationId,
            AuthorId: authorId,
            Content: content,
            CreatedOn: now,
            UpdatedOn: now,
        })
        .returning({ id: RecommendationReply.Id });

    return result[0].id;
}

export async function deleteRecommendation(
    recommendationId: string,
    userId: string
): Promise<boolean> {
    // Only allow the author to delete their own recommendation
    const result = await db
        .delete(StudentRecommendation)
        .where(
            sql`${StudentRecommendation.Id} = ${recommendationId} AND ${StudentRecommendation.AuthorId} = ${userId}`
        )
        .returning({ id: StudentRecommendation.Id });

    return result.length > 0;
}

export async function deleteReply(
    replyId: string,
    userId: string
): Promise<boolean> {
    // Only allow the author to delete their own reply
    const result = await db
        .delete(RecommendationReply)
        .where(
            sql`${RecommendationReply.Id} = ${replyId} AND ${RecommendationReply.AuthorId} = ${userId}`
        )
        .returning({ id: RecommendationReply.Id });

    return result.length > 0;
}

export async function updateRecommendation(
    recommendationId: string,
    userId: string,
    content: string
): Promise<boolean> {
    const now = new Date();

    // Only allow the author to update their own recommendation
    const result = await db
        .update(StudentRecommendation)
        .set({
            Content: content,
            UpdatedOn: now,
        })
        .where(
            sql`${StudentRecommendation.Id} = ${recommendationId} AND ${StudentRecommendation.AuthorId} = ${userId}`
        )
        .returning({ id: StudentRecommendation.Id });

    return result.length > 0;
}

export async function updateReply(
    replyId: string,
    userId: string,
    content: string
): Promise<boolean> {
    const now = new Date();

    // Only allow the author to update their own reply
    const result = await db
        .update(RecommendationReply)
        .set({
            Content: content,
            UpdatedOn: now,
        })
        .where(
            sql`${RecommendationReply.Id} = ${replyId} AND ${RecommendationReply.AuthorId} = ${userId}`
        )
        .returning({ id: RecommendationReply.Id });

    return result.length > 0;
}

// Get recommendation count for a student
export async function getRecommendationCount(
    studentId: string,
    organizationId: string
): Promise<number> {
    const result = await db
        .select({
            count: sql<number>`COUNT(*)`,
        })
        .from(StudentRecommendation)
        .where(
            sql`${StudentRecommendation.StudentId} = ${studentId} AND ${StudentRecommendation.OrganizationId} = ${organizationId}`
        );

    return result[0]?.count || 0;
}

// Get recent recommendations across all students in an organization
export async function getRecentRecommendations(
    organizationId: string,
    limit: number = 10
): Promise<RecommendationWithAuthor[]> {
    const recommendationsRaw = await db
        .select({
            id: StudentRecommendation.Id,
            studentId: StudentRecommendation.StudentId,
            content: StudentRecommendation.Content,
            createdOn: StudentRecommendation.CreatedOn,
            updatedOn: StudentRecommendation.UpdatedOn,
            authorId: User.Id,
            authorName: User.FullName,
            authorRole: OrganizationUser.RoleId,
            authorAvatar: User.ImageUrl,
        })
        .from(StudentRecommendation)
        .innerJoin(User, eq(StudentRecommendation.AuthorId, User.Id))
        .innerJoin(
            OrganizationUser,
            eq(User.Id, OrganizationUser.UserId)
        )
        .where(eq(StudentRecommendation.OrganizationId, organizationId))
        .orderBy(desc(StudentRecommendation.CreatedOn))
        .limit(limit);

    if (recommendationsRaw.length === 0) {
        return [];
    }

    const recommendationIds = recommendationsRaw.map((r) => r.id);

    const repliesRaw = await db
        .select({
            id: RecommendationReply.Id,
            recommendationId: RecommendationReply.RecommendationId,
            content: RecommendationReply.Content,
            createdOn: RecommendationReply.CreatedOn,
            authorId: User.Id,
            authorName: User.FullName,
            authorRole: OrganizationUser.RoleId,
            authorAvatar: User.ImageUrl,
        })
        .from(RecommendationReply)
        .innerJoin(User, eq(RecommendationReply.AuthorId, User.Id))
        .innerJoin(
            OrganizationUser,
            eq(User.Id, OrganizationUser.UserId)
        )
        .where(inArray(RecommendationReply.RecommendationId, recommendationIds))
        .orderBy(RecommendationReply.CreatedOn);

    const repliesByRecommendation = new Map<string, ReplyWithAuthor[]>();

    repliesRaw.forEach((reply) => {
        if (!repliesByRecommendation.has(reply.recommendationId)) {
            repliesByRecommendation.set(reply.recommendationId, []);
        }

        repliesByRecommendation.get(reply.recommendationId)!.push({
            id: reply.id,
            recommendationId: reply.recommendationId,
            content: reply.content,
            createdAt: reply.createdOn.toISOString(),
            author: {
                id: reply.authorId,
                name: reply.authorName,
                role: getRoleName(reply.authorRole),
                avatar: reply.authorAvatar,
            },
        });
    });

    return recommendationsRaw.map((rec) => ({
        id: rec.id,
        studentId: rec.studentId,
        content: rec.content,
        createdAt: rec.createdOn.toISOString(),
        updatedAt: rec.updatedOn.toISOString(),
        author: {
            id: rec.authorId,
            name: rec.authorName,
            role: getRoleName(rec.authorRole),
            avatar: rec.authorAvatar,
        },
        replies: repliesByRecommendation.get(rec.id) || [],
    }));
}