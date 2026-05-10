import { Router, type IRouter } from "express";
import { db, stopsTable, citiesTable, stopActivitiesTable, activitiesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware";
import {
  ListStopsParams,
  CreateStopParams,
  CreateStopBody,
  UpdateStopParams,
  UpdateStopBody,
  DeleteStopParams,
  AddActivityToStopParams,
  AddActivityToStopBody,
  RemoveActivityFromStopParams,
} from "@workspace/api-zod";
import { cityDto } from "./cities";
import { activityDto } from "./activities";

const router: IRouter = Router();

async function stopWithCity(s: typeof stopsTable.$inferSelect) {
  const [city] = await db.select().from(citiesTable).where(eq(citiesTable.id, s.cityId));
  return {
    id: s.id,
    tripId: s.tripId,
    cityId: s.cityId,
    city: city ? cityDto(city) : null,
    arrivalDate: s.arrivalDate,
    departureDate: s.departureDate,
    orderIndex: s.orderIndex,
    accommodation: s.accommodation ?? null,
    accommodationCost: s.accommodationCost ?? null,
    transportCost: s.transportCost ?? null,
    mealsCost: s.mealsCost ?? null,
  };
}

router.get("/trips/:tripId/stops", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = ListStopsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid tripId" });
    return;
  }
  const stops = await db
    .select()
    .from(stopsTable)
    .where(eq(stopsTable.tripId, params.data.tripId))
    .orderBy(stopsTable.orderIndex);
  const result = await Promise.all(stops.map(stopWithCity));
  res.json(result);
});

router.post("/trips/:tripId/stops", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = CreateStopParams.safeParse(req.params);
  const body = CreateStopBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { arrivalDate, departureDate, ...restBody } = body.data;
  const [stop] = await db
    .insert(stopsTable)
    .values({
      tripId: params.data.tripId,
      ...restBody,
      arrivalDate: arrivalDate instanceof Date ? arrivalDate.toISOString().split("T")[0] : String(arrivalDate),
      departureDate: departureDate instanceof Date ? departureDate.toISOString().split("T")[0] : String(departureDate),
    })
    .returning();
  res.status(201).json(await stopWithCity(stop));
});

router.patch("/trips/:tripId/stops/:stopId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateStopParams.safeParse(req.params);
  const body = UpdateStopBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { arrivalDate, departureDate, ...restUpdate } = body.data;
  const updateData: Record<string, unknown> = { ...restUpdate };
  if (arrivalDate != null) updateData.arrivalDate = arrivalDate instanceof Date ? arrivalDate.toISOString().split("T")[0] : String(arrivalDate);
  if (departureDate != null) updateData.departureDate = departureDate instanceof Date ? departureDate.toISOString().split("T")[0] : String(departureDate);
  const [stop] = await db
    .update(stopsTable)
    .set(updateData)
    .where(and(eq(stopsTable.id, params.data.stopId), eq(stopsTable.tripId, params.data.tripId)))
    .returning();
  if (!stop) {
    res.status(404).json({ error: "Stop not found" });
    return;
  }
  res.json(await stopWithCity(stop));
});

router.delete("/trips/:tripId/stops/:stopId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteStopParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  await db
    .delete(stopsTable)
    .where(and(eq(stopsTable.id, params.data.stopId), eq(stopsTable.tripId, params.data.tripId)));
  res.sendStatus(204);
});

router.post("/trips/:tripId/stops/:stopId/activities", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = AddActivityToStopParams.safeParse(req.params);
  const body = AddActivityToStopBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [sa] = await db
    .insert(stopActivitiesTable)
    .values({ stopId: params.data.stopId, activityId: body.data.activityId, scheduledTime: body.data.scheduledTime })
    .returning();
  const [activity] = await db.select().from(activitiesTable).where(eq(activitiesTable.id, sa.activityId));
  res.status(201).json({
    id: sa.id,
    stopId: sa.stopId,
    activityId: sa.activityId,
    scheduledTime: sa.scheduledTime ?? null,
    activity: activity ? activityDto(activity) : null,
  });
});

router.delete(
  "/trips/:tripId/stops/:stopId/activities/:activityId",
  requireAuth,
  async (req: AuthRequest, res): Promise<void> => {
    const params = RemoveActivityFromStopParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    await db
      .delete(stopActivitiesTable)
      .where(
        and(
          eq(stopActivitiesTable.stopId, params.data.stopId),
          eq(stopActivitiesTable.id, params.data.activityId)
        )
      );
    res.sendStatus(204);
  }
);

export default router;
