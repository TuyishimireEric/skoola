import {
    pgTable,
    uuid,
    text,
    timestamp,
    integer,
    pgEnum,
    boolean,
    numeric,
} from "drizzle-orm/pg-core";
import { Organization, User } from ".";

export const courseStatus = pgEnum("course_status", [
    "Draft",
    "Published",
    "Archived",
]);

export const Course = pgTable("Course", {
    Id: uuid("Id").defaultRandom().primaryKey().notNull(),
    Title: text("Title").notNull(),
    Description: text("Description"),
    ImageUrl: text("ImageUrl"),
    Grade: text("Grade").notNull(), // e.g., "Grade 1", "Grade 2", etc.
    Subject: text("Subject"), // e.g., "Mathematics", "Science", "English"
    Status: courseStatus("Status").default("Draft").notNull(),
    Order: integer("Order").default(0), // For ordering courses
    IsActive: boolean("IsActive").default(true).notNull(),
    OrganizationId: uuid("OrganizationId")
        .notNull()
        .references(() => Organization.Id, {
            onDelete: "cascade",
            onUpdate: "restrict",
        }),
    CreatedBy: uuid("CreatedBy")
        .notNull()
        .references(() => User.Id, { onDelete: "cascade" }),
    UpdatedBy: uuid("UpdatedBy")
        .notNull()
        .references(() => User.Id, { onDelete: "cascade" }),
    CreatedOn: timestamp("CreatedOn", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
    UpdatedOn: timestamp("UpdatedOn", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
});

// Course Performance table - tracks student performance in courses
export const CoursePerformance = pgTable("CoursePerformance", {
    Id: uuid("Id").defaultRandom().primaryKey().notNull(),
    CourseId: uuid("CourseId")
        .notNull()
        .references(() => Course.Id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    StudentId: uuid("StudentId")
        .notNull()
        .references(() => User.Id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    Assignment1: numeric("Assignment1", { precision: 5, scale: 2 }), // Out of 100
    Assignment2: numeric("Assignment2", { precision: 5, scale: 2 }), // Out of 100
    CAT: numeric("CAT", { precision: 5, scale: 2 }), // Continuous Assessment Test, out of 100
    Exam: numeric("Exam", { precision: 5, scale: 2 }), // Out of 100
    Total: numeric("Total", { precision: 5, scale: 2 }), // Calculated total
    Grade: text("Grade"), // Letter grade (A, B, C, D, E, F)
    Remarks: text("Remarks"), // Teacher's remarks
    Term: text("Term"), // e.g., "Term 1", "Term 2", "Term 3"
    AcademicYear: text("AcademicYear"), // e.g., "2024/2025"
    OrganizationId: uuid("OrganizationId")
        .notNull()
        .references(() => Organization.Id, {
            onDelete: "cascade",
            onUpdate: "restrict",
        }),
    CreatedBy: uuid("CreatedBy")
        .notNull()
        .references(() => User.Id, { onDelete: "cascade" }),
    UpdatedBy: uuid("UpdatedBy")
        .notNull()
        .references(() => User.Id, { onDelete: "cascade" }),
    CreatedOn: timestamp("CreatedOn", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
    UpdatedOn: timestamp("UpdatedOn", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
});