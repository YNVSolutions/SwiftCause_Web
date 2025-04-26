"use client";
import React from "react";
import Image from "next/image";

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
    return (
        <div className="flex flex-col md:flex-row h-screen bg-black text-white overflow-hidden">

            <aside className="w-full md:w-64 bg-gray-900 p-6 flex flex-col items-center">
                <div className="w-24 h-24 mb-6 rounded-full overflow-hidden border-4 border-indigo-600">
                    <Image src="/charity.png" alt="User Avatar" width={96} height={96} className="object-cover" />
                </div>
                <h2 className="text-2xl font-bold mb-1 text-indigo-400">Heart Reach</h2>
                <p className="text-gray-400 text-sm mb-8">Foundation Fundraiser</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg w-full">
                    Profile
                </button>
                <div className="mt-6 font-medium">
                    <p>
                        HeartReach Foundation empowers communities through healthcare, education, disaster relief, and women’s initiatives. We believe compassion creates change and work together to build a brighter, more equitable future for all.
                    </p>
                </div>
            </aside>


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
    );
};

export default page;
