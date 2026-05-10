import { Router, type IRouter } from "express";
import { db, checklistItemsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware";
import {
  CreateChecklistItemBody,
  CreateChecklistItemParams,
  UpdateChecklistItemBody,
  UpdateChecklistItemParams,
  DeleteChecklistItemParams,
  ListChecklistItemsParams,
  ResetChecklistParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/trips/:tripId/checklist", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = ListChecklistItemsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid tripId" });
    return;
  }
  const items = await db
    .select()
    .from(checklistItemsTable)
    .where(eq(checklistItemsTable.tripId, params.data.tripId));
  res.json(items.map(checklistDto));
});

router.post("/trips/:tripId/checklist", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = CreateChecklistItemParams.safeParse(req.params);
  const body = CreateChecklistItemBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [item] = await db
    .insert(checklistItemsTable)
    .values({ tripId: params.data.tripId, ...body.data })
    .returning();
  res.status(201).json(checklistDto(item));
});

router.patch("/trips/:tripId/checklist/:itemId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateChecklistItemParams.safeParse(req.params);
  const body = UpdateChecklistItemBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [item] = await db
    .update(checklistItemsTable)
    .set(body.data)
    .where(and(eq(checklistItemsTable.id, params.data.itemId), eq(checklistItemsTable.tripId, params.data.tripId)))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(checklistDto(item));
});

router.delete("/trips/:tripId/checklist/:itemId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteChecklistItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  await db
    .delete(checklistItemsTable)
    .where(and(eq(checklistItemsTable.id, params.data.itemId), eq(checklistItemsTable.tripId, params.data.tripId)));
  res.sendStatus(204);
});

router.post("/trips/:tripId/checklist/reset", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = ResetChecklistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid tripId" });
    return;
  }
  await db
    .update(checklistItemsTable)
    .set({ isPacked: false })
    .where(eq(checklistItemsTable.tripId, params.data.tripId));
  res.json({ ok: true });
});

function checklistDto(i: typeof checklistItemsTable.$inferSelect) {
  return {
    id: i.id,
    tripId: i.tripId,
    label: i.label,
    isPacked: i.isPacked,
    category: i.category,
    createdAt: i.createdAt,
  };
}

export default router;
