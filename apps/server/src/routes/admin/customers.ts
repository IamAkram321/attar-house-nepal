import { Router, Request, Response } from "express";
import { db, usersTable, ordersTable } from "@workspace/db";
import { eq, desc, count, sql, or, ilike } from "drizzle-orm";
import { requireAdmin } from "../../middleware/requireAuth";
import { getPaginationParams, buildPaginationMeta } from "../../lib/pagination";

const router = Router();

type CustomerRow = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  createdAt: Date;
  orderCount: number;
  totalSpent: string;
  lastOrderAt: Date | null;
};

/** GET /api/admin/customers */
router.get("/customers", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query as Record<string, string>;
    const pagination = getPaginationParams(req);

    const where = search
      ? or(ilike(usersTable.name, `%${search}%`), ilike(usersTable.email, `%${search}%`))
      : undefined;

    const [customersRaw, [{ total }]] = await Promise.all([
      db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          avatar: usersTable.avatar,
          role: usersTable.role,
          createdAt: usersTable.createdAt,
          orderCount: sql<number>`cast(count(distinct ${ordersTable.id}) as int)`,
          totalSpent: sql<string>`coalesce(sum(${ordersTable.total}::numeric), 0)::text`,
          lastOrderAt: sql<Date | null>`max(${ordersTable.createdAt})`,
        })
        .from(usersTable)
        .leftJoin(ordersTable, eq(ordersTable.userId, usersTable.id))
        .where(where)
        .groupBy(usersTable.id)
        .orderBy(desc(usersTable.createdAt))
        .limit(pagination.limit)
        .offset(pagination.offset) as unknown as Promise<CustomerRow[]>,
      db.select({ total: count() }).from(usersTable).where(where),
    ]);

    // Fallback missing avatar URLs with high-quality generated initials SVG
    const customers = customersRaw.map((customer) => ({
      ...customer,
      avatar:
        customer.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customer.name || "Customer")}`,
    }));

    res.json({ customers, ...buildPaginationMeta(pagination, total) });
  } catch (err) {
    console.error("[admin/customers]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** GET /api/admin/customers/:id */
router.get("/customers/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid customer ID" });
      return;
    }

    const [user] = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        avatar: usersTable.avatar,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    // Attach fallback avatar if missing
    const customer = {
      ...user,
      avatar:
        user.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || "Customer")}`,
    };

    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, id))
      .orderBy(desc(ordersTable.createdAt));

    res.json({ customer, orders });
  } catch (err) {
    console.error("[admin/customers/:id]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;