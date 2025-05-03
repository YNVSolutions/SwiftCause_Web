import React, { useMemo } from "react";

const TopCampaignsCard = ({ campaigns = [], donations = [], className = "", filter = null }) => {
  // Calculate total donations per campaign
  const campaignTotals = useMemo(() => {
    const filteredCampaigns = filter ? campaigns.filter(filter) : campaigns;
    return filteredCampaigns
      .map((campaign) => ({
        ...campaign,
        totalDonated: campaign.collectedAmount || 0,
      }))
      .sort((a, b) => b.totalDonated - a.totalDonated)
      .slice(0, 3);
  }, [campaigns, filter]);

  return (
    <div
      className={`bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 flex flex-col gap-4 ${className}`}
      role="region"
      aria-label="Top Campaigns"
    >
      <h3 className="text-lg font-semibold text-gray-200 mb-2">Top Campaigns</h3>
      {campaignTotals.length === 0 ? (
        <p className="text-gray-400 text-center flex-1 flex items-center justify-center">
          No campaigns available
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {campaignTotals.map((campaign, index) => (
            <div
              key={campaign.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg animate-fade-in ${
                index === 0 ? "bg-gray-800/70" : "bg-gray-800/50"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-semibold">
                {index + 1}
              </div>
              <img
                src={
                  "https://cdn.create.vista.com/downloads/d162ed88-d803-4856-8e5e-b0e509061370_640.jpeg"
                }
                alt={campaign.title}
                className="w-10 h-10 object-cover rounded-lg border border-gray-700"
              />
              <div className="flex-1">
                <h4 className="text-md font-semibold text-white truncate">{campaign.title}</h4>
                <p className="text-sm text-emerald-400 font-medium mt-0.5">
                  £{campaign.totalDonated.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopCampaignsCard;