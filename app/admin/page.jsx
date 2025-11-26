"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  MessageSquare,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  Zap,
  Database,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [timeRange, setTimeRange] = useState(7);
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchAnalytics();
    }
  }, [timeRange, loading]);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      if (!data.user.isAdmin) {
        toast.error("Admin access required");
        router.push("/");
        return;
      }

      await fetchStats();
      await fetchUsers();
      setLoading(false);
    } catch (error) {
      console.error("Admin check error:", error);
      router.push("/login");
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/analytics?days=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Fetch analytics error:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users?limit=5", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          updates: { isActive: !currentStatus },
        }),
      });

      if (response.ok) {
        toast.success("User status updated");
        fetchUsers();
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      console.error("Toggle user error:", error);
      toast.error("Failed to update user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isGuest");
    toast.success("Logged out successfully!");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-white">Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">VaaniAI Analytics & Management</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="rounded-lg bg-slate-800 px-4 py-2 text-white outline-none"
            >
              <option value={1}>Last 24 hours</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-white transition-colors hover:bg-slate-600"
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => router.push("/")}
              className="rounded-lg bg-slate-700 px-4 py-2 text-white transition-colors hover:bg-slate-600"
            >
              Back to Chat
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-500"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            title="Total Users"
            value={stats?.totalUsers ?? 0}
            subtitle={`+${stats?.newUsersToday ?? 0} today`}
            color="blue"
          />
          <StatCard
            icon={<MessageSquare className="h-6 w-6" />}
            title="Total Chats"
            value={stats?.totalChats ?? 0}
            subtitle={`${stats?.todayRequests ?? 0} requests today`}
            color="green"
          />
          <StatCard
            icon={<Activity className="h-6 w-6" />}
            title="API Requests"
            value={stats?.totalRequests ?? 0}
            subtitle={`${stats?.todayRequests ?? 0} today`}
            color="purple"
          />
          <StatCard
            icon={<DollarSign className="h-6 w-6" />}
            title="Total Cost"
            value={`$${(stats?.totalCost ?? 0).toFixed(2)}`}
            subtitle="All time"
            color="yellow"
          />
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Model Usage */}
            <div className="rounded-xl bg-slate-800 p-6">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Model Usage</h2>
              </div>
              <div className="space-y-3">
                {analytics?.modelUsage &&
                  Object.entries(analytics.modelUsage.count || {}).map(
                    ([model, count]) => (
                      <div key={model}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-slate-300">{model}</span>
                          <span className="text-slate-400">
                            {typeof count === "number" ? count : 0} requests
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width:
                                analytics.overview &&
                                analytics.overview.totalRequests
                                  ? `${(count / analytics.overview.totalRequests) * 100}%`
                                  : "0%",
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                <StatCard
                  icon={<DollarSign className="h-6 w-6" />}
                  title="Total Cost"
                  value={
                    typeof stats?.totalCost === "number"
                      ? `$${stats.totalCost.toFixed(2)}`
                      : "$0.00"
                  }
                  subtitle="All time"
                  color="yellow"
                />
              </div>
            </div>

            {/* Emotion Stats */}
            <div className="rounded-xl bg-slate-800 p-6">
              <div className="mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white">User Emotions</h2>
              </div>
              <div className="max-h-64 space-y-3 overflow-y-auto">
                {analytics?.emotionStats &&
                Object.entries(analytics.emotionStats).length > 0 ? (
                  Object.entries(analytics.emotionStats).map(
                    ([emotion, count]) => (
                      <div
                        key={emotion}
                        className="flex items-center justify-between rounded-md bg-slate-700 px-4 py-2 text-sm text-slate-300 shadow-sm"
                      >
                        <span className="font-medium capitalize">
                          {emotion}
                        </span>
                        <span className="rounded-full bg-slate-600 px-3 py-1 font-semibold">
                          {typeof count === "number" ? count : 0}
                        </span>
                      </div>
                    ),
                  )
                ) : (
                  <p className="text-center text-slate-400 italic">
                    No emotion data available.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {analytics && analytics.overview && (
          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            <MetricCard
              icon={<Clock className="h-5 w-5" />}
              title="Avg Response Time"
              value={`${analytics.overview.avgResponseTime}ms`}
              color="green"
            />
            <MetricCard
              icon={<Zap className="h-5 w-5" />}
              title="Total Tokens"
              value={analytics.overview.totalTokens.toLocaleString()}
              color="yellow"
            />
            <MetricCard
              icon={<Database className="h-5 w-5" />}
              title="Total Cost"
              value={`$${analytics.overview.totalCost}`}
              color="red"
            />
          </div>
        )}

        {/* Recent Users */}
        <div className="rounded-xl bg-slate-800 p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Recent Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="pb-3 text-sm font-semibold text-slate-400">
                    Username
                  </th>
                  <th className="pb-3 text-sm font-semibold text-slate-400">
                    Email
                  </th>
                  <th className="pb-3 text-sm font-semibold text-slate-400">
                    Personality
                  </th>
                  <th className="pb-3 text-sm font-semibold text-slate-400">
                    Status
                  </th>
                  <th className="pb-3 text-sm font-semibold text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-3 text-center text-slate-400">
                      No users found
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-slate-700">
                    <td className="py-3 text-white">{user.username}</td>
                    <td className="py-3 text-slate-300">{user.email}</td>
                    <td className="py-3 text-slate-300">
                      {user.personality || "---"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          user.isActive
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() =>
                          toggleUserStatus(user._id, user.isActive)
                        }
                        className="rounded bg-slate-700 px-3 py-1 text-sm text-white transition-colors hover:bg-slate-600"
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color }) {
  const colors = {
    blue: "from-blue-600 to-blue-700",
    green: "from-green-600 to-green-700",
    purple: "from-purple-600 to-purple-700",
    yellow: "from-yellow-600 to-yellow-700",
  };

  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${colors[color]} p-6 text-white shadow-lg`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg bg-white/20 p-3">{icon}</div>
      </div>
      <h3 className="mb-1 text-sm font-medium opacity-90">{title}</h3>
      <p className="mb-1 text-3xl font-bold">{value}</p>
      <p className="text-sm opacity-75">{subtitle}</p>
    </div>
  );
}

function MetricCard({ icon, title, value, color }) {
  const colors = {
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
  };

  return (
    <div className="rounded-xl bg-slate-800 p-6">
      <div className="mb-3 flex items-center gap-2">
        <div className={colors[color]}>{icon}</div>
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
