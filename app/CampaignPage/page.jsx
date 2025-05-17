"use client";
import React, { useState, useEffect } from 'react';
import { Filter, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Components/NavBar';
import { db } from '../Auth/firebase';
import { collection, getDocs } from 'firebase/firestore';


const CampaignsPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "campaigns"));
                const fetchedData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setData(fetchedData);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, []);

    const organizations = Array.from(new Set(data.map(c => c.org))).filter(Boolean);

    if (loading) {
        return <p>Loading data...</p>;
    }

    if (error) {
        return <p>Error loading data: {error.message}</p>;
    }
    return (
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
                    <div className="mt-6 w-full">
                        <a href='/CreateCampaign'>
                            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg w-full">
                                Create Campaign
                            </button>
                        </a>
                    </div>
                    <div className="hidden md:block w-full">
                        <h2 className="text-2xl font-bold mt-12 mb-6">Campaign Titles</h2>
                        {data.map(campaign => (
                            <div
                                key={campaign.id}
                                className="mb-3 text-gray-400 hover:text-white cursor-pointer transition-colors"
                            >
                                {campaign.title}
                            </div>
                        ))}
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto p-6 md:p-8 pt-8 md:pt-10 md:ml-64">
                    <h1 className="text-4xl font-bold text-blue-500 mb-10 text-center">
                        Explore Campaigns
                    </h1>
                    <div className="flex flex-wrap justify-center items-center gap-8">
                        <AnimatePresence>
                            {data.map((campaign) => (
                                <motion.div
                                    key={campaign.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-gray-800 text-black rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 w-full sm:w-80 md:w-72 lg:w-80"
                                >
                                    <div className="relative w-full h-48">
                                        
                                        {/*
                                        database image calling url
                                        <img
                                            src={campaign.coverImageUrl}
                                            alt={campaign.title}
                                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                        />
                                        */}
                                        <img
                                            src='/demo1.png'
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
                                                <span className="inline-flex items-center bg-green-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                                                    Goal: £{campaign.goalAmount}
                                                </span>
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
}

export default CampaignsPage;
