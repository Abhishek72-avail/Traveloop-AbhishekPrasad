import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tripsTable } from "./trips";
import { citiesTable } from "./cities";

export const stopsTable = pgTable("stops", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => tripsTable.id, { onDelete: "cascade" }),
  cityId: integer("city_id").notNull().references(() => citiesTable.id),
  arrivalDate: text("arrival_date").notNull(),
  departureDate: text("departure_date").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  accommodation: text("accommodation"),
  accommodationCost: real("accommodation_cost"),
  transportCost: real("transport_cost"),
  mealsCost: real("meals_cost"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStopSchema = createInsertSchema(stopsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStop = z.infer<typeof insertStopSchema>;
export type Stop = typeof stopsTable.$inferSelect;
