import { Shield, CheckCircle2 } from "lucide-react";

interface UserRoleBannerProps {
  user: {
    name: string;
    email: string;
    role: string;
    permissions?: string[];
  };
}

export function UserRoleBanner({ user }: UserRoleBannerProps) {
  if (!user) return null;

  const roleFormatted = user.role.replace(/_/g, " ");

  return (
    <div className="bg-neutral-900 text-neutral-100 border-b border-neutral-800 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
          <Shield className="h-4 w-4" />
          <span>{user.name}</span>
        </div>
        <span className="text-neutral-500">|</span>
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider">
          {roleFormatted}
        </span>
      </div>

      <div className="flex items-center gap-4 text-neutral-400 text-[11px]">
        {user.role === "SUPER_ADMIN" ? (
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Full System Control
          </span>
        ) : (
          <span>
            Active Permissions: <strong className="text-neutral-200">{user.permissions?.length || 0}</strong> modules assigned
          </span>
        )}
      </div>
    </div>
  );
}