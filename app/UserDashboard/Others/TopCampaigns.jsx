import React from 'react'

const TopCampaigns = ({ data }) => {
    return (
        <>
            <div className="bg-gray-800 rounded-lg p-6 shadow-md">
                <h2 className="text-lg font-semibold text-gray-400 mb-3">Top Campaigns</h2>
                <ul className="space-y-3 overflow-y-auto max-h-[150px]">
                    {data.map((campaign) => (
                        <li key={campaign.id} className="flex items-center space-x-3 ">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                               {/* image calling from firebase storage
                                <img
                                    src={campaign.coverImageUrl}
                                    alt={campaign.title}
                                    className="object-cover w-8 h-8"
                                />*/}
                                <img
                                    src='/demo2.png'
                                    alt={campaign.title}
                                    className="object-cover w-8 h-8"
                                />
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-sm font-semibold">{campaign.title}</h3>
                                <p className="text-xs text-teal-400">£{campaign.collectedAmount}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}

export default TopCampaigns