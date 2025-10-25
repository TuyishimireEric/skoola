import { TeacherData } from "@/types/teacher";
import { db } from "../db";
import {
  Organization,
  TeacherInvitations,
  OrganizationUser,
  User,
  Role,
  Game,
  StudentGame,
  GameReview,
  GameLike,
} from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

// Recommended database indexes for optimal performance:
/*
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_created_by_org ON "Game" ("CreatedBy", "OrganizationId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_game_game_student ON "StudentGame" ("GameId", "StudentId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_review_game_approved ON "GameReview" ("GameId", "IsApproved");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_like_game ON "GameLike" ("GameId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_user_org_role ON "OrganizationUser" ("OrganizationId", "RoleId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_role_name ON "Role" ("Name");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_teacher_invitations_org_status ON "TeacherInvitations" ("OrganizationId", "Status");
*/

export async function getOrganizationTeachers(
  organizationId: string
): Promise<TeacherData[]> {
  // Get existing teachers
  const teachers = await db
    .select({
      id: User.Id,
      fullName: User.FullName,
      email: User.Email,
      phone: User.Phone,
      image: User.ImageUrl,
      subject: OrganizationUser.Subjects,
      grade: OrganizationUser.Grade,
      joinDate: OrganizationUser.CreatedOn,
      status: OrganizationUser.Status,
      studentsCount: sql<number>`COALESCE(student_stats.student_count, 0)`,
      rating: sql<number>`COALESCE(review_stats.avg_rating, 0)`,
      likes: sql<number>`COALESCE(like_stats.like_count, 0)`,
    })
    .from(OrganizationUser)
    .innerJoin(User, eq(OrganizationUser.UserId, User.Id))
    .innerJoin(Role, eq(OrganizationUser.RoleId, Role.Id))
    // Pre-aggregated student counts per teacher
    .leftJoin(
      sql`(
        SELECT 
          g."CreatedBy" as teacher_id,
          COUNT(DISTINCT sg."StudentId") as student_count
        FROM ${Game} g
        LEFT JOIN ${StudentGame} sg ON g."Id" = sg."GameId"
        WHERE g."OrganizationId" = ${organizationId}
        GROUP BY g."CreatedBy"
      ) student_stats`,
      sql`student_stats.teacher_id = ${User.Id}`
    )
    // Pre-aggregated review ratings per teacher
    .leftJoin(
      sql`(
        SELECT 
          g."CreatedBy" as teacher_id,
          AVG(gr."Rating") as avg_rating
        FROM ${Game} g
        LEFT JOIN ${GameReview} gr ON g."Id" = gr."GameId"
        WHERE g."OrganizationId" = ${organizationId}
          AND gr."IsApproved" = true
        GROUP BY g."CreatedBy"
      ) review_stats`,
      sql`review_stats.teacher_id = ${User.Id}`
    )
    // Pre-aggregated like counts per teacher
    .leftJoin(
      sql`(
        SELECT 
          g."CreatedBy" as teacher_id,
          COUNT(gl."Id") as like_count
        FROM ${Game} g
        LEFT JOIN ${GameLike} gl ON g."Id" = gl."GameId"
        WHERE g."OrganizationId" = ${organizationId}
        GROUP BY g."CreatedBy"
      ) like_stats`,
      sql`like_stats.teacher_id = ${User.Id}`
    )
    .where(
      and(
        eq(OrganizationUser.OrganizationId, organizationId),
        eq(Role.Name, "Teacher")
      )
    );

  // Get pending invitations
  const pendingInvitations = await db
    .select({
      id: TeacherInvitations.Id,
      fullName: TeacherInvitations.FullName,
      email: TeacherInvitations.Email,
      joinDate: TeacherInvitations.CreatedOn,
      status: TeacherInvitations.Status,
      expiresAt: TeacherInvitations.ExpiresAt,
    })
    .from(TeacherInvitations)
    .where(
      and(
        eq(TeacherInvitations.OrganizationId, organizationId),
        eq(TeacherInvitations.Status, "Pending")
      )
    );

  // Map existing teachers
  const mappedTeachers: TeacherData[] = teachers.map((teacher) => ({
    id: teacher.id,
    fullName: teacher.fullName,
    email: teacher.email,
    phone: teacher.phone,
    image: teacher.image,
    subject: teacher.subject,
    grade: teacher.grade,
    joinDate: teacher.joinDate.toISOString().split("T")[0],
    status: teacher.status || "Active",
    studentsCount: Number(teacher.studentsCount) || 0,
    rating: Math.round((Number(teacher.rating) || 0) * 100) / 100,
    likes: Number(teacher.likes) || 0,
  }));

  // Map pending invitations as teachers with "Invitation pending" status
  const mappedInvitations: TeacherData[] = pendingInvitations.map(
    (invitation) => ({
      id: invitation.id,
      fullName: invitation.fullName,
      email: invitation.email,
      phone: null,
      image: null,
      subject: null,
      grade: null,
      joinDate: invitation.joinDate.toISOString().split("T")[0],
      status: "Invitation pending",
      studentsCount: 0,
      rating: 0,
      likes: 0,
    })
  );

  // Combine teachers and pending invitations (invitations at the end)
  return [...mappedTeachers, ...mappedInvitations];
}

export async function createTeacherInvitation(data: {
  Email: string;
  FullName: string;
  OrganizationId: string;
  InvitedBy: string;
  Token: string;
  ExpiresAt: Date;
}) {
  const [invitation] = await db
    .insert(TeacherInvitations)
    .values({
      Email: data.Email,
      FullName: data.FullName,
      OrganizationId: data.OrganizationId,
      InvitedBy: data.InvitedBy,
      Token: data.Token,
      ExpiresAt: data.ExpiresAt,
      Status: "Pending",
    })
    .returning();

  return invitation;
}

export async function getInvitationByEmail(
  email: string,
  organizationId: string
) {
  const [invitation] = await db
    .select()
    .from(TeacherInvitations)
    .where(
      and(
        eq(TeacherInvitations.Email, email),
        eq(TeacherInvitations.OrganizationId, organizationId),
        eq(TeacherInvitations.Status, "Pending")
      )
    )
    .limit(1);

  return invitation || null;
}

export async function getInvitationByToken(token: string) {
  const [invitation] = await db
    .select({
      id: TeacherInvitations.Id,
      token: TeacherInvitations.Token,
      email: TeacherInvitations.Email,
      status: TeacherInvitations.Status,
      expiresAt: TeacherInvitations.ExpiresAt,
      organization: {
        id: Organization.Id,
        name: Organization.Name,
        email: Organization.Email,
        phone: Organization.Phone,
        logo: Organization.Logo,
        address: Organization.Address,
        type: Organization.Type,
      },
    })
    .from(TeacherInvitations)
    .leftJoin(
      Organization,
      eq(TeacherInvitations.OrganizationId, Organization.Id)
    )
    .where(
      and(
        eq(TeacherInvitations.Token, token),
        eq(TeacherInvitations.Status, "Pending")
      )
    )
    .limit(1);

  return invitation || null;
}

export async function acceptInvitation(token: string) {
  const [updatedInvitation] = await db
    .update(TeacherInvitations)
    .set({
      Status: "Active",
      AcceptedOn: new Date(),
    })
    .where(eq(TeacherInvitations.Token, token))
    .returning();

  return updatedInvitation;
}
