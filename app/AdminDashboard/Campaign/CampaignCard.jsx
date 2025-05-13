import React from "react";
import Link from "next/link";

export default function CampaignCard({ campaign }) {
  const { id, title, collectedAmount = 0, goalAmount = 0, imageUrl } = campaign;
  const percentage = Math.min(
    (collectedAmount / goalAmount) * 100,
    100
  ).toFixed(0);

  return (
    <Link href={`/AdminCampaignDashboard?id=${id}`}>
    <div className="bg-gray-900 rounded-2xl px-5 py-4 border border-gray-800 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="flex gap-4 items-center">
        <img
          src={
            "https://cdn.create.vista.com/downloads/d162ed88-d803-4856-8e5e-b0e509061370_640.jpeg"
          }
          alt={title}
          className="w-14 h-14 object-cover rounded-lg border border-gray-700"
        />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
        </div>
      </div>
      <div className="py-3">
        {/* Progress bar */}
        <div className="w-full bg-gray-700 h-1.5 rounded-full mb-2 relative overflow-hidden">
          <div
            className="h-1.5 bg-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {/* Amount display */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <p className="text-md font-semibold text-white">
              £{collectedAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">
              /£{goalAmount.toLocaleString()}
            </p>
          </div>
          <p className="text-md font-semibold text-emerald-400">
            {percentage}%
          </p>
        </div>
      </div>
    </div>
    </Link>
  );
}