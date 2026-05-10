import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody, SignupBody } from "@workspace/api-zod";

const router: IRouter = Router();
const JWT_SECRET = process.env.SESSION_SECRET ?? "traveloop-secret-dev";

function makeToken(userId: number, role: string) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

function userDto(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl ?? null,
    language: u.language,
    role: u.role,
    createdAt: u.createdAt,
  };
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const token = makeToken(user.id, user.role);
  res.json({ user: userDto(user), token });
});

router.post("/auth/signup", async (req, res): Promise<void> => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, avatarUrl } = parsed.data;
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ 
    name, 
    email: email.toLowerCase(), 
    passwordHash,
    avatarUrl 
  }).returning();
  const token = makeToken(user.id, user.role);
  res.status(201).json({ user: userDto(user), token });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ ok: true });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: number };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.json(userDto(user));
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
});

export default router;
