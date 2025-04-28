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
import { app } from "../../Auth/firebase";

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
    <div className="w-full h-96 bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 transition-all duration-300 hover:shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Donation Trend</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ bottom: 40, top: 20, left: 10, right: 10 }}>
          <CartesianGrid stroke="#374151" strokeDasharray="3 3" opacity={0.5} />
          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={60}
            style={{
              fontSize: "12px",
              fill: "#9ca3af", // Tailwind's gray-400
              fontWeight: "500",
            }}
          />
          <YAxis
            tickFormatter={(val) => `£${val}`}
            style={{
              fontSize: "12px",
              fill: "#9ca3af", // Tailwind's gray-400
              fontWeight: "500",
            }}
          />
          <Tooltip
            formatter={(val) => `£${val}`}
            contentStyle={{
              backgroundColor: "#1f2937", // Tailwind's gray-800
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontWeight: "500",
              padding: "8px 12px",
            }}
            itemStyle={{ color: "#fff" }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#10b981" // Tailwind's emerald-500
            strokeWidth={3}
            dot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#34d399", stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AmountTrendChart;