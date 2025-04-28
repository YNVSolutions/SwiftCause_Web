import React from "react";
import { isSameMonth, subMonths } from "date-fns";

const TotalDonationsCard = ({ donations, className = "" }) => {
  const currentMonth = new Date();
  const previousMonth = subMonths(currentMonth, 1);

  const currentTotal = donations
    .filter((d) => isSameMonth(new Date(d.timestamp), currentMonth))
    .reduce((sum, d) => sum + d.amount, 0);
  const previousTotal = donations
    .filter((d) => isSameMonth(new Date(d.timestamp), previousMonth))
    .reduce((sum, d) => sum + d.amount, 0);

  const percentageChange = previousTotal
    ? ((currentTotal - previousTotal) / previousTotal) * 100
    : 0;
  const isPositive = percentageChange >= 0;

  return (
    <div
      className={`bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 transition-all duration-300 hover:shadow-2xl ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Donations</h3>
      <p className="text-3xl font-bold text-white">₹{currentTotal.toLocaleString()}</p>
      <p
        className={`text-sm font-medium ${
          isPositive ? "text-emerald-500" : "text-red-500"
        }`}
      >
        {isPositive ? "+" : ""}{percentageChange.toFixed(1)}% vs last month
      </p>
    </div>
  );
};

export default TotalDonationsCard;