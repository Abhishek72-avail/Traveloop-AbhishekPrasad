import { Router, type IRouter } from "express";
import { db, notesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware";
import {
  CreateNoteBody,
  CreateNoteParams,
  UpdateNoteBody,
  UpdateNoteParams,
  DeleteNoteParams,
  ListNotesParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/trips/:tripId/notes", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = ListNotesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid tripId" });
    return;
  }
  const notes = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.tripId, params.data.tripId))
    .orderBy(desc(notesTable.createdAt));
  res.json(notes.map(noteDto));
});

router.post("/trips/:tripId/notes", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = CreateNoteParams.safeParse(req.params);
  const body = CreateNoteBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [note] = await db
    .insert(notesTable)
    .values({ tripId: params.data.tripId, ...body.data })
    .returning();
  res.status(201).json(noteDto(note));
});

router.patch("/trips/:tripId/notes/:noteId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateNoteParams.safeParse(req.params);
  const body = UpdateNoteBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [note] = await db
    .update(notesTable)
    .set(body.data)
    .where(and(eq(notesTable.id, params.data.noteId), eq(notesTable.tripId, params.data.tripId)))
    .returning();
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(noteDto(note));
});

router.delete("/trips/:tripId/notes/:noteId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  await db
    .delete(notesTable)
    .where(and(eq(notesTable.id, params.data.noteId), eq(notesTable.tripId, params.data.tripId)));
  res.sendStatus(204);
});

function noteDto(n: typeof notesTable.$inferSelect) {
  return {
    id: n.id,
    tripId: n.tripId,
    stopId: n.stopId ?? null,
    title: n.title,
    content: n.content,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  };
}

export default router;
