"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import type { DailyActivity, CategoryStat } from "@/types";

interface AdminChartsProps {
  dailyActivity: DailyActivity[];
  categoryStats: CategoryStat[];
}

export function AdminCharts({ dailyActivity, categoryStats }: AdminChartsProps) {
  return (
    <>
      {/* Activity Chart */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">7-Day Activity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={dailyActivity} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="posts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="comments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#e2e8f0",
              }}
            />
            <Area type="monotone" dataKey="posts" stroke="#6366f1" fill="url(#posts)" strokeWidth={2} name="Posts" />
            <Area type="monotone" dataKey="comments" stroke="#8b5cf6" fill="url(#comments)" strokeWidth={2} name="Comments" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Pie Chart */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Posts by Category</h3>
        {categoryStats.filter((c) => c.count > 0).length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-gray-600 text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryStats.filter((c) => c.count > 0)}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
                nameKey="name"
              >
                {categoryStats.filter((c) => c.count > 0).map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#e2e8f0",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", color: "#6b7280" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}
