"use client";
import React from 'react';
import { Filter, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Components/NavBar';

const campaignsData = [
    {
        id: 1,
        title: "Support Education for All",
        description: "Help underprivileged children access quality education and build a brighter future.",
        imageUrl: "/demo1.png", 
        target: 12000,
        amountRaised: 5000, 
        org: "EduFund"
    },
    {
        id: 2,
        title: "Medical Aid for Needy",
        description: "Join hands to fund urgent medical surgeries and treatments for those in need.",
        imageUrl: "/demo2.png",
        target: 34000,
        amountRaised: 20000,
        org: "HealthPlus"
    },
    {
        id: 3,
        title: "Empower Women Entrepreneurs",
        description: "Support women-led small businesses to thrive and uplift communities.",
        imageUrl: "/demo3.png",
        target: 43000,
        amountRaised: 10000,
        org: "WEmpower"
    },
    {
        id: 4,
        title: "Disaster Relief Support",
        description: "Help families rebuild their lives after natural disasters by contributing today.",
        imageUrl: "/demo4.png",
        target: 56000,
        amountRaised: 40000,
        org: "ReliefAid"
    },
    {
        id: 5,
        title: "Clean Energy Access",
        description: "Support sustainable energy solutions like solar and wind power.",
        imageUrl: "/demo5.png",
        target: 45000,
        amountRaised: 15000,
        org: "GreenFuture"
    },
    {
        id: 6,
        title: "Arts & Culture Preservation",
        description: "Help protect and promote traditional arts, culture, and heritage.",
        imageUrl: "/demo6.png",
        target: 30000,
        amountRaised: 25000,
        org: "CulturePreserve"
    },
    {
        id: 7,
        title: "Shelter for Homeless",
        description: "Provide safe and secure housing for homeless individuals and families.",
        imageUrl: "/demo7.png",
        target: 50000,
        amountRaised: 5000,
        org: "HomeSafe"
    },
    {
        id: 8,
        title: "Clean Water for All",
        description: "Bring clean and safe drinking water to communities.",
        imageUrl: "/demo8.png",
        target: 60000,
        amountRaised: 30000,
        org: "WaterAid"
    }
];

const organizations = Array.from(new Set(campaignsData.map(c => c.org)));

const CampaignsPage = () => (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col">
        <div className="fixed top-0 left-0 w-full z-50">
            <Navbar />
        </div>
        <div className="flex flex-1 flex-col md:flex-row pt-16">
            <aside
                className={`
                    md:fixed md:top-16 md:left-0
                    w-full md:w-64 bg-gray-900 p-6 flex flex-col items-center z-40
                    border-b border-gray-800 md:border-b-0 md:border-r
                    md:h-[calc(100vh-4rem)]
                    md:overflow-y-auto
                `}
                style={{ maxWidth: "100vw" }}
            >   
                <h2 className="text-2xl font-bold mb-1 text-indigo-400 text-center">Heart Reach</h2>
                <p className="text-gray-400 text-sm mb-8 text-center">Foundation Fundraiser</p>
                <a href='/AdminDashboard' className="w-full">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg w-full mb-4">
                        Profile
                    </button>
                </a>
                <div className="mt-2 font-medium text-center">
                    <p>
                        HeartReach Foundation empowers communities through healthcare, education, disaster relief, and women’s initiatives.
                        We believe compassion creates change and work together to build a brighter, more equitable future for all.
                    </p>
                </div>
                <div className="mt-6 w-full">
                    <a href='/CreateCampaign'>
                        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg w-full">
                            Create Campaign
                        </button>
                    </a>
                </div>
                <div className="hidden md:block w-full">
                    <h2 className="text-2xl font-bold mt-12 mb-6">Organizations</h2>
                    {organizations.map(org => (
                        <div
                            key={org}
                            className="mb-3 text-gray-400 hover:text-white cursor-pointer transition-colors"
                        >
                            {org}
                        </div>
                    ))}
                </div>
            </aside>
            
            <main className="flex-1 overflow-y-auto p-6 md:p-8 pt-8 md:pt-10 md:ml-64">
                <h1 className="text-4xl font-bold text-blue-500 mb-10 text-center">
                    Explore Campaigns
                </h1>
                
                <div className="flex items-center justify-center mb-8 w-full">
                    <div className="relative flex-1 max-w-xl">
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            className="w-full bg-gray-800 border border-gray-700 text-gray-100 py-2 pl-10 pr-4 rounded-lg shadow-sm focus:ring focus:ring-indigo-200 focus:border-indigo-500 sm:text-sm"
                            disabled
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="8" cy="8" r="6" />
                                <path d="M16 16L12.5 12.5" />
                            </svg>
                        </span>
                    </div>
                    <button
                        className="ml-4 bg-gray-800 border border-gray-700 text-gray-100 py-2 px-4 rounded-lg shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center"
                    >
                        <Filter className="mr-2" />
                        Filter
                    </button>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-8">
                    <AnimatePresence>
                        {campaignsData.map((campaign) => (
                            <motion.div
                                key={campaign.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-gray-800 text-black rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 w-full sm:w-80 md:w-72 lg:w-80"
                            >
                                <div className="relative w-full h-48">
                                    <img
                                        src={campaign.imageUrl}
                                        alt={campaign.title}
                                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                    />
                                </div>
                                <div className="p-6 flex flex-col justify-between h-[calc(100%-12rem)]">
                                    <div>
                                        <h2 className="text-lg font-semibold text-indigo-600 mb-2">{campaign.title}</h2>
                                        <p className="text-gray-400 text-sm mb-4">{campaign.description}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-lg text-gray-300">Raised: ${campaign.amountRaised}</p>
                                            <p className="text-sm text-gray-500">Goal: ${campaign.target}</p>
                                        </div>
                                        <button
                                            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                        >
                                            <Heart className="mr-2" /> Donate
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    </div>
);

export default CampaignsPage;
