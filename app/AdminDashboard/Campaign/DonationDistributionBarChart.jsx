"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
} from "recharts";

const DonationDistributionBarChart = ({
  donations = [],
  campaignId = null,
  className = "",
  ranges = [
    { min: 0, max: 9, label: "Below £10" },
    { min: 10, max: 49, label: "£10 - £50" },
    { min: 50, max: 99, label: "£50 - £100" },
    { min: 100, max: 499, label: "£100 - £500" },
    { min: 500, max: Infinity, label: "£500+" },
  ],
}) => {
  const data = useMemo(() => {
    const filteredDonations = campaignId
      ? donations.filter((d) => d.campaignId === campaignId)
      : donations;

    const rangeData = ranges.map((range) => {
      const donationsInRange = filteredDonations.filter(
        (d) => d.amount >= range.min && d.amount <= range.max
      );
      return {
        name: range.label,
        count: donationsInRange.length,
        total: donationsInRange.reduce((sum, d) => sum + (d.amount || 0), 0),
      };
    });

    return rangeData.filter((d) => d.count > 0);
  }, [donations, campaignId, ranges]);

  return (
    <div
      className={`bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 h-[340px] flex flex-col ${className}`}
      role="region"
      aria-label="Donation Amount Distribution"
    >
      <h3 className="text-lg font-bold text-white mb-4 tracking-tight">
        Donation Distribution
      </h3>

      {data.length === 0 ? (
        <p className="text-gray-400 text-center flex-1 flex items-center justify-center">
          No donation data available
        </p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />

            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              style={{ fontSize: "12px", fontWeight: "500" }}
            />

            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: "12px", fontWeight: "500" }}
              tickFormatter={(val) => `${val}`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                padding: "12px 16px",
                color: "#ffffff",
                fontSize: "14px",
                
              }}
              formatter={(value, name) => {
                if (name === "count") return [`${value} donations`, "Donations"];
                if (name === "total") return [`£${value.toLocaleString()}`, "Total Collected"];
                return value;
              }}
            />

            <Bar
              dataKey="count"
              fill="url(#barGradient)"
              radius={[8, 8, 0, 0]}
              barSize={40}
              
              
            >
              <LabelList
                dataKey="total"
                position="top"
                formatter={(val) => `£${(val / 1000).toFixed(1)}k`}
                style={{
                  fill: "#10b981",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DonationDistributionBarChart;
