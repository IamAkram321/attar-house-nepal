import { Router, Request, Response } from "express";
import { db, ordersTable, customOrdersTable, usersTable, productsTable } from "@workspace/db";
import { count, sql } from "drizzle-orm";
import { requireAdmin } from "../../middleware/requireAuth";

const router = Router();

router.get("/dashboard", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const [orderStats, totalCustomers, productStats, recentOrders, recentCustomRequests, dailyTrend] =
      await Promise.all([
        db.select({
          status: ordersTable.status,
          cnt: count(),
          total: sql<string>`coalesce(sum(${ordersTable.total}::numeric), 0)`,
        }).from(ordersTable).groupBy(ordersTable.status),

        db.select({ cnt: count() }).from(usersTable),

        db.select({
          total: count(),
          lowStock: sql<number>`sum(case when ${productsTable.stock} < 5 then 1 else 0 end)`,
        }).from(productsTable),

        db.select({
          id: ordersTable.id,
          customerName: ordersTable.customerName,
          customerEmail: ordersTable.customerEmail,
          total: ordersTable.total,
          status: ordersTable.status,
          paymentStatus: ordersTable.paymentStatus,
          createdAt: ordersTable.createdAt,
        }).from(ordersTable).orderBy(sql`${ordersTable.createdAt} desc`).limit(10),

        db.select({
          id: customOrdersTable.id,
          projectName: customOrdersTable.projectName,
          fullName: customOrdersTable.fullName,
          email: customOrdersTable.email,
          status: customOrdersTable.status,
          preferredMaterial: customOrdersTable.preferredMaterial,
          createdAt: customOrdersTable.createdAt,
        }).from(customOrdersTable).orderBy(sql`${customOrdersTable.createdAt} desc`).limit(10),

        // Revenue + order count per day for the last 30 days, excluding cancelled orders.
        db.select({
          date: sql<string>`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD')`,
          revenue: sql<string>`coalesce(sum(${ordersTable.total}::numeric), 0)`,
          orders: count(),
        })
          .from(ordersTable)
          .where(sql`${ordersTable.createdAt} >= now() - interval '30 days' and ${ordersTable.status} != 'cancelled'`)
          .groupBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD')`)
          .orderBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD') asc`),
      ]);

    const statusMap = Object.fromEntries(
      orderStats.map((r) => [r.status, { count: Number(r.cnt), revenue: Number(r.total) }])
    );
    const totalOrders = orderStats.reduce((s, r) => s + Number(r.cnt), 0);
    const totalRevenue = orderStats.reduce((s, r) => s + Number(r.total), 0);

    res.json({
      orders: {
        total: totalOrders,
        pending: statusMap["pending"]?.count ?? 0,
        confirmed: statusMap["confirmed"]?.count ?? 0,
        processing: statusMap["processing"]?.count ?? 0,
        shipped: statusMap["shipped"]?.count ?? 0,
        delivered: statusMap["delivered"]?.count ?? 0,
        cancelled: statusMap["cancelled"]?.count ?? 0,
      },
      revenue: { total: totalRevenue },
      customers: { total: Number(totalCustomers[0]?.cnt ?? 0) },
      products: {
        total: Number(productStats[0]?.total ?? 0),
        lowStock: Number(productStats[0]?.lowStock ?? 0),
      },
      recentOrders,
      recentCustomRequests,
      trend: dailyTrend.map((d) => ({
        date: d.date,
        revenue: Number(d.revenue),
        orders: Number(d.orders),
      })),
    });
  } catch (err) {
    console.error("[admin/dashboard]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;