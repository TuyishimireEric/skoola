import {
    pgTable,
    uuid,
    text,
    timestamp,
    date,
    pgEnum,
} from "drizzle-orm/pg-core";
import { User, Organization } from ".";

export const attendanceStatus = pgEnum("attendance_status", [
    "present",
    "late",
    "absent",
    "excused",
]);

export const Attendance = pgTable("Attendance", {
    Id: uuid("Id").defaultRandom().primaryKey().notNull(),
    StudentId: uuid("StudentId")
        .notNull()
        .references(() => User.Id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    Date: date("Date").notNull(),
    Status: attendanceStatus("Status").notNull(),
    Notes: text("Notes"),
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