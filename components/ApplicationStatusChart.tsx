"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from "./ApplicationStatusChart.module.css";

export default function ApplicationStatusChart({
  pending,
  accepted,
  rejected,
}: {
  pending: number;
  accepted: number;
  rejected: number;
}) {
  const data = [
    { status: "Pending", count: pending },
    { status: "Accepted", count: accepted },
    { status: "Rejected", count: rejected },
  ];

  return (
    <div className={styles.wrapper} role="img" aria-label={`Application status: ${pending} pending, ${accepted} accepted, ${rejected} rejected`}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <XAxis dataKey="status" stroke="#667085" fontSize={12} tickLine={false} axisLine={{ stroke: "#e4e7ec" }} />
          <YAxis stroke="#667085" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "#f2f4f7" }} contentStyle={{ background: "#ffffff", border: "1px solid #e4e7ec", borderRadius: "10px", boxShadow: "0 8px 20px rgba(16,24,40,.08)", color: "#101828", fontSize: "12px" }} />
          <Bar dataKey="count" fill="#3157d5" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
