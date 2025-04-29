import React from "react";
import { isToday, subDays } from "date-fns";

const TodaysDonationsCard = ({ donations, className = "" }) => {
  const today = new Date();
  const yesterday = subDays(today, 1);

  const todayCount = donations.filter((d) => isToday(new Date(d.timestamp))).length;
  const yesterdayCount = donations.filter((d) =>
    isToday(subDays(new Date(d.timestamp), 1))
  ).length;

  const percentageChange = yesterdayCount
    ? ((todayCount - yesterdayCount) / yesterdayCount) * 100
    : 0;
  const isPositive = percentageChange >= 0;

  return (
    <div
      className={`bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 transition-all duration-300 hover:shadow-2xl ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-300 mb-2">Today's Donations</h3>
      <p className="p-3 mb-2 text-5xl font-bold text-white">{todayCount}</p>
      <p
        className={`text-sm font-medium ${
          isPositive ? "text-emerald-500" : "text-red-500"
        }`}
      >
        {isPositive ? "+" : ""}{percentageChange.toFixed(1)}% vs yesterday
      </p>
    </div>
  );
};

export default TodaysDonationsCard;