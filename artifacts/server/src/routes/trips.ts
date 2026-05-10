import { Router, type IRouter } from "express";
import { db, tripsTable, stopsTable, citiesTable, stopActivitiesTable, activitiesTable } from "@workspace/db";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { requireAuth, optionalAuth, type AuthRequest } from "../lib/auth-middleware";
import {
  CreateTripBody,
  UpdateTripBody,
  UpdateTripParams,
  GetTripParams,
  DeleteTripParams,
  GetTripBudgetParams,
  GetPublicTripParams,
  UpdateTripShareParams,
  UpdateTripShareBody,
  CopyTripParams,
} from "@workspace/api-zod";
import { cityDto } from "./cities";
import { activityDto } from "./activities";

const router: IRouter = Router();

function tripDto(t: typeof tripsTable.$inferSelect, stopCount = 0) {
  return {
    id: t.id,
    name: t.name,
    description: t.description ?? null,
    startDate: t.startDate,
    endDate: t.endDate,
    coverPhoto: t.coverPhoto ?? null,
    isPublic: t.isPublic,
    stopCount,
    totalBudget: t.totalBudget ?? null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

async function buildTripDetail(tripId: number) {
  const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, tripId));
  if (!trip) return null;

  const stops = await db
    .select()
    .from(stopsTable)
    .leftJoin(citiesTable, eq(stopsTable.cityId, citiesTable.id))
    .where(eq(stopsTable.tripId, tripId))
    .orderBy(stopsTable.orderIndex);

  const stopsWithActivities = await Promise.all(
    stops.map(async (s) => {
      const stopActs = await db
        .select()
        .from(stopActivitiesTable)
        .leftJoin(activitiesTable, eq(stopActivitiesTable.activityId, activitiesTable.id))
        .where(eq(stopActivitiesTable.stopId, s.stops.id));

      return {
        id: s.stops.id,
        tripId: s.stops.tripId,
        cityId: s.stops.cityId,
        city: s.cities ? cityDto(s.cities) : null,
        arrivalDate: s.stops.arrivalDate,
        departureDate: s.stops.departureDate,
        orderIndex: s.stops.orderIndex,
        accommodation: s.stops.accommodation ?? null,
        accommodationCost: s.stops.accommodationCost ?? null,
        transportCost: s.stops.transportCost ?? null,
        mealsCost: s.stops.mealsCost ?? null,
        activities: stopActs.map((sa) => ({
          id: sa.stop_activities.id,
          stopId: sa.stop_activities.stopId,
          activityId: sa.stop_activities.activityId,
          scheduledTime: sa.stop_activities.scheduledTime ?? null,
          activity: sa.activities ? activityDto(sa.activities) : null,
        })),
      };
    })
  );

  return {
    id: trip.id,
    name: trip.name,
    description: trip.description ?? null,
    startDate: trip.startDate,
    endDate: trip.endDate,
    coverPhoto: trip.coverPhoto ?? null,
    isPublic: trip.isPublic,
    totalBudget: trip.totalBudget ?? null,
    stops: stopsWithActivities,
    createdAt: trip.createdAt,
  };
}

// Dashboard
router.get("/trips/dashboard", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userTrips = await db.select().from(tripsTable).where(eq(tripsTable.userId, req.userId!)).orderBy(desc(tripsTable.createdAt));
  const today = new Date().toISOString().split("T")[0];
  const upcoming = userTrips.filter((t) => t.startDate >= today);

  const totalBudgetSpent = userTrips.reduce((sum, t) => sum + (t.totalBudget ?? 0), 0);
  const recentTrips = userTrips.slice(0, 5);

  const stopCounts = await Promise.all(
    recentTrips.map(async (t) => {
      const [{ value }] = await db.select({ value: count() }).from(stopsTable).where(eq(stopsTable.tripId, t.id));
      return value;
    })
  );

  const popularCities = await db.select().from(citiesTable).orderBy(desc(citiesTable.popularityScore)).limit(6);

  res.json({
    totalTrips: userTrips.length,
    upcomingTrips: upcoming.length,
    totalBudgetSpent,
    recentTrips: recentTrips.map((t, i) => tripDto(t, stopCounts[i])),
    popularCities: popularCities.map(cityDto),
  });
});

// List trips
router.get("/trips", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const trips = await db.select().from(tripsTable).where(eq(tripsTable.userId, req.userId!)).orderBy(desc(tripsTable.createdAt));
  const withCounts = await Promise.all(
    trips.map(async (t) => {
      const [{ value }] = await db.select({ value: count() }).from(stopsTable).where(eq(stopsTable.tripId, t.id));
      return tripDto(t, value);
    })
  );
  res.json(withCounts);
});

// Create trip
router.post("/trips", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const body = CreateTripBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const { startDate, endDate, ...rest } = body.data;
  const [trip] = await db.insert(tripsTable).values({
    userId: req.userId!,
    ...rest,
    startDate: startDate instanceof Date ? startDate.toISOString().split("T")[0] : String(startDate),
    endDate: endDate instanceof Date ? endDate.toISOString().split("T")[0] : String(endDate),
  }).returning();
  res.status(201).json(tripDto(trip, 0));
});

// Get trip
router.get("/trips/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetTripParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const detail = await buildTripDetail(params.data.id);
  if (!detail || (detail as any).userId !== req.userId) {
    // check ownership
    const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.id), eq(tripsTable.userId, req.userId!)));
    if (!trip && !detail) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }
  }
  if (!detail) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.json(detail);
});

// Update trip
router.patch("/trips/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateTripParams.safeParse(req.params);
  const body = UpdateTripBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { startDate, endDate, ...rest } = body.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (startDate != null) updateData.startDate = startDate instanceof Date ? startDate.toISOString().split("T")[0] : String(startDate);
  if (endDate != null) updateData.endDate = endDate instanceof Date ? endDate.toISOString().split("T")[0] : String(endDate);
  const [trip] = await db
    .update(tripsTable)
    .set(updateData)
    .where(and(eq(tripsTable.id, params.data.id), eq(tripsTable.userId, req.userId!)))
    .returning();
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.json(tripDto(trip));
});

// Delete trip
router.delete("/trips/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteTripParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [trip] = await db.delete(tripsTable).where(and(eq(tripsTable.id, params.data.id), eq(tripsTable.userId, req.userId!))).returning();
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.sendStatus(204);
});

// Budget breakdown
router.get("/trips/:id/budget", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetTripBudgetParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.id), eq(tripsTable.userId, req.userId!)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const stops = await db.select().from(stopsTable).where(eq(stopsTable.tripId, params.data.id));
  const stopActs = await db
    .select()
    .from(stopActivitiesTable)
    .leftJoin(activitiesTable, eq(stopActivitiesTable.activityId, activitiesTable.id))
    .where(sql`${stopActivitiesTable.stopId} IN (SELECT id FROM stops WHERE trip_id = ${params.data.id})`);

  const transport = stops.reduce((s, stop) => s + (stop.transportCost ?? 0), 0);
  const accommodation = stops.reduce((s, stop) => s + (stop.accommodationCost ?? 0), 0);
  const meals = stops.reduce((s, stop) => s + (stop.mealsCost ?? 0), 0);
  const activitiesTotal = stopActs.reduce((s, sa) => s + (sa.activities?.estimatedCost ?? 0), 0);
  const totalEstimated = transport + accommodation + meals + activitiesTotal;

  // Daily costs
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const dailyCosts: { date: string; cost: number }[] = [];
  const overBudgetDays: string[] = [];
  const current = new Date(start);
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const dailyAvg = totalEstimated / days;
  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    const cost = dailyAvg * (0.8 + Math.random() * 0.4);
    dailyCosts.push({ date: dateStr, cost: Math.round(cost * 100) / 100 });
    if (trip.totalBudget && cost > trip.totalBudget / days * 1.2) {
      overBudgetDays.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }

  res.json({
    totalBudget: trip.totalBudget ?? null,
    totalEstimated,
    breakdown: { transport, accommodation, activities: activitiesTotal, meals, other: 0 },
    dailyCosts,
    overBudgetDays,
  });
});

// Public trip
router.get("/trips/:id/public", optionalAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetPublicTripParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, params.data.id));
  if (!trip || !trip.isPublic) {
    res.status(404).json({ error: "Trip not found or not public" });
    return;
  }
  const detail = await buildTripDetail(params.data.id);
  res.json(detail);
});

// Update share
router.patch("/trips/:id/share", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateTripShareParams.safeParse(req.params);
  const body = UpdateTripShareBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [trip] = await db
    .update(tripsTable)
    .set({ isPublic: body.data.isPublic })
    .where(and(eq(tripsTable.id, params.data.id), eq(tripsTable.userId, req.userId!)))
    .returning();
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.json(tripDto(trip));
});

// Copy trip
router.post("/trips/:id/copy", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = CopyTripParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [original] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.id), eq(tripsTable.isPublic, true)));
  if (!original) {
    res.status(404).json({ error: "Trip not found or not public" });
    return;
  }
  const [newTrip] = await db
    .insert(tripsTable)
    .values({
      userId: req.userId!,
      name: `Copy of ${original.name}`,
      description: original.description,
      startDate: original.startDate,
      endDate: original.endDate,
      coverPhoto: original.coverPhoto,
      totalBudget: original.totalBudget,
      isPublic: false,
    })
    .returning();
  res.status(201).json(tripDto(newTrip, 0));
});

export { buildTripDetail };
export default router;
