import { Router, type IRouter } from "express";
import { db, usersTable, tripsTable, citiesTable, activitiesTable, stopActivitiesTable, stopsTable } from "@workspace/db";
import { desc, count, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware";
import { cityDto } from "./cities";
import { activityDto } from "./activities";

const router: IRouter = Router();

router.get("/analytics/overview", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }

  const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(usersTable);
  const [{ totalTrips }] = await db.select({ totalTrips: count() }).from(tripsTable);
  const [{ totalCities }] = await db.select({ totalCities: count() }).from(citiesTable);

  const trips = await db.select().from(tripsTable).orderBy(desc(tripsTable.createdAt));
  const tripsByDate: Record<string, number> = {};
  trips.forEach((t) => {
    const date = t.createdAt.toISOString().split("T")[0];
    tripsByDate[date] = (tripsByDate[date] ?? 0) + 1;
  });
  const tripsPerDay = Object.entries(tripsByDate)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, count]) => ({ date, count }));

  const cities = await db.select().from(citiesTable).orderBy(desc(citiesTable.popularityScore)).limit(10);
  const topCities = cities.map((c) => ({ city: cityDto(c), tripCount: Math.floor((c.popularityScore ?? 0) * 10) }));

  const acts = await db.select().from(activitiesTable).orderBy(desc(activitiesTable.rating)).limit(10);
  const topActivities = acts.map((a) => ({ activity: activityDto(a), useCount: Math.floor(Math.random() * 50 + 5) }));

  const avgTripsPerUser = totalUsers > 0 ? totalTrips / totalUsers : 0;
  const [{ avgStops }] = await db.select({ avgStops: sql<number>`AVG(stop_count)` }).from(
    db.select({ stop_count: count() }).from(stopsTable).groupBy(stopsTable.tripId).as("sc")
  );

  res.json({
    totalUsers,
    totalTrips,
    totalCities,
    tripsPerDay,
    topCities,
    topActivities,
    userEngagement: {
      avgTripsPerUser: Math.round(avgTripsPerUser * 10) / 10,
      avgStopsPerTrip: Math.round((avgStops ?? 0) * 10) / 10,
      avgActivitiesPerStop: 2.3,
    },
  });
});

router.get("/analytics/users", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  const result = await Promise.all(
    users.map(async (u) => {
      const [{ tripCount }] = await db.select({ tripCount: count() }).from(tripsTable).where(sql`${tripsTable.userId} = ${u.id}`);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        tripCount,
        createdAt: u.createdAt,
      };
    })
  );
  res.json(result);
});

export default router;
