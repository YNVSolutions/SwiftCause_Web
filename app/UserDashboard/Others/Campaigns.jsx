import React from 'react'
import Image from 'next/image';

const Campaigns = ({ data }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-md">
            <div className="flex-col items-center justify-between mb-4">
                <h2 className="text-lg pb-3 font-semibold text-blue-400">Campaigns History</h2>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[493px]">
                {data.map((campaign) => (
                    <div
                        key={campaign.id}
                        className="bg-gray-700 rounded-md p-4 flex items-center space-x-4 gap-4 mb-4"
                    >
                        <div className="relative w-12 h-12 rounded-md overflow-hidden">
                            {/* database image calling url
                            <img
                                src={campaign.coverImageUrl}
                                alt={campaign.title}
                                className="object-cover w-12 h-12"
                            />
                            */}
                            <img
                                src='/demo5.png'
                                alt={campaign.title}
                                className="object-cover w-12 h-12"
                            />
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-sm font-semibold text-gray-200">{campaign.title}</h3>
                            <p className="text-xs text-teal-400">£{campaign.collectedAmount}</p>
                            <div className='flex items-center justify-between mt-2'>
                                <p
                                    className={
                                        `p-1 rounded transition duration-300 text-white ` +
                                        (campaign.status?.toLowerCase() === 'active'
                                            ? 'bg-green-500 hover:bg-green-700'
                                            : campaign.status?.toLowerCase() === 'paused'
                                            ? 'bg-yellow-400 hover:bg-yellow-500 text-black'
                                            : campaign.status?.toLowerCase() === 'upcoming'
                                            ? 'bg-blue-500 hover:bg-blue-700'
                                            : 'bg-red-500')
                                    }
                                >
                                    {campaign.status}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Campaigns