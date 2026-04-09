"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: string;
  email: string;
  isSubscribed: boolean;
  subscriptionEnds: string | null;
  _count: { todos: number };
}

interface AdminData {
  users: User[];
  totalUsers: number;
  totalPro: number;
  totalTodos: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/api/admin/users");
        setData(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <p className="p-6 text-sm text-gray-400">Loading...</p>;
  if (!data) return <p className="p-6 text-sm text-red-400">Failed to load.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-medium mb-6">Admin dashboard</h1>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Total users", value: data.totalUsers },
          { label: "Pro users", value: data.totalPro },
          { label: "Total todos", value: data.totalTodos },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-medium">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Status
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Todos
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Subscription ends
              </th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => (
              <tr key={user.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 text-gray-700">{user.email}</td>
                <td className="px-4 py-3">
                  {user.isSubscribed ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                      Pro
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                      Free
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">{user._count.todos}</td>
                <td className="px-4 py-3 text-gray-400">
                  {user.subscriptionEnds
                    ? new Date(user.subscriptionEnds).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
