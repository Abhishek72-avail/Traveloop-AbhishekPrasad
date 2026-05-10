import { Router, type IRouter } from "express";
import { db, activitiesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { GetActivityParams, ListActivitiesQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/activities", async (req, res): Promise<void> => {
  const qp = ListActivitiesQueryParams.safeParse(req.query);

  let acts = await db.select().from(activitiesTable).orderBy(desc(activitiesTable.rating));

  if (qp.success) {
    if (qp.data.cityId) {
      acts = acts.filter((a) => a.cityId === qp.data.cityId);
    }
    if (qp.data.type) {
      acts = acts.filter((a) => a.type === qp.data.type);
    }
    if (qp.data.maxCost != null) {
      acts = acts.filter((a) => a.estimatedCost <= qp.data.maxCost!);
    }
    if (qp.data.q) {
      const q = qp.data.q.toLowerCase();
      acts = acts.filter((a) => a.name.toLowerCase().includes(q) || (a.description ?? "").toLowerCase().includes(q));
    }
  }

  res.json(acts.map(activityDto));
});

router.get("/activities/:id", async (req, res): Promise<void> => {
  const params = GetActivityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [act] = await db.select().from(activitiesTable).where(eq(activitiesTable.id, params.data.id));
  if (!act) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.json(activityDto(act));
});

function activityDto(a: typeof activitiesTable.$inferSelect) {
  return {
    id: a.id,
    cityId: a.cityId,
    name: a.name,
    description: a.description ?? null,
    type: a.type,
    estimatedCost: a.estimatedCost,
    durationHours: a.durationHours,
    imageUrl: a.imageUrl ?? null,
    rating: a.rating ?? null,
  };
}

export { activityDto };
export default router;
