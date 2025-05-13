import React, { useState } from "react";
import { isSameMonth, isSameYear, subMonths } from "date-fns";

const TotalDonationsCard = ({ donations, campaignId = null, className = "" }) => {
  const [filter, setFilter] = useState("month"); // Default filter: month
  const currentMonth = new Date();
  const previousMonth = subMonths(currentMonth, 1);

  // Filter donations by campaignId and paymentStatus if campaignId is provided
  let filteredDonations = donations;
  if (campaignId) {
    filteredDonations = donations.filter(
      (d) => d.campaignId === campaignId && d.paymentStatus === "success"
    );
    console.log(campaignId);
  }

  // Calculate totals based on selected filter
  let currentTotal = 0;
  let previousTotal = 0;
  let percentageChange = 0;
  let isPositive = true;

  if (filter === "month") {
    currentTotal = filteredDonations
      .filter((d) => isSameMonth(new Date(d.timestamp), currentMonth))
      .reduce((sum, d) => sum + d.amount, 0);
    previousTotal = filteredDonations
      .filter((d) => isSameMonth(new Date(d.timestamp), previousMonth))
      .reduce((sum, d) => sum + d.samount, 0);
    percentageChange = previousTotal
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;
    isPositive = percentageChange >= 0;
  } else if (filter === "year") {
    currentTotal = filteredDonations
      .filter((d) => isSameYear(new Date(d.timestamp), currentMonth))
      .reduce((sum, d) => sum + d.amount, 0);
    previousTotal = filteredDonations
      .filter((d) => isSameYear(new Date(d.timestamp), subMonths(currentMonth, 12)))
      .reduce((sum, d) => sum + d.amount, 0);
    percentageChange = previousTotal
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;
    isPositive = percentageChange >= 0;
  } else if (filter === "all") {
    currentTotal = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
    percentageChange = 0; // No percentage change for all time
    isPositive = true;
  }

  return (
    <div
      className={`bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 transition-all duration-300 hover:shadow-2xl ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-300 mb-4">Total Donations</h3>
      <div className="flex justify-between">
        <div>
          <p className="p-3 text-5xl font-bold text-white mb-2">
        £{currentTotal.toLocaleString()}
      </p>
      {filter !== "all" && (
        <p
          className={`text-sm font-medium ${
            isPositive ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {isPositive ? "+" : ""}
          {percentageChange.toFixed(1)}% vs last {filter === "month" ? "month" : "year"}
        </p>
      )}
      </div>
      {/* <div className="gap-2 mb-6"> */}
        <div className="flex flex-col p-2 gap-1">
          <button
            onClick={() => setFilter("month")}
            className={`px-4 py-2 rounded-full capitalize text-sm font-medium transition-all duration-300 ease-in-out ${
              filter === "month"
                ? "bg-emerald-500 text-white shadow-md"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setFilter("year")}
            className={`px-4 py-2 rounded-full capitalize text-sm font-medium transition-all duration-300 ease-in-out ${
              filter === "year"
                ? "bg-emerald-500 text-white shadow-md"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            This Year
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full capitalize text-sm font-medium transition-all duration-300 ease-in-out ${
              filter === "all"
                ? "bg-emerald-500 text-white shadow-md"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            All Time
          </button>
        {/* </div> */}
      </div>
        </div>

        
      
      
      
    </div>
  );
};

export default TotalDonationsCard;