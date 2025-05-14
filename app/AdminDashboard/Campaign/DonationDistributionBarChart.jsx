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

function roundToNiceNumber(num) {
  if (num <= 10) return 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(num)));
  const normalized = num / magnitude;

  if (normalized <= 1) return 1 * magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

const DonationDistributionBarChart = ({
  donations = [],
  campaignId = null,
  className = ""
}) => {
  const data = useMemo(() => {
  const filteredDonations = campaignId
    ? donations.filter((d) => d.campaignId === campaignId)
    : donations;

  if (filteredDonations.length === 0) return [];

  const amounts = filteredDonations.map((d) => d.amount || 0);
  const minAmount = Math.min(...amounts) ;
  const maxAmount = Math.max(...amounts);

  const minBins = 4;
  const maxBins = 7;
  const idealBinCount = Math.min(maxBins, Math.max(minBins, Math.floor(filteredDonations.length / 5)));

  const rawBinWidth = (maxAmount - minAmount) / idealBinCount;
  const niceBinWidth = roundToNiceNumber(rawBinWidth);

  const start = Math.floor(minAmount / niceBinWidth) * niceBinWidth;
  const end = Math.ceil(maxAmount / niceBinWidth) * niceBinWidth;

  const dynamicRanges = [];
  for (let i = start; i < end; i += niceBinWidth) {
    const min = i;
    const max = i + niceBinWidth - 1;
    const label = max + 1 >= end ? `£${min}+` : `£${min} - £${max}`;
    dynamicRanges.push({ min, max, label });
  }

  const rangeData = dynamicRanges.map((range) => {
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
}, [donations, campaignId]);


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

            <Tooltip cursor={{fill: 'oklch(27.8% 0.033 256.848)'}}
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
