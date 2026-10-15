import { Router, type IRouter } from "express";
import { db, testimonialsTable } from "@workspace/db";
import { ListTestimonialsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/testimonials", async (_req, res): Promise<void> => {
  const testimonials = await db.select().from(testimonialsTable);
  const mapped = testimonials.map((t) => ({
    ...t,
    rating: Number(t.rating),
  }));
  res.json(ListTestimonialsResponse.parse(mapped));
});

export default router;
