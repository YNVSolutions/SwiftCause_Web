import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const DonationDistributionBarChart = ({
  donations = [],
  campaignId = null,
  className = "",
  ranges = [
    { min: 0, max: 1000, label: "₹0-1K" },
    { min: 1001, max: 5000, label: "₹1K-5K" },
    { min: 5001, max: 10000, label: "₹5K-10K" },
    { min: 10001, max: Infinity, label: "₹10K+" },
  ],
}) => {
  // Calculate donation counts and totals per range
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

    return rangeData.filter((d) => d.count > 0); // Remove empty ranges
  }, [donations, campaignId, ranges]);

  return (
    <div
      className={`bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 h-[300px] flex flex-col ${className}`}
      role="region"
      aria-label="Donation Amount Distribution"
    >
      <h3 className="text-lg font-semibold text-gray-300 mb-4">
        Donation Amount Distribution
      </h3>
      {data.length === 0 ? (
        <p className="text-gray-400 text-center flex-1 flex items-center justify-center">
          No donation data available
        </p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#fff" }}
              formatter={(value, name, props) => [
                name === "total" ? `₹${value.toLocaleString()}` : value,
                name === "total" ? "Total Amount" : "Donation Count",
              ]}
            />
            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DonationDistributionBarChart;