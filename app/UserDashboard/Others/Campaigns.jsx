import React from 'react'
import Image from 'next/image';
const Campaigns = () => {
    const campaignsData = [
        { id: 1, name: 'Immersive methodical capacity', raised: 5288, goal: 22698, image: '/demo4.png' },
        { id: 2, name: 'Sustainable high-level ability', raised: 2069, goal: 26734, image: '/demo1.png' },
        { id: 3, name: 'Innovative value-added toolset', raised: 36646, goal: 24681, image: '/demo2.png' },
        { id: 4, name: 'Innovative value-added toolset', raised: 36646, goal: 24681, image: '/demo3.png' }
    ];

    const formatCurrency = (amount) => `£${amount.toLocaleString()}`;
    const calculatePercentage = (raised, goal) => goal > 0 ? Math.round((raised / goal) * 100) : 0;
    return (
        <>
            <div className="bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex-col items-center justify-between mb-4">
                    <h2 className="text-lg pb-3 font-semibold text-gray-400">Campaigns</h2>
                    <div className="flex space-x-2">
                        <button className="bg-teal-500 text-white rounded-md px-3 py-1 text-xs font-semibold hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1">All</button>
                        <button className="bg-gray-700 text-gray-300 rounded-md px-3 py-1 text-xs font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1">Active</button>
                        <button className="bg-gray-700 text-gray-300 rounded-md px-3 py-1 text-xs font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1">Upcoming</button>
                        <button className="bg-gray-700 text-gray-300 rounded-md px-3 py-1 text-xs font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1">Completed</button>
                    </div>
                </div>
                <div className="space-y-4">
                    {campaignsData.map((campaign) => (
                        <div key={campaign.id} className="bg-gray-700 rounded-md p-4 flex items-center space-x-4">
                            <div className="relative w-12 h-12 rounded-md overflow-hidden">
                                {campaign.image && (
                                    <Image src={campaign.image} alt={campaign.name} layout="fill" objectFit="cover" />
                                )}
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-sm font-semibold">{campaign.name}</h3>
                                <p className="text-xs text-gray-400">{formatCurrency(campaign.raised)} / {formatCurrency(campaign.goal)}</p>
                                <div className="bg-gray-600 rounded-full h-2 mt-1 overflow-hidden">
                                    <div
                                        className="bg-teal-500 h-full rounded-full"
                                        style={{ width: `${calculatePercentage(campaign.raised, campaign.goal)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-teal-400">{calculatePercentage(campaign.raised, campaign.goal)}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Campaigns