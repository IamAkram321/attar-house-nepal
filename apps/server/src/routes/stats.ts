import { Router, type IRouter } from "express";
import { GetStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const STATS = {
  customersServed: 1200,
  projectsCompleted: 850,
  customDesigns: 430,
  printingHours: 9500,
  satisfactionPercent: 94,
  avgProductionDays: 2,
};

router.get("/stats", async (_req, res): Promise<void> => {
  res.json(GetStatsResponse.parse(STATS));
});

export default router;
