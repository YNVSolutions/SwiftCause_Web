import React from "react";

export default function CampaignCard({ campaign }) {
  const { title, collectedAmount = 0, goalAmount = 0, imageUrl } = campaign;
  const percentage = Math.min(
    (collectedAmount / goalAmount) * 100,
    100
  ).toFixed(0);

  return (
    <div className="bg-white rounded-2xl px-4 py-3">
      <div className="flex gap-4 items-center">
        <img
          src={
            "https://cdn.create.vista.com/downloads/d162ed88-d803-4856-8e5e-b0e509061370_640.jpeg"
          }
          alt={title}
          className="w-12 h-12 object-cover rounded-md"
        />

        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
        </div>
      </div>
      <div className="py-2">
        {/* Progress bar */}
        <div className="w-full bg-gray-100 h-1 rounded-full mb-1 relative">
          <div
            className="h-1 bg-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {/* Amount display */}
        <div className="flex items-center justify-between">
          <div className="flex">
          <p className="text-md text-gray-800 font-bold">
            £ {collectedAmount.toLocaleString()}
          </p>
          <p className="text-md text-gray-500">
            /{goalAmount.toLocaleString()}
          </p>
          </div>
          <p className="text-md text-gray-800 font-medium">
            {percentage}%
          </p>
        </div>
      </div>
    </div>
  );
}
