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

  const rankColors = ["bg-yellow-500", "bg-gray-400", "bg-amber-600"]; // Gold, silver, bronze

  return (
    <div
      className={`bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 flex flex-col gap-4 ${className}`}
      role="region"
      aria-label="Top Campaigns"
    >
      <h3 className="text-lg font-semibold text-gray-300 mb-2">Top Campaigns</h3>
      {campaignTotals.length === 0 ? (
        <p className="text-gray-400 text-center flex-1 flex items-center justify-center">
          No campaigns available
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {campaignTotals.map((campaign, index) => (
            <div
              key={campaign.id}
              className={`flex items-center gap-4 p-3 bg-gray-800 rounded-lg transition-all duration-300 hover:shadow-2xl animate-fade-in ${
                index === 0 ? "w-full opacity-100" : index === 1 ? " opacity-85" : " opacity-70"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src={
                  campaign.coverImageUrl ||
                  "https://cdn.create.vista.com/downloads/d162ed88-d803-4856-8e5e-b0e509061370_640.jpeg"
                }
                alt={campaign.title}
                className="w-10 h-10 object-cover rounded-lg border border-gray-700"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium text-white rounded-full ${rankColors[index]}`}
                  >
                    #{index + 1}
                  </span>
                  <h4 className="text-md font-bold text-white truncate">{campaign.title}</h4>
                </div>
                <p className="text-xs text-emerald-500 font-medium mt-1">
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