import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  serial,
  text,
  integer,
  index,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { Organization, User } from ".";

export const Classes = pgTable("Classes", {
  Id: serial("Id").primaryKey(),
  Name: varchar("Name").notNull().unique(),
  Description: text("Description"),
  Type: varchar("Type", { length: 20 }).notNull(),
  Order: integer("Order").notNull(),
  ClassCode: varchar("ClassCode", { length: 10 }).notNull().unique(),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const ClassOrganization = pgTable(
  "ClassOrganization",
  {
    Id: uuid("Id").primaryKey().defaultRandom(),
    ClassId: serial("ClassId")
      .notNull()
      .references(() => Classes.Id, { onDelete: "cascade" }),
    OrganizationId: uuid("OrganizationId")
      .notNull()
      .references(() => Organization.Id, { onDelete: "cascade" }),
    CreatedOn: timestamp("CreatedOn", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    UpdatedOn: timestamp("UpdatedOn", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("class-org-idx").on(table.ClassId, table.OrganizationId)]
);

export const ClassStudent = pgTable(
  "ClassStudent",
  {
    Id: uuid("Id").primaryKey().defaultRandom(),
    ClassId: integer("ClassId")
      .notNull()
      .references(() => Classes.Id, { onDelete: "cascade" }),
    UserId: uuid("UserId")
      .notNull()
      .references(() => User.Id),
    OrganizationId: uuid("OrganizationId")
      .notNull()
      .references(() => Organization.Id, { onDelete: "cascade" }),
    StartedOn: timestamp("StartedOn", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    EndedOn: timestamp("EndedOn", { withTimezone: true, mode: "string" }),
    IsCurrentClass: boolean("IsCurrentClass").default(false),
    CreatedOn: timestamp("CreatedOn", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    UpdatedOn: timestamp("UpdatedOn", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("class-user-index").on(table.ClassId, table.UserId)]
);
