import { Router, type IRouter } from "express";
import { db, citiesTable } from "@workspace/db";
import { eq, ilike, or, desc } from "drizzle-orm";
import { GetCityParams, ListCitiesQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/cities", async (req, res): Promise<void> => {
  const qp = ListCitiesQueryParams.safeParse(req.query);
  const query = qp.success ? qp.data.q : undefined;
  const country = qp.success ? qp.data.country : undefined;
  const region = qp.success ? qp.data.region : undefined;

  let cities = await db.select().from(citiesTable).orderBy(desc(citiesTable.popularityScore));

  if (query) {
    cities = cities.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.country.toLowerCase().includes(query.toLowerCase())
    );
  }
  if (country) {
    cities = cities.filter((c) => c.country.toLowerCase().includes(country.toLowerCase()));
  }
  if (region) {
    cities = cities.filter((c) => c.region.toLowerCase().includes(region.toLowerCase()));
  }

  res.json(cities.map(cityDto));
});

router.get("/cities/popular", async (_req, res): Promise<void> => {
  const cities = await db
    .select()
    .from(citiesTable)
    .orderBy(desc(citiesTable.popularityScore))
    .limit(8);
  res.json(cities.map(cityDto));
});

router.get("/cities/:id", async (req, res): Promise<void> => {
  const params = GetCityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [city] = await db.select().from(citiesTable).where(eq(citiesTable.id, params.data.id));
  if (!city) {
    res.status(404).json({ error: "City not found" });
    return;
  }
  res.json(cityDto(city));
});

function cityDto(c: typeof citiesTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    country: c.country,
    region: c.region,
    description: c.description ?? null,
    imageUrl: c.imageUrl ?? null,
    costIndex: c.costIndex ?? null,
    popularityScore: c.popularityScore ?? null,
    currency: c.currency ?? null,
    timezone: c.timezone ?? null,
  };
}

export { cityDto };
export default router;
