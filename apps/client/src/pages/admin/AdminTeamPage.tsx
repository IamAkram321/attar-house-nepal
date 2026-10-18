import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UserPlus, X, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

type RoleType = 
  | "SUPER_ADMIN" 
  | "ADMIN" 
  | "PRODUCTION_MANAGER" 
  | "CAD_DESIGNER" 
  | "FULFILLMENT_LEAD" 
  | "SUPPORT_AGENT" 
  | "CUSTOMER";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: RoleType;
  permissions: string[];
  metrics: {
    productsCreated: number;
    totalTimeSeconds: number;
  };
}

const AVAILABLE_PERMISSIONS = [
  { key: "PRINTER_MANAGE", label: "Manage Atelier" },
  { key: "QUEUE_OVERRIDE", label: "Override Fulfillment Queue" },
  { key: "CUSTOM_REQUESTS_PROCESS", label: "Process Special Requests" },
  { key: "PRODUCTS_CREATE", label: "Create Products" },
  { key: "PRODUCTS_EDIT", label: "Edit Products" },
  { key: "PRODUCTS_DELETE", label: "Delete Products" },
  { key: "ORDERS_FULFILL", label: "Fulfill & Ship Orders" },
  { key: "ORDERS_MANAGE", label: "Manage Orders" },
  { key: "ANALYTICS_VIEW", label: "View Analytics" },
  { key: "REVIEWS_MANAGE", label: "Manage Reviews" },
];

const DEFAULT_ROLE_PERMISSIONS: Record<RoleType, string[]> = {
  SUPER_ADMIN: [],
  ADMIN: AVAILABLE_PERMISSIONS.map(p => p.key),
  PRODUCTION_MANAGER: ["PRINTER_MANAGE", "QUEUE_OVERRIDE", "ORDERS_MANAGE"],
  CAD_DESIGNER: ["CUSTOM_REQUESTS_PROCESS", "PRODUCTS_CREATE", "PRODUCTS_EDIT"],
  FULFILLMENT_LEAD: ["ORDERS_FULFILL", "ORDERS_MANAGE"],
  SUPPORT_AGENT: ["REVIEWS_MANAGE", "ORDERS_MANAGE"],
  CUSTOMER: [],
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "PRODUCTION_MANAGER" as RoleType,
    permissions: DEFAULT_ROLE_PERMISSIONS.PRODUCTION_MANAGER,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const apiUrl = import.meta.env.VITE_API_URL || "";

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/admin/team`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch team members");
      const data = await res.json();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      toast({ title: "Error", description: err.message || "Failed to fetch team members", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleRoleSelectChange = (newRole: RoleType) => {
    setFormData({
      ...formData,
      role: newRole,
      permissions: DEFAULT_ROLE_PERMISSIONS[newRole] || [],
    });
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/team/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to onboard team member");
      }

      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        role: "PRODUCTION_MANAGER",
        permissions: DEFAULT_ROLE_PERMISSIONS.PRODUCTION_MANAGER,
      });
      fetchTeam();
      toast({ title: "Team member added", description: `${formData.name} has been added to the team.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to add team member", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFormPermission = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const togglePermission = async (userId: number, currentPermissions: string[], permissionKey: string) => {
    const updated = currentPermissions.includes(permissionKey)
      ? currentPermissions.filter((p) => p !== permissionKey)
      : [...currentPermissions, permissionKey];

    try {
      const res = await fetch(`${apiUrl}/api/admin/team/${userId}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ permissions: updated }),
      });

      if (!res.ok) throw new Error("Failed to update permissions");

      setMembers((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, permissions: updated } : m))
      );
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update permissions", variant: "destructive" });
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/team/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Failed to update user role");

      fetchTeam();
      toast({ title: "Role updated", description: `User role changed to ${newRole}.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update role", variant: "destructive" });
    }
  };

  const handleDeleteMember = async (userId: number, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the team?`)) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/admin/team/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to remove team member");
      }

      fetchTeam();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Error removing team member", variant: "destructive" });
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const getRoleBadgeStyle = (role: RoleType) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case "PRODUCTION_MANAGER":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "CAD_DESIGNER":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
      case "FULFILLMENT_LEAD":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "SUPPORT_AGENT":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      default:
        return "bg-neutral-50 text-neutral-700 border-neutral-200/80";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-serif text-neutral-900">Team & Access Control</h1>
            <p className="text-sm text-neutral-500 font-mono">Manage print farm operators, CAD designers, and administrative privileges.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-full transition-colors font-medium shadow-xs cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Add Team Member
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-amber-500 font-mono text-xs uppercase tracking-widest p-6">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Loading team data...
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-mono">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200/80">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">User</th>
                    <th className="px-6 py-3.5 text-left text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">Role</th>
                    <th className="px-6 py-3.5 text-left text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">Productivity</th>
                    <th className="px-6 py-3.5 text-left text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">Assigned Permissions</th>
                    <th className="px-6 py-3.5 text-right text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200/80 text-sm">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-neutral-900">{member.name}</div>
                        <div className="text-xs text-neutral-500 font-mono">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider rounded-full border ${getRoleBadgeStyle(member.role)}`}>
                          {member.role.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-neutral-900 font-mono text-xs">{member.metrics?.productsCreated || 0} Uploads</div>
                        <div className="text-xs text-neutral-500 font-mono">
                          Time: {formatTime(member.metrics?.totalTimeSeconds || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {member.role === "SUPER_ADMIN" ? (
                          <span className="text-xs text-neutral-400 italic font-mono">
                            Full Access (Bypasses checks)
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {AVAILABLE_PERMISSIONS.map((perm) => {
                              const active = member.permissions?.includes(perm.key);
                              return (
                                <button
                                  key={perm.key}
                                  onClick={() => togglePermission(member.id, member.permissions || [], perm.key)}
                                  className={`px-2.5 py-1 text-[11px] font-mono rounded-full border transition-all cursor-pointer ${
                                    active
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-medium shadow-xs"
                                      : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900"
                                  }`}
                                >
                                  {perm.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {member.role !== "SUPER_ADMIN" ? (
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              className="text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                            >
                              <option value="PRODUCTION_MANAGER">Atelier Manager</option>
                              <option value="CAD_DESIGNER">Fragrance Specialist</option>
                              <option value="FULFILLMENT_LEAD">Fulfillment Lead</option>
                              <option value="SUPPORT_AGENT">Support Agent</option>
                              <option value="ADMIN">Admin</option>
                              <option value="CUSTOMER">Demote to Customer</option>
                            </select>

                            <button
                              onClick={() => handleDeleteMember(member.id, member.name)}
                              title="Remove from Team"
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-neutral-400 italic">Owner</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Team Member Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xl w-full max-w-md p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-serif font-medium text-neutral-900">Onboard Team Member</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="teammate@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1">
                    Maison Operational Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleSelectChange(e.target.value as RoleType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-sans cursor-pointer"
                  >
                    <option value="PRODUCTION_MANAGER">Atelier Manager</option>
                    <option value="CAD_DESIGNER">Fragrance Specialist</option>
                    <option value="FULFILLMENT_LEAD">Fulfillment & Shipping Lead</option>
                    <option value="SUPPORT_AGENT">Customer Support Agent</option>
                    <option value="ADMIN">Admin (General)</option>
                    <option value="SUPER_ADMIN">Super Admin (Full Control)</option>
                  </select>
                </div>

                {formData.role !== "SUPER_ADMIN" && (
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-2">
                      Permissions Preset
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_PERMISSIONS.map((perm) => {
                        const active = formData.permissions.includes(perm.key);
                        return (
                          <button
                            type="button"
                            key={perm.key}
                            onClick={() => toggleFormPermission(perm.key)}
                            className={`px-2.5 py-1 text-[11px] font-mono rounded-full border transition-all cursor-pointer ${
                              active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-medium"
                                : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                            }`}
                          >
                            {perm.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-full border border-neutral-200 text-xs font-mono uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-full bg-neutral-900 hover:bg-amber-600 text-white text-xs font-mono uppercase tracking-wider font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Onboarding..." : "Confirm Onboarding"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}