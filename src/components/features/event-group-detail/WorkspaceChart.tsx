"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/shared/CustomCards";

interface WorkspaceChartProps {
  chartData: { name: string; Registrasi: number; Kehadiran: number }[];
}

export function WorkspaceChart({ chartData }: WorkspaceChartProps) {
  return (
    <ContentCard>
      <ContentCardHeader title="Statistik per Event" />
      <ContentCardBody className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "#f3f4f6" }}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Legend />
              <Bar dataKey="Registrasi" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Kehadiran" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Belum ada data event
          </div>
        )}
      </ContentCardBody>
    </ContentCard>
  );
}
