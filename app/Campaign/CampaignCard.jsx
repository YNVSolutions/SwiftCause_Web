import React from "react";

export default function CampaignCard({ campaign }) {
  return (
    <div className="p-4 border border-gray-300 rounded-md shadow-sm">
      <h2 className="text-lg font-semibold">{campaign.title}</h2>
      <p className="text-sm text-gray-600 capitalize">Status: {campaign.status}</p>
    </div>
  );
}
