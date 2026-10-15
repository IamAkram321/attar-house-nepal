import type { Request } from "express";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;

export interface PaginationParams {
  limit: number;
  offset: number;
  page: number;
}

/**
 * Reads ?page and ?limit query params with sane defaults and hard caps.
 *
 * Defaults to 100 rows if the caller doesn't ask for pagination at all —
 * generous enough that it won't silently truncate any of this app's
 * current admin lists, while still putting a real ceiling on worst-case
 * response size as data grows. Once the frontend adds actual page-through
 * controls, callers can pass &page=2 etc. to move past that default.
 */
export function getPaginationParams(req: Request): PaginationParams {
  const rawPage = parseInt(String(req.query.page ?? "1"), 10);
  const rawLimit = parseInt(String(req.query.limit ?? DEFAULT_LIMIT), 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;

  return { limit, offset: (page - 1) * limit, page };
}

export function buildPaginationMeta(params: PaginationParams, total: number) {
  return {
    page: params.page,
    pageSize: params.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / params.limit)),
  };
}