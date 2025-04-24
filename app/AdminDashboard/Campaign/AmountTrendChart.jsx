"use client";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { app } from "../../Components/Auth/firebase";

const db = getFirestore(app);

const AmountTrendChart = ({ campaignId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchDonations = async () => {
      const q = query(
        collection(db, "donations"),
        where("campaignId", "==", campaignId),
        where("paymentStatus", "==", "success")
      );

      const snapshot = await getDocs(q);
      const dailyTotals = {};

      snapshot.forEach((doc) => {
        const { amount, timestamp } = doc.data();
        const date = new Date(timestamp).toISOString().split("T")[0]; // YYYY-MM-DD

        if (!dailyTotals[date]) {
          dailyTotals[date] = 0;
        }
        dailyTotals[date] += amount;
      });

      // Convert to sorted array for charting
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
    };

    fetchDonations();
  }, [campaignId]);

  return (
    <div className="w-full h-96 bg-white rounded-xl p-4 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Donation Trend</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ bottom: 30, top: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={60}
            style={{
              fontSize: "12px",
              fill: "#6b7280", // Tailwind's gray-500
              fontWeight: "bold",
            }}
          />
          <YAxis tickFormatter={(val) => `£${val}`} style={{
    fontSize: "14px",
    fill: "#6b7280", // Tailwind's gray-500
    fontWeight: "bold",
  }} />
          <Tooltip formatter={(val) => `£${val}`} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AmountTrendChart;
