import { pgTable, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { citiesTable } from "./cities";

export const savedDestinationsTable = pgTable("saved_destinations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  cityId: integer("city_id").notNull().references(() => citiesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSavedDestinationSchema = createInsertSchema(savedDestinationsTable).omit({ id: true, createdAt: true });
export type InsertSavedDestination = z.infer<typeof insertSavedDestinationSchema>;
export type SavedDestination = typeof savedDestinationsTable.$inferSelect;
