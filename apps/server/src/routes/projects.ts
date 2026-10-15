import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, projectsTable } from "@workspace/db";
import {
  ListProjectsResponse,
  ListFeaturedProjectsResponse,
  GetProjectParams,
  GetProjectResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/projects", async (_req, res): Promise<void> => {
  const projects = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);
  const mapped = projects.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }));
  res.json(ListProjectsResponse.parse(mapped));
});

router.get("/projects/featured", async (_req, res): Promise<void> => {
  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.featured, true))
    .limit(6);
  const mapped = projects.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }));
  res.json(ListFeaturedProjectsResponse.parse(mapped));
});

router.get("/projects/:slug", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.slug, params.data.slug));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(GetProjectResponse.parse({ ...project, createdAt: project.createdAt.toISOString() }));
});

export default router;
