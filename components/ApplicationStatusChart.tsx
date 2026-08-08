"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ApplicationStatusChartProps = {
  pending: number;
  accepted: number;
  rejected: number;
};

export default function ApplicationStatusChart({
  pending,
  accepted,
  rejected,
}: ApplicationStatusChartProps) {
  const data = [
    { status: "Pending", count: pending },
    { status: "Accepted", count: accepted },
    { status: "Rejected", count: rejected },
  ];

  return (
    <div style={chartWrapper}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <XAxis
            dataKey="status"
            stroke="#667085"
          />

          <YAxis
            stroke="#667085"
            allowDecimals={false}
          />

          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e4e7ec",
              borderRadius: "10px",
              color: "#101828",
            }}
          />

          <Bar
            dataKey="count"
            fill="#3157d5"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const chartWrapper = {
  width: "100%",
  height: "280px",
};
