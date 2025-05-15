"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Payment from "../Payment/page";
import Navbar from "../Components/NavBar";

const campaigns = [
    {
        id: 1,
        title: "Support Education for All",
        description: "Help underprivileged children access quality education and build a brighter future.",
        imageUrl: "/demo1.png",
        target: 12000
    },
    {
        id: 2,
        title: "Medical Aid for Needy",
        description: "Join hands to fund urgent medical surgeries and treatments for those in need.",
        imageUrl: "/demo2.png",
        target: 34000
    },
    {
        id: 3,
        title: "Empower Women Entrepreneurs",
        description: "Support women-led small businesses to thrive and uplift communities.",
        imageUrl: "/demo3.png",
        target: 43000
    },
    {
        id: 4,
        title: "Disaster Relief Support",
        description: "Help families rebuild their lives after natural disasters by contributing today.",
        imageUrl: "/demo4.png",
        target: 56000
    },
    {
        id: 5,
        title: "Clean Energy Access",
        description: "Support sustainable energy solutions like solar and wind power for underserved communities.",
        imageUrl: "/demo5.png",
        target: 45000
    },
    {
        id: 6,
        title: "Arts & Culture Preservation",
        description: "Help protect and promote traditional arts, culture, and heritage around the world.",
        imageUrl: "/demo6.png",
        target: 30000
    },
    {
        id: 7,
        title: "Shelter for Homeless",
        description: "Provide safe and secure housing for homeless individuals and families in need.",
        imageUrl: "/demo7.png",
        target: 50000
    },
    {
        id: 8,
        title: "Clean Water for All",
        description: "Bring clean and safe drinking water to communities struggling with water scarcity.",
        imageUrl: "/demo8.png",
        target: 60000
    }
];

const page = () => {
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <>
            <div className="fixed top-0 left-0 w-full z-50 bg-black">
                <Navbar />
            </div>
            <div className="pt-20 flex flex-col md:flex-row h-screen bg-black text-white overflow-hidden">
                <button
                    className="md:hidden fixed top-24 left-4 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg"
                    onClick={() => setShowSidebar(true)}
                    aria-label="Open sidebar"
                >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <aside
                    className={`
                        fixed md:static top-20 left-0
                        h-[calc(100vh-5rem)] lg:h-[calc(100vh-5rem)]
                        w-64 bg-gray-900 p-6 flex flex-col items-center z-40
                        transition-transform duration-300
                        ${showSidebar ? "translate-x-0" : "-translate-x-full"}
                        md:translate-x-0
                    `}
                    style={{ maxWidth: "100vw" }}
                >
                    <button
                        className="md:hidden self-end mb-4 text-gray-400 hover:text-white"
                        onClick={() => setShowSidebar(false)}
                        aria-label="Close sidebar"
                    >
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="w-24 h-24 mb-6 rounded-xl overflow-hidden border-4 border-indigo-600">
                        <Image src="/charity.png" alt="User Avatar" width={96} height={96} className="object-cover" />
                    </div>
                    <h2 className="text-2xl font-bold mb-1 text-indigo-400">Heart Reach</h2>
                    <p className="text-gray-400 text-sm mb-8">Foundation Fundraiser</p>
                    <Link href='/AdminDashboard'>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg w-full">
                            Profile
                        </button>
                    </Link>
                    <div className="mt-6 font-medium">
                        <p>
                            HeartReach Foundation empowers communities through healthcare, education, disaster relief, and women’s initiatives. We believe compassion creates change and work together to build a brighter, more equitable future for all.
                        </p>
                    </div>
                    <div className="mt-10">
                        <Link href='/CreateCampaign'>
                            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg w-full">Create Campaign</button>
                        </Link>
                    </div>
                </aside>
                
                {showSidebar && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                        onClick={() => setShowSidebar(false)}
                        aria-label="Sidebar overlay"
                    />
                )}

                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <h1 className="text-4xl font-bold text-blue-500 mb-10 text-center">
                        Explore Campaigns
                    </h1>

                    <div className="flex flex-wrap justify-center items-center gap-8">
                        {campaigns.map((campaign) => (
                            <div
                                key={campaign.id}
                                className="bg-gray-900 text-black rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 w-full sm:w-80 md:w-72 lg:w-80"
                            >
                                <div className="relative w-full h-48">
                                    <Image
                                        src={campaign.imageUrl}
                                        alt={campaign.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-6 flex flex-col justify-between h-[calc(100%-12rem)]">
                                    <div>
                                        <h2 className="text-lg font-semibold text-indigo-600 mb-2">{campaign.title}</h2>
                                        <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>
                                    </div>
                                    <div className="flex mb-6">
                                        <h2 className='bg-green-600 text-xl text-white px-3 py-1 rounded'>$ {campaign.target}+</h2>
                                    </div>
                                    <button className="mt-auto w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all">
                                        Help to Rise
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
};

export default page;
