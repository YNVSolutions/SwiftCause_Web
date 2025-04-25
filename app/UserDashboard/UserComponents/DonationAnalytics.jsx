"use client";
import React from 'react'
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Doughnut } from 'react-chartjs-2'
import DonationData from '../UserComponents/Data/DonationData.json'
const DonationAnalytics = () => {
    return (
        <>
            <div className='flex justify-between gap-3'>
                <div className='w-1/2'>
                    <h2 className="text-center text-2xl font-bold mb-4">Donation Distribution</h2>
                    <Bar
                        data={{
                            labels: DonationData.map((data) => data.Orgination),
                            datasets: [
                                {
                                    label: "Donation Amount",
                                    data: DonationData.map((data) => data.Value),
                                    borderWidth: 1,
                                    backgroundColor: [
                                        "rgba(66, 165, 245, 1)",
                                        "rgba(102, 187, 106, 1)",
                                        "rgba(92, 107, 192, 1)"
                                    ]
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Donation Graph',
                                },
                            },
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Organizations',
                                    },
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Donation Value (in USD)',
                                    },
                                    beginAtZero: true,
                                },
                            },
                        }}
                    />
                </div>
                <div className='w-1/2 text-white mt-8'>
                    <h1 className='text-3xl font-bold text-center'>The Donation Analytics</h1>
                    <p className='font-medium mt-5 text-gray-300'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo incidunt fugiat laboriosam iusto amet. Repellendus perspiciatis ab cupiditate ducimus quos quis consequatur exercitationem architecto!</p>
                    <div className='flex justify-center items-center gap-5'>
                        <button className='bg-green-600 text-sm px-3 py-2 rounded hover:bg-green-800'>Monthly</button><button className='bg-blue-600 text-sm px-3 py-2 rounded hover:bg-blue-800'>Yearly
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DonationAnalytics