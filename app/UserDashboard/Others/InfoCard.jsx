import React from 'react'

const InfoCard = () => {
    const formatCurrency = (amount) => `£${amount.toLocaleString()}`;
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 shadow-md">
                    <h2 className="text-lg font-semibold text-gray-400 mb-2">Total Donations</h2>
                    <h1 className="text-3xl md:text-4xl font-bold mb-1">{formatCurrency(1438)}</h1>
                    <p className="text-sm text-green-400">+0.0% vs last month</p>
                    <div className="mt-4 flex space-x-2">
                        <button className="bg-teal-500 text-white rounded-md px-3 py-1 text-xs font-semibold hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1">This Month</button>
                        <button className="bg-gray-700 text-gray-300 rounded-md px-3 py-1 text-xs font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1">This Year</button>
                        <button className="bg-gray-700 text-gray-300 rounded-md px-3 py-1 text-xs font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1">All Time</button>
                    </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 shadow-md">
                    <h2 className="text-lg font-semibold text-gray-400 mb-2">Today's Donations</h2>
                    <h1 className="text-3xl md:text-4xl font-bold mb-1">{formatCurrency(1)}</h1>
                    <p className="text-sm text-green-400">+0.0% vs yesterday</p>
                </div>
            </div>
        </>
    )
}

export default InfoCard