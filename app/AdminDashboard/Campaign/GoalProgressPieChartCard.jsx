import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const GoalProgressPieChartCard = ({ campaigns = [], donations = [], campaign, className = "" }) => {
  // Handle single campaign or all campaigns
  let donatedAmount = 0;
  let expectedAmount = 0;

  if (campaign) {
    // Single campaign mode
    donatedAmount = campaign.collectedAmount || 0;
    expectedAmount = campaign.goalAmount || 0;
  } else {
    // All campaigns mode
    donatedAmount = campaigns.reduce((sum, c) => sum + (c.collectedAmount || 0), 0);
    expectedAmount = campaigns.reduce((sum, c) => sum + (c.goalAmount || 0), 0);
  }

  // Calculate remaining amount (ensure non-negative)
  const remainingAmount = Math.max(0, expectedAmount - donatedAmount);

  // Pie chart data
  const data = [
    { name: "Donated", value: donatedAmount },
    { name: "Remaining", value: remainingAmount },
  ].filter((item) => item.value > 0); // Remove zero-value slices

  const COLORS = ["#10b981", "#6b7280"];

  return (
    <div
      className={`bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 h-[300px] flex flex-col ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-300 mb-4">
        {campaign ? "Campaign Progress" : "Total Goal Progress"}
      </h3>
      {data.length === 0 || expectedAmount === 0 ? (
        <p className="text-gray-400 text-center flex-1 flex items-center justify-center">
          No progress data available
        </p>
      ) : (
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
              formatter={(value) => `₹${value.toLocaleString()}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GoalProgressPieChartCard;