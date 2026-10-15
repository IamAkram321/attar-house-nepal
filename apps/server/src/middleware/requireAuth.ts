import { Request, Response, NextFunction } from "express";

// Ensures request is authenticated via active session
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

// Restricts route access to Admin and Super Admin users
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const role = req.session?.userRole;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    res.status(403).json({ error: "Access denied. Admin privileges required." });
    return;
  }
  next();
}

// Restricts route access strictly to Super Admin users
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (req.session?.userRole !== "SUPER_ADMIN") {
    res.status(403).json({ error: "Access denied. Super Admin privileges required." });
    return;
  }
  next();
}

// Restricts route access based on explicit permission (SUPER_ADMIN bypasses)
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session?.userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const role = req.session?.userRole;
    const permissions: string[] = (req.session as any)?.userPermissions || [];

    // Super Admins automatically bypass permission checks
    if (role === "SUPER_ADMIN") {
      next();
      return;
    }

    // Standard Admins must have the explicit permission assigned
    if (role === "ADMIN" && permissions.includes(permission)) {
      next();
      return;
    }

    res.status(403).json({ 
      error: `Access denied. Missing required permission: ${permission}` 
    });
  };
}