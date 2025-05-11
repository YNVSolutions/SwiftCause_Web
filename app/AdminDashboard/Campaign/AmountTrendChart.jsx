"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AmountTrendChart = ({ donations = [], campaignId = null }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const filtered = donations
      .filter((d) => d.paymentStatus === "success")
      .filter((d) => (campaignId ? d.campaignId === campaignId : true));

    const dailyTotals = {};

    filtered.forEach(({ amount, timestamp }) => {
      const date = new Date(timestamp).toISOString().split("T")[0];
      dailyTotals[date] = (dailyTotals[date] || 0) + amount;
    });

    const chartData = Object.entries(dailyTotals)
      .map(([date, total]) => ({
        date: new Date(date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
        amount: total,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setData(chartData);
  }, [donations, campaignId]);

  return (
    <div className="w-full h-96 bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 transition-all duration-300 hover:shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-4 tracking-tight">
        Donation Trend
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ bottom: 40, top: 20, left: 10, right: 10 }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#374151" strokeDasharray="3 3" opacity={0.2} />

          <XAxis
            dataKey="date"
            angle={-35}
            textAnchor="end"
            interval={"preserveStartEnd"}
            height={60}
            style={{
              fontSize: "12px",
              fill: "#9ca3af",
              fontWeight: "500",
            }}
          />

          <YAxis
            tickFormatter={(val) => `£${val}`}
            style={{
              fontSize: "12px",
              fill: "#9ca3af",
              fontWeight: "500",
            }}
          />

          <Tooltip
            formatter={(val) => `£${val.toLocaleString()}`}
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "10px",
              color: "#f9fafb",
              padding: "10px 14px",
              fontWeight: "600",
            }}
            itemStyle={{ color: "#f9fafb" }}
          />

          <Area
            type="monotone"
            dataKey="amount"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#colorAmount)"
            activeDot={{
              r: 5,
              fill: "#34d399",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AmountTrendChart;
