import React from 'react'
import Image from 'next/image'
const TopCampaigns = () => {
    const topCampaignsData = [
        { id: 1, name: 'Stand-alone global analyzer', raised: 39947, image: '/demo1.png' },
        { id: 2, name: 'Innovative value-added toolset', raised: 36646, image: '/demo2.png' },
        { id: 3, name: 'Upgradable content-based hierarchy', raised: 36068, image: '/demo3.png' },
    ];
    const formatCurrency = (amount) => `£${amount.toLocaleString()}`;
    return (
        <>
            <div className="bg-gray-800 rounded-lg p-6 shadow-md">
                <h2 className="text-lg font-semibold text-gray-400 mb-3">Top Campaigns</h2>
                <ul className="space-y-3">
                    {topCampaignsData.map((campaign) => (
                        <li key={campaign.id} className="flex items-center space-x-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                {campaign.image && (
                                    <Image src={campaign.image} alt={campaign.name} layout="fill" objectFit="cover" />
                                )}   
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-sm font-semibold">{campaign.name}</h3>
                                <p className="text-xs text-teal-400">{formatCurrency(campaign.raised)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}

export default TopCampaigns