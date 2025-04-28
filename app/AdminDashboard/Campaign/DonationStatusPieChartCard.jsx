import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DonationStatusPieChartCard = ({ donations, className = "" }) => {
  const statusCounts = donations.reduce((acc, d) => {
    acc[d.paymentStatus] = (acc[d.paymentStatus] || 0) + 1;
    return acc;
  }, {});
  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));
  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  return (
    <div
      className={`bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 h-[300px] flex flex-col ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-300 mb-4">Donation Status</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#fff" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonationStatusPieChartCard;