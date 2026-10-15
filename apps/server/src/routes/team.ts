import { Router, Request, Response } from "express";
import { requireSuperAdmin } from "../middleware/requireAuth";
import { db } from "../../../../lib/db/src";
import { usersTable } from "../../../../lib/db/src/schema/users";
import { productsTable } from "../../../../lib/db/src/schema/products";
import { eq, and, ne, count, sum, inArray } from "drizzle-orm";

const router = Router();

// Enforce strict Super Admin access
router.use(requireSuperAdmin);

const TEAM_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "PRODUCTION_MANAGER",
  "CAD_DESIGNER",
  "FULFILLMENT_LEAD",
  "SUPPORT_AGENT",
  "CUSTOMER",
] as const;

type RoleType = (typeof TEAM_ROLES)[number];

// Default permission presets auto-assigned when changing roles
const DEFAULT_ROLE_PERMISSIONS: Record<RoleType, string[]> = {
  SUPER_ADMIN: [],
  ADMIN: [
    "PRINTER_MANAGE",
    "QUEUE_OVERRIDE",
    "CUSTOM_REQUESTS_PROCESS",
    "PRODUCTS_CREATE",
    "PRODUCTS_EDIT",
    "PRODUCTS_DELETE",
    "ORDERS_FULFILL",
    "ORDERS_MANAGE",
    "ANALYTICS_VIEW",
    "REVIEWS_MANAGE",
  ],
  PRODUCTION_MANAGER: ["PRINTER_MANAGE", "QUEUE_OVERRIDE", "ORDERS_MANAGE"],
  CAD_DESIGNER: ["CUSTOM_REQUESTS_PROCESS", "PRODUCTS_CREATE", "PRODUCTS_EDIT"],
  FULFILLMENT_LEAD: ["ORDERS_FULFILL", "ORDERS_MANAGE"],
  SUPPORT_AGENT: ["REVIEWS_MANAGE", "ORDERS_MANAGE"],
  CUSTOMER: [],
};

// Helper function to extract user ID across session/JWT auth configurations
const getAuthUserId = (req: Request): number | null => {
  const id = (req as any).user?.id || req.session?.userId;
  return id ? Number(id) : null;
};

// 1. Get all admin & operational team members with productivity stats
router.get("/", async (req: Request, res: Response) => {
  try {
    const teamMembers = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        permissions: usersTable.permissions,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(
        inArray(usersTable.role, [
          "SUPER_ADMIN",
          "ADMIN",
          "PRODUCTION_MANAGER",
          "CAD_DESIGNER",
          "FULFILLMENT_LEAD",
          "SUPPORT_AGENT",
        ])
      );

    const stats = await db
      .select({
        userId: productsTable.createdByUserId,
        productsCount: count(productsTable.id),
        totalSeconds: sum(productsTable.creationDurationSeconds),
      })
      .from(productsTable)
      .groupBy(productsTable.createdByUserId);

    const statsMap = new Map(stats.map((s) => [s.userId, s]));

    const response = teamMembers.map((member) => ({
      ...member,
      metrics: {
        productsCreated: Number(statsMap.get(member.id)?.productsCount || 0),
        totalTimeSeconds: Number(statsMap.get(member.id)?.totalSeconds || 0),
      },
    }));

    res.json(response);
  } catch (error) {
    console.error("Error fetching admin team:", error);
    res.status(500).json({ error: "Failed to fetch admin team" });
  }
});

// 2. Onboard or invite a team member by Name & Email
router.post("/invite", async (req: Request, res: Response) => {
  const { name, email, role, permissions } = req.body;

  if (!name || !email) {
    res.status(400).json({ error: "Name and email are required." });
    return;
  }

  const assignedRole: RoleType = TEAM_ROLES.includes(role) ? role : "ADMIN";
  const assignedPermissions =
    Array.isArray(permissions) && permissions.length > 0
      ? permissions
      : DEFAULT_ROLE_PERMISSIONS[assignedRole] || [];

  try {
    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser) {
      const [updatedUser] = await db
        .update(usersTable)
        .set({
          name,
          role: assignedRole,
          permissions: assignedRole === "SUPER_ADMIN" ? [] : assignedPermissions,
        })
        .where(eq(usersTable.id, existingUser.id))
        .returning();

      res.status(200).json({ message: "Existing user promoted to team", user: updatedUser });
      return;
    }

    const [newUser] = await db
      .insert(usersTable)
      .values({
        name,
        email,
        role: assignedRole,
        permissions: assignedRole === "SUPER_ADMIN" ? [] : assignedPermissions,
      })
      .returning();

    res.status(201).json({ message: "Team member onboarded successfully", user: newUser });
  } catch (error) {
    console.error("Error onboarding team member:", error);
    res.status(500).json({ error: "Failed to onboard team member" });
  }
});

// 3. Update permissions for a specific Team Member
router.patch("/:userId/permissions", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { permissions } = req.body;

  if (!Array.isArray(permissions)) {
    res.status(400).json({ error: "Permissions must be an array of string flags." });
    return;
  }

  try {
    const [updatedUser] = await db
      .update(usersTable)
      .set({ permissions })
      .where(and(eq(usersTable.id, Number(userId)), ne(usersTable.role, "SUPER_ADMIN")))
      .returning();

    if (!updatedUser) {
      res.status(404).json({ error: "User not found or is a Super Admin." });
      return;
    }

    res.json({ message: "Permissions updated successfully", permissions: updatedUser.permissions });
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).json({ error: "Failed to update permissions" });
  }
});

// 4. Change role (or demote to Customer)
router.patch("/:userId/role", async (req: Request, res: Response) => {
  const targetUserId = Number(req.params.userId);
  const { role } = req.body as { role: RoleType };
  const currentUserId = getAuthUserId(req);

  if (isNaN(targetUserId)) {
    res.status(400).json({ error: "Invalid user ID supplied." });
    return;
  }

  if (currentUserId && targetUserId === currentUserId) {
    res.status(400).json({ error: "You cannot change your own role." });
    return;
  }

  if (!TEAM_ROLES.includes(role)) {
    res.status(400).json({ error: "Invalid role specified." });
    return;
  }

  try {
    const newPermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];

    const [updatedUser] = await db
      .update(usersTable)
      .set({
        role,
        permissions: role === "SUPER_ADMIN" ? [] : newPermissions,
      })
      .where(and(eq(usersTable.id, targetUserId), ne(usersTable.role, "SUPER_ADMIN")))
      .returning();

    if (!updatedUser) {
      res.status(404).json({ error: "User not found or target is a Super Admin." });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

// 5. Delete or offboard Team Member
router.delete("/:userId", async (req: Request, res: Response) => {
  const targetUserId = Number(req.params.userId);
  const currentUserId = getAuthUserId(req);

  if (isNaN(targetUserId)) {
    res.status(400).json({ error: "Invalid user ID supplied." });
    return;
  }

  if (currentUserId && targetUserId === currentUserId) {
    res.status(400).json({ error: "You cannot delete your own account." });
    return;
  }

  try {
    const [deletedUser] = await db
      .delete(usersTable)
      .where(and(eq(usersTable.id, targetUserId), ne(usersTable.role, "SUPER_ADMIN")))
      .returning();

    if (!deletedUser) {
      res.status(404).json({ error: "User not found or target is a Super Admin." });
      return;
    }

    res.json({ message: "Team member removed successfully", user: deletedUser });
  } catch (error) {
    console.error("Error removing team member:", error);
    res.status(500).json({ error: "Failed to remove team member" });
  }
});

export default router;