import { Router, type IRouter } from "express";
import { db, usersTable, savedDestinationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware";
import { UpdateProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.patch("/users/profile", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db
    .update(usersTable)
    .set({ ...parsed.data })
    .where(eq(usersTable.id, req.userId!))
    .returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    language: user.language,
    role: user.role,
    createdAt: user.createdAt,
  });
});

router.get("/users/saved-destinations", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rows = await db
    .select()
    .from(savedDestinationsTable)
    .where(eq(savedDestinationsTable.userId, req.userId!));
  res.json(rows.map((r) => r.cityId));
});

router.post("/users/saved-destinations/:cityId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const cityId = parseInt(Array.isArray(req.params.cityId) ? req.params.cityId[0] : req.params.cityId, 10);
  if (isNaN(cityId)) {
    res.status(400).json({ error: "Invalid cityId" });
    return;
  }
  const existing = await db
    .select()
    .from(savedDestinationsTable)
    .where(and(eq(savedDestinationsTable.userId, req.userId!), eq(savedDestinationsTable.cityId, cityId)));
  if (existing.length === 0) {
    await db.insert(savedDestinationsTable).values({ userId: req.userId!, cityId });
  }
  res.json({ ok: true });
});

router.delete("/users/saved-destinations/:cityId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const cityId = parseInt(Array.isArray(req.params.cityId) ? req.params.cityId[0] : req.params.cityId, 10);
  if (isNaN(cityId)) {
    res.status(400).json({ error: "Invalid cityId" });
    return;
  }
  await db
    .delete(savedDestinationsTable)
    .where(and(eq(savedDestinationsTable.userId, req.userId!), eq(savedDestinationsTable.cityId, cityId)));
  res.sendStatus(204);
});

export default router;
